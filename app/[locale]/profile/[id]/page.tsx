import { requireAuthAndEmailVerified } from "@/lib/auth-utils";

export default async function ProfilePage() {
  const session = await requireAuthAndEmailVerified();
  const user = session.user;
  return <div>Profile page for {user.email}</div>;
}
