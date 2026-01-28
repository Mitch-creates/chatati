import { NextResponse } from "next/server";
import { requireAuthAPI, UnauthorizedError } from "@/lib/auth-utils";
import { updateContactRequestStatus } from "@/lib/services/contact-request.service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthAPI();
    const userId = session.user.id;
    const { id } = await params;

    const body = await request.json().catch(() => ({}));
    const { status } = body ?? {};

    if (status !== "ACCEPTED" && status !== "DECLINED") {
      return NextResponse.json(
        {
          error: "validationError",
          message: "status must be ACCEPTED or DECLINED",
        },
        { status: 400 }
      );
    }

    const updated = await updateContactRequestStatus(
      id,
      userId,
      status as "ACCEPTED" | "DECLINED"
    );

    if (!updated) {
      return NextResponse.json(
        {
          error: "forbidden",
          message: "Request not found or you cannot respond to it",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: updated.id,
      status: updated.status,
      respondedAt: updated.respondedAt?.toISOString() ?? null,
    });
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

    console.error("Error in PATCH /api/contact-requests/[id]:", error);
    return NextResponse.json(
      {
        error: "internalServerError",
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
