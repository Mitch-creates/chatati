import { Spinner } from "@/components/ui/spinner";
import { getCachedTranslations } from "@/lib/i18n-helpers";
import { Suspense } from "react";
import { EditProfileForm } from "@/components/forms/editProfileForm";

async function EditPageContent({
  searchParams,
  locale,
}: {
  searchParams: Promise<{ newUser: string }>;
  locale: string;
}) {
  const { newUser } = await searchParams;
  const isFromNewUser = newUser === "true";
  const onboardingMessages = await getCachedTranslations(
    locale,
    "profileCreation"
  );
  return (
    <><div className="bg-accent-color2 items-center justify-center flex flex-col gap-4 min-h-[calc(30vh-4rem)] py-12 px-4 sm:px-6 lg:px-8">
      {isFromNewUser ? <><h1 className="text-5xl font-bold">Welcome to Chatati!</h1> <p className="text-2xl">Please complete your profile to start using Chatati.</p></>
       : <><h1 className="text-5xl font-bold">Edit your Profile</h1> <p className="text-2xl">Please edit your profile to update your information.</p></>}
      
    </div>
    <EditProfileForm /></>
  );
}

export default async function EditPage({
  searchParams,
  params,
}: {
  searchParams: Promise<{ newUser: string }>;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <Suspense fallback={<Spinner />}>
      <EditPageContent searchParams={searchParams} locale={locale} />
    </Suspense>
  );
}
