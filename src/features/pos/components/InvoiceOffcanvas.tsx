import z from "zod";
import { useFormik } from "formik";
import { zodToFormik } from "@/lib/zodToFormik";
import { cn, formatMoney } from "@/lib/utils";
import { X } from "lucide-react";
import { FormField } from "@/components/shared/Basics/FormField";
import { Label } from "@/components/shared/Basics/Label";
import { Input } from "@/components/ui/input";
import { ErrorMessage } from "@/components/shared/Basics/ErrorMessage";
import { Button } from "@/components/ui/button";
import { Sale } from "../../sales/models/sale";

const invoiceSchema = z.object({
  nit: z.string().min(1, "El NIT es requerido."),
  customerName: z.string().min(2, "El nombre es requerido."),
});

type InvoiceForm = z.infer<typeof invoiceSchema>;

interface InvoiceOffcanvasProps {
  order: Sale;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (nit: string, customerName: string) => void;
  isLoading: boolean;
}

export function InvoiceOffcanvas({
  order,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: InvoiceOffcanvasProps) {
  const { values, errors, touched, handleChange, handleBlur, handleSubmit } =
    useFormik<InvoiceForm>({
      initialValues: { nit: "", customerName: order.customerName ?? "" },
      validate: zodToFormik(invoiceSchema),
      onSubmit: (data) => onSubmit(data.nit, data.customerName),
    });

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-inkblack/40 z-50 transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "absolute right-0 top-0 h-full w-80 bg-white z-50 flex flex-col transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface flex-shrink-0">
          <h2 className="text-sm font-medium text-inkblack">Emitir factura</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-inkblack"
          >
            <X size={16} />
          </button>
        </div>

        {/* Resumen pedido */}
        <div className="px-5 py-4 bg-surface border-b border-surface flex-shrink-0">
          <p className="text-xs text-muted-foreground mb-2">
            Pedido #{order.id.slice(-6).toUpperCase()}
          </p>
          {order.details.map((item) => (
            <div key={item.id} className="flex justify-between text-xs py-0.5">
              <span className="text-inkblack">
                {item.product.name} × {item.quantity}
              </span>
              <span className="text-muted-foreground">
                {formatMoney(item.itemSubtotal)}
              </span>
            </div>
          ))}
          <div className="flex justify-between text-sm font-medium text-inkblack mt-2 pt-2 border-t border-surface">
            <span>Total</span>
            <span>{formatMoney(order.total)}</span>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 px-5 py-4 flex flex-col gap-4 overflow-y-auto"
        >
          <FormField>
            <Label htmlFor="nit" required>
              NIT / CI
            </Label>
            <Input
              id="nit"
              name="nit"
              placeholder="12345678"
              value={values.nit}
              onChange={handleChange}
              onBlur={handleBlur}
              className={cn(
                "bg-background border-input focus-visible:border-brand focus-visible:ring-0",
                touched.nit && errors.nit && "border-destructive",
              )}
            />
            <ErrorMessage touched={touched.nit} error={errors.nit} />
          </FormField>

          <FormField>
            <Label htmlFor="customerName" required>
              Nombre / Razón social
            </Label>
            <Input
              id="customerName"
              name="customerName"
              placeholder="Juan Pérez"
              value={values.customerName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={cn(
                "bg-background border-input focus-visible:border-brand focus-visible:ring-0",
                touched.customerName &&
                  errors.customerName &&
                  "border-destructive",
              )}
            />
            <ErrorMessage
              touched={touched.customerName}
              error={errors.customerName}
            />
          </FormField>
        </form>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-surface flex gap-2 flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 h-9 text-sm"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            onClick={() => handleSubmit()}
            className="flex-[2] h-9 bg-brand hover:bg-brand-dark text-white font-medium text-sm"
          >
            {isLoading ? "Emitiendo..." : "Emitir e imprimir"}
          </Button>
        </div>
      </div>
    </>
  );
}
