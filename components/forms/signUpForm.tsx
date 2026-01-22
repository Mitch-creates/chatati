"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../ui/field";
import {
  getSignUpFormSchema,
  SignUpFormData,
} from "@/lib/zod-schemas/signupFormSchema";
import { Input } from "../ui/input";
import { Card, CardContent, CardFooter } from "../ui/card";
import CtaButton from "../cta-button";
import { authClient } from "@/lib/auth-client";
import { Link, useRouter } from "@/i18n/navigation";
import { useState } from "react";

export function SignUpForm() {
  const validationMessages = useTranslations("validation");
  const onboardingMessages = useTranslations("onboarding");

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(getSignUpFormSchema(validationMessages)),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const onSubmit = async (data: SignUpFormData) => {
    authClient.signUp.email(
      {
        email: data.email,
        password: data.password,
        name: data.firstName + " " + data.lastName.charAt(0).toUpperCase(),
        callbackURL: "/platform/account/edit?newUser=true",
      },
      {
        onRequest: () => {
          setIsPending(true);
        },
        onResponse: () => {
          setIsPending(false);
        },
        onSuccess: () => {
          router.push("/verification-sent");
        },
        onError: (ctx) => {
          setIsPending(false);
          // Handle email already taken error
          if (ctx.error.status === 422) {
            signUpForm.setError("email", {
              type: "emailTaken",
              message: onboardingMessages("emailAlreadyTaken"),
            });
          } else {
            // TODO Implement better error handling
            console.error(ctx.error.message);
          }
        },
      }
    );
  };

  return (
    <Card className="w-full border-2 border-black shadow-[4px_4px_0_0_black]">
      <CardContent className="p-4 sm:p-6">
        <form
          id="signUpForm"
          className="w-full flex flex-col justify-center space-y-4"
          onSubmit={signUpForm.handleSubmit(onSubmit)}
          noValidate
        >
          <FieldGroup>
            <Controller
              name="firstName"
              control={signUpForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="signUp-firstName">
                    {onboardingMessages("firstName")}
                  </FieldLabel>
                  <FieldDescription>
                    {onboardingMessages("firstNameDescription")}
                  </FieldDescription>
                  <Input
                    {...field}
                    id="signUp-firstName"
                    aria-invalid={fieldState.invalid}
                    placeholder={onboardingMessages("firstNamePlaceholder")}
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
              name="lastName"
              control={signUpForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="signUp-lastName">
                    {onboardingMessages("lastName")}
                  </FieldLabel>
                  <FieldDescription>
                    {onboardingMessages("lastNameDescription")}
                  </FieldDescription>
                  <Input
                    {...field}
                    id="signUp-lastName"
                    aria-invalid={fieldState.invalid}
                    placeholder={onboardingMessages("lastNamePlaceholder")}
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
              name="email"
              control={signUpForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="signUp-email">
                    {onboardingMessages("emailAddress")}
                  </FieldLabel>
                  <FieldDescription>
                    {onboardingMessages("emailDescription")}
                  </FieldDescription>
                  <Input
                    {...field}
                    id="signUp-email"
                    aria-invalid={fieldState.invalid}
                    placeholder={onboardingMessages("emailPlaceholder")}
                    className="placeholder:opacity-0 focus:placeholder:opacity-100 transition-opacity"
                  />
                  {fieldState.invalid && (
                    <>
                      {fieldState.error?.type !== "emailTaken" && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                      {fieldState.error?.type === "emailTaken" && (
                        <div className="text-sm text-red-600 mt-1">
                          {onboardingMessages("emailAlreadyTaken")}{" "}
                          <Link
                            href="/account/forgot-password"
                            className="underline text-blue-700 hover:text-blue-900"
                          >
                            {onboardingMessages("forgotPasswordLink")}
                          </Link>
                        </div>
                      )}
                    </>
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          <FieldGroup>
            <Controller
              name="password"
              control={signUpForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="signUp-password">
                    {onboardingMessages("password")}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="signUp-password"
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
          <FieldGroup>
            <Controller
              name="confirmPassword"
              control={signUpForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="signUp-confirmPassword">
                    {onboardingMessages("confirmPassword")}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="signUp-confirmPassword"
                    aria-invalid={fieldState.invalid}
                    placeholder={onboardingMessages(
                      "confirmPasswordPlaceholder"
                    )}
                    type="password"
                    className="placeholder:opacity-0 focus:placeholder:opacity-100 transition-opacity"
                  />
                  {fieldState.invalid &&
                    (fieldState.isTouched ||
                      signUpForm.formState.isSubmitted) && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <CtaButton
            type="submit"
            form="signUpForm"
            disabled={signUpForm.formState.isSubmitting}
            fullWidth="w-full"
          >
            {isPending
              ? onboardingMessages("submitting").toLocaleUpperCase()
              : onboardingMessages("signUp").toLocaleUpperCase()}
          </CtaButton>
        </Field>
      </CardFooter>
    </Card>
  );
}
