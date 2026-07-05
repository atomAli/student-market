import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { markConversationAsRead } from "@/lib/chat";

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await markConversationAsRead(id, session.user.id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to mark as read" }, { status: 500 });
  }
}
