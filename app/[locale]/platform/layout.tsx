import { requireAuthAndEmailVerified } from "@/lib/auth-utils";
import { ReactNode } from "react";

export default async function PlatformLayout({
  children,
}: {
  children: ReactNode;
}) {
  // This will redirect to signin if not authenticated
  // or to /verify-email if email not verified
  await requireAuthAndEmailVerified();

  return <>{children}</>;
}
