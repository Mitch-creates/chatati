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
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail(user.email, url);
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail(user.email, url);
      console.log("Sent verification email to", user.email);
    },
    onPasswordReset: async ({ user }: { user: { email: string } }) => {
      // your logic here
      console.log(`Password for user ${user.email} has been reset.`);
    },
  },
});
