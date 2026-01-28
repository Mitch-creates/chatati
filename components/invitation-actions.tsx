"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import CtaButton from "./cta-button";
import RegularButton from "./regular-button";

interface InvitationActionsProps {
  requestId: string;
}

export function InvitationActions({ requestId }: InvitationActionsProps) {
  const router = useRouter();
  const invitationsMessages = useTranslations("invitations");
  const [isPending, setIsPending] = useState(false);

  const handleRespond = async (status: "ACCEPTED" | "DECLINED") => {
    setIsPending(true);
    try {
      const res = await fetch(`/api/contact-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div
      className="mt-2 flex gap-2"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <CtaButton
        type="button"
        accent="color2"
        disabled={isPending}
        onClick={() => handleRespond("ACCEPTED")}
      >
        {invitationsMessages("accept")}
      </CtaButton>
      <RegularButton
        type="button"
        disabled={isPending}
        onClick={() => handleRespond("DECLINED")}
      >
        {invitationsMessages("decline")}
      </RegularButton>
    </div>
  );
}
