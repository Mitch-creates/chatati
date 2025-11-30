import { SignInForm } from "@/components/account/signInForm";
import { Spinner } from "@/components/ui/spinner";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

export default async function SignIn() {
  const onboardingMessages = await getTranslations("onboarding");
  return (
    <Suspense fallback={<Spinner />}>
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left side or Top - Welcome text */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-12">
          <div className="w-full max-w-md space-y-4 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              {onboardingMessages("welcomeBack")}
            </h1>
            <p className="text-base sm:text-lg text-gray-600">
              {onboardingMessages("welcomeBackMessage")}
            </p>
          </div>
        </div>

        {/* Right side or Bottom - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-12 bg-gray-50">
          <div className="w-full lg:max-w-2xl md:max-w-xl max-w-md">
            <SignInForm />
          </div>
        </div>
      </div>
    </Suspense>
  );
}
