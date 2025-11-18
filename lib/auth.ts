import { config } from "dotenv";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "@/lib/mail/email";

config();
// TODO Implement magic link auth https://www.better-auth.com/docs/plugins/magic-link
// TODO Implement passkey https://www.better-auth.com/docs/plugins/passkey

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
    requireEmailVerification: true,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail(user.email, url);
    },
  },
  onPasswordReset: async ({
    user,
    url,
  }: {
    user: { email: string };
    url: string;
  }) => {
    await sendPasswordResetEmail(user.email, url);
  },
});
