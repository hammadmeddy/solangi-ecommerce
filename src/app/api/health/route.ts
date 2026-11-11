import { prisma } from "@/lib/db";
import { jsonOk } from "@/lib/api-map";

export async function GET() {
  try {
    const [products, users] = await Promise.all([
      prisma.product.count(),
      prisma.user.count(),
    ]);
    return jsonOk({
      ok: true,
      backend: "solangi-api",
      db: "up",
      products,
      users,
    });
  } catch (err) {
    console.error(err);
    return jsonOk({ ok: false, backend: "solangi-api", db: "down" }, { status: 503 });
  }
}
