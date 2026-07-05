import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getFavorites } from "@/lib/favorites";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ids: [] });
    }
    const ids = await getFavorites(session.user.id);
    return NextResponse.json({ ids });
  } catch {
    return NextResponse.json({ ids: [] });
  }
}

