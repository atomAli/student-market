"use client";
import { useEffect } from "react";

export default function ThemeProvider({ theme }) {
  useEffect(() => {
    if (!theme) return;
    const root = document.documentElement;
    root.style.setProperty("--color-primary",  theme.primary);
    root.style.setProperty("--color-nav-from", theme.navFrom);
    root.style.setProperty("--color-nav-to",   theme.navTo);
    root.style.setProperty("--color-bg-from",  theme.bgFrom);
    root.style.setProperty("--color-bg-to",    theme.bgTo);
    root.style.setProperty("--color-accent",   theme.accent);
  }, [theme]);

  return null;
}
