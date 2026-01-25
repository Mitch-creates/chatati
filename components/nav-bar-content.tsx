"use client";
import Link from "next/link";
import CtaButton from "./cta-button";
import RegularButton from "./regular-button";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { UsersRound } from "lucide-react";

type SessionType = Awaited<
  ReturnType<typeof import("@/lib/auth-utils").getSessionHelper>
> | null;

interface NavbarContentProps {
  session: SessionType;
  isPending: boolean;
}

export function NavbarContent({ session, isPending }: NavbarContentProps) {
  const navigationMessages = useTranslations("navigation");
  const router = useRouter();

  const user = session?.user;

  return (
    <nav className="flex justify-between items-center p-4 border-b-4 border-black select-none">
      <h1>
        <Link href="/" className="flex items-center">
          <UsersRound className="w-10 h-10 text-accent-color2" />
        </Link>
      </h1>
      <ul className="flex space-x-4">
        {/* Platform navigation - only visible when logged in */}
        {user && !isPending && (
          <>
            <li>
              <Link href="/platform/search-chatati">
                {navigationMessages("searchChatatis")}
              </Link>
            </li>
            <li>
              <Link href="/platform/invites">
                {navigationMessages("invites")}
              </Link>
            </li>
            <li>
              <Link href="/platform/favorites">
                {navigationMessages("savedChatatis")}
              </Link>
            </li>
          </>
        )}
        {/* Public navigation - visible to everyone */}
        <li>
          <Link href="/news">{navigationMessages("news")}</Link>
        </li>
        <li>
          <Link href="/about">{navigationMessages("about")}</Link>
        </li>
      </ul>
      {user && !isPending ? (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <Link href={`/platform/profile/${user.id}`}>{navigationMessages("myProfile")}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/platform/account/edit">{navigationMessages("editProfile")}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/platform/account/edit">{navigationMessages("accountSettings")}</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                await authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      router.push("/");
                      router.refresh();
                    },
                  },
                });
              }}
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : isPending ? (
        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
      ) : (
        <ul className="flex space-x-4">
          <li>
            <Link href="/signin">
              <RegularButton>{navigationMessages("signIn")}</RegularButton>
            </Link>
          </li>
          <li>
            <Link href="/signup">
              <CtaButton accent="color2">
                {navigationMessages("signUp")}
              </CtaButton>
            </Link>
          </li>
        </ul>
      )}
    </nav>
  );
}
