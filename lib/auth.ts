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
  session: {
    enabled: true,
    expiresIn: 5 * 60,
    strategy: "compact",
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    verifyEmailUrl: "/verification-required",
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail(user.email, url);
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail(user.email, url);
      console.log("Sent verification email to", user.email);
    },
    autoSignInAfterVerification: true,
    callbackURL: "/platform/account/edit?newUser=true",
    onPasswordReset: async ({ user }: { user: { email: string } }) => {
      console.log(`Password for user ${user.email} has been reset.`);
    },
  },
});
