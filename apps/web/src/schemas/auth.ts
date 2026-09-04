import { z } from "zod";

const passwordSchema = z
  .string()
  .min(12, "Usa pelo menos 12 caracteres.")
  .max(128)
  .regex(/[a-z]/, "Inclui uma letra minúscula.")
  .regex(/[A-Z]/, "Inclui uma letra maiúscula.")
  .regex(/\d/, "Inclui um número.");

export const loginSchema = z.object({
  email: z.email("Introduz um email válido.").max(254),
  password: z
    .string()
    .min(8, "A palavra-passe deve ter pelo menos 8 caracteres.")
    .max(128),
  remember: z.boolean(),
});

export const registrationSchema = z
  .object({
    firstName: z.string().trim().min(2, "Indica o teu nome.").max(60),
    lastName: z.string().trim().min(2, "Indica o teu apelido.").max(60),
    email: z.email("Introduz um email válido.").max(254),
    phone: z.string().trim().min(9, "Introduz um telemóvel válido.").max(20),
    password: passwordSchema,
    confirmPassword: z.string(),
    privacyAccepted: z
      .boolean()
      .refine(Boolean, "É necessário aceitar a política de privacidade."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "As palavras-passe não coincidem.",
  });

export const passwordResetRequestSchema = z.object({
  email: z.email("Introduz um email válido.").max(254),
});

export const passwordResetConfirmSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "As palavras-passe não coincidem.",
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegistrationFormData = z.infer<typeof registrationSchema>;
export type PasswordResetRequestData = z.infer<
  typeof passwordResetRequestSchema
>;
export type PasswordResetConfirmData = z.infer<
  typeof passwordResetConfirmSchema
>;
