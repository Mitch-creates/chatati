import { UserWithProfile } from "@/lib/services/user.service";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function ProfileHeader({ user }: { user: UserWithProfile }) {
  // Ensure image URL is a full URL (external) for Next.js Image component
  const imageSrc = user.image?.startsWith("http://") || user.image?.startsWith("https://")
    ? user.image
    : user.image
      ? `https://${user.image}`
      : null;

  // Check if it's an external URL (R2 or other external source)
  const isExternalUrl = imageSrc?.startsWith("http://") || imageSrc?.startsWith("https://");

  return (
    <div className={cn(
        "relative rounded-full border-4 border-black",
        "flex items-center justify-center",
        "bg-white hover:bg-gray-50 transition-colors",
        "overflow-hidden",
      )}>
        {imageSrc ? (
          <Image 
            src={imageSrc} 
            alt={user.name} 
            width={100} 
            height={100}
            className="object-cover"
            unoptimized={isExternalUrl} // Disable optimization for external URLs to avoid Next.js trying to fetch them as local paths
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
  );}
