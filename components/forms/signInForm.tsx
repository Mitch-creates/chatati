"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import {
  getSignInFormSchema,
  SignInFormData,
} from "@/lib/zod-schemas/signinFormSchema";
import { Input } from "../ui/input";
import { Card, CardContent, CardFooter } from "../ui/card";
import CtaButton from "../cta-button";
import { authClient } from "@/lib/auth-client";
import { Link, useRouter } from "@/i18n/navigation";
import { useState } from "react";

export function SignInForm() {
  const validationMessages = useTranslations("validation");
  const onboardingMessages = useTranslations("onboarding");
  const [formError, setFormError] = useState<string | null>(null);

  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(getSignInFormSchema(validationMessages)),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const onSubmit = async (data: SignInFormData) => {
    authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
      },
      {
        onRequest: () => {
          setIsPending(true);
        },
        onResponse: () => {
          setIsPending(false);
        },
        onSuccess: () => {
          router.push("/platform/search-chatati");
        },
        onError: (ctx) => {
          if (ctx.error.status === 403) {
            router.push("/verification-required");
          }
          if (ctx.error.status === 401) {
            setFormError(onboardingMessages("invalidCredentials"));
          }
          setIsPending(false);
        },
      }
    );
  };

  return (
    <Card className="w-full border-2 border-black shadow-[4px_4px_0_0_black]">
      <CardContent className="p-4 sm:p-6">
        <form
          id="signInForm"
          className="w-full flex flex-col justify-center space-y-4"
          onSubmit={signInForm.handleSubmit(onSubmit)}
          noValidate
        >
          <FieldGroup>
            <Controller
              name="email"
              control={signInForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="signIn-email">
                    {onboardingMessages("emailAddress")}
                  </FieldLabel>
                  <Input
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      if (formError) setFormError(null);
                    }}
                    id="signIn-email"
                    aria-invalid={fieldState.invalid}
                    placeholder={onboardingMessages("emailPlaceholder")}
                    className="placeholder:opacity-0 focus:placeholder:opacity-100 transition-opacity"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          <FieldGroup>
            <Controller
              name="password"
              control={signInForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className="flex justify-between">
                  <FieldLabel htmlFor="signIn-password">
                    {onboardingMessages("password")}
                  </FieldLabel>
                  <Link
            href="/forgot-password"
            className="text-sm underline hover:text-gray-600"
          >
            {onboardingMessages("forgotPassword")}
          </Link>
                  </div>
                  <Input
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      if (formError) setFormError(null);
                    }}
                    id="signIn-password"
                    aria-invalid={fieldState.invalid}
                    placeholder={onboardingMessages("passwordPlaceholder")}
                    type="password"
                    className="placeholder:opacity-0 focus:placeholder:opacity-100 transition-opacity"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      {formError && (
        <CardContent>
          <p className="text-red-500 text-center">{formError}</p>
        </CardContent>
      )}
      <CardFooter className="pt-0 flex flex-col gap-4">
        <Field orientation="horizontal">
          <CtaButton
            type="submit"
            form="signInForm"
            disabled={signInForm.formState.isSubmitting}
            fullWidth="w-full"
          >
            {isPending
              ? onboardingMessages("signingIn").toLocaleUpperCase()
              : onboardingMessages("signIn").toLocaleUpperCase()}
          </CtaButton>
        </Field>
        <div className="text-center flex justify-center gap-1">
        <span className="text-sm">{onboardingMessages("noAccountYet")}</span>
        <Link
            href="/signup"
            className="text-sm underline hover:text-gray-600"
          >
             {onboardingMessages("signUpHere")}
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
