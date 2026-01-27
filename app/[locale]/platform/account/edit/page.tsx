import { Spinner } from "@/components/ui/spinner";
import { getCachedTranslations, getTranslation } from "@/lib/i18n-helpers";
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
  const profileMessages = await getCachedTranslations(
    locale,
    "profile"
  );
  const onboardingMessages = await getCachedTranslations(
    locale,
    "onboarding"
  );
  return (
    <><div className="bg-accent-color2 items-center justify-center flex flex-col gap-4 min-h-[calc(30vh-4rem)] py-12 px-4 sm:px-6 lg:px-8">
      {isFromNewUser ? <><h1 className="text-5xl font-bold">{getTranslation(onboardingMessages, "welcome")}</h1> <p className="text-xl">{getTranslation(onboardingMessages, "newUserProfileMessage")}</p></>
       : <h1 className="text-5xl font-bold">{getTranslation(profileMessages, "editProfile")}</h1>}
      
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
