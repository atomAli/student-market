"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { translations } from "@/lib/i18n";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("fa");

  function applyDir(l) {
    const dir = translations[l]?.dir || "rtl";
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", l);
  }

  useEffect(() => {
    Promise.resolve().then(() => {
      const saved = localStorage.getItem("lang") || "fa";
      setLang(saved);
      applyDir(saved);
    });
  }, []);

  function changeLang(l) {
    setLang(l);
    localStorage.setItem("lang", l);
    applyDir(l);
  }

  const t = (key) => translations[lang]?.[key] ?? translations["fa"][key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
