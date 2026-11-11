import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip API + static assets so backend routes stay unlocalized
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
