import { Spinner } from "@/components/ui/spinner";
import { getCachedTranslations } from "@/lib/i18n-helpers";
import { Suspense } from "react";

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
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold">Edit Account</h1>
      <div>{isFromNewUser ? "New User" : "Not New User"}</div>
    </div>
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
