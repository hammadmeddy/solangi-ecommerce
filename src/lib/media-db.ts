import type { AdminMediaState } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { deleteManagedUpload } from "@/lib/uploads";

export async function ensureSiteSetting() {
  return prisma.siteSetting.upsert({
    where: { id: "solo" },
    update: {},
    create: { id: "solo", announcement: "" },
  });
}

export async function readMediaState(): Promise<AdminMediaState> {
  const [setting, categories, products] = await Promise.all([
    ensureSiteSetting(),
    prisma.category.findMany({
      where: { imageUrl: { not: null } },
      select: { id: true, imageUrl: true },
    }),
    prisma.product.findMany({
      where: { imageUrl: { not: null } },
      select: { id: true, imageUrl: true },
    }),
  ]);

  const heroImages: Record<string, string> = {};
  [setting.heroRetail, setting.heroFlash, setting.heroModes].forEach((url, index) => {
    if (url) heroImages[String(index)] = url;
  });

  const categoryImages: Record<string, string> = {};
  for (const category of categories) {
    if (category.imageUrl) categoryImages[category.id] = category.imageUrl;
  }

  const productImages: Record<string, string> = {};
  for (const product of products) {
    if (product.imageUrl) productImages[product.id] = product.imageUrl;
  }

  return {
    categoryImages,
    productImages,
    heroImages,
    announcement: setting.announcement ?? "",
  };
}

export async function clearStoredMedia() {
  const state = await readMediaState();
  const paths = [
    ...Object.values(state.categoryImages),
    ...Object.values(state.productImages),
    ...Object.values(state.heroImages),
  ];
  await Promise.all(paths.map((url) => deleteManagedUpload(url)));
  await prisma.$transaction([
    prisma.category.updateMany({ data: { imageUrl: null } }),
    prisma.product.updateMany({ data: { imageUrl: null } }),
    prisma.siteSetting.update({
      where: { id: "solo" },
      data: { announcement: "", heroRetail: null, heroFlash: null, heroModes: null },
    }),
  ]);
}
