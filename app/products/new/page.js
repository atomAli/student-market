"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useLanguage } from "../../components/LanguageContext";
import { regions } from "@/lib/cities";
import { Lock, TriangleAlert, Check, X, Camera } from "lucide-react";
import Image from "next/image";

const RentalMap = dynamic(() => import("../../components/RentalMap"), { ssr: false });

export default function NewProductPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const fileRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", price: "", category: "", city: "Messina", province: "Messina", address: "" });
  const [location, setLocation] = useState(null);
  const [images, setImages] = useState([]);   // { preview, url, uploading }
  const [useTelegram, setUseTelegram] = useState(false);
  const [telegramId, setTelegramId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(cats => {
      setCategories(cats);
      if (cats.length > 0) setForm(f => ({ ...f, category: cats[0].name }));
    });
  }, []);

  if (status === "loading") return <p className="text-center mt-20 text-slate-400">{t("loading")}</p>;
  if (!session) return (
    <div className="text-center mt-20">
      <Lock className="w-12 h-12 mx-auto mb-4" />
      <p className="text-slate-600 mb-4 font-medium">{t("loginRequired")}</p>
      <Link href="/login" className="text-white px-6 py-2.5 rounded-xl font-medium" style={{ background: "var(--color-primary)" }}>
        {t("loginRequiredBtn")}
      </Link>
    </div>
  );

  async function handleFileChange(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newSlots = files.map(f => ({ preview: URL.createObjectURL(f), url: null, uploading: true, id: Math.random() }));
    setImages(prev => [...prev, ...newSlots]);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const slot = newSlots[i];
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        setImages(prev => prev.map(img =>
          img.id === slot.id ? { ...img, uploading: false, url: data.url } : img
        ));
      } catch {
        setImages(prev => prev.map(img =>
          img.id === slot.id ? { ...img, uploading: false, error: true } : img
        ));
      }
    }
    e.target.value = "";
  }

  function removeImage(id) {
    setImages(prev => prev.filter(img => img.id !== id));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (images.some(img => img.uploading)) { setError(t("waitUpload")); return; }
    setError(""); setLoading(true);
    const uploadedUrls = images.filter(img => img.url).map(img => img.url);
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, city: form.city, images: uploadedUrls, latitude: location?.lat || null, longitude: location?.lng || null, telegram: useTelegram ? telegramId.trim() : null }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) setError(data.error || t("errorOccurred"));
    else router.push("/products/" + data.id);
  }

  const inputClass = "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white";

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">{t("newListingTitle")}</h1>
        <p className="text-slate-500 text-sm mt-1">{t("newListingSubtitle")}</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 mb-4 text-sm flex items-center gap-1"><TriangleAlert className="w-4 h-4 shrink-0" />{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">

        {/* چند عکس */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            {t("photoLabel")} <span className="text-slate-400 font-normal">({t("optional")})</span>
          </label>

          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-2">
              {images.map(img => (
                <div key={img.id} className="relative rounded-xl overflow-hidden aspect-square border border-slate-200">
                  <Image src={img.preview} alt="" fill unoptimized className="object-cover" />
                  {img.uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                    </div>
                  )}
                  {!img.uploading && img.url && (
                    <div className="absolute bottom-1 right-1 bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center"><Check className="w-3 h-3" /></div>
                  )}
                  {!img.uploading && (
                    <button type="button" onClick={() => removeImage(img.id)}
                      className="absolute top-1 left-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => fileRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center hover:border-indigo-400 hover:bg-indigo-50 transition text-slate-400 hover:text-indigo-500 text-xs gap-1">
                <Camera className="w-6 h-6" />
                <span>{t("addMorePhotos")}</span>
              </button>
            </div>
          )}

          {images.length === 0 && (
            <button type="button" onClick={() => fileRef.current?.click()}
              className="w-full h-36 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-indigo-400 hover:bg-indigo-50 transition text-slate-400 hover:text-indigo-500">
              <Camera className="w-8 h-8" />
              <span className="text-sm font-medium">{t("uploadClick")}</span>
              <span className="text-xs">{t("uploadHint")}</span>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif"
            multiple onChange={handleFileChange} className="hidden" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t("titleLabel")} *</label>
          <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            required placeholder={t("titlePlaceholder")} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t("categoryLabel")} *</label>
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inputClass}>
            {categories.map(c => <option key={c.id} value={c.name}>{c.icon} {c.name}</option>)}
          </select>
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t("province")}</label>
            <select value={form.province} onChange={e => setForm({ ...form, province: e.target.value, city: "" })} className={inputClass}>
              {regions.flatMap(r => r.provinces.map(p => ({ name: p.name, cities: p.cities }))).map(p => (
                <option key={p.name} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t("city")}</label>
            <select value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className={inputClass}>
              {regions.flatMap(r => r.provinces).find(p => p.name === form.province)?.cities?.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t("descLabel")} *</label>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            required rows={4} placeholder={t("descPlaceholder")} className={inputClass + " resize-none"} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t("priceLabel")} *</label>
          <div className="relative">
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">€</span>
            <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
              required min="0" step="0.01" placeholder={t("pricePlaceholder")} className={inputClass + " pr-8"} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t("addressLabel")}</label>
          <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
            placeholder={t("addressPlaceholder")}
            className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t("locationLabel")}</label>
          <p className="text-xs text-slate-400 mb-2">{t("mapInstructions")}</p>
          <RentalMap selected={location} onSelect={setLocation} height="320px" zoom={13} />
          {location && (
            <div className="mt-2 text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-xl p-2">
              Lat: {location.lat.toFixed(5)} — Lng: {location.lng.toFixed(5)}
            </div>
          )}
        </div>

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={useTelegram} onChange={e => { setUseTelegram(e.target.checked); if (!e.target.checked) setTelegramId(""); }}
              className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-400" />
            <span className="text-sm font-semibold text-slate-700">{t("contactTelegram")}</span>
          </label>
          {useTelegram && (
            <div className="mt-3">
              <label className="block text-xs font-medium text-slate-500 mb-1">{t("telegramId")}</label>
              <input type="text" value={telegramId} onChange={e => setTelegramId(e.target.value)}
                placeholder={t("telegramHint")} required
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white" />
              <p className="text-xs text-slate-400 mt-1">{t("telegramHint")}</p>
            </div>
          )}
        </div>

        <button type="submit" disabled={loading || images.some(i => i.uploading) || (useTelegram && !telegramId.trim())}
          className="w-full text-white py-3 rounded-xl font-semibold transition shadow-sm disabled:opacity-60"
          style={{ background: "var(--color-primary)" }}>
          {loading ? t("submitting") : t("submitListing")}
        </button>
      </form>
    </div>
  );
}
