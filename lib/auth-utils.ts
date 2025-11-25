import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

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
export async function getSessionHelper() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
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
    redirect("/verify-email");
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
