import { prisma } from "@/lib/prisma";

async function ensureFavoritesSchema() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Favorite" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "productId" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  try {
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Favorite_userId_productId_key"
      ON "Favorite"("userId", "productId")
    `);
  } catch {
  }
}

export async function getFavorites(userId) {
  await ensureFavoritesSchema();
  const rows = await prisma.$queryRawUnsafe(
    `SELECT "productId" FROM "Favorite" WHERE "userId" = $1 ORDER BY "createdAt" DESC`,
    userId,
  );
  return rows.map((r) => r.productId);
}

export async function getFavoriteProducts(userId) {
  await ensureFavoritesSchema();
  const rows = await prisma.$queryRawUnsafe(
    `
    SELECT p.*
    FROM "Favorite" f
    JOIN "Product" p ON p.id = f."productId"
    WHERE f."userId" = $1
    ORDER BY f."createdAt" DESC
    `,
    userId,
  );
  return rows.map((r) => ({
    ...r,
    images: parseImages(r.images, r.image),
  }));
}

function parseImages(value, fallback) {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return fallback ? [fallback] : [];
  }
}

export async function isFavorited(userId, productId) {
  await ensureFavoritesSchema();
  const rows = await prisma.$queryRawUnsafe(
    `SELECT id FROM "Favorite" WHERE "userId" = $1 AND "productId" = $2 LIMIT 1`,
    userId,
    productId,
  );
  return rows.length > 0;
}

export async function toggleFavorite(userId, productId) {
  await ensureFavoritesSchema();
  const existing = await prisma.$queryRawUnsafe(
    `SELECT id FROM "Favorite" WHERE "userId" = $1 AND "productId" = $2 LIMIT 1`,
    userId,
    productId,
  );

  if (existing.length > 0) {
    await prisma.$executeRawUnsafe(
      `DELETE FROM "Favorite" WHERE "userId" = $1 AND "productId" = $2`,
      userId,
      productId,
    );
    return { favorited: false };
  }

  await prisma.$executeRawUnsafe(
    `INSERT INTO "Favorite" ("id", "userId", "productId", "createdAt") VALUES (gen_random_uuid(), $1, $2, NOW())`,
    userId,
    productId,
  );
  return { favorited: true };
}
