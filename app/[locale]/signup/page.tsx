import { SignUpForm } from "@/components/account/signUpForm";
import { useTranslations } from "next-intl";

export default function SignUp() {
  const onboardingMessages = useTranslations("onboarding");
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side or Top - Welcome text */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-12">
        <div className="w-full max-w-md space-y-4 text-center lg:text-left">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
            {onboardingMessages("becomeAChatati")}
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            {onboardingMessages("welcomeMessage")}
          </p>
        </div>
      </div>

      {/* Right side or Bottom - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-12 bg-gray-50">
        <div className="w-full lg:max-w-2xl md:max-w-xl max-w-md">
          <SignUpForm />
        </div>
      </div>
    </div>
  );
}
