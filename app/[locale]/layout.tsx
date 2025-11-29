import type { Metadata } from "next";
import "../globals.css";
import Navbar from "@/components/nav-bar";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Reem_Kufi } from "next/font/google";

const reem = Reem_Kufi({
  subsets: ["latin"],
  variable: "--font-reem",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Learning application",
  description: "A learning application built with Next.js",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const messages = await getMessages();
  return (
    <html lang={locale} className={`${reem.variable} font-sans`}>
      <body className={reem.className} suppressHydrationWarning>
        {/* suppressHydrationWarning is used to avoid the warning that the server and client are rendering different things. For example: Grammarly was causing errors because it was rendering the server and client differently. */}
        <NextIntlClientProvider messages={messages}>
          {/* This is the provider that makes the messages available to the client. It's the same as the server provider, but it's used to make the messages available to the client. Otherwise, we were making an additional request to the server to get the messages. */}
          <Navbar />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
