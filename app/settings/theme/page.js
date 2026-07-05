"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../components/LanguageContext";
import { GraduationCap } from "lucide-react";

const PRESETS = [
  { name: "ایندیگو (پیش‌فرض)", primary: "#4f46e5", navFrom: "#312e81", navTo: "#4338ca", bgFrom: "#eef2ff", bgTo: "#f0fdf4", accent: "#4f46e5" },
  { name: "آبی اقیانوس",        primary: "#0284c7", navFrom: "#0c4a6e", navTo: "#0369a1", bgFrom: "#e0f2fe", bgTo: "#f0fdf4", accent: "#0284c7" },
  { name: "سبز زمردی",          primary: "#059669", navFrom: "#064e3b", navTo: "#047857", bgFrom: "#ecfdf5", bgTo: "#f0fdf4", accent: "#059669" },
  { name: "بنفش شاهانه",        primary: "#7c3aed", navFrom: "#2e1065", navTo: "#6d28d9", bgFrom: "#f5f3ff", bgTo: "#fdf4ff", accent: "#7c3aed" },
  { name: "قرمز گرم",           primary: "#dc2626", navFrom: "#450a0a", navTo: "#b91c1c", bgFrom: "#fff1f2", bgTo: "#fef9c3", accent: "#dc2626" },
  { name: "نارنجی پاییزی",      primary: "#ea580c", navFrom: "#431407", navTo: "#c2410c", bgFrom: "#fff7ed", bgTo: "#fef3c7", accent: "#ea580c" },
  { name: "صورتی مدرن",         primary: "#db2777", navFrom: "#500724", navTo: "#be185d", bgFrom: "#fdf2f8", bgTo: "#fdf4ff", accent: "#db2777" },
  { name: "شب تیره",            primary: "#6366f1", navFrom: "#0f172a", navTo: "#1e293b", bgFrom: "#f1f5f9", bgTo: "#e2e8f0", accent: "#6366f1" },
];

const FIELDS = [
  { key: "primary",  labelKey: "primaryColor",      descKey: "primaryDesc" },
  { key: "navFrom",  labelKey: "navFrom",           descKey: "navFromDesc" },
  { key: "navTo",    labelKey: "navTo",             descKey: "navToDesc" },
  { key: "bgFrom",   labelKey: "bgFrom",            descKey: "bgFromDesc" },
  { key: "bgTo",     labelKey: "bgTo",              descKey: "bgToDesc" },
  { key: "accent",   labelKey: "accent",            descKey: "accentDesc" },
];

export default function ThemeSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const [theme, setTheme] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/theme").then(r => r.json()).then(setTheme);
  }, []);

  function applyPreview(t) {
    const root = document.documentElement;
    root.style.setProperty("--color-primary",  t.primary);
    root.style.setProperty("--color-nav-from", t.navFrom);
    root.style.setProperty("--color-nav-to",   t.navTo);
    root.style.setProperty("--color-bg-from",  t.bgFrom);
    root.style.setProperty("--color-bg-to",    t.bgTo);
    root.style.setProperty("--color-accent",   t.accent);
    document.documentElement.style.setProperty("--body-bg", `linear-gradient(135deg, ${t.bgFrom} 0%, #f8fafc 60%, ${t.bgTo} 100%)`);
    document.documentElement.style.setProperty("background", `linear-gradient(135deg, ${t.bgFrom} 0%, #f8fafc 60%, ${t.bgTo} 100%)`);
  }

  function handleChange(key, value) {
    const updated = { ...theme, [key]: value };
    setTheme(updated);
    applyPreview(updated);
  }

  function applyPreset(preset) {
    setTheme(prev => ({ ...prev, ...preset }));
    applyPreview(preset);
  }

  async function handleSave() {
    setSaving(true);
    await fetch("/api/theme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(theme),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (status === "loading" || !theme) return (
    <div className="text-center mt-20 text-slate-400">{t("loading")}</div>
  );
  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto" dir={t("dir")}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">{t("themeSettings")}</h1>
        <p className="text-slate-500 text-sm mt-1">{t("themeSubtitle")}</p>
      </div>

      {/* Presets */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-5">
        <h2 className="font-bold text-slate-700 mb-3 text-sm">{t("presets")}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              className="group flex flex-col items-center gap-2 p-3 rounded-xl border-2 border-slate-100 hover:border-slate-300 transition-all"
            >
              <div className="flex gap-1">
                <div className="w-5 h-5 rounded-full border border-white shadow" style={{ background: p.navFrom }} />
                <div className="w-5 h-5 rounded-full border border-white shadow" style={{ background: p.primary }} />
                <div className="w-5 h-5 rounded-full border border-white shadow" style={{ background: p.bgFrom }} />
              </div>
              <span className="text-xs text-slate-600 text-center leading-tight group-hover:text-slate-800">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Colors */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-5">
        <h2 className="font-bold text-slate-700 mb-4 text-sm">{t("customColors")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FIELDS.map(({ key, labelKey, descKey }) => (
            <div key={key} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-xl border-2 border-white shadow-md cursor-pointer overflow-hidden"
                  style={{ background: theme[key] }}>
                  <input
                    type="color"
                    value={theme[key]}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-700">{t(labelKey)}</p>
                <p className="text-xs text-slate-400">{t(descKey)}</p>
                <p className="text-xs font-mono text-slate-500 mt-0.5">{theme[key]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Bar */}
      <div className="rounded-2xl overflow-hidden shadow-sm mb-5">
        <div className="h-12 flex items-center px-4 gap-3"
          style={{ background: `linear-gradient(to left, ${theme.navFrom}, ${theme.navTo})` }}>
          <span className="text-white font-bold text-sm flex items-center gap-1"><GraduationCap className="w-4 h-4" />بازار دانشجویی</span>
          <div className="mr-auto flex gap-2">
            <div className="bg-white/20 rounded-full px-3 py-1 text-white text-xs">خانه</div>
            <div className="rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: "white", color: theme.primary }}>ثبت‌نام</div>
          </div>
        </div>
        <div className="p-4 flex gap-3"
          style={{ background: `linear-gradient(135deg, ${theme.bgFrom}, ${theme.bgTo})` }}>
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-xl p-3 flex-1 shadow-sm">
              <div className="h-16 rounded-lg mb-2" style={{ background: `${theme.bgFrom}` }} />
              <div className="h-2 bg-slate-100 rounded mb-1" />
              <div className="h-2 bg-slate-50 rounded w-2/3" />
              <p className="text-xs font-bold mt-2" style={{ color: theme.accent }}>۱۵۰,۰۰۰ تومان</p>
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="flex gap-3">
        <button onClick={handleSave} disabled={saving}
          className="flex-1 py-3 rounded-xl text-white font-bold text-sm shadow-sm transition disabled:opacity-60"
          style={{ background: theme.primary }}>
          {saving ? t("saving") : saved ? t("saved") : t("save")}
        </button>
        <button onClick={() => router.push("/")}
          className="px-6 py-3 rounded-xl bg-slate-100 text-slate-600 font-medium text-sm hover:bg-slate-200 transition">
          {t("back")}
        </button>
      </div>
    </div>
  );
}
