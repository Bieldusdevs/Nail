import { z } from "zod";

const portuguesePhonePattern = /^(?:\+351\s?)?(?:2\d{8}|9[1236]\d{7})$/;

export const customerDetailsSchema = z.object({
  firstName: z.string().trim().min(2, "Indica o teu nome.").max(60),
  lastName: z.string().trim().min(2, "Indica o teu apelido.").max(60),
  email: z.email("Introduz um email válido.").max(254),
  phone: z
    .string()
    .trim()
    .transform((value) => value.replace(/\s/g, ""))
    .pipe(
      z
        .string()
        .regex(portuguesePhonePattern, "Introduz um número português válido."),
    ),
  notes: z.string().trim().max(500, "Máximo de 500 caracteres.").optional(),
  privacyAccepted: z
    .boolean()
    .refine(Boolean, "É necessário aceitar a política de privacidade."),
});

export const bookingSelectionSchema = z.object({
  serviceId: z.uuid(),
  professionalId: z.union([z.literal("any"), z.uuid()]),
  date: z.iso.date(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
});

export const createAppointmentSchema = bookingSelectionSchema.and(
  customerDetailsSchema,
);

export type CustomerDetailsFormData = z.input<typeof customerDetailsSchema>;
