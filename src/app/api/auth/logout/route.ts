import { jsonOk } from "@/lib/api-map";
import { clearSessionCookie } from "@/lib/session";

export async function POST() {
  await clearSessionCookie();
  return jsonOk({ ok: true });
}
