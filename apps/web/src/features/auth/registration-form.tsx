"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { registrationSchema, type RegistrationFormData } from "@/schemas/auth";
import { registerAccount } from "@/services/auth-service";

export function RegistrationForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [formError, setFormError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      privacyAccepted: false,
    },
    mode: "onBlur",
  });

  async function submitRegistration(values: RegistrationFormData) {
    setFormError("");
    try {
      await registerAccount(values);
      setCompleted(true);
    } catch {
      setFormError(
        "Não foi possível criar a conta. Se este email já estiver registado, tenta iniciar sessão.",
      );
    }
  }

  if (completed) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-mint">
          <Check className="size-6" />
        </div>
        <h1 className="mt-7 text-5xl font-light tracking-[-0.055em]">
          Conta criada.
        </h1>
        <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-graphite">
          Já podes entrar e ter todas as tuas marcações num só lugar.
        </p>
        <Button asChild size="large" className="mt-8">
          <Link href="/entrar">Entrar na minha conta</Link>
        </Button>
      </div>
    );
  }

  const field = (
    name: keyof RegistrationFormData,
    label: string,
    type = "text",
    autoComplete?: string,
  ) => (
    <div>
      <div className="field-shell" data-invalid={Boolean(errors[name])}>
        <input
          id={`register-${name}`}
          type={type}
          autoComplete={autoComplete}
          placeholder=" "
          aria-invalid={Boolean(errors[name])}
          aria-describedby={errors[name] ? `register-${name}-error` : undefined}
          {...register(name)}
        />
        <label htmlFor={`register-${name}`}>{label}</label>
      </div>
      <FieldError
        id={`register-${name}-error`}
        message={errors[name]?.message}
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit(submitRegistration)} noValidate>
      <p className="text-[0.68rem] uppercase tracking-[0.08em] text-graphite">
        Nova conta
      </p>
      <h1 className="mt-4 text-[clamp(2.75rem,5vw,4.75rem)] font-light leading-[0.92] tracking-[-0.055em]">
        Tudo num só lugar.
      </h1>
      <p className="mt-5 max-w-xl text-sm leading-6 text-graphite">
        Cria uma conta para gerir marcações e manter um histórico dos teus
        serviços.
      </p>
      <div className="mt-8 grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {field("firstName", "Nome", "text", "given-name")}
        {field("lastName", "Apelido", "text", "family-name")}
        {field("email", "Email", "email", "email")}
        {field("phone", "Telemóvel", "tel", "tel")}
        <div>
          <div className="field-shell" data-invalid={Boolean(errors.password)}>
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder=" "
              aria-invalid={Boolean(errors.password)}
              aria-describedby="register-password-hint register-password-error"
              {...register("password")}
            />
            <label htmlFor="register-password">Palavra-passe</label>
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
          <p id="register-password-hint" className="mt-2 text-xs text-graphite">
            12+ caracteres, maiúscula, minúscula e número.
          </p>
          <FieldError
            id="register-password-error"
            message={errors.password?.message}
          />
        </div>
        {field(
          "confirmPassword",
          "Confirmar palavra-passe",
          showPassword ? "text" : "password",
          "new-password",
        )}
      </div>
      <div className="mt-7">
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-5">
          <input
            type="checkbox"
            className="mt-0.5 size-4 accent-ink"
            {...register("privacyAccepted")}
          />
          <span>
            Aceito a{" "}
            <Link href="/privacidade" className="border-b border-ink">
              Política de Privacidade
            </Link>
            .
          </span>
        </label>
        <FieldError
          id="registration-privacy-error"
          message={errors.privacyAccepted?.message}
        />
      </div>
      {formError ? (
        <p role="alert" className="mt-5 text-sm text-rose-800">
          {formError}
        </p>
      ) : null}
      <Button
        type="submit"
        size="large"
        className="mt-8 w-full"
        loading={isSubmitting}
      >
        {isSubmitting ? "A criar" : "Criar conta"}
      </Button>
      <p className="mt-6 text-center text-sm text-graphite">
        Já tens conta?{" "}
        <Link href="/entrar" className="border-b border-ink text-ink">
          Entrar
        </Link>
      </p>
    </form>
  );
}
