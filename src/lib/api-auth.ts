import { jsonError } from "@/lib/api-map";
import type { AuthRole } from "@/lib/auth";
import { getSession, type SessionPayload } from "@/lib/session";

export async function requireRoles(
  roles: AuthRole[],
): Promise<{ session: SessionPayload; error?: undefined } | { session?: undefined; error: Response }> {
  const session = await getSession();
  if (!session) return { error: jsonError("Sign in required", 401) };
  if (!roles.includes(session.role)) return { error: jsonError("Not allowed", 403) };
  return { session };
}
