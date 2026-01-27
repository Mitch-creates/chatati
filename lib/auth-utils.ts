import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class EmailNotVerifiedError extends Error {
  constructor(message = "Email not verified") {
    super(message);
    this.name = "EmailNotVerifiedError";
  }
}

// Simply get the session from the API
// Validates that the user still exists in the database (handles cases like database resets)
export async function getSessionHelper() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If no session, return null
  if (!session || !session.user?.id) {
    return null;
  }

  // Validate that the user still exists in the database
  // This prevents issues when database is reset but session cookie still exists
  try {
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true }, // Only select id for performance
    });

    // If user doesn't exist, invalidate the session
    if (!userExists) {
      return null;
    }
  } catch (error) {
    // If database query fails, invalidate session for safety
    console.error("Error validating user in session:", error);
    return null;
  }

  return session;
}

// Redirect to signin if not authenticated [server components]
export async function requireAuth() {
  const session = await getSessionHelper();
  if (!session) {
    redirect("/signin");
  }
  return session;
}

// Return 401 if not authenticated [API Side]
export async function requireAuthAPI() {
  const session = await getSessionHelper();
  if (!session) {
    throw new UnauthorizedError("Unauthorized");
  }
  return session;
}

// Redirect to signin if not authenticated or if email not verified [server components]
export async function requireAuthAndEmailVerified() {
  const session = await getSessionHelper();

  if (!session) {
    redirect("/signin");
  }
  if (!session.user?.emailVerified) {
    redirect("/verification-required");
  }

  return session;
}

// Return 401 if not authenticated or if email not verified [API Side]
export async function requireAuthAndEmailVerifiedAPI() {
  const session = await getSessionHelper();
  if (!session) {
    throw new UnauthorizedError("Unauthorized");
  }
  if (!session.user?.emailVerified) {
    throw new EmailNotVerifiedError("Email not verified");
  }
  return session;
}

// Get the user from the session
export async function getUser() {
  const session = await getSessionHelper();
  return session?.user;
}

// See if the user has verified their email
export async function isEmailVerified() {
  const user = await getUser();
  return user?.emailVerified;
}
