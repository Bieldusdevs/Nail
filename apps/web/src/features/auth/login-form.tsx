"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { loginSchema, type LoginFormData } from "@/schemas/auth";
import { login, verifyMfa } from "@/services/auth-service";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [submittingMfa, setSubmittingMfa] = useState(false);
  const [formError, setFormError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: false },
    mode: "onBlur",
  });

  async function submitCredentials(credentials: LoginFormData) {
    setFormError("");
    try {
      const result = await login(credentials);
      if (result.status === "MFA_REQUIRED") {
        setMfaRequired(true);
        return;
      }
      router.push("/conta");
      router.refresh();
    } catch {
      setFormError(
        "Email ou palavra-passe incorretos. Confirma os dados e tenta novamente.",
      );
    }
  }

  async function submitMfa(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^\d{6}$/.test(mfaCode)) {
      setFormError(
        "Introduz o código de 6 dígitos da aplicação autenticadora.",
      );
      return;
    }
    setSubmittingMfa(true);
    setFormError("");
    try {
      const result = await verifyMfa(mfaCode);
      if (result.status === "AUTHENTICATED") {
        router.push("/admin");
        router.refresh();
      }
    } catch {
      setFormError("O código não é válido ou já expirou.");
    } finally {
      setSubmittingMfa(false);
    }
  }

  if (mfaRequired) {
    return (
      <form onSubmit={submitMfa} noValidate>
        <div className="mb-8 flex size-12 items-center justify-center rounded-full bg-mint">
          <LockKeyhole className="size-5" strokeWidth={1.5} />
        </div>
        <p className="text-[0.68rem] uppercase tracking-[0.08em] text-graphite">
          Verificação adicional
        </p>
        <h1 className="mt-4 text-[clamp(2.75rem,5vw,4.75rem)] font-light leading-[0.92] tracking-[-0.055em]">
          Confirma que és tu.
        </h1>
        <p className="mt-5 max-w-md text-sm leading-6 text-graphite">
          Introduz o código atual da tua aplicação autenticadora. Este passo é
          obrigatório para contas administrativas.
        </p>
        <div className="field-shell mt-8">
          <input
            id="mfaCode"
            value={mfaCode}
            onChange={(event) =>
              setMfaCode(event.target.value.replace(/\D/g, "").slice(0, 6))
            }
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder=" "
            maxLength={6}
          />
          <label htmlFor="mfaCode">Código de 6 dígitos</label>
        </div>
        {formError ? (
          <p role="alert" className="mt-4 text-sm text-rose-800">
            {formError}
          </p>
        ) : null}
        <Button
          type="submit"
          size="large"
          className="mt-8 w-full"
          loading={submittingMfa}
        >
          Verificar e entrar
        </Button>
        <button
          type="button"
          onClick={() => setMfaRequired(false)}
          className="mt-5 w-full text-sm text-graphite underline underline-offset-4"
        >
          Voltar ao início de sessão
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit(submitCredentials)} noValidate>
      <p className="text-[0.68rem] uppercase tracking-[0.08em] text-graphite">
        Área pessoal
      </p>
      <h1 className="mt-4 text-[clamp(2.75rem,5vw,4.75rem)] font-light leading-[0.92] tracking-[-0.055em]">
        Que bom ter-te de volta.
      </h1>
      <p className="mt-5 max-w-md text-sm leading-6 text-graphite">
        Entra para consultar, alterar ou cancelar as tuas marcações.
      </p>

      <div className="mt-8">
        <div className="field-shell" data-invalid={Boolean(errors.email)}>
          <input
            id="loginEmail"
            type="email"
            autoComplete="email"
            placeholder=" "
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "login-email-error" : undefined}
            {...register("email")}
          />
          <label htmlFor="loginEmail">Email</label>
        </div>
        <FieldError id="login-email-error" message={errors.email?.message} />
      </div>
      <div className="mt-3">
        <div className="field-shell" data-invalid={Boolean(errors.password)}>
          <input
            id="loginPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder=" "
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? "login-password-error" : undefined
            }
            {...register("password")}
          />
          <label htmlFor="loginPassword">Palavra-passe</label>
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
        <FieldError
          id="login-password-error"
          message={errors.password?.message}
        />
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 text-sm">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            className="size-4 accent-ink"
            {...register("remember")}
          />
          Manter sessão neste dispositivo
        </label>
        <Link href="/recuperar" className="link-underline shrink-0">
          Esqueci-me
        </Link>
      </div>

      {formError ? (
        <p
          role="alert"
          className="mt-5 border border-rose-800/25 bg-rose-50 p-4 text-sm text-rose-900"
        >
          {formError}
        </p>
      ) : null}

      <Button
        type="submit"
        size="large"
        className="mt-8 w-full"
        loading={isSubmitting}
      >
        {isSubmitting ? "A entrar" : "Entrar em segurança"}
      </Button>
      <p className="mt-6 text-center text-sm text-graphite">
        Ainda não tens conta?{" "}
        <Link href="/criar-conta" className="border-b border-ink text-ink">
          Criar conta
        </Link>
      </p>
    </form>
  );
}
