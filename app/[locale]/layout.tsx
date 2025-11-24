import type { Metadata } from "next";
import "../globals.css";
import Navbar from "@/components/nav-bar";
import { NextIntlClientProvider } from "next-intl";
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

  return (
    <html lang={locale} className={`${reem.variable} font-sans`}>
      <body className={reem.className}>
        <NextIntlClientProvider>
          <Navbar />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
