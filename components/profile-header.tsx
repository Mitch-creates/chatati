import { UserWithProfile } from "@/lib/services/user.service";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function ProfileHeader({ user }: { user: UserWithProfile }) {
  return (
    <div className={cn(
        "relative rounded-full border-4 border-black",
        "flex items-center justify-center",
        "bg-white hover:bg-gray-50 transition-colors",
        "overflow-hidden",
      )}>
        {user.image ? <Image src={user.image} alt={user.name} width={100} height={100} /> :
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">{user.name.charAt(0).toUpperCase()}</div>
        }
      </div>
  );}
