import { execSync } from "node:child_process";

const url = process.env.DATABASE_URL ?? "";
const isServerDb = url.startsWith("mysql://") || url.startsWith("postgresql://");

if (!isServerDb) {
  console.log("[prepare-db] No MySQL/Postgres DATABASE_URL in this environment. Skipping.");
  process.exit(0);
}

console.log("[prepare-db] Creating tables...");
execSync("npx prisma db push", { stdio: "inherit" });

console.log("[prepare-db] Seeding catalog...");
execSync("npx tsx prisma/seed.ts", { stdio: "inherit" });
