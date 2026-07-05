"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useLanguage } from "./LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import {
  GraduationCap,
  MapPin,
  MessageSquare,
  PlusCircle,
  LogOut,
} from "lucide-react";

function navLinks({ mobile, t, session, isAdmin, unread, closeMenu }) {
  const base = mobile
    ? "block w-full text-left px-4 py-3 text-sm font-medium hover:bg-white/10 transition"
    : "flex items-center gap-1.5 hover:opacity-75 transition px-3 py-2 rounded-xl hover:bg-white/10 text-sm font-medium";

  const listRoomBtn = mobile
    ? "block w-full text-left px-4 py-3 text-sm font-bold bg-white text-indigo-700 hover:bg-indigo-50 transition"
    : "flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-indigo-700 font-bold text-sm hover:bg-indigo-50 transition shadow-lg";
  return (
    <>
      {session ? (
        <>
          <Link href="/map" className={base} onClick={closeMenu}>
            <MapPin className="w-4 h-4" />
            {t("map")}
          </Link>
          <Link href="/chat" className={base + " relative"} onClick={closeMenu}>
            <MessageSquare className="w-4 h-4" />
            {t("chat")}
            {unread > 0 && (
              <span className="inline-flex absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] items-center justify-center rounded-full px-1 leading-none">
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </Link>
          <Link
            href="/products/new"
            className={listRoomBtn}
            onClick={closeMenu}
          >
            <PlusCircle className="w-4 h-4" />
            {t("newListing")}
          </Link>
          <Link href="/dashboard" className={base} onClick={closeMenu}>
            {t("dashboard")}
          </Link>
          <button
            onClick={() => {
              signOut();
              closeMenu();
            }}
            className={base + " text-red-300 hover:text-red-200"}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </>
      ) : (
        <>
          <Link href="/map" className={base} onClick={closeMenu}>
            <MapPin className="w-4 h-4" />
            {t("map")}
          </Link>
          <Link href="/login" className={base} onClick={closeMenu}>
            {t("login")}
          </Link>
          <Link href="/register" className={listRoomBtn} onClick={closeMenu}>
            {t("register")}
          </Link>
        </>
      )}
    </>
  );
}

export default function Navbar() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const isAdmin = !!session?.user?.isAdmin;
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const mounted = useRef(true);
  const menuRef = useRef(null);

  useEffect(() => {
    mounted.current = true;
    if (!session?.user?.id) return;

    const controller = new AbortController();

    fetch("/api/chat/unread", { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        if (mounted.current) setUnread(data.count ?? 0);
      })
      .catch(() => {
        if (mounted.current) setUnread(0);
      });

    const interval = setInterval(() => {
      fetch("/api/chat/unread", { signal: controller.signal })
        .then((r) => r.json())
        .then((data) => {
          if (mounted.current) setUnread(data.count ?? 0);
        })
        .catch(() => {});
    }, 30000);

    return () => {
      mounted.current = false;
      controller.abort();
      clearInterval(interval);
    };
  }, [session?.user?.id]);

  useEffect(() => {
    function handleClick(e) {
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  const navProps = { t, session, isAdmin, unread, closeMenu };

  return (
    <nav
      style={{
        background:
          "linear-gradient(to left, var(--color-nav-from), var(--color-nav-to))",
      }}
      className="text-white shadow-lg"
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-white hover:opacity-80 transition"
        >
          <GraduationCap className="w-6 h-6" />
          <span className="text-[10px] sm:text-base">{t("siteName")}</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 text-sm font-medium">
            {navLinks({ mobile: false, ...navProps })}
          </div>

          <LanguageSwitcher />
          {session && (
            <button
              onClick={() => {
                signOut();
                closeMenu();
              }}
              className="hidden lg:flex w-9 h-9 rounded-lg items-center justify-center hover:bg-white/10 transition"
              title={t("logout")}
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/10 transition"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {menuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>
      {menuOpen && (
        <div
          ref={menuRef}
          className="lg:hidden border-t border-white/10 bg-inherit"
        >
          <div className="px-3 py-2 space-y-0.5">
            {navLinks({ mobile: true, ...navProps })}
          </div>
        </div>
      )}
    </nav>
  );
}
