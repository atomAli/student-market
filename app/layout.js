import "./globals.css";
import Providers from "./components/Providers";
import Navbar from "./components/Navbar";
import ThemeProvider from "./components/ThemeProvider";
import { prisma } from "@/lib/prisma";
import { Vazirmatn } from "next/font/google";

const vazirmatn = Vazirmatn({ subsets: ["latin", "arabic"], display: "swap" });

export const metadata = {
  title: "خانه دانشجویی مسینا",
  description: "پلتفرم اجاره خانه، اتاق و تخت برای دانشجویان شهر مسینا",
};

const DEFAULT_THEME = {
  primary: "#4f46e5",
  navFrom: "#312e81",
  navTo:   "#4338ca",
  bgFrom:  "#eef2ff",
  bgTo:    "#f0fdf4",
  accent:  "#4f46e5",
};

export default async function RootLayout({ children }) {
  let theme = DEFAULT_THEME;
  try {
    const db = await prisma.themeConfig.findUnique({ where: { id: "default" } });
    if (db) theme = db;
  } catch {}

  const bodyBg = `linear-gradient(135deg, ${theme.bgFrom} 0%, #f8fafc 60%, ${theme.bgTo} 100%)`;

  return (
    <html lang="fa" dir="rtl" className={vazirmatn.className}>
      <head>
        <style>{`
          :root {
            --color-primary:  ${theme.primary};
            --color-nav-from: ${theme.navFrom};
            --color-nav-to:   ${theme.navTo};
            --color-bg-from:  ${theme.bgFrom};
            --color-bg-to:    ${theme.bgTo};
            --color-accent:   ${theme.accent};
          }
        `}</style>
      </head>
      <body className="min-h-screen" style={{ background: bodyBg }}>
        <Providers>
          <ThemeProvider theme={theme} />
          <Navbar />
          <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
