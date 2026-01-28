import { NextResponse } from "next/server";
import { requireAuthAPI, UnauthorizedError } from "@/lib/auth-utils";
import {
  createContactRequest,
  getContactRequestsReceived,
  getContactRequestsSent,
} from "@/lib/services/contact-request.service";

export async function POST(request: Request) {
  try {
    const session = await requireAuthAPI();
    const senderId = session.user.id;

    const body = await request.json();
    const { recipientId, message } = body ?? {};

    if (!recipientId || typeof recipientId !== "string") {
      return NextResponse.json(
        {
          error: "validationError",
          message: "recipientId is required",
        },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || message.trim().length < 10) {
      return NextResponse.json(
        {
          error: "validationError",
          message: "Message must be at least 10 characters long",
        },
        { status: 400 }
      );
    }

    if (recipientId === senderId) {
      return NextResponse.json(
        {
          error: "validationError",
          message: "You cannot send a contact request to yourself",
        },
        { status: 400 }
      );
    }

    const created = await createContactRequest(
      senderId,
      recipientId,
      message.trim()
    );

    return NextResponse.json(
      {
        id: created.id,
        senderId: created.senderId,
        recipientId: created.recipientId,
        message: created.message,
        status: created.status,
        createdAt: created.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        {
          error: "unauthorized",
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    console.error("Error in POST /api/contact-requests:", error);
    return NextResponse.json(
      {
        error: "internalServerError",
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await requireAuthAPI();
    const userId = session.user.id;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") ?? "received";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const view = (searchParams.get("view") ?? "current") as "current" | "history";

    if (type === "received") {
      const result = await getContactRequestsReceived(userId, { page, view });
      return NextResponse.json(result);
    }

    if (type === "sent") {
      const result = await getContactRequestsSent(userId, { page, view });
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: "badRequest", message: "Invalid type" },
      { status: 400 }
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        {
          error: "unauthorized",
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    console.error("Error in GET /api/contact-requests:", error);
    return NextResponse.json(
      {
        error: "internalServerError",
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
