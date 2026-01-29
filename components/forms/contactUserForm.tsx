"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import CtaButton from "@/components/cta-button";
import { cn } from "@/lib/utils";
import { CircleCheckBigIcon, Info } from "lucide-react";

const messageSchema = z.object({
  message: z
    .string()
    .min(10, "messageTooShort")
    .max(400, "messageTooLong"),
});

export type ContactUserFormData = z.infer<typeof messageSchema>;

interface ContactUserFormProps {
  recipientId: string;
  recipientFirstName: string;
  onSuccess?: () => void;
}

export function ContactUserForm({
  recipientId,
  recipientFirstName,
  onSuccess,
}: ContactUserFormProps) {
  const router = useRouter();
  const t = useTranslations("contact");
  const tValidation = useTranslations("validation");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const form = useForm<ContactUserFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message: "",
    },
  });

  const maxLength = 400;
  const messageLength = form.watch("message")?.length || 0;

  const onSubmit: SubmitHandler<ContactUserFormData> = async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const response = await fetch("/api/contact-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientId,
          message: data.message,
        }),
      });

      if (!response.ok) {
        const json = await response.json().catch(() => null);
        const isAlreadyContacted =
          response.status === 409 && json?.error === "alreadyContacted";
        const message = isAlreadyContacted
          ? t("alreadyContacted")
          : (json?.message ?? tValidation("genericError"));
        throw new Error(message);
      }
      setSubmitSuccess(true);

      form.reset({ message: "" });

      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => {
          router.push("/platform/invites");
        }, 1500);
      }
    } catch (error: unknown) {
      setSubmitError(
        error instanceof Error ? error.message : tValidation("genericError")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="w-full min-w-0 flex flex-col space-y-4"
      noValidate
    >
      <h2 className="text-xl font-bold text-black">
        {t("titleMessageBox")}
      </h2>

      <p className="text-sm text-muted-foreground">
        {t("descriptionMessageBox")}
      </p>

      <div className="space-y-2">
        <Textarea
          id="contact-message"
          aria-invalid={!!form.formState.errors.message}
          maxLength={maxLength}
          className={cn(
            "w-full min-h-[120px] resize-y rounded-lg border-2 border-black",
            "focus:outline-none focus:ring-0",
            form.formState.errors.message && "border-red-500"
          )}
          placeholder={t("placeholderMessageBox")}
          {...form.register("message")}
        />

        <p className="text-sm text-black">
          {messageLength} / {maxLength}
        </p>

        {form.formState.errors.message && (
          <p className="text-sm text-red-600">
            {tValidation(
              form.formState.errors.message.message ?? "genericError"
            )}
          </p>
        )}
        <div className="flex items-center gap-2 mt-4">
          <Info className="size[1.15em] shrink-0" />
          <p className="text-sm text-accent-black">
            {t("contactInformation", { firstName: recipientFirstName })}
          </p>
        </div>
      </div>

      <div className="pt-2">
        <CtaButton
          type="submit"
          disabled={isSubmitting}
          fullWidth="w-full"
        >
          {!submitSuccess && !submitError && t("submit").toUpperCase()}
          {submitSuccess && (
            <div className="flex items-center justify-center gap-2">
              <CircleCheckBigIcon className="h-5 w-5 text-black" strokeWidth={3} />
              <span>{t("success")}</span>
            </div>
          )}
          {submitError && (
            <span className="text-sm">{submitError}</span>
          )}
        </CtaButton>
      </div>
    </form>
  );
}
