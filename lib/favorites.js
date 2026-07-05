import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

async function ensureFavoritesSchema() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Favorite" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "productId" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  try {
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Favorite_userId_productId_key"
      ON "Favorite"("userId", "productId")
    `);
  } catch {
    // index already exists
  }
}

export async function getFavorites(userId) {
  await ensureFavoritesSchema();
  const rows = await prisma.$queryRawUnsafe(
    `SELECT "productId" FROM "Favorite" WHERE "userId" = ? ORDER BY datetime("createdAt") DESC`,
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
    WHERE f."userId" = ?
    ORDER BY datetime(f."createdAt") DESC
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
    `SELECT id FROM "Favorite" WHERE "userId" = ? AND "productId" = ? LIMIT 1`,
    userId,
    productId,
  );
  return rows.length > 0;
}

export async function toggleFavorite(userId, productId) {
  await ensureFavoritesSchema();
  const existing = await prisma.$queryRawUnsafe(
    `SELECT id FROM "Favorite" WHERE "userId" = ? AND "productId" = ? LIMIT 1`,
    userId,
    productId,
  );

  if (existing.length > 0) {
    await prisma.$executeRawUnsafe(
      `DELETE FROM "Favorite" WHERE "userId" = ? AND "productId" = ?`,
      userId,
      productId,
    );
    return { favorited: false };
  }

  const id = randomUUID();
  await prisma.$executeRawUnsafe(
    `INSERT INTO "Favorite" ("id", "userId", "productId", "createdAt") VALUES (?, ?, ?, ?)`,
    id,
    userId,
    productId,
    new Date().toISOString(),
  );
  return { favorited: true };
}
