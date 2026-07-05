"use client";
import { useLanguage } from "./LanguageContext";
import { LANGUAGES } from "@/lib/i18n";
import { useState } from "react";
import { Globe, ChevronDown } from "lucide-react";

export default function LanguageSwitcher() {
  const { lang, changeLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find(l => l.code === lang);

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/10 transition text-sm text-white">
        <Globe className="w-4 h-4" />
        <span className="text-xs hidden sm:inline">{current?.label}</span>
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-50 min-w-[140px]">
            {LANGUAGES.map(l => (
              <button key={l.code} onClick={() => { changeLang(l.code); setOpen(false); }}
                className={"w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-slate-50 transition " +
                  (lang === l.code ? "text-indigo-600 font-semibold bg-indigo-50" : "text-slate-700")}>
                <span>{l.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
