import { NextResponse } from "next/server";
import { requireAuthAPI, UnauthorizedError } from "@/lib/auth-utils";
import { getUserWithProfile } from "@/lib/services/user.service";
import { cacheLife, cacheTag, updateTag } from "next/cache";

// Get the current user's profile
export async function GET() {
  try {
    const session = await requireAuthAPI();
    const userId = session.user.id;

    // Creates a user-specific cache tag for manual invalidation
    const userCacheTag = `user-profile-${userId}`;

    async function getCachedUser() {
      "use cache";
      cacheLife({
        stale: 300, // 5 minutes - fresh data window
        revalidate: 1800, // 30 minutes - background revalidation
        expire: 86400, // 1 day - complete expiration
      });
      cacheTag(userCacheTag);

      return await getUserWithProfile(userId);
    }

    const user = await getCachedUser();

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

// When defining a function that updates the current user's profile we need to manually update the cache tag with updateTag('nameOfTheTag')
