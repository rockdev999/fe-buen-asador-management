import { FormEvent, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { t } from "@/locales/es";
import { FormInput } from "@/components/shared/Form/FormInput";
import { Button } from "@/components/shared/Basics/Button";
import { useForgotPassword } from "../../hooks/useForgotPassword";

const trans = t.auth.forgotPassword;

interface ForgotPasswordCardProps {
  /** Lo que el usuario ya había escrito en el login. */
  initialIdentifier?: string;
  /** Vuelve al login; `sentMessage` llega solo si la solicitud se envió. */
  onBack: (identifier: string, sentMessage?: string) => void;
}

export function ForgotPasswordCard({
  initialIdentifier = "",
  onBack,
}: ForgotPasswordCardProps) {
  const { mutate: requestReset, status } = useForgotPassword();
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [touched, setTouched] = useState(false);

  const error = identifier.trim()
    ? undefined
    : t.auth.validation.identifierRequired;
  const isSending = status === "pending";

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (error || isSending) return;
    requestReset(identifier, {
      onSuccess: (message) => onBack(identifier.trim(), message),
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-1">
      <div className="mb-7">
        <h2 className="mb-1 text-xl font-medium text-inkblack">
          {trans.title}
        </h2>
        <p className="text-sm text-muted-foreground">{trans.subtitle}</p>
      </div>

      <FormInput
        required
        autoFocus
        id="forgot-identifier"
        name="identifier"
        label={t.auth.login.identifier}
        type="text"
        autoComplete="username"
        value={identifier}
        placeholder={t.auth.login.identifierPlaceholder}
        onChange={(event) => setIdentifier(event.target.value)}
        onBlur={() => setTouched(true)}
        touched={touched}
        error={error}
        helperText={trans.hint}
      />

      <Button type="submit" isLoading={isSending} className="mt-4 w-full">
        {trans.submit}
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={isSending}
        onClick={() => onBack(identifier.trim())}
        className="mt-2 w-full"
      >
        <ArrowLeft size={14} />
        {trans.back}
      </Button>
    </form>
  );
}
