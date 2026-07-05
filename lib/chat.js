import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

async function ensureChatSchema() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Conversation" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "productId" TEXT NOT NULL,
      "buyerId" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Conversation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT "Conversation_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Message" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "content" TEXT NOT NULL,
      "senderId" TEXT NOT NULL,
      "conversationId" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "readAt" DATETIME,
      CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Conversation_productId_buyerId_key"
    ON "Conversation"("productId", "buyerId")
  `);

  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Message" ADD COLUMN "readAt" DATETIME
    `);
  } catch {
    // column already exists
  }

  await prisma.$executeRawUnsafe(`
    CREATE TRIGGER IF NOT EXISTS "cascade_product_delete"
    BEFORE DELETE ON "Product"
    BEGIN
      DELETE FROM "Message" WHERE "conversationId" IN (SELECT "id" FROM "Conversation" WHERE "productId" = OLD."id");
      DELETE FROM "Conversation" WHERE "productId" = OLD."id";
    END
  `);
}

export async function markConversationAsRead(conversationId, userId) {
  await ensureChatSchema();
  await prisma.$executeRawUnsafe(
    `
    UPDATE "Message"
    SET "readAt" = ?
    WHERE "conversationId" = ? AND "senderId" != ? AND "readAt" IS NULL
  `,
    new Date().toISOString(),
    conversationId,
    userId,
  );
}

export async function getUnreadCount(userId) {
  await ensureChatSchema();
  const rows = await prisma.$queryRawUnsafe(
    `
    SELECT COUNT(*) AS cnt
    FROM "Message" m
    JOIN "Conversation" c ON c.id = m."conversationId"
    JOIN "Product" p ON p.id = c."productId"
    WHERE m."senderId" != ?
      AND m."readAt" IS NULL
      AND (c."buyerId" = ? OR p."sellerId" = ?)
  `,
    userId,
    userId,
    userId,
  );
  return Number(rows?.[0]?.cnt || 0);
}

function mapConversationRow(row) {
  if (!row) return null;

  const messages = row.lastMessageId
    ? [
        {
          id: row.lastMessageId,
          content: row.lastMessageContent,
          senderId: row.lastMessageSenderId,
          conversationId: row.id,
          createdAt: row.lastMessageCreatedAt,
          sender: {
            id: row.lastMessageSenderId,
            name: row.lastMessageSenderName,
            email: row.lastMessageSenderEmail,
          },
        },
      ]
    : [];

  return {
    id: row.id,
    productId: row.productId,
    buyerId: row.buyerId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    unreadCount: Number(row.unreadCount || 0),
    product: {
      id: row.productId,
      title: row.productTitle,
      image: row.productImage,
      seller: {
        id: row.sellerId,
        name: row.sellerName,
        email: row.sellerEmail,
      },
    },
    buyer: {
      id: row.buyerId,
      name: row.buyerName,
      email: row.buyerEmail,
    },
    messages,
  };
}

function mapFullConversation(row, messages) {
  if (!row) return null;

  return {
    id: row.id,
    productId: row.productId,
    buyerId: row.buyerId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    product: {
      id: row.productId,
      title: row.productTitle,
      description: row.productDescription,
      price: row.productPrice,
      category: row.productCategory,
      address: row.productAddress,
      latitude: row.productLatitude,
      longitude: row.productLongitude,
      image: row.productImage,
      images: row.productImages,
      sold: !!row.productSold,
      sellerId: row.sellerId,
      seller: {
        id: row.sellerId,
        name: row.sellerName,
        email: row.sellerEmail,
      },
    },
    buyer: {
      id: row.buyerId,
      name: row.buyerName,
      email: row.buyerEmail,
    },
    messages,
  };
}

async function findConversationAccessRow(conversationId) {
  const rows = await prisma.$queryRawUnsafe(
    `
    SELECT
      c.id,
      c."productId",
      c."buyerId",
      c."createdAt",
      c."updatedAt",
      p.id AS "productRowId",
      p.title AS "productTitle",
      p.description AS "productDescription",
      p.price AS "productPrice",
      p.category AS "productCategory",
      p.address AS "productAddress",
      p.latitude AS "productLatitude",
      p.longitude AS "productLongitude",
      p.image AS "productImage",
      p.images AS "productImages",
      p.sold AS "productSold",
      p."sellerId" AS "sellerId",
      seller.name AS "sellerName",
      seller.email AS "sellerEmail",
      buyer.name AS "buyerName",
      buyer.email AS "buyerEmail"
    FROM "Conversation" c
    JOIN "Product" p ON p.id = c."productId"
    JOIN "User" buyer ON buyer.id = c."buyerId"
    JOIN "User" seller ON seller.id = p."sellerId"
    WHERE c.id = ?
    LIMIT 1
  `,
    conversationId,
  );

  return rows?.[0] ?? null;
}

