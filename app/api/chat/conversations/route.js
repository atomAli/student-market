import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createConversationForProduct, getInboxConversations } from "@/lib/chat";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const conversations = await getInboxConversations(session);
    return NextResponse.json(conversations);
  } catch {
    return NextResponse.json({ error: "Failed to load conversations" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    console.log("API: POST /api/chat/conversations called");
    const session = await auth();
    console.log("API: session:", session);
    if (!session?.user?.id) {
      console.log("API: No session, returning 401");
      return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    console.log("API: body:", body);
    const productId = body?.productId;
    if (!productId) {
      console.log("API: No productId, returning 400");
      return NextResponse.json(
        { error: "شناسه محصول الزامی است" },
        { status: 400 },
      );
    }

    const result = await createConversationForProduct(productId, session);
    console.log("API: result:", result);
    if (result.error === "PRODUCT_NOT_FOUND") {
      return NextResponse.json({ error: "محصول پیدا نشد" }, { status: 404 });
    }
    if (result.error === "SELF_CHAT_NOT_ALLOWED") {
      return NextResponse.json(
        { error: "نمی‌توانید برای آگهی خودتان پیام بفرستید" },
        { status: 400 },
      );
    }
    if (result.error) {
      return NextResponse.json({ error: "خطا در ساخت گفتگو" }, { status: 500 });
    }

    console.log(
      "API: returning success with status:",
      result.created ? 201 : 200,
    );
    return NextResponse.json(result, { status: result.created ? 201 : 200 });
  } catch (error) {
    console.error("chat conversation create failed:", error);
    return NextResponse.json({ error: "خطا در ساخت گفتگو" }, { status: 500 });
  }
}
