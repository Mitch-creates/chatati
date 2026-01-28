"use client";

import { useState } from "react";
import CtaButton from "./cta-button";
import { ContactUserModal } from "./contact-user-modal";

interface ContactButtonProps {
  recipientId: string;
  locale: string;
  buttonText: string;
}

export function ContactButton({
  recipientId,
  locale,
  buttonText,
}: ContactButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <CtaButton accent="color2" onClick={() => setIsOpen(true)}>
        {buttonText}
      </CtaButton>
      <ContactUserModal
        recipientId={recipientId}
        locale={locale}
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    </>
  );
}
