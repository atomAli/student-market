import { NextResponse } from "next/server";

const SUPPORTED = ["en", "fa", "it"];

export async function POST(req) {
  const { text, target } = await req.json();

  if (!text || !target || !SUPPORTED.includes(target))
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  try {
    const url = "https://translate.googleapis.com/translate_a/single"
      + "?client=gtx&sl=auto&tl=" + target + "&dt=t&q=" + encodeURIComponent(text);

    const res = await fetch(url);
    if (!res.ok) throw new Error("Google Translate returned " + res.status);

    const data = await res.json();
    const translated = data[0].map(seg => seg[0]).join("");

    return NextResponse.json({ translatedText: translated });
  } catch {
    return NextResponse.json({ error: "Translation failed" }, { status: 502 });
  }
}
