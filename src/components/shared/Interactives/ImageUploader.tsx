import { cn } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle2,
  ImagePlus,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type MouseEvent,
} from "react";

interface ImageUploaderProps {
  value?: string | null;
  onChange: (file: File | null) => void;
  onRemove?: () => void;
  maxSizeMB?: number;
  accept?: string;
  className?: string;
  error?: string;
  touched?: boolean;
  label?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
}

export function ImageUploader({
  value,
  onChange,
  onRemove,
  maxSizeMB = 5,
  accept = "image/jpeg,image/png,image/webp",
  className,
  error,
  touched,
  label = "Imagen",
  hint,
  required,
  disabled,
}: ImageUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  const [preview, setPreview] = useState<string | null>(value ?? null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const errorMsg = localError || (touched && error ? error : null);
  const hasError = Boolean(errorMsg);

  useEffect(() => {
    if (objectUrlRef.current) return;
    setPreview(value ?? null);
  }, [value]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const openFileDialog = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const resetInput = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const clearObjectUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  const isValidFileType = (file: File) => {
    const validTypes = accept.split(",").map((type) => type.trim());

    return validTypes.some((type) => {
      if (type === "image/*") return file.type.startsWith("image/");
      return type === file.type;
    });
  };

  const handleFile = useCallback(
    (file: File) => {
      setLocalError(null);

      if (!file.type.startsWith("image/")) {
        setLocalError("El archivo seleccionado no es una imagen.");
        return;
      }

      if (!isValidFileType(file)) {
        setLocalError("Formato no válido. Usa JPG, PNG o WEBP.");
        return;
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        setLocalError(`La imagen no puede superar ${maxSizeMB}MB.`);
        return;
      }

      clearObjectUrl();

      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;

      setPreview(url);
      setFileName(file.name);
      onChange(file);
    },
    [accept, maxSizeMB, onChange],
  );

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      handleFile(file);
    }

    resetInput();
  };

  const handleRemove = (event?: MouseEvent<HTMLButtonElement>) => {
    event?.stopPropagation();

    clearObjectUrl();
    setPreview(null);
    setFileName(null);
    setLocalError(null);

    onChange(null);
    onRemove?.();
    resetInput();
  };

  const handleDragOver = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (disabled) return;
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const file = event.dataTransfer.files?.[0];

    if (file) {
      handleFile(file);
    }
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {/* Label */}
      {label && (
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor={inputId}
            className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>

          <span className="text-[10px] text-muted-foreground/50">
            Máx. {maxSizeMB}MB
          </span>
        </div>
      )}

      {/* Preview */}
      {preview ? (
        <div
          className={cn(
            "group relative overflow-hidden rounded-xl border bg-surface/30",
            hasError ? "border-red-300" : "border-surface",
            disabled && "opacity-60",
          )}
        >
          <img
            src={preview}
            alt="Vista previa de la imagen"
            className="h-44 w-full object-cover"
          />

          {/* Top badge */}
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-medium text-green-600 shadow-sm backdrop-blur">
            <CheckCircle2 size={11} />
            Imagen cargada
          </div>

          {/* Bottom actions */}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-inkblack/70 to-transparent p-3">
            <div className="min-w-0">
              <p className="truncate text-[11px] font-medium text-white">
                {fileName ?? "Imagen actual"}
              </p>
              <p className="text-[10px] text-white/70">
                Puedes cambiarla o eliminarla.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={openFileDialog}
                disabled={disabled}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-lg bg-white px-3 text-[11px] font-medium text-inkblack shadow-sm transition-colors",
                  "hover:bg-surface disabled:cursor-not-allowed",
                )}
              >
                <RefreshCw size={12} />
                Cambiar
              </button>

              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-lg bg-white px-3 text-[11px] font-medium text-red-600 shadow-sm transition-colors",
                  "hover:bg-red-50 disabled:cursor-not-allowed",
                )}
              >
                <Trash2 size={12} />
                Quitar
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openFileDialog}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={errorMsg ? `${inputId}-error` : undefined}
          className={cn(
            "flex h-44 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 text-center transition-all duration-200",
            isDragging
              ? "scale-[1.01] border-brand bg-brand/5"
              : hasError
                ? "border-red-300 bg-red-50/40"
                : "border-surface bg-surface/30 hover:border-brand/40 hover:bg-brand/5",
            disabled &&
              "cursor-not-allowed opacity-60 hover:border-surface hover:bg-surface/30",
          )}
        >
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-2xl transition-colors",
              isDragging
                ? "bg-brand/10 text-brand"
                : hasError
                  ? "bg-red-100 text-red-500"
                  : "bg-white text-muted-foreground shadow-sm",
            )}
          >
            {isDragging ? <Upload size={19} /> : <ImagePlus size={19} />}
          </div>

          <div>
            <p
              className={cn(
                "text-[13px] font-semibold",
                isDragging
                  ? "text-brand"
                  : hasError
                    ? "text-red-500"
                    : "text-inkblack",
              )}
            >
              {isDragging ? "Suelta la imagen aquí" : "Subir imagen"}
            </p>

            <p className="mt-1 text-[11px] text-muted-foreground">
              Arrastra una imagen o haz clic para seleccionar.
            </p>

            <p className="mt-0.5 text-[10px] text-muted-foreground/60">
              JPG, PNG o WEBP · Máx. {maxSizeMB}MB
            </p>
          </div>
        </button>
      )}

      {/* Error */}
      {errorMsg && (
        <div
          id={`${inputId}-error`}
          className="flex items-start gap-1.5 rounded-lg bg-red-50 px-2 py-1.5"
        >
          <AlertCircle size={12} className="mt-0.5 shrink-0 text-red-500" />
          <p className="text-[10px] leading-4 text-red-500">{errorMsg}</p>
        </div>
      )}

      {/* Hint */}
      {hint && !errorMsg && (
        <p className="text-[10px] leading-4 text-muted-foreground/60">{hint}</p>
      )}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
      />
    </div>
  );
}
