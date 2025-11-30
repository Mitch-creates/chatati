"use client";
import { NavbarContent } from "./nav-bar-content";
import { authClient } from "@/lib/auth-client";
import { useRef, useState, useEffect } from "react";

interface NavbarProps {
  initialSession?: Awaited<
    ReturnType<typeof import("@/lib/auth-utils").getSessionHelper>
  > | null;
}

export default function Navbar({ initialSession }: NavbarProps) {
  const { data: session, isPending } = authClient.useSession();
  const [currentSession, setCurrentSession] = useState(initialSession ?? null);
  const initialSessionRef = useRef(initialSession);
  const hasSwitchedRef = useRef(false);

  useEffect(() => {
    // Only switch to hook data if:
    // 1. Hook is not pending
    // 2. Session has actually changed (e.g., after sign-in)
    // 3. We haven't switched yet OR session is different from initial
    if (!isPending && session !== undefined) {
      const sessionChanged =
        session?.user?.id !== initialSessionRef.current?.user?.id;

      if (sessionChanged || !hasSwitchedRef.current) {
        setCurrentSession(session ?? null);
        hasSwitchedRef.current = true;
      }
    }
  }, [session, isPending]);

  // Always use currentSession state, which starts with initialSession
  // This prevents flash because we control when it updates
  return (
    <NavbarContent
      session={currentSession}
      isPending={initialSession !== undefined ? false : isPending}
    />
  );
}
