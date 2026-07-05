"use client";
import { useState, useEffect, useMemo } from "react";
import ProductCard from "./components/ProductCard";
import { useLanguage } from "./components/LanguageContext";
import { regions } from "@/lib/cities";
import { GraduationCap, Tag, Clock, Inbox } from "lucide-react";

export default function HomePage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("all");
  const [selectedProvince, setSelectedProvince] = useState("Messina");
  const [selectedCity, setSelectedCity] = useState("Messina");
  const [loading, setLoading] = useState(true);
  const [favoritedIds, setFavoritedIds] = useState(null);

  const provinces = useMemo(() => {
    const list = [];
    for (const region of regions) {
      for (const province of region.provinces) {
        list.push({ name: province.name, region: region.name, cities: province.cities });
      }
    }
    return list;
  }, []);

  const availableCities = useMemo(() => {
    const p = provinces.find(p => p.name === selectedProvince);
    return p ? p.cities : [];
  }, [selectedProvince, provinces]);

  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/favorites/ids").then(r => r.json()).then(data => setFavoritedIds(new Set(data.ids || []))).catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (selectedCity) params.set("city", selectedCity);

    let cancelled = false;

    Promise.resolve().then(() => { if (!cancelled) setLoading(true); });

    fetch("/api/products?" + params.toString())
      .then(r => r.json())
      .then(data => { if (!cancelled && Array.isArray(data)) setProducts(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [category, selectedCity]);

  return (
    <div>
      <div className="text-center mb-6 py-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center justify-center gap-2"><GraduationCap className="w-8 h-8" />{t("siteName")}</h1>
        <p className="text-slate-500 text-sm">{t("newListingSubtitle")}</p>
      </div>

      <div className="flex gap-3 items-end justify-center mb-6 flex-wrap">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">{t("province")}</label>
          <select value={selectedProvince} onChange={e => { setSelectedProvince(e.target.value); setSelectedCity(""); }}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400">
            {provinces.map(p => (
              <option key={p.name} value={p.name}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">{t("city")}</label>
          <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <option value="">{t("all")}</option>
            {availableCities.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mb-8 justify-center">
        <button onClick={() => setCategory("all")}
          className={"flex items-center gap-1 px-4 py-1.5 rounded-full text-sm font-medium transition border " +
            (category === "all" ? "text-white" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-400")}
          style={category === "all" ? { background: "var(--color-primary)", borderColor: "var(--color-primary)" } : {}}>
          <Tag className="w-4 h-4" /> {t("all")}
        </button>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setCategory(cat.name)}
            className={"flex items-center gap-1 px-4 py-1.5 rounded-full text-sm font-medium transition border " +
              (category === cat.name ? "text-white" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-400")}
            style={category === cat.name ? { background: "var(--color-primary)", borderColor: "var(--color-primary)" } : {}}>
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">
          <Clock className="w-10 h-10 mx-auto mb-3 animate-pulse" />
          <p>{t("loading")}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Inbox className="w-12 h-12 mx-auto mb-3" />
          <p className="font-medium">{t("noListings")}</p>
          <p className="text-sm mt-1">{t("noListingsSub")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map(p => <ProductCard key={p.id} product={p} favoritedIds={favoritedIds} />)}
        </div>
      )}
    </div>
  );
}
