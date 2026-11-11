import { PrismaClient } from "@prisma/client";
import { CATEGORIES } from "../src/lib/categories";
import { CATALOG } from "../src/lib/products";
import { MODE_CATALOG } from "../src/lib/modes-catalog";

const prisma = new PrismaClient();

async function main() {
  for (const [index, cat] of CATEGORIES.entries()) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {
        name: cat.name,
        photoLabel: cat.photoLabel,
        hrefKind: cat.href === "services-mode" ? "services-mode" : "category",
        sortOrder: index,
      },
      create: {
        id: cat.id,
        name: cat.name,
        photoLabel: cat.photoLabel,
        hrefKind: cat.href === "services-mode" ? "services-mode" : "category",
        sortOrder: index,
      },
    });
  }

  const all = [...CATALOG, ...MODE_CATALOG];
  for (const p of all) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        categoryId: p.categoryId,
        pricePkr: p.pricePkr,
        oldPricePkr: p.oldPricePkr ?? null,
        discountLabel: p.discountLabel ?? null,
        rating: p.rating,
        description: p.description,
        sellerName: p.seller,
        stockLabel: p.stockLabel,
        mode: p.mode ?? "retail",
        minQty: p.minQty ?? null,
        condition: p.condition ?? null,
        serviceArea: p.serviceArea ?? null,
        status: "active",
      },
      create: {
        id: p.id,
        name: p.name,
        categoryId: p.categoryId,
        pricePkr: p.pricePkr,
        oldPricePkr: p.oldPricePkr ?? null,
        discountLabel: p.discountLabel ?? null,
        rating: p.rating,
        description: p.description,
        sellerName: p.seller,
        stockLabel: p.stockLabel,
        mode: p.mode ?? "retail",
        minQty: p.minQty ?? null,
        condition: p.condition ?? null,
        serviceArea: p.serviceArea ?? null,
        status: "active",
        stock: p.minQty && p.minQty > 1 ? p.minQty * 20 : 25,
      },
    });
  }

  await prisma.user.upsert({
    where: { phone: "03000000000" },
    update: { name: "Solangi Admin", role: "admin" },
    create: {
      phone: "03000000000",
      name: "Solangi Admin",
      role: "admin",
      email: "admin@solangiecommerce.com",
    },
  });

  await prisma.user.upsert({
    where: { phone: "03001112233" },
    update: { name: "Demo Seller", role: "seller" },
    create: {
      phone: "03001112233",
      name: "Demo Seller",
      role: "seller",
    },
  });

  const seller = await prisma.user.findUniqueOrThrow({ where: { phone: "03001112233" } });
  await prisma.sellerStore.upsert({
    where: { userId: seller.id },
    update: {
      name: "Solangi Demo Store",
      city: "Karachi",
      phone: seller.phone,
      bio: "Seed seller store for backend demos.",
      verified: true,
    },
    create: {
      userId: seller.id,
      name: "Solangi Demo Store",
      slug: "solangi-demo-store",
      city: "Karachi",
      phone: seller.phone,
      bio: "Seed seller store for backend demos.",
      verified: true,
    },
  });

  await prisma.siteSetting.upsert({
    where: { id: "solo" },
    update: {},
    create: { id: "solo", announcement: "" },
  });

  console.log(`Seeded ${CATEGORIES.length} categories, ${all.length} products, admin + seller.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
