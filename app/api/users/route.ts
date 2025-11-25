import { NextResponse } from "next/server";
import { requireAuthAPI, UnauthorizedError } from "@/lib/auth-utils";
import { getUserWithProfile } from "@/lib/services/user.service";

// Get the current user's profile
export async function GET() {
  try {
    // 1. Authenticate - get the current user's session
    const session = await requireAuthAPI();

    // 2. Fetch user with profile from database
    const user = await getUserWithProfile(session.user.id);

    // 3. Handle case where user doesn't exist (shouldn't happen, but safety)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 4. Return the user data
    return NextResponse.json(user);
  } catch (error) {
    // 5. Handle authentication errors
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 6. Handle unexpected errors
    console.error("Error in GET /api/users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
