import { SignInForm } from "@/components/forms/signInForm";
import { Spinner } from "@/components/ui/spinner";
import { getCachedTranslations, getTranslation } from "@/lib/i18n-helpers";
import { Suspense } from "react";

async function SignInContent({ locale }: { locale: string }) {
  const onboardingMessages = await getCachedTranslations(locale, "onboarding");

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side or Top - Welcome text */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-12">
        <div className="w-full max-w-md space-y-4 text-center lg:text-left">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
            {getTranslation(onboardingMessages, "welcomeBack")}
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            {getTranslation(onboardingMessages, "welcomeBackMessage")}
          </p>
        </div>
      </div>

      {/* Right side or Bottom - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-12">
        <div className="w-full lg:max-w-2xl md:max-w-xl max-w-md">
          <SignInForm />
        </div>
      </div>
    </div>
  );
}

export default async function SignIn({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <Suspense fallback={<Spinner />}>
      <SignInContent locale={locale} />
    </Suspense>
  );
}
