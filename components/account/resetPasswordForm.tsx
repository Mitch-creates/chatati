"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth-client";
import {
  getResetPasswordSchema,
  ResetPasswordFormData,
} from "@/lib/zod-schemas/resetPasswordSchema";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Card, CardContent, CardFooter } from "../ui/card";
import CtaButton from "../cta-button";

export function ResetPasswordForm() {
  const validationMessages = useTranslations("validation");
  const onboardingMessages = useTranslations("onboarding");
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(getResetPasswordSchema(validationMessages)),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    // TODO better error handling
    if (!token) {
      alert("No token found");
      return;
    }

    await authClient.resetPassword(
      {
        newPassword: data.password,
        token: token,
        // Better Auth automatically looks for 'token' in the URL query params
        // If your URL is /reset-password?token=xyz, you don't need to pass it manually
      },
      {
        onRequest: () => setIsPending(true),
        onResponse: () => setIsPending(false),
        onSuccess: () => {
          router.push("/signin");
        },
        onError: (ctx) => {
          alert(ctx.error.message);
          console.error(ctx.error);
        },
      }
    );
  };

  return (
    <Card className="w-full border-2 border-black shadow-[4px_4px_0_0_black]">
      <CardContent className="p-4 sm:p-6">
        <form
          id="resetPasswordForm"
          className="w-full flex flex-col justify-center space-y-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup>
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="new-password">
                    {onboardingMessages("newPassword")}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="new-password"
                    type="password"
                    aria-invalid={fieldState.invalid}
                    placeholder={onboardingMessages("passwordPlaceholder")}
                    className="placeholder:opacity-0 focus:placeholder:opacity-100 transition-opacity"
                  />
                  {fieldState.invalid &&
                    (fieldState.isTouched || form.formState.isSubmitted) && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                </Field>
              )}
            />
          </FieldGroup>

          <FieldGroup>
            <Controller
              name="confirmPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="confirm-password">
                    {onboardingMessages("confirmNewPassword")}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="confirm-password"
                    type="password"
                    aria-invalid={fieldState.invalid}
                    placeholder={onboardingMessages(
                      "confirmPasswordPlaceholder"
                    )}
                    className="placeholder:opacity-0 focus:placeholder:opacity-100 transition-opacity"
                  />
                  {fieldState.invalid &&
                    (fieldState.isTouched || form.formState.isSubmitted) && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className="p-4 sm:p-6 pt-0">
        <CtaButton
          type="submit"
          form="resetPasswordForm"
          disabled={isPending}
          fullWidth="w-full"
        >
          {isPending
            ? onboardingMessages("resetting").toUpperCase()
            : onboardingMessages("resetPassword").toUpperCase()}
        </CtaButton>
      </CardFooter>
    </Card>
  );
}
