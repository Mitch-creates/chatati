import { z } from "zod";

export const getResetPasswordSchema = (t?: (key: string) => string) => {
  return z
    .object({
      password: z
        .string()
        .min(8, {
          message: t
            ? t("passwordMinLength")
            : "Password must be at least 8 characters long.",
        })
        .regex(/[A-Z]/, {
          message: t
            ? t("passwordUppercase")
            : "Password must contain at least one uppercase letter.",
        })
        .regex(/[0-9]/, {
          message: t
            ? t("passwordNumber")
            : "Password must contain at least one number.",
        }),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t ? t("confirmPasswordMatch") : "Passwords do not match.",
      path: ["confirmPassword"],
    });
};

export type ResetPasswordFormData = z.infer<
  Awaited<ReturnType<typeof getResetPasswordSchema>>
>;
