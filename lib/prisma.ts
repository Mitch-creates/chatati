import { PrismaClient } from "@prisma/client";

// Prevent multiple instances in development (Next.js hot reload)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? // In development, log queries, errors, and warnings for debugging.
          // TODO In production, only log errors (typically to your logging infrastructure or monitoring service,
          // such as Datadog, Sentry, or a centralized logging system) to avoid excessive or sensitive output.
          ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
