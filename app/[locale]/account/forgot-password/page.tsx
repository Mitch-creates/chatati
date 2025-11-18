import { ForgotPasswordForm } from "@/components/account/forgotPasswordForm";
import { getTranslations } from "next-intl/server";

export default async function ForgotPasswordPage() {
  const t = await getTranslations("onboarding");

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            {t("forgotPassword")}
          </h2>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
