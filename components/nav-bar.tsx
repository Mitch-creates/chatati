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

interface NavbarProps {
  initialSession?: Awaited<
    ReturnType<typeof import("@/lib/auth-utils").getSessionHelper>
  > | null;
}

export default function Navbar({ initialSession }: NavbarProps) {
  const navigationMessages = useTranslations("navigation");
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  const effectiveSession =
    initialSession !== undefined ? initialSession : session;
  const effectiveIsPending = initialSession !== undefined ? false : isPending;

  const user = effectiveSession?.user;

  return (
    <nav className="flex justify-between items-center p-4 border-b-2 select-none">
      <h1>
        <Link href="/">Logo Website</Link>
      </h1>
      <ul className="flex space-x-4">
        <li>
          <Link href="/Content">{navigationMessages("news")}</Link>
        </li>
        <li>
          <Link href="/Dashboard">{navigationMessages("about")}</Link>
        </li>
      </ul>
      {user && !effectiveIsPending ? (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="flex items-center gap-2">
              {
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              }
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <Link href={`/profile/${user.id}`}>Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/account/settings">Settings</Link>
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
