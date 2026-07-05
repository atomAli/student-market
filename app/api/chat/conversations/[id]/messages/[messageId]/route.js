import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { deleteChatMessage } from "@/lib/chat";

export async function DELETE(req, { params }) {
  try {
    const { messageId } = await params;
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const result = await deleteChatMessage(messageId, session);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
  }
}
