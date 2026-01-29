import { UserWithProfile } from "@/lib/services/user.service";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import CtaButton from "./cta-button";
import { getCachedTranslations, getTranslation } from "@/lib/i18n-helpers";

interface ProfileHeaderProps {
  user: UserWithProfile;
  isOwnProfile: boolean;
  hasContacted?: boolean;
  locale: string;
}

export default async function ProfileHeader({
  user,
  isOwnProfile,
  hasContacted = false,
  locale,
}: ProfileHeaderProps) {
  const profileMessages = await getCachedTranslations(locale, "profile");

  // R2 URLs are always https://, but keep fallback for edge cases
  const imageSrc = user.image?.startsWith("http://") || user.image?.startsWith("https://")
    ? user.image
    : user.image
      ? `https://${user.image}`
      : null;

  // Format name: first name + first letter of last name
  const firstName = user.firstName || user.name.split(" ")[0] || user.name;
  const lastNameInitial = user.lastName ? user.lastName.charAt(0).toUpperCase() : (user.name.split(" ")[1]?.charAt(0).toUpperCase() || "");
  const displayName = `${firstName.toUpperCase()}${lastNameInitial ? ` ${lastNameInitial}.` : ""}`;

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      {/* Profile Picture */}
      <div className={cn(
        "relative rounded-full border-4 border-black",
        "flex items-center justify-center",
        "bg-white",
        "overflow-hidden",
        "w-32 h-32"
      )}>
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={user.name}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-accent-color4 flex items-center justify-center text-4xl font-bold">
            {firstName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Name */}
      <h1 className="text-4xl sm:text-5xl font-bold uppercase tracking-tight">
        {displayName}
      </h1>

      <span className="text-sm text-muted-foreground text-center">
        {getTranslation(profileMessages, "accountCreated")}{" "}
        {new Intl.DateTimeFormat(locale, {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(new Date(user.createdAt))}
        {" · "}
        {getTranslation(profileMessages, "lastLogin")}{" "}
        {user.lastLoginAt
          ? new Intl.DateTimeFormat(locale, {
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(new Date(user.lastLoginAt))
          : getTranslation(profileMessages, "lastLoginNever")}
      </span>

      <div className="flex flex-wrap justify-center gap-4">
        {/* Edit Profile Button - Only show if it's their own profile */}
        {isOwnProfile ? (
          <Link href={`/platform/account/edit`}>
            <CtaButton>
              {getTranslation(profileMessages, "editProfile")}
            </CtaButton>
          </Link>
        ) : hasContacted ? (
          <CtaButton disabled>
            {getTranslation(profileMessages, "contacted")}
          </CtaButton>
        ) : (
          <Link href={`/platform/contact/${user.id}`}>
            <CtaButton>{getTranslation(profileMessages, "contactThisChatati")}</CtaButton>
          </Link>
        )}
      </div>
    </div>
  );
}