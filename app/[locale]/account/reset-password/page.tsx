import { ResetPasswordForm } from "@/components/account/resetPasswordForm";
import { Spinner } from "@/components/ui/spinner";
import { getCachedTranslations, getTranslation } from "@/lib/i18n-helpers";
import { Suspense } from "react";

async function ResetPasswordContent({ locale }: { locale: string }) {
  const onboardingMessages = await getCachedTranslations(locale, "onboarding");

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            {getTranslation(onboardingMessages, "resetPassword")}
          </h2>
        </div>
        <ResetPasswordForm />
      </div>
    </div>
  );
}

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <Suspense fallback={<Spinner />}>
      <ResetPasswordContent locale={locale} />
    </Suspense>
  );
}
