"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import ProductCard from "../components/ProductCard";
import { useLanguage } from "../components/LanguageContext";

const RentalMap = dynamic(() => import("../components/RentalMap"), { ssr: false });

export default function MapPage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoritedIds, setFavoritedIds] = useState(null);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetch("/api/favorites/ids").then(r => r.json()).then(data => setFavoritedIds(new Set(data.ids || []))).catch(() => {});
  }, []);

  const mapped = products.filter((p) => typeof p.latitude === "number" && typeof p.longitude === "number");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">{t("mapTitle")}</h1>
        <p className="text-slate-500 text-sm mt-1">{t("mapSubtitle")}</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">{t("loading")}</div>
      ) : (
        <>
          <RentalMap products={mapped} height="520px" zoom={13} />
          <div className="mt-8">
            <h2 className="font-bold text-slate-800 mb-4">{mapped.length} {t("listingsOnMap")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {mapped.map((p) => <ProductCard key={p.id} product={p} favoritedIds={favoritedIds} />)}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
