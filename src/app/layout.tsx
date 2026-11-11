import type { ReactNode } from "react";

/** Root layout — locale-specific html/body live under [locale]. */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
