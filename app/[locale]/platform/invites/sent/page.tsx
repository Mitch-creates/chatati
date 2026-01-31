import { requireAuthAndEmailVerified } from "@/lib/auth-utils";
import { getSessionHelper } from "@/lib/auth-utils";
import { getContactRequestsSent } from "@/lib/services/contact-request.service";
import { getCachedTranslations, getTranslation } from "@/lib/i18n-helpers";
import {
  getDisplayUser,
} from "@/lib/invitations-helpers";
import { ProfileCard } from "@/components/profile-card";
import { Pagination } from "@/components/ui/pagination";
import { Link } from "@/i18n/navigation";

export default async function InvitesSentPage({
  searchParams,
  params,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  params: Promise<{ locale: string }>;
}) {
  await requireAuthAndEmailVerified();
  const session = await getSessionHelper();
  const userId = session?.user?.id;
  if (!userId) {
    return null;
  }

  const resolved = await searchParams;
  const locale = (await params).locale;
  const page = Math.max(
    1,
    parseInt(typeof resolved.page === "string" ? resolved.page : "1", 10)
  );

  const [invitationsMessages, languageMessages, sent] = await Promise.all([
    getCachedTranslations(locale, "invitations"),
    getCachedTranslations(locale, "languages"),
    getContactRequestsSent(userId, { view: "history", page }),
  ]);

  const langMsgs = languageMessages as Record<string, string>;

  return (
    <div className="min-h-screen bg-accent-white">
      <div className="container mx-auto py-8 px-4 sm:px-6 space-y-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight">
          {getTranslation(invitationsMessages, "sentInvitations")}
        </h1>

        <p className="text-sm">
          <Link
            href="/platform/invites"
            className="font-medium underline hover:no-underline"
          >
            ← {getTranslation(invitationsMessages, "backToInvitations")}
          </Link>
        </p>

        {sent.items.length === 0 ? (
          <p className="text-muted-foreground">
            {getTranslation(invitationsMessages, "noSent")}
          </p>
        ) : (
          <>
            <div className="w-full md:max-w-2xl">
              <ul className="space-y-3">
                {sent.items.map((item) => {
                const user = getDisplayUser(item, "recipient", langMsgs);
                return (
                  <li key={item.id}>
                    <ProfileCard
                      id={user.id}
                      href={`/platform/profile/${user.id}`}
                      type="invitationsSent"
                      imageUrl={user.imageUrl}
                      firstName={user.firstName}
                      lastNameInitial={user.lastNameInitial}
                      languages={user.languages}
                      invitationRequestId={item.id}
                      invitationStatus={item.status}
                      invitationCreatedAt={item.createdAt}
                    />
                  </li>
                );
              })}
              </ul>
            </div>
            {sent.pageCount > 1 && (
              <Pagination
                page={sent.page}
                pageCount={sent.pageCount}
                basePath="/platform/invites/sent"
                pageParam="page"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