export async function canAccessConversation(conversationId, session) {
  if (!session?.user?.id) return false;
  if (session.user.isAdmin) return true;

  await ensureChatSchema();
  const conversation = await findConversationAccessRow(conversationId);
  if (!conversation) return false;
  return (
    conversation.buyerId === session.user.id ||
    conversation.sellerId === session.user.id
  );
}

export async function getConversationForSession(conversationId, session) {
  if (!session?.user?.id) return null;

  await ensureChatSchema();
  const conversation = await findConversationAccessRow(conversationId);
  if (!conversation) return null;

  if (
    !session.user.isAdmin &&
    conversation.buyerId !== session.user.id &&
    conversation.sellerId !== session.user.id
  ) {
    return null;
  }

  const messages = await prisma.$queryRawUnsafe(
    `
    SELECT
      m.id,
      m.content,
      m."senderId",
      m."conversationId",
      m."createdAt",
      sender.name AS "senderName",
      sender.email AS "senderEmail"
    FROM "Message" m
    JOIN "User" sender ON sender.id = m."senderId"
    WHERE m."conversationId" = ?
    ORDER BY datetime(m."createdAt") ASC
  `,
    conversationId,
  );

  return mapFullConversation(
    conversation,
    messages.map((message) => ({
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      conversationId: message.conversationId,
      createdAt: message.createdAt,
      sender: {
        id: message.senderId,
        name: message.senderName,
        email: message.senderEmail,
      },
    })),
  );
}

export async function getInboxConversations(session) {
  if (!session?.user?.id) return [];

  await ensureChatSchema();

  const rows = session.user.isAdmin
    ? await prisma.$queryRawUnsafe(`
        SELECT
          c.id,
          c."productId",
          c."buyerId",
          c."createdAt",
          c."updatedAt",
          p.title AS "productTitle",
          p.image AS "productImage",
          p."sellerId" AS "sellerId",
          seller.name AS "sellerName",
          seller.email AS "sellerEmail",
          buyer.name AS "buyerName",
          buyer.email AS "buyerEmail",
          lm.id AS "lastMessageId",
          lm.content AS "lastMessageContent",
          lm."senderId" AS "lastMessageSenderId",
          lm."createdAt" AS "lastMessageCreatedAt",
          lsender.name AS "lastMessageSenderName",
          lsender.email AS "lastMessageSenderEmail",
          (SELECT COUNT(*) FROM "Message" m2 WHERE m2."conversationId" = c.id AND m2."readAt" IS NULL) AS "unreadCount"
        FROM "Conversation" c
        JOIN "Product" p ON p.id = c."productId"
        JOIN "User" buyer ON buyer.id = c."buyerId"
        JOIN "User" seller ON seller.id = p."sellerId"
        LEFT JOIN "Message" lm ON lm.id = (
          SELECT id
          FROM "Message"
          WHERE "conversationId" = c.id
          ORDER BY datetime("createdAt") DESC, id DESC
          LIMIT 1
        )
        LEFT JOIN "User" lsender ON lsender.id = lm."senderId"
        ORDER BY datetime(c."updatedAt") DESC
      `)
    : await prisma.$queryRawUnsafe(
        `
        SELECT
          c.id,
          c."productId",
          c."buyerId",
          c."createdAt",
          c."updatedAt",
          p.title AS "productTitle",
          p.image AS "productImage",
          p."sellerId" AS "sellerId",
          seller.name AS "sellerName",
          seller.email AS "sellerEmail",
          buyer.name AS "buyerName",
          buyer.email AS "buyerEmail",
          lm.id AS "lastMessageId",
          lm.content AS "lastMessageContent",
          lm."senderId" AS "lastMessageSenderId",
          lm."createdAt" AS "lastMessageCreatedAt",
          lsender.name AS "lastMessageSenderName",
          lsender.email AS "lastMessageSenderEmail",
          (SELECT COUNT(*) FROM "Message" m2 WHERE m2."conversationId" = c.id AND m2."senderId" != ? AND m2."readAt" IS NULL) AS "unreadCount"
        FROM "Conversation" c
        JOIN "Product" p ON p.id = c."productId"
        JOIN "User" buyer ON buyer.id = c."buyerId"
        JOIN "User" seller ON seller.id = p."sellerId"
        LEFT JOIN "Message" lm ON lm.id = (
          SELECT id
          FROM "Message"
          WHERE "conversationId" = c.id
          ORDER BY datetime("createdAt") DESC, id DESC
          LIMIT 1
        )
        LEFT JOIN "User" lsender ON lsender.id = lm."senderId"
        WHERE c."buyerId" = ? OR p."sellerId" = ?
        ORDER BY datetime(c."updatedAt") DESC
      `,
        session.user.id,
        session.user.id,
        session.user.id,
      );

  return rows.map(mapConversationRow);
}

