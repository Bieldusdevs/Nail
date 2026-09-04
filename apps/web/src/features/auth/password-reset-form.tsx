"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import {
  passwordResetRequestSchema,
  type PasswordResetRequestData,
} from "@/schemas/auth";
import { requestPasswordReset } from "@/services/auth-service";

export function PasswordResetForm() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordResetRequestData>({
    resolver: zodResolver(passwordResetRequestSchema),
    defaultValues: { email: "" },
  });

  async function submitRequest(values: PasswordResetRequestData) {
    await requestPasswordReset(values.email).catch(() => undefined);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="text-center">
        <MailCheck className="mx-auto size-12" strokeWidth={1.2} />
        <h1 className="mt-7 text-5xl font-light tracking-[-0.055em]">
          Verifica o email.
        </h1>
        <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-graphite">
          Se existir uma conta associada, enviámos uma ligação válida por 20
          minutos. A resposta é sempre igual para proteger a tua privacidade.
        </p>
        <Button asChild variant="outline" className="mt-8">
          <Link href="/entrar">Voltar a entrar</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(submitRequest)} noValidate>
      <p className="text-[0.68rem] uppercase tracking-[0.08em] text-graphite">
        Recuperar acesso
      </p>
      <h1 className="mt-4 text-[clamp(2.75rem,5vw,4.75rem)] font-light leading-[0.92] tracking-[-0.055em]">
        Acontece.
      </h1>
      <p className="mt-5 text-sm leading-6 text-graphite">
        Indica o email da conta. Enviaremos uma ligação segura para escolheres
        uma nova palavra-passe.
      </p>
      <div className="field-shell mt-8" data-invalid={Boolean(errors.email)}>
        <input
          id="reset-email"
          type="email"
          autoComplete="email"
          placeholder=" "
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "reset-email-error" : undefined}
          {...register("email")}
        />
        <label htmlFor="reset-email">Email</label>
      </div>
      <FieldError id="reset-email-error" message={errors.email?.message} />
      <Button
        type="submit"
        size="large"
        className="mt-8 w-full"
        loading={isSubmitting}
      >
        Enviar ligação segura
      </Button>
      <p className="mt-6 text-center text-sm">
        <Link href="/entrar" className="link-underline">
          Voltar a entrar
        </Link>
      </p>
    </form>
  );
}
