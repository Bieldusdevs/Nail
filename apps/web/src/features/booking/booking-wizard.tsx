"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, LockKeyhole } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { BookingProgress } from "@/features/booking/components/booking-progress";
import { BookingSummary } from "@/features/booking/components/booking-summary";
import { ConfirmationStep } from "@/features/booking/components/confirmation-step";
import { CustomerStep } from "@/features/booking/components/customer-step";
import { DateTimeStep } from "@/features/booking/components/date-time-step";
import { ProfessionalStep } from "@/features/booking/components/professional-step";
import { ServiceStep } from "@/features/booking/components/service-step";
import { nailServices } from "@/config/site";
import {
  createAppointmentSchema,
  type CustomerDetailsFormData,
} from "@/schemas/booking";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { createAppointment } from "@/services/booking-service";
import type { AppointmentConfirmation } from "@/types/booking";

const totalSteps = 4;

export function BookingWizard() {
  const searchParams = useSearchParams();
  const requestedServiceSlug = searchParams.get("servico");
  const initialServiceId = useMemo(
    () =>
      nailServices.find((service) => service.slug === requestedServiceSlug)
        ?.id ?? "",
    [requestedServiceSlug],
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [serviceId, setServiceId] = useState(initialServiceId);
  const [professionalId, setProfessionalId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [stepError, setStepError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] =
    useState<AppointmentConfirmation | null>(null);
  const [customerEmail, setCustomerEmail] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const selectedService = nailServices.find(
    (service) => service.id === serviceId,
  );

  const updateTime = useCallback((nextTime: string) => setTime(nextTime), []);

  function focusStepContent() {
    window.requestAnimationFrame(() => {
      contentRef.current?.focus({ preventScroll: true });
      window.scrollTo({
        top: 0,
        behavior: shouldReduceMotion ? "auto" : "smooth",
      });
    });
  }

  function goToNextStep() {
    const validationMessages = [
      serviceId ? "" : "Escolhe um serviço para continuar.",
      professionalId ? "" : "Escolhe uma artista para continuar.",
      date && time ? "" : "Escolhe uma data e uma hora para continuar.",
    ];
    const validationMessage = validationMessages[currentStep] ?? "";
    if (validationMessage) {
      setStepError(validationMessage);
      return;
    }
    setStepError("");
    setCurrentStep((step) => Math.min(step + 1, totalSteps - 1));
    focusStepContent();
  }

  function goToPreviousStep() {
    setStepError("");
    setCurrentStep((step) => Math.max(step - 1, 0));
    focusStepContent();
  }

  async function submitAppointment(details: CustomerDetailsFormData) {
    setSubmitting(true);
    setSubmitError("");
    try {
      const request = createAppointmentSchema.parse({
        serviceId,
        professionalId,
        date,
        startTime: time,
        ...details,
      });
      const createdAppointment = await createAppointment(request);
      setCustomerEmail(request.email);
      setConfirmation(createdAppointment);
      window.scrollTo({
        top: 0,
        behavior: shouldReduceMotion ? "auto" : "smooth",
      });
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Não foi possível concluir a marcação. Tenta novamente.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmation) {
    return (
      <div className="page-gutter min-h-[70vh] py-14 md:py-20">
        <ConfirmationStep confirmation={confirmation} email={customerEmail} />
      </div>
    );
  }

  return (
    <div className="page-gutter pb-24 pt-10 md:pt-16">
      <div className="mb-12 grid gap-5 border-b border-ink pb-6 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="text-[0.68rem] uppercase tracking-[0.08em] text-graphite">
            Marcação online
          </p>
          <h1 className="mt-3 text-[clamp(2.75rem,6vw,6.5rem)] font-light leading-[0.9] tracking-[-0.06em]">
            Tempo para ti.
          </h1>
        </div>
        <div className="w-full md:w-72">
          <BookingProgress currentStep={currentStep} totalSteps={totalSteps} />
          <p className="mt-3 text-right text-[0.65rem] uppercase tracking-[0.07em] text-graphite">
            Passo {currentStep + 1} / {totalSteps}
          </p>
        </div>
      </div>

      <div className="booking-grid">
        <div>
          <div ref={contentRef} tabIndex={-1} className="outline-none">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentStep}
                initial={shouldReduceMotion ? false : { opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, x: -18 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                {currentStep === 0 ? (
                  <ServiceStep
                    value={serviceId}
                    onChange={(value) => {
                      setServiceId(value);
                      setStepError("");
                    }}
                  />
                ) : null}
                {currentStep === 1 ? (
                  <ProfessionalStep
                    value={professionalId}
                    onChange={(value) => {
                      setProfessionalId(value);
                      setStepError("");
                    }}
                  />
                ) : null}
                {currentStep === 2 && selectedService ? (
                  <DateTimeStep
                    date={date}
                    time={time}
                    serviceId={serviceId}
                    professionalId={professionalId}
                    durationMinutes={selectedService.durationMinutes}
                    onDateChange={(value) => {
                      setDate(value);
                      setTime("");
                      setStepError("");
                    }}
                    onTimeChange={updateTime}
                  />
                ) : null}
                {currentStep === 3 ? (
                  <CustomerStep
                    onSubmit={submitAppointment}
                    submitError={submitError}
                  />
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>

          {stepError ? (
            <p className="mt-6 text-sm text-rose-800" role="alert">
              {stepError}
            </p>
          ) : null}

          <div className="mt-12 flex items-center justify-between gap-4 border-t hairline pt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={goToPreviousStep}
              disabled={currentStep === 0 || submitting}
            >
              <ArrowLeft className="size-4" /> Anterior
            </Button>
            {currentStep < totalSteps - 1 ? (
              <Button type="button" size="large" onClick={goToNextStep}>
                Continuar <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                form="booking-customer-form"
                size="large"
                loading={submitting}
              >
                {submitting ? "A confirmar" : "Confirmar marcação"}
              </Button>
            )}
          </div>
          <p className="mt-5 flex items-center justify-end gap-2 text-xs text-graphite">
            <LockKeyhole className="size-3.5" strokeWidth={1.5} /> Ligação
            segura e dados protegidos
          </p>
        </div>

        <BookingSummary
          serviceId={serviceId}
          professionalId={professionalId}
          date={date}
          time={time}
        />
      </div>
    </div>
  );
}
