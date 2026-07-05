import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUnreadCount } from "@/lib/chat";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ count: 0 });
    }

    const count = await getUnreadCount(session.user.id);
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
