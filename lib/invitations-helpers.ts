import type { ContactRequestWithUsers } from "@/lib/services/contact-request.service";

export function formatDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function getDisplayUser(
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
  const firstName = user.firstName || user.name.split(" ")[0] || user.name;
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

export function getStatusLabel(
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
