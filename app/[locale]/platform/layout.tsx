import { requireAuthAndEmailVerified } from "@/lib/auth-utils";
import { ReactNode } from "react";

export default async function PlatformLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAuthAndEmailVerified();

  return <>{children}</>;
}
