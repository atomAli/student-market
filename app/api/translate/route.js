import { NextResponse } from "next/server";

const SUPPORTED = ["en", "fa", "it"];

export async function POST(req) {
  const { text, target } = await req.json();

  if (!text || !target || !SUPPORTED.includes(target))
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const res = await fetch("https://libretranslate.com/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: text, source: "auto", target }),
  });

  if (!res.ok)
    return NextResponse.json({ error: "Translation failed" }, { status: 502 });

  const data = await res.json();
  return NextResponse.json({ translatedText: data.translatedText });
}
