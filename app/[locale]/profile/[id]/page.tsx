import { getSessionHelper } from "@/lib/auth-utils";

export default async function ProfilePage() {
  const session = await getSessionHelper();
  return <div>Profile page</div>;
}
