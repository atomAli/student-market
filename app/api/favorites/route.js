import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getFavorites, getFavoriteProducts, toggleFavorite } from "@/lib/favorites";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const products = await getFavoriteProducts(session.user.id);
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: "Failed to load favorites" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }
    const result = await toggleFavorite(session.user.id, productId);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to toggle favorite" }, { status: 500 });
  }
}
