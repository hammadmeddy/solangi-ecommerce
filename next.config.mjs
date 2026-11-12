import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Hostinger: plain .mjs (no SWC/TS config load) + webpack build (see package.json)
  output: "standalone",
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default withNextIntl(nextConfig);
