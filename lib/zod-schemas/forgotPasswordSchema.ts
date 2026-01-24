import { z } from "zod";

export const getForgotPasswordSchema = (t?: (key: string) => string) => {
  return z.object({
    email: z.email({ message: t ? t("emailInvalid") : "Email is required" }),
  });
};

export type ForgotPasswordFormData = z.infer<
  Awaited<ReturnType<typeof getForgotPasswordSchema>>
>;
