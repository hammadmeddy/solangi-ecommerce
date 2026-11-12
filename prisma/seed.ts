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
      email: "yasirhammad21@gmail.com",
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

  const seedReviews = [
    {
      id: "rev-ayesha",
      quote:
        "Clean shopping experience. I found home goods quickly and checkout felt familiar.",
      author: "Ayesha K.",
      meta: "Karachi · Retail shopper",
      sortOrder: 1,
    },
    {
      id: "rev-usman",
      quote:
        "As a seller I want listings that update prices easily — this layout already makes that feel possible.",
      author: "Usman R.",
      meta: "Lahore · Prospective seller",
      sortOrder: 2,
    },
    {
      id: "rev-sara",
      quote:
        "Language and currency switches in the header are exactly what multi-city families need.",
      author: "Sara M.",
      meta: "Islamabad · Retail shopper",
      sortOrder: 3,
    },
  ];

  for (const rev of seedReviews) {
    await prisma.review.upsert({
      where: { id: rev.id },
      update: {
        quote: rev.quote,
        author: rev.author,
        meta: rev.meta,
        status: "approved",
        sortOrder: rev.sortOrder,
      },
      create: {
        id: rev.id,
        quote: rev.quote,
        author: rev.author,
        meta: rev.meta,
        rating: 5,
        status: "approved",
        locale: "en",
        sortOrder: rev.sortOrder,
      },
    });
  }

  const demoListings = [
    {
      id: "listing-kurta",
      name: "Linen blend kurta set",
      categoryId: "fashion",
      pricePkr: 4290,
      stock: 18,
      status: "active",
      description: "Seller-managed retail listing (demo).",
    },
    {
      id: "listing-dinner",
      name: "Ceramic dinner set · 16 pcs",
      categoryId: "home",
      pricePkr: 7890,
      stock: 6,
      status: "active",
      description: "Seller-managed retail listing (demo).",
    },
    {
      id: "listing-draft",
      name: "New seasonal scarf (draft)",
      categoryId: "fashion",
      pricePkr: 1290,
      stock: 0,
      status: "draft",
      description: "Draft listing — not visible in shop yet.",
    },
  ];

  for (const item of demoListings) {
    const data = {
      name: item.name,
      categoryId: item.categoryId,
      pricePkr: item.pricePkr,
      description: item.description,
      sellerName: "Solangi Demo Store",
      stock: item.stock,
      stockLabel: item.stock > 0 ? "In stock" : "Out of stock",
      status: item.status,
      mode: "retail",
      sellerId: seller.id,
    };
    await prisma.product.upsert({
      where: { id: item.id },
      update: data,
      create: { id: item.id, ...data },
    });
  }

  console.log(
    `Seeded ${CATEGORIES.length} categories, ${all.length + demoListings.length} products, ${seedReviews.length} reviews, admin + seller.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
