import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/api-map";
import type { AuthRole } from "@/lib/auth";
import { getSession, type SessionPayload } from "@/lib/session";

/** Phones allowed to sign in as admin even before the DB says so (comma-separated). */
function allowListedAdminPhones(): string[] {
  return (process.env.SOLANGI_ADMIN_PHONES || "")
    .split(",")
    .map((p) => p.replace(/\s/g, ""))
    .filter(Boolean);
}

export function isAdminPhone(phone: string, storedRole?: string | null): boolean {
  return storedRole === "admin" || allowListedAdminPhones().includes(phone);
}

/**
 * Reads the session cookie, then re-checks the user in the database so role
 * changes and suspensions made by an admin apply on the very next request.
 */
export async function getActiveSession(): Promise<SessionPayload | null> {
  const session = await getSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true, phone: true, name: true, role: true, status: true },
  });
  if (!user || user.status !== "active") return null;
  return { sub: user.id, phone: user.phone, name: user.name, role: user.role as AuthRole };
}

export async function requireRoles(
  roles: AuthRole[],
): Promise<{ session: SessionPayload; error?: undefined } | { session?: undefined; error: Response }> {
  const raw = await getSession();
  if (!raw) return { error: jsonError("Sign in required", 401) };
  const session = await getActiveSession();
  if (!session) return { error: jsonError("This account is suspended or no longer exists", 403) };
  if (!roles.includes(session.role)) return { error: jsonError("Not allowed", 403) };
  return { session };
}

/** Seller routes need an approved store, not just the seller role. */
export async function requireApprovedSeller(): Promise<
  | { session: SessionPayload; storeId: string; error?: undefined }
  | { session?: undefined; storeId?: undefined; error: Response }
> {
  const gate = await requireRoles(["seller"]);
  if (gate.error) return { error: gate.error };
  const store = await prisma.sellerStore.findUnique({
    where: { userId: gate.session.sub },
    select: { id: true, status: true },
  });
  if (!store || store.status !== "approved") {
    return { error: jsonError("Your seller store is not approved", 403) };
  }
  return { session: gate.session, storeId: store.id };
}
