import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api-map";
import { requireRoles } from "@/lib/api-auth";
import { clearStoredMedia, ensureSiteSetting, readMediaState } from "@/lib/media-db";
import { deleteManagedUpload, saveImageUpload } from "@/lib/uploads";

const heroField = ["heroRetail", "heroFlash", "heroModes"] as const;

const bodySchema = z.discriminatedUnion("target", [
  z.object({
    target: z.literal("category"),
    id: z.string().min(1).max(40),
    dataUrl: z.string().max(2_200_000).nullable(),
  }),
  z.object({
    target: z.literal("product"),
    id: z.string().min(1).max(64),
    dataUrl: z.string().max(2_200_000).nullable(),
  }),
  z.object({
    target: z.literal("hero"),
    index: z.number().int().min(0).max(2),
    dataUrl: z.string().max(2_200_000).nullable(),
  }),
  z.object({
    target: z.literal("announcement"),
    announcement: z.string().max(240),
  }),
  z.object({
    target: z.literal("reset"),
  }),
]);

export async function PATCH(req: Request) {
  const gate = await requireRoles(["admin"]);
  if (gate.error) return gate.error;

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Invalid media update", 400);

  try {
    const body = parsed.data;
    if (body.target === "reset") {
      await ensureSiteSetting();
      await clearStoredMedia();
      return jsonOk({ media: await readMediaState() });
    }

    if (body.target === "announcement") {
      await ensureSiteSetting();
      await prisma.siteSetting.update({
        where: { id: "solo" },
        data: { announcement: body.announcement.trim() },
      });
      return jsonOk({ media: await readMediaState() });
    }

    if (body.target === "category") {
      const category = await prisma.category.findUnique({ where: { id: body.id } });
      if (!category) return jsonError("Category not found", 404);
      if (!body.dataUrl) {
        await deleteManagedUpload(category.imageUrl);
        await prisma.category.update({ where: { id: category.id }, data: { imageUrl: null } });
      } else {
        const imageUrl = await saveImageUpload("category", category.id, body.dataUrl);
        await deleteManagedUpload(category.imageUrl);
        await prisma.category.update({ where: { id: category.id }, data: { imageUrl } });
      }
      return jsonOk({ media: await readMediaState() });
    }

    if (body.target === "product") {
      const product = await prisma.product.findUnique({ where: { id: body.id } });
      if (!product) return jsonError("Product not found", 404);
      if (!body.dataUrl) {
        await deleteManagedUpload(product.imageUrl);
        await prisma.product.update({ where: { id: product.id }, data: { imageUrl: null } });
      } else {
        const imageUrl = await saveImageUpload("product", product.id, body.dataUrl);
        await deleteManagedUpload(product.imageUrl);
        await prisma.product.update({ where: { id: product.id }, data: { imageUrl } });
      }
      return jsonOk({ media: await readMediaState() });
    }

    await ensureSiteSetting();
    const setting = await prisma.siteSetting.findUniqueOrThrow({ where: { id: "solo" } });
    const field = heroField[body.index];
    const previous = setting[field];
    if (!body.dataUrl) {
      await deleteManagedUpload(previous);
      await prisma.siteSetting.update({ where: { id: "solo" }, data: { [field]: null } });
    } else {
      const imageUrl = await saveImageUpload("hero", field, body.dataUrl);
      await deleteManagedUpload(previous);
      await prisma.siteSetting.update({ where: { id: "solo" }, data: { [field]: imageUrl } });
    }
    return jsonOk({ media: await readMediaState() });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return jsonError(message, 400);
  }
}
