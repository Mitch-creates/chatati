// lib/zod-schemas/signinFormSchema.ts
import { z } from "zod";

export const getSignInFormSchema = (t?: (key: string) => string) => {
  return z.object({
    email: z.email({ message: t ? t("emailInvalid") : "Email is required" }),
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
  });
};

export type SignInFormData = z.infer<
  Awaited<ReturnType<typeof getSignInFormSchema>>
>;
