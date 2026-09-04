"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import {
  passwordResetConfirmSchema,
  type PasswordResetConfirmData,
} from "@/schemas/auth";
import { confirmPasswordReset } from "@/services/auth-service";

export function PasswordResetConfirmForm() {
  const token = useSearchParams().get("token") ?? "";
  const [showPassword, setShowPassword] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [formError, setFormError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordResetConfirmData>({
    resolver: zodResolver(passwordResetConfirmSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function submitNewPassword(values: PasswordResetConfirmData) {
    if (token.length < 40) {
      setFormError("Esta ligação de recuperação é inválida ou expirou.");
      return;
    }
    setFormError("");
    try {
      await confirmPasswordReset(token, values.password);
      window.history.replaceState(null, "", "/redefinir?concluido=true");
      setCompleted(true);
    } catch {
      setFormError("Esta ligação de recuperação é inválida ou expirou.");
    }
  }

  if (completed) {
    return (
      <div className="text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-mint">
          <Check className="size-6" />
        </div>
        <h1 className="mt-7 text-5xl font-light tracking-[-0.055em]">
          Acesso recuperado.
        </h1>
        <p className="mt-5 text-sm leading-6 text-graphite">
          A palavra-passe foi alterada e as sessões anteriores foram terminadas.
        </p>
        <Button asChild size="large" className="mt-8">
          <Link href="/entrar">Entrar em segurança</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(submitNewPassword)} noValidate>
      <p className="text-[0.68rem] uppercase tracking-[0.08em] text-graphite">
        Nova palavra-passe
      </p>
      <h1 className="mt-4 text-[clamp(2.75rem,5vw,4.75rem)] font-light leading-[0.92] tracking-[-0.055em]">
        Um novo começo.
      </h1>
      <p className="mt-5 text-sm leading-6 text-graphite">
        Escolhe uma palavra-passe diferente das anteriores.
      </p>
      <div className="mt-8">
        <div className="field-shell" data-invalid={Boolean(errors.password)}>
          <input
            id="new-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder=" "
            aria-invalid={Boolean(errors.password)}
            aria-describedby="new-password-hint new-password-error"
            {...register("password")}
          />
          <label htmlFor="new-password">Nova palavra-passe</label>
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            className="absolute bottom-3 right-0 flex size-8 items-center justify-center"
            aria-label={
              showPassword ? "Ocultar palavra-passe" : "Mostrar palavra-passe"
            }
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
        <p id="new-password-hint" className="mt-2 text-xs text-graphite">
          12+ caracteres, maiúscula, minúscula e número.
        </p>
        <FieldError
          id="new-password-error"
          message={errors.password?.message}
        />
      </div>
      <div className="mt-3">
        <div
          className="field-shell"
          data-invalid={Boolean(errors.confirmPassword)}
        >
          <input
            id="confirm-new-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder=" "
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={
              errors.confirmPassword ? "confirm-new-password-error" : undefined
            }
            {...register("confirmPassword")}
          />
          <label htmlFor="confirm-new-password">Confirmar palavra-passe</label>
        </div>
        <FieldError
          id="confirm-new-password-error"
          message={errors.confirmPassword?.message}
        />
      </div>
      {formError ? (
        <p className="mt-5 text-sm text-rose-800" role="alert">
          {formError}
        </p>
      ) : null}
      <Button
        type="submit"
        size="large"
        className="mt-8 w-full"
        loading={isSubmitting}
      >
        Guardar nova palavra-passe
      </Button>
    </form>
  );
}
