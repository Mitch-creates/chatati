"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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
  locale: string;
  messages: Record<string, any>;
  recipientFirstName: string;
  onSuccess?: () => void;
}

export function ContactUserForm({
  recipientId,
  locale,
  messages,
  recipientFirstName,
  onSuccess,
}: ContactUserFormProps) {
  const router = useRouter();
  const validationMessages = useTranslations("validation");
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
        const message =
          json?.message ||
          validationMessages("genericError") ||
          "Something went wrong";
        throw new Error(message);
      }
      setSubmitSuccess(true);

      form.reset({ message: "" });

      // Call onSuccess callback if provided, otherwise redirect
      if (onSuccess) {
        onSuccess();
      } else {
        // Redirect to invitations after a short delay
        setTimeout(() => {
          router.push("/platform/invites");
        }, 1500);
      }
    } catch (error: any) {
      setSubmitError(error.message || validationMessages("genericError"));
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
      {/* Title */}
      <h2 className="text-xl font-bold text-black">
        {messages.titleMessageBox || "Your message"}
      </h2>

      {/* Description */}
      <p className="text-sm text-muted-foreground">
        {messages.descriptionMessageBox ||
          "Share something about yourself, your language goals and when you are usually available."}
      </p>

      {/* Textarea */}
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
          placeholder={messages.placeholderMessageBox || "Write a friendly message..."}
          {...form.register("message")}
        />

        {/* Character counter */}
        <p className="text-sm text-black">
          {messageLength} / {maxLength}
        </p>

        {/* Error message */}
        {form.formState.errors.message && (
          <p className="text-sm text-red-600">
            {validationMessages(
              form.formState.errors.message.message || "genericError"
            )}
          </p>
        )}
        <div className="flex items-center gap-2 mt-4">
          <Info className="size[1.15em] shrink-0" />
          <p className="text-sm text-accent-black">{messages.contactInformation.replace("{firstName}", recipientFirstName).replace("{firstName}", recipientFirstName) || "If {firstName} accepts your invitation, you will both receive eachother's email address automatically. If {firstName} doesn't accept your invitation, nothing will be shared."}</p>
          {/* TODO Add a link to a page that explains the system of how to contact other Chatati's */}
        </div>
      </div>

      {/* Submit button */}
      <div className="pt-2">
        <CtaButton
          type="submit"
          disabled={isSubmitting}
          fullWidth="w-full"
        >
          {!submitSuccess && !submitError &&
            (messages.submit?.toUpperCase() || "SEND INVITATION")}
          {submitSuccess && (
            <div className="flex items-center justify-center gap-2">
              <CircleCheckBigIcon className="h-5 w-5 text-black" strokeWidth={3} />
              <span>{messages.invitationSentSuccess || "Invitation sent successfully!"}</span>
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
