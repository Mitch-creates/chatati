import { prisma } from "@/lib/prisma";
import type { ContactRequestStatus } from "@prisma/client";

const PAGE_SIZE = 10;

export type ContactRequestWithUsers = {
  id: string;
  message: string | null;
  status: ContactRequestStatus;
  createdAt: Date;
  respondedAt: Date | null;
  sender: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    name: string;
    image: string | null;
    profile: {
      nativeLangs: { code: string; name: string }[];
      learningLangs: { code: string; name: string }[];
    } | null;
  } | null;
  recipient: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    name: string;
    image: string | null;
    profile: {
      nativeLangs: { code: string; name: string }[];
      learningLangs: { code: string; name: string }[];
    } | null;
  } | null;
};

export async function createContactRequest(
  senderId: string,
  recipientId: string,
  message: string
) {
  return prisma.contactRequest.create({
    data: {
      senderId,
      recipientId,
      message: message.trim(),
    },
  });
}

export async function getContactRequestsReceived(
  userId: string,
  options: { page?: number; view?: "current" | "history"; limit?: number }
) {
  const view = options.view ?? "current";
  const limit = options.limit;
  const useLimit = limit != null && limit > 0;
  const page = useLimit ? 1 : Math.max(1, options.page ?? 1);
  const take = useLimit ? limit : PAGE_SIZE;
  const skip = useLimit ? 0 : (page - 1) * PAGE_SIZE;

  const where =
    view === "current"
      ? { recipientId: userId, status: "PENDING" as const }
      : { recipientId: userId };

  const [items, total] = await Promise.all([
    prisma.contactRequest.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            name: true,
            image: true,
            profile: {
              select: {
                nativeLangs: { select: { code: true, name: true } },
                learningLangs: { select: { code: true, name: true } },
              },
            },
          },
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            name: true,
            image: true,
            profile: {
              select: {
                nativeLangs: { select: { code: true, name: true } },
                learningLangs: { select: { code: true, name: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.contactRequest.count({ where }),
  ]);

  return {
    items: items.map((item) => ({
      id: item.id,
      message: item.message,
      status: item.status,
      createdAt: item.createdAt,
      respondedAt: item.respondedAt,
      sender: item.sender,
      recipient: item.recipient,
    })) as ContactRequestWithUsers[],
    total,
    page,
    pageCount: useLimit ? 1 : Math.ceil(total / PAGE_SIZE) || 1,
  };
}

export async function getContactRequestsSent(
  userId: string,
  options: { page?: number; view?: "current" | "history"; limit?: number }
) {
  const view = options.view ?? "current";
  const limit = options.limit;
  const useLimit = limit != null && limit > 0;
  const page = useLimit ? 1 : Math.max(1, options.page ?? 1);
  const take = useLimit ? limit : PAGE_SIZE;
  const skip = useLimit ? 0 : (page - 1) * PAGE_SIZE;

  const where =
    view === "current"
      ? { senderId: userId, status: "PENDING" as const }
      : { senderId: userId };

  const [items, total] = await Promise.all([
    prisma.contactRequest.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            name: true,
            image: true,
            profile: {
              select: {
                nativeLangs: { select: { code: true, name: true } },
                learningLangs: { select: { code: true, name: true } },
              },
            },
          },
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            name: true,
            image: true,
            profile: {
              select: {
                nativeLangs: { select: { code: true, name: true } },
                learningLangs: { select: { code: true, name: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.contactRequest.count({ where }),
  ]);

  return {
    items: items.map((item) => ({
      id: item.id,
      message: item.message,
      status: item.status,
      createdAt: item.createdAt,
      respondedAt: item.respondedAt,
      sender: item.sender,
      recipient: item.recipient,
    })) as ContactRequestWithUsers[],
    total,
    page,
    pageCount: useLimit ? 1 : Math.ceil(total / PAGE_SIZE) || 1,
  };
}

export async function hasContactRequestFromSenderToRecipient(
  senderId: string,
  recipientId: string
): Promise<boolean> {
  const existing = await prisma.contactRequest.findFirst({
    where: { senderId, recipientId },
  });
  return !!existing;
}

export async function updateContactRequestStatus(
  requestId: string,
  userId: string,
  status: "ACCEPTED" | "DECLINED"
) {
  const request = await prisma.contactRequest.findUnique({
    where: { id: requestId },
  });

  if (!request || request.recipientId !== userId) {
    return null;
  }
  if (request.status !== "PENDING") {
    return null;
  }

  return prisma.contactRequest.update({
    where: { id: requestId },
    data: { status: status as ContactRequestStatus, respondedAt: new Date() },
  });
}
