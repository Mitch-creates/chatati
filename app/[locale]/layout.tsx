import type { Metadata } from "next";
import "../globals.css";
import Navbar from "@/components/nav-bar";
import { NextIntlClientProvider } from "next-intl";
import { getCachedMessages } from "@/lib/i18n-helpers";
import { getSessionHelper } from "@/lib/auth-utils";
import { Reem_Kufi } from "next/font/google";
import { routing } from "@/i18n/routing";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";

const reem = Reem_Kufi({
  subsets: ["latin"],
  variable: "--font-reem",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Learning application",
  description: "A learning application built with Next.js",
};

export function generateStaticParams() {
  return routing.locales.map((locale: string) => ({ locale }));
}

async function LayoutContent({
  locale,
  children,
}: {
  locale: string;
  children: React.ReactNode;
}) {
  const messages = await getCachedMessages(locale);
  const session = await getSessionHelper();

  return (
    <>
      <NextIntlClientProvider messages={messages}>
        {/* This is the provider that makes the messages available to the client. Otherwise, we were making an additional request to the server to get the messages. */}
        <Navbar initialSession={session} />
        {children}
      </NextIntlClientProvider>
    </>
  );
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  return (
    <html lang={locale} className={`${reem.variable} font-sans`}>
      <body className={reem.className} suppressHydrationWarning>
        {/* suppressHydrationWarning is used to avoid the warning that the server and client are rendering different things. For example: Grammarly was causing errors because it was rendering the server and client differently. */}
        <Suspense fallback={<Spinner />}>
          <LayoutContent locale={locale}>{children}</LayoutContent>
        </Suspense>
      </body>
    </html>
  );
}
