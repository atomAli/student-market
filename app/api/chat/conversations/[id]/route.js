import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getConversationForSession, sendChatMessage, deleteChatConversation, markConversationAsRead } from "@/lib/chat";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const conversation = await getConversationForSession(id, session);
    if (!conversation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await markConversationAsRead(id, session.user.id);
    return NextResponse.json(conversation);
  } catch {
    return NextResponse.json({ error: "Failed to load conversation" }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const content = String(body?.content || "").trim();
    if (!content) {
      return NextResponse.json({ error: "EMPTY_MESSAGE" }, { status: 400 });
    }
    const result = await sendChatMessage(id, content, session);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const result = await deleteChatConversation(id, session);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to delete conversation" }, { status: 500 });
  }
}
