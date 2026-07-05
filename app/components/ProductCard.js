"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useLanguage } from "./LanguageContext";
import { Camera, House, MapPin } from "lucide-react";

const categoryStyles = {
  "Camera singola": { bg: "bg-emerald-100", text: "text-emerald-700" },
  "Camera doppia": { bg: "bg-blue-100", text: "text-blue-700" },
  "Posto letto": { bg: "bg-amber-100", text: "text-amber-700" },
  "Monolocale": { bg: "bg-violet-100", text: "text-violet-700" },
  "Bilocale": { bg: "bg-rose-100", text: "text-rose-700" },
  "Appartamento": { bg: "bg-cyan-100", text: "text-cyan-700" },
};

export default function ProductCard({ product, favoritedIds }) {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [imgFailed, setImgFailed] = useState(false);
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setFavorited(favoritedIds?.has(product.id) ?? false);
    });
  }, [favoritedIds, product.id]);
  const cat = categoryStyles[product.category] || { bg: "bg-slate-100", text: "text-slate-600" };
  const images = Array.isArray(product.images) ? product.images : [];
  const coverImage = !imgFailed ? (images[0] || product.image || null) : null;
  const perMonth = t("perMonth");

  async function toggleFavorite(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!session?.user?.id) return;
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id }),
    });
    if (res.ok) {
      const data = await res.json();
      setFavorited(data.favorited);
    }
  }

  return (
    <Link href={"/products/" + product.id}>
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-100 hover:border-indigo-200 transition-all duration-200 cursor-pointer h-full flex flex-col group relative">
        {session?.user?.id && (
          <button onClick={toggleFavorite}
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition border border-slate-200"
          >
            <svg className={"w-4 h-4 " + (favorited ? "text-indigo-600" : "text-slate-400")} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={favorited ? "currentColor" : "none"}>
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        )}
        {coverImage ? (
          <div className="relative h-44">
            <Image src={coverImage} alt={product.title} fill sizes="(max-width: 768px) 100vw, 400px" unoptimized className="object-cover rounded-t-2xl" onError={() => setImgFailed(true)} />
            {images.length > 1 && (
              <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                <Camera className="w-3 h-3 inline mr-1" />{images.length}
              </span>
            )}
          </div>
        ) : (
          <div className="h-44 bg-gradient-to-br from-indigo-50 to-slate-100 flex items-center justify-center text-5xl rounded-t-2xl group-hover:from-indigo-100 transition-colors">
            <House className="w-10 h-10 text-slate-300" />
          </div>
        )}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 flex-1 group-hover:text-indigo-700 transition-colors">
              {product.title}
            </h3>
            <span className={"text-xs px-2 py-0.5 rounded-full font-medium shrink-0 " + cat.bg + " " + cat.text}>
              {product.category}
            </span>
          </div>
          <p className="text-slate-500 text-xs line-clamp-2 flex-1 mb-1 leading-relaxed">
            {product.description}
          </p>
          {product.city && <p className="text-indigo-500 text-xs font-medium mb-3 flex items-center gap-1"><MapPin className="w-3 h-3" />{product.city}</p>}
          <div className="flex items-center justify-between mt-auto border-t border-slate-50 pt-3">
            <span className="text-indigo-700 font-bold text-base">
              €{product.price.toLocaleString("de-DE", { minimumFractionDigits: 0 })}
              <span className="text-xs font-normal text-slate-400 ms-1">/{perMonth}</span>
            </span>
            <span className="text-slate-400 text-xs">{product.seller?.name}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
