import { requireAuthAndEmailVerified } from "@/lib/auth-utils";
import { getSessionHelper } from "@/lib/auth-utils";
import {
  getContactRequestsReceived,
  getContactRequestsSent,
} from "@/lib/services/contact-request.service";
import { getCachedTranslations, getTranslation } from "@/lib/i18n-helpers";
import {
  formatDate,
  getDisplayUser,
  getStatusLabel,
} from "@/lib/invitations-helpers";
import { ProfileCard } from "@/components/profile-card";
import { Link } from "@/i18n/navigation";

const OVERVIEW_LIMIT = 3;

export default async function InvitesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await requireAuthAndEmailVerified();
  const session = await getSessionHelper();
  const userId = session?.user?.id;
  if (!userId) {
    return null;
  }

  const locale = (await params).locale;

  const [invitationsMessages, languageMessages, received, sent] =
    await Promise.all([
      getCachedTranslations(locale, "invitations"),
      getCachedTranslations(locale, "languages"),
      getContactRequestsReceived(userId, { view: "history", limit: OVERVIEW_LIMIT }),
      getContactRequestsSent(userId, { view: "history", limit: OVERVIEW_LIMIT }),
    ]);

  const invitationsMsgs = invitationsMessages as Record<string, string>;
  const langMsgs = languageMessages as Record<string, string>;

  return (
    <div className="min-h-screen bg-accent-white">
      <div className="container mx-auto py-8 px-4 sm:px-6 space-y-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight">
          {getTranslation(invitationsMessages, "title")}
        </h1>

        {/* Recent received */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold uppercase">
            {getTranslation(invitationsMessages, "receivedInvitations")}
          </h2>
          {received.items.length === 0 ? (
            <p className="text-muted-foreground">
              {getTranslation(invitationsMessages, "noReceived")}
            </p>
          ) : (
            <div className="w-full md:max-w-2xl">
              <ul className="space-y-3">
                {received.items.map((item) => {
                  const user = getDisplayUser(item, "sender", langMsgs);
                  return (
                    <li key={item.id}>
                      <ProfileCard
                        id={user.id}
                        href={`/platform/profile/${user.id}`}
                        type="invitationsReceived"
                        imageUrl={user.imageUrl}
                        firstName={user.firstName}
                        lastNameInitial={user.lastNameInitial}
                        languages={user.languages}
                        footerContent={
                          <span>
                            {formatDate(item.createdAt, locale)} –{" "}
                            {getStatusLabel(item.status, invitationsMsgs)}
                          </span>
                        }
                        invitationRequestId={item.id}
                        invitationStatus={item.status}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          <p className="text-sm">
            <Link
              href="/platform/invites/received"
              className="font-medium underline hover:no-underline"
            >
              {getTranslation(invitationsMessages, "viewFullHistory")}
            </Link>
          </p>
        </section>

        {/* Recent sent */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold uppercase">
            {getTranslation(invitationsMessages, "sentInvitations")}
          </h2>
          {sent.items.length === 0 ? (
            <p className="text-muted-foreground">
              {getTranslation(invitationsMessages, "noSent")}
            </p>
          ) : (
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
                        footerContent={
                          <span>
                            {formatDate(item.createdAt, locale)} –{" "}
                            {getStatusLabel(item.status, invitationsMsgs)}
                          </span>
                        }
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          <p className="text-sm">
            <Link
              href="/platform/invites/sent"
              className="font-medium underline hover:no-underline"
            >
              {getTranslation(invitationsMessages, "viewFullHistory")}
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
