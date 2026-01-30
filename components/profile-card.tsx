"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check, Star, X } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import RegularButton from "./regular-button";

export type ProfileCardType =
  | "search"
  | "favorites"
  | "invitationsSent"
  | "invitationsReceived";

export type InvitationStatus = "PENDING" | "ACCEPTED" | "DECLINED";

export interface ProfileCardProps {
  id: string;
  href?: string;
  imageUrl?: string | null;
  firstName: string;
  lastNameInitial?: string | null;
  languages: string[];
  isFavorite?: boolean;
  type: ProfileCardType;
  showFavoriteToggle?: boolean;
  onToggleFavorite?: (id: string, next: boolean) => void;
  footerContent?: React.ReactNode;
  /** For type="invitationsReceived": request id and status. When PENDING, Accept/Decline buttons show. */
  invitationRequestId?: string;
  invitationStatus?: InvitationStatus;
  className?: string;
}

export function ProfileCard(props: ProfileCardProps) {
  const {
    id,
    href,
    imageUrl,
    firstName,
    lastNameInitial,
    languages,
    isFavorite = false,
    onToggleFavorite,
    footerContent,
    invitationRequestId,
    invitationStatus,
    className,
    type,
  } = props;

  const router = useRouter();
  const invitationsMessages = useTranslations("invitations");
  const [isPending, setIsPending] = useState(false);

  const displayName = `${firstName.toUpperCase()}${
    lastNameInitial ? ` ${lastNameInitial.toUpperCase()}.` : ""
  }`;

  const showFavoriteToggle = type === "search" || type === "favorites";
  const isInvitation = type === "invitationsSent" || type === "invitationsReceived";
  const showInvitationButtons =
    type === "invitationsReceived" &&
    invitationStatus === "PENDING" &&
    invitationRequestId;

  const handleRespond = async (status: "ACCEPTED" | "DECLINED") => {
    if (!invitationRequestId) return;
    setIsPending(true);
    try {
      const res = await fetch(`/api/contact-requests/${invitationRequestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) router.refresh();
    } finally {
      setIsPending(false);
    }
  };

  const cardInner = (
    <Card
      className={cn(
        "relative flex flex-row items-center gap-4 border-2 border-black bg-white",
        "shadow-[4px_4px_0_0_black] rounded-lg px-4 py-2",
        "cursor-pointer",
        className
      )}
      data-profile-id={id}
    >
      {/* Left: Avatar + name/languages */}
      <div className="flex flex-row items-center gap-4 flex-1 min-w-0">
        <div className="shrink-0">
          <div
            className={cn(
              "relative overflow-hidden rounded-full border-2 border-black",
              "w-14 h-14 bg-accent-color4 flex items-center justify-center"
            )}
          >
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={displayName}
                fill
                sizes="56px"
                className="object-cover"
              />
            ) : (
              <span className="text-xl font-bold">
                {firstName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>

        <CardContent className="flex-1 min-w-0 p-0">
          <div className="text-sm font-semibold tracking-wide uppercase wrap-break-word">
            {displayName}
          </div>
          {languages.length > 0 && (
            <div className="mt-0.5 text-sm text-muted-foreground wrap-break-word">
              {languages.join(" · ")}
            </div>
          )}
        </CardContent>
      </div>

      {/* Right: for invitations = date/status column + buttons; for search/favorites = star only */}
      {showFavoriteToggle && (
        <button
          type="button"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          className={cn(
            "absolute top-2 right-2 z-10 inline-flex items-center justify-center rounded-full border-2 border-black",
            "w-8 h-8 bg-accent-color2 text-black",
            "shadow-[2px_2px_0_0_black]",
            "hover:translate-y-0.5 hover:shadow-none",
            "transition-transform"
          )}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            if (onToggleFavorite) onToggleFavorite(id, !isFavorite);
          }}
        >
          <Star
            className={cn(
              "w-4 h-4",
              isFavorite ? "fill-black" : "fill-transparent"
            )}
          />
        </button>
      )}

      {isInvitation && (footerContent || showInvitationButtons) && (
        <div
          className="flex flex-col items-end gap-1 shrink-0 text-right"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {footerContent && (
            <div className="text-sm text-muted-foreground">
              {footerContent}
            </div>
          )}
          {showInvitationButtons && (
            <div className="flex gap-1.5">
              <RegularButton
                type="button"
                variant="success"
                size="sm"
                disabled={isPending}
                onClick={() => handleRespond("ACCEPTED")}
              >
                <span className="inline-flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  {invitationsMessages("accept")}
                </span>
              </RegularButton>
              <RegularButton
                type="button"
                variant="danger"
                size="sm"
                disabled={isPending}
                onClick={() => handleRespond("DECLINED")}
              >
                <span className="inline-flex items-center gap-1">
                  <X className="w-3 h-3" />
                  {invitationsMessages("decline")}
                </span>
              </RegularButton>
            </div>
          )}
        </div>
      )}
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {cardInner}
      </Link>
    );
  }

  return cardInner;
}
