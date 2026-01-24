import { Spinner } from "@/components/ui/spinner";
import { requireAuthAndEmailVerified } from "@/lib/auth-utils";
import { Suspense } from "react";

export default async function ProfilePage() {
  const session = await requireAuthAndEmailVerified();
  const user = session.user;
  
  return (
    <Suspense fallback={<Spinner />}>
      <div>Profile page for {user.email}</div>
    </Suspense>
  );
}

