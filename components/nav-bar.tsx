"use client";
import { NavbarContent } from "./nav-bar-content";
import { authClient } from "@/lib/auth-client";
import { useState, useEffect } from "react";

interface NavbarProps {
  initialSession?: Awaited<
    ReturnType<typeof import("@/lib/auth-utils").getSessionHelper>
  > | null;
}

export default function Navbar({ initialSession }: NavbarProps) {
  const { data: session, isPending } = authClient.useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // On first render (server + initial client), use initialSession to prevent flash
  // After mount, use hook data so it can update when session changes (e.g., after sign-in)
  const effectiveSession = mounted ? session ?? null : initialSession ?? null;
  const effectiveIsPending = mounted
    ? isPending
    : initialSession !== undefined
    ? false
    : isPending;

  return (
    <NavbarContent session={effectiveSession} isPending={effectiveIsPending} />
  );
}
