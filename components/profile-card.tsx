import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

export interface ProfileCardProps {
  id: string;
  href?: string;
  imageUrl?: string | null;
  firstName: string;
  lastNameInitial?: string | null;
  languages: string[];
  isFavorite?: boolean;
  type: "search" | "favorites" | "invitations";
  showFavoriteToggle?: boolean;
  onToggleFavorite?: (id: string, next: boolean) => void;
  footerContent?: React.ReactNode;
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

  const displayName = `${firstName.toUpperCase()}${
    lastNameInitial ? ` ${lastNameInitial.toUpperCase()}.` : ""
  }`;

  const showFavoriteToggle = type !== "invitations";

  const cardInner = (
    <Card
      className={cn(
        "relative flex items-center gap-4 border-2 border-black bg-white",
        "shadow-[4px_4px_0_0_black] rounded-lg px-4 py-3",
        "cursor-pointer",
        className
      )}
      data-profile-id={id}
    >
      {/* Avatar */}
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

      {/* Main content */}
      <CardContent className="flex-1 p-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-sm font-semibold tracking-wide uppercase">
              {displayName}
            </div>
            {languages.length > 0 && (
              <div className="mt-1 text-sm text-muted-foreground">
                {languages.join(" · ")}
              </div>
            )}
          </div>

          {/* Favorite toggle (only when explicitly enabled) */}
          {showFavoriteToggle && (
            <button
              type="button"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              className={cn(
                "ml-2 inline-flex items-center justify-center rounded-full border-2 border-black",
                "w-8 h-8 bg-accent-color2 text-black",
                "shadow-[2px_2px_0_0_black]",
                "hover:translate-y-0.5 hover:shadow-none",
                "transition-transform"
              )}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                if (onToggleFavorite) {
                  onToggleFavorite(id, !isFavorite);
                }
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
        </div>

        {footerContent && (
          <div className="mt-2 text-sm text-muted-foreground">{footerContent}</div>
        )}
      </CardContent>
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

