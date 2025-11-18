import { config } from "dotenv";
config();
// TODO Implement magic link auth https://www.better-auth.com/docs/plugins/magic-link
// TODO Implement passkey https://www.better-auth.com/docs/plugins/passkey
// TODO Implement emailVerification https://www.better-auth.com/docs/authentication/email-password#email-verification
// TODO Implement Forgetpassword https://www.better-auth.com/docs/authentication/email-password#request-password-reset

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
});
