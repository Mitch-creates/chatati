import ProfileHeader from "@/components/profile-header";
import { Spinner } from "@/components/ui/spinner";
import { requireAuthAndEmailVerified } from "@/lib/auth-utils";
import { getUserWithProfile } from "@/lib/services/user.service";
import { cn } from "@/lib/utils";
import { notFound } from "next/navigation";
import { Suspense } from "react";

async function ProfilePageContent({userId, locale}: {userId: string; locale: string}) {
  const user = await getUserWithProfile(userId);

  if (!user) {
    notFound();
  }
  return (
    <>
    <ProfileHeader user={user} />
    </>
  );
}

export default async function ProfilePage({params}: {params: Promise<{id: string; locale: string}>}) {
  const session = await requireAuthAndEmailVerified();
  const {id, locale} = await params;

  
  return (
    <Suspense fallback={<Spinner />}>
      <ProfilePageContent userId={id} locale={locale} />
    </Suspense>
  );
}

