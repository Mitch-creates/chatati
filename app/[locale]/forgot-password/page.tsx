import { ForgotPasswordForm } from "@/components/forms/forgotPasswordForm";
import { Spinner } from "@/components/ui/spinner";
import { getCachedTranslations, getTranslation } from "@/lib/i18n-helpers";
import { Suspense } from "react";

async function ForgotPasswordContent({ locale }: { locale: string }) {
  const onboardingMessages = await getCachedTranslations(locale, "onboarding");

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            {getTranslation(onboardingMessages, "forgotPassword")}
          </h2>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <Suspense fallback={<Spinner />}>
      <ForgotPasswordContent locale={locale} />
    </Suspense>
  );
}
