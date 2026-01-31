"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Star} from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Button } from "./ui/button";

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
    className,
    type,
  } = props;

  const router = useRouter();

  const displayName = `${firstName.toUpperCase()}${lastNameInitial ? ` ${lastNameInitial.toUpperCase()}.` : ""
    }`;

  const showFavoriteToggle = type === "search" || type === "favorites";
  const isInvitation = type === "invitationsSent" || type === "invitationsReceived";

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
              "w-20 h-20 bg-accent-color4 flex items-center justify-center"
            )}
          >
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={displayName}
                fill
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-xl font-bold">
                {firstName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>

        <CardContent className="flex-1 min-w-0 p-0 gap-1">
          <div className="text-sm font-semibold tracking-wide uppercase wrap-break-word">
            {displayName}
          </div>
          {languages.length > 0 && (
            <div className="mt-0.5 text-sm text-muted-foreground wrap-break-word">
              {(languages.length > 0 && isInvitation && footerContent) ? footerContent: languages.join(" · ")}
            </div>
          )}
        </CardContent>
        <div className="absolute top-2 right-2">
          
              <Star className= {cn("w-6 h-6", isFavorite ? "fill-accent-gold text-accent-gold" : "fill-transparent text-accent-gold")} strokeWidth={2.5}/>
        </div>
      </div>
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
