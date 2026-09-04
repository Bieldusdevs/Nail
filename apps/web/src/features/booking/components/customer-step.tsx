"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FieldError } from "@/components/ui/field-error";
import { StepHeading } from "@/features/booking/components/step-heading";
import {
  customerDetailsSchema,
  type CustomerDetailsFormData,
} from "@/schemas/booking";

interface CustomerStepProps {
  onSubmit: (details: CustomerDetailsFormData) => Promise<void>;
  submitError: string;
}

export function CustomerStep({ onSubmit, submitError }: CustomerStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerDetailsFormData>({
    resolver: zodResolver(customerDetailsSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      notes: "",
      privacyAccepted: false,
    },
    mode: "onBlur",
  });

  return (
    <div>
      <StepHeading
        eyebrow="Passo 4 de 4"
        title="Só falta saber quem és."
        description="Usaremos estes dados apenas para gerir a marcação e enviar a confirmação. Não precisas de criar conta agora."
      />
      <form
        id="booking-customer-form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
          <div>
            <div
              className="field-shell"
              data-invalid={Boolean(errors.firstName)}
            >
              <input
                id="firstName"
                type="text"
                autoComplete="given-name"
                placeholder=" "
                aria-invalid={Boolean(errors.firstName)}
                aria-describedby={
                  errors.firstName ? "firstName-error" : undefined
                }
                {...register("firstName")}
              />
              <label htmlFor="firstName">Nome</label>
            </div>
            <FieldError
              id="firstName-error"
              message={errors.firstName?.message}
            />
          </div>
          <div>
            <div
              className="field-shell"
              data-invalid={Boolean(errors.lastName)}
            >
              <input
                id="lastName"
                type="text"
                autoComplete="family-name"
                placeholder=" "
                aria-invalid={Boolean(errors.lastName)}
                aria-describedby={
                  errors.lastName ? "lastName-error" : undefined
                }
                {...register("lastName")}
              />
              <label htmlFor="lastName">Apelido</label>
            </div>
            <FieldError
              id="lastName-error"
              message={errors.lastName?.message}
            />
          </div>
          <div>
            <div className="field-shell" data-invalid={Boolean(errors.email)}>
              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder=" "
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
                {...register("email")}
              />
              <label htmlFor="email">Email</label>
            </div>
            <FieldError id="email-error" message={errors.email?.message} />
          </div>
          <div>
            <div className="field-shell" data-invalid={Boolean(errors.phone)}>
              <input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder=" "
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? "phone-error" : undefined}
                {...register("phone")}
              />
              <label htmlFor="phone">Telemóvel</label>
            </div>
            <FieldError id="phone-error" message={errors.phone?.message} />
          </div>
          <div className="sm:col-span-2">
            <div className="field-shell" data-invalid={Boolean(errors.notes)}>
              <textarea
                id="notes"
                placeholder=" "
                aria-invalid={Boolean(errors.notes)}
                aria-describedby={errors.notes ? "notes-error" : "notes-hint"}
                {...register("notes")}
              />
              <label htmlFor="notes">Notas para a artista (opcional)</label>
            </div>
            <p id="notes-hint" className="mt-2 text-xs text-graphite">
              Alergias, remoção anterior ou uma ideia que devamos preparar.
            </p>
            <FieldError id="notes-error" message={errors.notes?.message} />
          </div>
        </div>

        <div className="mt-8">
          <label className="flex cursor-pointer items-start gap-3 text-sm leading-5">
            <input
              type="checkbox"
              className="mt-0.5 size-4 shrink-0 accent-ink"
              aria-invalid={Boolean(errors.privacyAccepted)}
              aria-describedby={
                errors.privacyAccepted ? "privacy-error" : undefined
              }
              {...register("privacyAccepted")}
            />
            <span>
              Li e aceito a{" "}
              <a href="/privacidade" className="border-b border-ink">
                Política de Privacidade
              </a>{" "}
              e o tratamento dos meus dados para gerir esta marcação.
            </span>
          </label>
          <FieldError
            id="privacy-error"
            message={errors.privacyAccepted?.message}
          />
        </div>

        {submitError ? (
          <div
            role="alert"
            className="mt-6 border border-rose-800/25 bg-rose-50 p-4 text-sm text-rose-900"
          >
            {submitError}
          </div>
        ) : null}
      </form>
    </div>
  );
}
