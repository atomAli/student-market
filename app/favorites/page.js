"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "../components/LanguageContext";
import ProductCard from "../components/ProductCard";
import { HeartOff } from "lucide-react";

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.id) {
      router.push("/login?callbackUrl=/favorites");
      return;
    }
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((data) => { setProducts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [status, session, router]);

  if (status === "loading") return <p className="text-center mt-20 text-slate-400">{t("loading")}</p>;
  if (!session) return null;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">{t("favoritesTitle")}</h1>
        <p className="text-slate-500 text-sm mt-1">{t("favoritesSubtitle")}</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">{t("loading")}</div>
      ) : products.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center">
          <HeartOff className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500 font-medium">{t("noFavorites")}</p>
          <Link href="/" className="mt-4 inline-block text-indigo-600 hover:underline font-medium">
            {t("browseListings")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
