import { getUserWithProfile } from "@/lib/services/user.service";
import { hasContactRequestFromSenderToRecipient } from "@/lib/services/contact-request.service";
import { getCachedTranslations, getTranslation } from "@/lib/i18n-helpers";
import { getSessionHelper } from "@/lib/auth-utils";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { ContactUserForm } from "@/components/forms/contactUserForm";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

async function ContactPageContent({
  userId,
  locale,
}: {
  userId: string;
  locale: string;
}) {
  const [user, session, contactMessages] = await Promise.all([
    getUserWithProfile(userId),
    getSessionHelper(),
    getCachedTranslations(locale, "contact"),
  ]);

  if (!user) {
    notFound();
  }

  const hasContacted =
    !!session?.user?.id &&
    (await hasContactRequestFromSenderToRecipient(session.user.id, userId));

  const firstName = user.firstName || user.name.split(" ")[0] || user.name;
  const imageSrc =
    user.image?.startsWith("http://") || user.image?.startsWith("https://")
      ? user.image
      : user.image
        ? `https://${user.image}`
        : null;

  const contactPrefix = getTranslation(contactMessages, "contactHeading");
  const heading = `${contactPrefix} ${firstName.toUpperCase()}`;

  return (
    <div className="min-h-screen bg-accent-white">
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center gap-6 py-8">
          <div
            className={cn(
              "relative rounded-full border-4 border-black",
              "flex items-center justify-center",
              "bg-white overflow-hidden",
              "w-32 h-32"
            )}
          >
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={user.name}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-accent-color4 flex items-center justify-center text-4xl font-bold">
                {firstName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold uppercase tracking-tight">
            {heading}
          </h1>
        </div>

        <div className="max-w-2xl mx-auto px-4">
          {hasContacted ? (
            <div className="space-y-4 text-center">
              <p className="text-muted-foreground">
                {getTranslation(contactMessages, "alreadyContacted")}
              </p>
              <p className="text-sm">
                <Link
                  href={`/platform/profile/${userId}`}
                  className="font-medium underline hover:no-underline"
                >
                  ← {getTranslation(contactMessages, "backToProfile")}
                </Link>
              </p>
            </div>
          ) : (
            <ContactUserForm
              recipientId={user.id}
              recipientFirstName={firstName}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;

  return (
    <Suspense fallback={<Spinner />}>
      <ContactPageContent userId={id} locale={locale} />
    </Suspense>
  );
}
