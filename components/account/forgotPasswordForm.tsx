"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import {
  getForgotPasswordSchema,
  ForgotPasswordFormData,
} from "@/lib/zod-schemas/forgotPasswordSchema";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Card, CardContent, CardFooter } from "../ui/card";
import CtaButton from "../cta-button";

export function ForgotPasswordForm() {
  const validationMessages = useTranslations("validation");
  const onboardingMessages = useTranslations("onboarding");
  const locale = useLocale();
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(getForgotPasswordSchema(validationMessages)),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    await authClient.forgetPassword(
      {
        email: data.email,
        redirectTo: `/${locale}/account/reset-password`,
      },
      {
        onRequest: () => setIsPending(true),
        onResponse: () => setIsPending(false),
        onSuccess: () => {
          setIsSuccess(true);
        },
        onError: (ctx) => {
          alert(ctx.error.message);
        },
      }
    );
  };

  if (isSuccess) {
    return (
      <Card className="w-full border-2 border-black shadow-[4px_4px_0_0_black]">
        <CardContent className="p-4 sm:p-6 text-center space-y-4">
          <h3 className="text-xl font-bold">
            {onboardingMessages("resetLinkSent")}
          </h3>
          <p>{onboardingMessages("checkEmail")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-2 border-black shadow-[4px_4px_0_0_black]">
      <CardContent className="p-4 sm:p-6">
        <form
          id="forgotPasswordForm"
          className="w-full flex flex-col justify-center space-y-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="email">
                    {onboardingMessages("emailAddress")}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="email"
                    type="email"
                    aria-invalid={fieldState.invalid}
                    placeholder={onboardingMessages("emailPlaceholder")}
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

      <CardFooter className="pt-0 flex flex-col gap-4">
        <CtaButton
          type="submit"
          form="forgotPasswordForm"
          disabled={isPending}
          fullWidth="w-full"
        >
          {isPending
            ? onboardingMessages("sendingResetLink").toUpperCase()
            : onboardingMessages("sendResetLink").toUpperCase()}
        </CtaButton>
        <div className="text-center">
          <Link
            href="/signin"
            className="text-sm underline hover:text-gray-600"
          >
            {onboardingMessages("backToSignIn")}
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
