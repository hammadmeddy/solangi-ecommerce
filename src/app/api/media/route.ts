import { jsonOk } from "@/lib/api-map";
import { readMediaState } from "@/lib/media-db";

export async function GET() {
  const media = await readMediaState();
  return jsonOk({ media });
}
