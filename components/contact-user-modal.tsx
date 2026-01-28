"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { ContactUserForm } from "@/components/forms/contactUserForm";

interface ContactUserModalProps {
  recipientId: string;
  locale: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactUserModal({
  recipientId,
  locale,
  open,
  onOpenChange,
}: ContactUserModalProps) {
  const [contactMessages, setContactMessages] = useState<Record<string, any> | null>(null);

  // Load translations when modal opens
  useEffect(() => {
    if (open && !contactMessages) {
      import(`@/messages/${locale}.json`).then((module) => {
        setContactMessages(module.default.contact || {});
      });
    }
  }, [open, locale, contactMessages]);

  const handleSuccess = () => {
    // Close modal after a short delay to show success message
    setTimeout(() => {
      onOpenChange(false);
    }, 1500);
  };

  if (!contactMessages) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[calc(100%-2rem)] sm:w-full border-2 border-black shadow-[4px_4px_0_0_black] bg-white rounded-lg p-6 sm:p-8">
        <ContactUserForm
          recipientId={recipientId}
          locale={locale}
          messages={contactMessages}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