export async function createConversationForProduct(productId, session) {
  console.log(
    "createConversationForProduct called with productId:",
    productId,
    "session:",
    session,
  );
  if (!session?.user?.id) {
    return { error: "AUTH_REQUIRED" };
  }

  await ensureChatSchema();

  const productRows = await prisma.$queryRawUnsafe(
    `
    SELECT id, "sellerId"
    FROM "Product"
    WHERE id = ?
    LIMIT 1
  `,
    productId,
  );

  console.log("productRows:", productRows);
  const product = productRows?.[0];
  if (!product) {
    return { error: "PRODUCT_NOT_FOUND" };
  }

  if (product.sellerId === session.user.id) {
    return { error: "SELF_CHAT_NOT_ALLOWED" };
  }

  const existingRows = await prisma.$queryRawUnsafe(
    `
    SELECT id
    FROM "Conversation"
    WHERE "productId" = ? AND "buyerId" = ?
    LIMIT 1
  `,
    productId,
    session.user.id,
  );

  if (existingRows?.[0]) {
    return { conversationId: existingRows[0].id, existing: true };
  }

  const now = new Date().toISOString();
  const conversationId = randomUUID();

  await prisma.$executeRawUnsafe(
    `
    INSERT INTO "Conversation" ("id", "productId", "buyerId", "createdAt", "updatedAt")
    VALUES (?, ?, ?, ?, ?)
  `,
    conversationId,
    productId,
    session.user.id,
    now,
    now,
  );

  console.log("Created conversation:", conversationId);
  return { conversationId, created: true };
}

export async function sendChatMessage(conversationId, content, session) {
  if (!session?.user?.id) {
    return { error: "AUTH_REQUIRED" };
  }

  const text = String(content || "").trim();
  if (!text) {
    return { error: "EMPTY_MESSAGE" };
  }

  await ensureChatSchema();

  const access = await getConversationForSession(conversationId, session);
  if (!access) {
    return { error: "FORBIDDEN" };
  }

  const now = new Date().toISOString();
  const messageId = randomUUID();

  await prisma.$executeRawUnsafe(
    `
    INSERT INTO "Message" ("id", "content", "senderId", "conversationId", "createdAt")
    VALUES (?, ?, ?, ?, ?)
  `,
    messageId,
    text,
    session.user.id,
    conversationId,
    now,
  );

  await prisma.$executeRawUnsafe(
    `
    UPDATE "Conversation"
    SET "updatedAt" = ?
    WHERE "id" = ?
  `,
    now,
    conversationId,
  );

  return {
    success: true,
    message: {
      id: messageId,
      content: text,
      senderId: session.user.id,
      conversationId,
      createdAt: now,
    },
  };
}

export async function deleteChatMessage(messageId, session) {
  if (!session?.user?.isAdmin) {
    return { error: "FORBIDDEN" };
  }

  await ensureChatSchema();

  const row = await prisma.$queryRawUnsafe(
    `
    SELECT "conversationId"
    FROM "Message"
    WHERE id = ?
    LIMIT 1
  `,
    messageId,
  );

  if (!row?.[0]) {
    return { error: "NOT_FOUND" };
  }

  await prisma.$executeRawUnsafe(
    `
    DELETE FROM "Message"
    WHERE id = ?
  `,
    messageId,
  );

  await prisma.$executeRawUnsafe(
    `
    UPDATE "Conversation"
    SET "updatedAt" = CURRENT_TIMESTAMP
    WHERE "id" = ?
  `,
    row[0].conversationId,
  );

  return { success: true, conversationId: row[0].conversationId };
}

export async function deleteChatConversation(conversationId, session) {
  if (!session?.user?.isAdmin) {
    return { error: "FORBIDDEN" };
  }

  await ensureChatSchema();

  await prisma.$executeRawUnsafe(
    `
    DELETE FROM "Message"
    WHERE "conversationId" = ?
  `,
    conversationId,
  );

  await prisma.$executeRawUnsafe(
    `
    DELETE FROM "Conversation"
    WHERE id = ?
  `,
    conversationId,
  );

  return { success: true };
}
