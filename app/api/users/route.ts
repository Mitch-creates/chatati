import { NextResponse } from "next/server";
import { requireAuthAPI, UnauthorizedError } from "@/lib/auth-utils";
import { getUserWithProfile } from "@/lib/services/user.service";

// Get the current user's profile
export async function GET() {
  try {
    const session = await requireAuthAPI();

    const user = await getUserWithProfile(session.user.id);

    // Handle case where user doesn't exist
    if (!user) {
      return NextResponse.json(
        {
          error: "userNotFound",
          message: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
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

    // Handle unexpected errors
    console.error("Error in GET /api/users:", error);
    return NextResponse.json(
      {
        error: "internalServerError",
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
