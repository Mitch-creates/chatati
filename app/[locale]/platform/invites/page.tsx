import { requireAuthAndEmailVerified } from "@/lib/auth-utils";
import { getSessionHelper } from "@/lib/auth-utils";
import {
  getContactRequestsReceived,
  getContactRequestsSent,
  ContactRequestWithUsers,
} from "@/lib/services/contact-request.service";
import { getCachedTranslations, getTranslation } from "@/lib/i18n-helpers";
import { ProfileCard } from "@/components/profile-card";
import { Pagination } from "@/components/ui/pagination";
import { InvitationActions } from "@/components/invitation-actions";
import { Link } from "@/i18n/navigation";

const PAGE_SIZE = 10;

function formatDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function getDisplayUser(
  item: ContactRequestWithUsers,
  type: "sender" | "recipient",
  languageMessages: Record<string, string>
) {
  const user = type === "sender" ? item.sender : item.recipient;
  if (!user) {
    return {
      id: "",
      firstName: "",
      lastNameInitial: "",
      imageUrl: null as string | null,
      languages: [] as string[],
    };
  }
  const firstName =
    user.firstName || user.name.split(" ")[0] || user.name;
  const lastNameInitial = user.lastName
    ? user.lastName.charAt(0).toUpperCase()
    : user.name.split(" ")[1]?.charAt(0).toUpperCase() ?? "";
  const languages: string[] = [];
  if (user.profile) {
    user.profile.nativeLangs.forEach((l) => {
      languages.push(languageMessages[l.code] || l.name);
    });
    user.profile.learningLangs.forEach((l) => {
      languages.push(languageMessages[l.code] || l.name);
    });
  }
  const imageUrl = user.image?.startsWith("http")
    ? user.image
    : user.image
      ? `https://${user.image}`
      : null;
  return {
    id: user.id,
    firstName,
    lastNameInitial,
    imageUrl,
    languages: [...new Set(languages)],
  };
}

function getStatusLabel(
  status: string,
  invitationsMessages: Record<string, string>
): string {
  switch (status) {
    case "PENDING":
      return invitationsMessages.statusPending ?? "Pending";
    case "ACCEPTED":
      return invitationsMessages.statusAnswered ?? "Answered";
    case "DECLINED":
      return invitationsMessages.statusDeclined ?? "Declined";
    default:
      return status;
  }
}

export default async function InvitesPage({
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
  const section = typeof resolved.section === "string" ? resolved.section : null;
  const view = (resolved.view as string) ?? "current";
  const receivedPage = Math.max(
    1,
    parseInt(typeof resolved.receivedPage === "string" ? resolved.receivedPage : "1", 10)
  );
  const sentPage = Math.max(
    1,
    parseInt(typeof resolved.sentPage === "string" ? resolved.sentPage : "1", 10)
  );
  const historyPage = Math.max(
    1,
    parseInt(typeof resolved.page === "string" ? resolved.page : "1", 10)
  );

  const [invitationsMessages, languageMessages] = await Promise.all([
    getCachedTranslations(locale, "invitations"),
    getCachedTranslations(locale, "languages"),
  ]);

  const showMainView = !section;
  const showReceivedHistory = section === "received" && view === "history";
  const showSentHistory = section === "sent" && view === "history";

  const [receivedCurrent, sentCurrent, receivedHistory, sentHistory] =
    await Promise.all([
      showMainView
        ? getContactRequestsReceived(userId, {
            page: receivedPage,
            view: "current",
          })
        : null,
      showMainView
        ? getContactRequestsSent(userId, {
            page: sentPage,
            view: "current",
          })
        : null,
      showReceivedHistory
        ? getContactRequestsReceived(userId, {
            page: historyPage,
            view: "history",
          })
        : null,
      showSentHistory
        ? getContactRequestsSent(userId, {
            page: historyPage,
            view: "history",
          })
        : null,
    ]);

  const received = showReceivedHistory ? receivedHistory : receivedCurrent;
  const sent = showSentHistory ? sentHistory : sentCurrent;

  return (
    <div className="min-h-screen bg-accent-white">
      <div className="container mx-auto py-8 px-4 space-y-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight">
          {getTranslation(invitationsMessages, "title")}
        </h1>

        {/* New invitations (received) - current or history */}
        {(showMainView || showReceivedHistory) && received && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase">
              {getTranslation(invitationsMessages, "newInvitations")}
            </h2>
            {received.items.length === 0 ? (
              <p className="text-muted-foreground">
                {getTranslation(invitationsMessages, "noUnanswered")}
              </p>
            ) : (
              <ul className="space-y-3">
                {received.items.map((item) => {
                  const user = getDisplayUser(
                    item,
                    "sender",
                    languageMessages as Record<string, string>
                  );
                  const footer = (
                    <>
                      <span>
                        {formatDate(item.createdAt, locale)} –{" "}
                        {getStatusLabel(item.status, invitationsMessages)}
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
            )}
            {received.pageCount > 1 && (
              <Pagination
                page={received.page}
                pageCount={received.pageCount}
                basePath="/platform/invites"
                pageParam={showReceivedHistory ? "page" : "receivedPage"}
                query={
                  showReceivedHistory
                    ? { section: "received", view: "history" }
                    : undefined
                }
              />
            )}
            {showMainView && (
              <p className="text-sm">
                <Link
                  href="/platform/invites?section=received&view=history"
                  className="font-medium underline hover:no-underline"
                >
                  {getTranslation(invitationsMessages, "viewFullHistory")}
                </Link>
              </p>
            )}
          </section>
        )}

        {/* Sent invitations - current or history */}
        {(showMainView || showSentHistory) && sent && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase">
              {getTranslation(invitationsMessages, "sentInvitations")}
            </h2>
            {sent.items.length === 0 ? (
              <p className="text-muted-foreground">
                {getTranslation(
                  invitationsMessages,
                  showSentHistory ? "noUnanswered" : "noSentYet"
                )}
              </p>
            ) : (
              <ul className="space-y-3">
                {sent.items.map((item) => {
                  const user = getDisplayUser(
                    item,
                    "recipient",
                    languageMessages as Record<string, string>
                  );
                  const footer = (
                    <span>
                      {formatDate(item.createdAt, locale)} –{" "}
                      {getStatusLabel(item.status, invitationsMessages)}
                    </span>
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
            )}
            {sent.pageCount > 1 && (
              <Pagination
                page={sent.page}
                pageCount={sent.pageCount}
                basePath="/platform/invites"
                pageParam={showSentHistory ? "page" : "sentPage"}
                query={
                  showSentHistory
                    ? { section: "sent", view: "history" }
                    : undefined
                }
              />
            )}
            {showMainView && (
              <p className="text-sm">
                <Link
                  href="/platform/invites?section=sent&view=history"
                  className="font-medium underline hover:no-underline"
                >
                  {getTranslation(invitationsMessages, "viewFullHistory")}
                </Link>
              </p>
            )}
          </section>
        )}

        {(showReceivedHistory || showSentHistory) && (
          <p className="text-sm">
            <Link
              href="/platform/invites"
              className="font-medium underline hover:no-underline"
            >
              ← {getTranslation(invitationsMessages, "backToInvitations")}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
