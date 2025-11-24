import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

// Run on all pages
export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};

