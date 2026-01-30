import { requireAuthAndEmailVerified } from "@/lib/auth-utils";
import { getSessionHelper } from "@/lib/auth-utils";
import { getContactRequestsReceived } from "@/lib/services/contact-request.service";
import { getCachedTranslations, getTranslation } from "@/lib/i18n-helpers";
import {
  formatDate,
  getDisplayUser,
  getStatusLabel,
} from "@/lib/invitations-helpers";
import { ProfileCard } from "@/components/profile-card";
import { Pagination } from "@/components/ui/pagination";
import { InvitationActions } from "@/components/invitation-actions";
import { Link } from "@/i18n/navigation";

export default async function InvitesReceivedPage({
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

  const [invitationsMessages, languageMessages, received] = await Promise.all([
    getCachedTranslations(locale, "invitations"),
    getCachedTranslations(locale, "languages"),
    getContactRequestsReceived(userId, { view: "history", page }),
  ]);

  const invitationsMsgs = invitationsMessages as Record<string, string>;
  const langMsgs = languageMessages as Record<string, string>;

  return (
    <div className="min-h-screen bg-accent-white">
      <div className="container mx-auto py-8 px-4 sm:px-6 space-y-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight">
          {getTranslation(invitationsMessages, "receivedInvitations")}
        </h1>

        <p className="text-sm">
          <Link
            href="/platform/invites"
            className="font-medium underline hover:no-underline"
          >
            ← {getTranslation(invitationsMessages, "backToInvitations")}
          </Link>
        </p>

        {received.items.length === 0 ? (
          <p className="text-muted-foreground">
            {getTranslation(invitationsMessages, "noReceived")}
          </p>
        ) : (
          <>
            <ul className="space-y-3">
              {received.items.map((item) => {
                const user = getDisplayUser(item, "sender", langMsgs);
                const footer = (
                  <>
                    <span>
                      {formatDate(item.createdAt, locale)} –{" "}
                      {getStatusLabel(item.status, invitationsMsgs)}
                    </span>
                    {item.status === "PENDING" && (
                      <InvitationActions requestId={item.id} />
                    )}
                  </>
                );
                return (
                  <li key={item.id}>
                    <ProfileCard
                      id={user.id}
                      href={`/platform/profile/${user.id}`}
                      imageUrl={user.imageUrl}
                      firstName={user.firstName}
                      lastNameInitial={user.lastNameInitial}
                      languages={user.languages}
                      footerContent={footer}
                    />
                  </li>
                );
              })}
            </ul>
            {received.pageCount > 1 && (
              <Pagination
                page={received.page}
                pageCount={received.pageCount}
                basePath="/platform/invites/received"
                pageParam="page"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
