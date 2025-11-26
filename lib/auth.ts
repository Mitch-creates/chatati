import { config } from "dotenv";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "@/lib/mail/email";
import { prisma } from "@/lib/prisma"; // Defined as a singleton so we can reuse it across the app

config();
// TODO Implement magic link auth https://www.better-auth.com/docs/plugins/magic-link
// TODO Implement passkey https://www.better-auth.com/docs/plugins/passkey

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Defaults to false, but I chose to be explicit. Users should be able to access certain parts of the app without email verification.
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail(user.email, url);
    },
  },
  emailVerification: {
    sendOnSignUp: true, // TODO let users know that a verification email has been sent after signup
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail(user.email, url);
      console.log("Sent verification email to", user.email);
    },
    onPasswordReset: async ({ user }: { user: { email: string } }) => {
      console.log(`Password for user ${user.email} has been reset.`);
    },
  },
});
