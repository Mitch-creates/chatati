import ProfileHeader from "@/components/profile-header";
import ProfileDetails from "@/components/profile-details";
import { Spinner } from "@/components/ui/spinner";
import { getSessionHelper } from "@/lib/auth-utils";
import { getUserWithProfile } from "@/lib/services/user.service";
import { hasContactRequestFromSenderToRecipient } from "@/lib/services/contact-request.service";
import { notFound } from "next/navigation";
import { Suspense } from "react";

async function ProfilePageContent({userId, locale}: {userId: string; locale: string}) {
  const [user, session] = await Promise.all([
    getUserWithProfile(userId),
    getSessionHelper(),
  ]);

  const isOwnProfile = session?.user?.id === userId;

  if (!user) {
    notFound();
  }

  const hasContacted =
    !isOwnProfile && session?.user?.id
      ? await hasContactRequestFromSenderToRecipient(session.user.id, userId)
      : false;

  return (
    <div className="min-h-screen bg-accent-white">
      <div className="container mx-auto py-8">
        <ProfileHeader
          user={user}
          isOwnProfile={isOwnProfile}
          hasContacted={hasContacted}
          locale={locale}
        />
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

