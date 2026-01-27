import ProfileHeader from "@/components/profile-header";
import ProfileDetails from "@/components/profile-details";
import { Spinner } from "@/components/ui/spinner";
import { getSessionHelper } from "@/lib/auth-utils";
import { getUserWithProfile } from "@/lib/services/user.service";
import { notFound } from "next/navigation";
import { Suspense } from "react";

async function ProfilePageContent({userId, locale}: {userId: string; locale: string}) {
  const user = await getUserWithProfile(userId);
  const session = await getSessionHelper();
  
  // Check if this is the user's own profile
  const isOwnProfile = session?.user?.id === userId;

  if (!user) {
    notFound();
  }
  
  return (
    <div className="min-h-screen bg-accent-white">
      <div className="container mx-auto py-8">
        <ProfileHeader user={user} isOwnProfile={isOwnProfile} locale={locale} />
        <ProfileDetails user={user} locale={locale} />
      </div>
    </div>
  );
}

export default async function ProfilePage({params}: {params: Promise<{id: string; locale: string}>}) {
  const {id, locale} = await params;

  
  return (
    <Suspense fallback={<Spinner />}>
      <ProfilePageContent userId={id} locale={locale} />
    </Suspense>
  );
}

