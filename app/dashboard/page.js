"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "../components/LanguageContext";
import ProductCard from "../components/ProductCard";
import {
  Heart,
  List,
  Clock,
  ShieldCheck,
  HeartOff,
  PackageOpen,
  Pencil,
  Trash2,
  MapPin,
  House,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Eye,
  LogOut,
  MessageSquare,
  Palette,
} from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const isAdmin = !!session?.user?.isAdmin;
  const [tab, setTab] = useState("favorites");
  const [favorites, setFavorites] = useState([]);
  const [listings, setListings] = useState([]);
  const [activity, setActivity] = useState([]);
  const [adminListings, setAdminListings] = useState([]);
  const [loading, setLoading] = useState({
    favorites: true,
    listings: true,
    activity: true,
    adminListings: false,
  });
  const [favIds, setFavIds] = useState(new Set());

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.id) {
      router.push("/login?callbackUrl=/dashboard");
      return;
    }
  }, [status, session, router]);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((data) => {
        setFavorites(Array.isArray(data) ? data : []);
        setLoading((p) => ({ ...p, favorites: false }));
      })
      .catch(() => setLoading((p) => ({ ...p, favorites: false })));
  }, [session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch("/api/products/mine")
      .then((r) => r.json())
      .then((data) => {
        const items = Array.isArray(data) ? data : [];
        setListings(items);
        setLoading((p) => ({ ...p, listings: false }));
      })
      .catch(() => setLoading((p) => ({ ...p, listings: false })));
  }, [session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id || !isAdmin) return;
    fetch("/api/admin/listings")
      .then((r) => r.json())
      .then((data) => {
        setAdminListings(Array.isArray(data) ? data : []);
        setLoading((p) => ({ ...p, adminListings: false }));
      })
      .catch(() => setLoading((p) => ({ ...p, adminListings: false })));
  }, [session?.user?.id, isAdmin]);

  useEffect(() => {
    if (!session?.user?.id) return;
    Promise.all([
      fetch("/api/products/mine")
        .then((r) => r.json())
        .catch(() => []),
      fetch("/api/chat/conversations")
        .then((r) => r.json())
        .catch(() => []),
    ])
      .then(([products, conversations]) => {
        const events = [];
        if (Array.isArray(products)) {
          products.forEach((p) => {
            events.push({
              type: "listing",
              product: p,
              date: new Date(p.createdAt).getTime(),
              label: "createdListing",
            });
          });
        }
        if (Array.isArray(conversations)) {
          conversations.forEach((c) => {
            if (c.lastMessage) {
              events.push({
                type: "message",
                conversation: c,
                date: new Date(c.lastMessage.createdAt).getTime(),
                label: "messagedAbout",
                productTitle: c.product?.title || "",
              });
            }
          });
        }
        events.sort((a, b) => b.date - a.date);
        setActivity(events.slice(0, 50));
        setLoading((p) => ({ ...p, activity: false }));
      })
      .catch(() => setLoading((p) => ({ ...p, activity: false })));
  }, [session?.user?.id]);

  useEffect(() => {
    if (favorites.length === 0) return;
    fetch("/api/favorites/ids")
      .then((r) => r.json())
      .then((data) => setFavIds(new Set(data.ids || [])))
      .catch(() => {});
  }, [favorites.length]);

  if (status === "loading")
    return <p className="text-center mt-20 text-slate-400">{t("loading")}</p>;
  if (!session) return null;

  const tabList = [
    { key: "favorites", icon: Heart, label: t("favorites") },
    { key: "listings", icon: List, label: t("myListings") },
    { key: "activity", icon: Clock, label: t("activity") },
    ...(isAdmin
      ? [
          { key: "admin", icon: ShieldCheck, label: t("adminListings") },
          { key: "chatAdmin", icon: MessageSquare, label: t("adminMessages") },
          { key: "theme", icon: Palette, label: t("themeSettings") },
        ]
      : []),
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {t("dashboardTitle")}
          </h1>
          <p className="text-slate-500 text-sm mt-1">{session?.user?.name}</p>
        </div>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition"
        >
          <LogOut className="w-4 h-4" />
          {t("logout")}
        </button>
      </div>

      <div className="flex gap-1 mb-6 border-b border-slate-200 overflow-x-auto">
        {tabList.map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={
              "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition -mb-px whitespace-nowrap " +
              (tab === key
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-500 hover:text-slate-700")
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === "favorites" && (
        <FavoritesTab
          favorites={favorites}
          loading={loading.favorites}
          t={t}
          favIds={favIds}
        />
      )}
      {tab === "listings" && (
        <ListingsTab listings={listings} loading={loading.listings} t={t} />
      )}
      {tab === "activity" && (
        <ActivityTab activity={activity} loading={loading.activity} t={t} />
      )}
      {tab === "admin" && (
        <AdminListingsTab
          listings={adminListings}
          loading={loading.adminListings}
          t={t}
          onRefresh={() => {
            if (!session?.user?.id || !isAdmin) return;
            fetch("/api/admin/listings")
              .then((r) => r.json())
              .then((data) => setAdminListings(Array.isArray(data) ? data : []))
              .catch(() => {});
          }}
        />
      )}
      {tab === "chatAdmin" && (
        <div className="bg-white rounded-2xl border border-slate-100 p-8">
          <div className="text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              {t("adminMessagesTitle")}
            </h2>
            <p className="text-slate-500 mb-4">{t("adminMessagesSubtitle")}</p>
            <Link
              href="/admin/messages"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition"
            >
              {t("adminMessagesPanel")}
            </Link>
          </div>
        </div>
      )}
      {tab === "theme" && (
        <div className="bg-white rounded-2xl border border-slate-100 p-8">
          <div className="text-center">
            <Palette className="w-12 h-12 mx-auto mb-4 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              {t("themeSettings")}
            </h2>
            <p className="text-slate-500 mb-4">{t("themeSubtitle")}</p>
            <Link
              href="/settings/theme"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition"
            >
              {t("themeSettings")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function FavoritesTab({ favorites, loading, t, favIds }) {
  if (loading)
    return <p className="text-center py-20 text-slate-400">{t("loading")}</p>;
  if (favorites.length === 0) {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center">
        <HeartOff className="w-12 h-12 mx-auto mb-4 text-slate-300" />
        <p className="text-slate-500 font-medium">{t("noFavorites")}</p>
        <Link
          href="/"
          className="mt-4 inline-block text-indigo-600 hover:underline font-medium"
        >
          {t("browseListings")}
        </Link>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {favorites.map((p) => (
        <ProductCard key={p.id} product={p} favoritedIds={favIds} />
      ))}
    </div>
  );
}

function statusStyle(status) {
  switch (status) {
    case "pending":
      return {
        bg: "bg-amber-100",
        text: "text-amber-700",
        dot: "bg-amber-500",
      };
    case "active":
      return {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        dot: "bg-emerald-500",
      };
    case "rented":
      return { bg: "bg-rose-100", text: "text-rose-700", dot: "bg-rose-500" };
    default:
      return {
        bg: "bg-slate-100",
        text: "text-slate-600",
        dot: "bg-slate-400",
      };
  }
}

function statusLabel(status, t) {
  switch (status) {
    case "pending":
      return t("statusPending");
    case "active":
      return t("statusActive");
    case "rented":
      return t("statusRented");
    default:
      return status;
  }
}

function ListingsTab({ listings, loading, t }) {
  if (loading)
    return <p className="text-center py-20 text-slate-400">{t("loading")}</p>;
  if (listings.length === 0) {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center">
        <PackageOpen className="w-12 h-12 mx-auto mb-4 text-slate-300" />
        <p className="text-slate-500 font-medium">{t("noListingsYet")}</p>
        <Link
          href="/products/new"
          className="mt-4 inline-block bg-indigo-600 text-white px-5 py-2 rounded-full font-medium hover:bg-indigo-700 transition"
        >
          {t("postFirstListing")}
        </Link>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {listings.map((p) => (
        <ListingRow key={p.id} product={p} t={t} showActions={true} />
      ))}
    </div>
  );
}

function ListingRow({ product, t, showActions, onRefresh }) {
  const images = Array.isArray(product.images) ? product.images : [];
  const cover = images[0] || product.image;
  const catStyles = {
    "Camera singola": { bg: "bg-emerald-100", text: "text-emerald-700" },
    "Camera doppia": { bg: "bg-blue-100", text: "text-blue-700" },
    "Posto letto": { bg: "bg-amber-100", text: "text-amber-700" },
    Monolocale: { bg: "bg-violet-100", text: "text-violet-700" },
  };
  const cat = catStyles[product.category] || {
    bg: "bg-slate-100",
    text: "text-slate-600",
  };
  const sStyle = statusStyle(
    product.status || (product.sold ? "rented" : "active"),
  );

  async function handleSold() {
    if (!confirm(t("confirmMarkSold"))) return;
    await fetch(`/api/products/${product.id}`, { method: "PATCH" });
    onRefresh ? onRefresh() : window.location.reload();
  }

  async function handleDelete() {
    if (!confirm(t("confirmDelete"))) return;
    await fetch(`/api/products/${product.id}`, { method: "DELETE" });
    onRefresh ? onRefresh() : window.location.reload();
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 flex gap-4 items-center hover:shadow-sm transition">
      <Link
        href={`/products/${product.id}`}
        className="shrink-0 w-24 h-20 rounded-xl overflow-hidden relative"
      >
        {cover ? (
          <Image
            src={cover}
            alt={product.title}
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-slate-100 flex items-center justify-center">
            <House className="w-6 h-6 text-slate-300" />
          </div>
        )}
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Link
            href={`/products/${product.id}`}
            className="font-semibold text-slate-800 hover:text-indigo-600 transition truncate"
          >
            {product.title}
          </Link>
          <span
            className={
              "text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 " +
              cat.bg +
              " " +
              cat.text
            }
          >
            {product.category}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="font-bold text-indigo-700">
            €{product.price.toLocaleString("de-DE")}
          </span>
          {product.city && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {product.city}
            </span>
          )}
          <span
            className={
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium " +
              sStyle.bg +
              " " +
              sStyle.text
            }
          >
            <span className={"w-1.5 h-1.5 rounded-full " + sStyle.dot} />
            {statusLabel(
              product.status || (product.sold ? "rented" : "active"),
              t,
            )}
          </span>
        </div>
      </div>
      {showActions && (
        <div className="flex items-center gap-1 shrink-0">
          {product.status === "pending" && (
            <span className="text-[10px] text-slate-400 italic px-2">
              {t("waitingApproval")}
            </span>
          )}
          {product.status === "active" && !product.sold && (
            <button
              onClick={handleSold}
              className="text-xs px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 transition font-medium"
            >
              {t("markSold")}
            </button>
          )}
          <button
            onClick={handleDelete}
            className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

function AdminListingsTab({ listings, loading, t, onRefresh }) {
  if (loading)
    return <p className="text-center py-20 text-slate-400">{t("loading")}</p>;
  if (listings.length === 0) {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center">
        <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-slate-300" />
        <p className="text-slate-500 font-medium">{t("noListingsTotal")}</p>
      </div>
    );
  }

  const pending = listings.filter((p) => p.status === "pending");
  const others = listings.filter((p) => p.status !== "pending");

  return (
    <div className="space-y-6">
      {pending.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-500" />
            {t("pendingApproval")} ({pending.length})
          </h3>
          <div className="space-y-3">
            {pending.map((p) => (
              <AdminListingRow
                key={p.id}
                product={p}
                t={t}
                onRefresh={onRefresh}
              />
            ))}
          </div>
        </div>
      )}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">
          {t("allListings")} ({others.length})
        </h3>
        <div className="space-y-3">
          {others.map((p) => (
            <AdminListingRow
              key={p.id}
              product={p}
              t={t}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminListingRow({ product, t, onRefresh }) {
  const images = Array.isArray(product.images) ? product.images : [];
  const cover = images[0] || product.image;
  const catStyles = {
    "Camera singola": { bg: "bg-emerald-100", text: "text-emerald-700" },
    "Camera doppia": { bg: "bg-blue-100", text: "text-blue-700" },
    "Posto letto": { bg: "bg-amber-100", text: "text-amber-700" },
    Monolocale: { bg: "bg-violet-100", text: "text-violet-700" },
  };
  const cat = catStyles[product.category] || {
    bg: "bg-slate-100",
    text: "text-slate-600",
  };
  const sStyle = statusStyle(
    product.status || (product.sold ? "rented" : "active"),
  );

  async function handleApprove() {
    await fetch(`/api/products/${product.id}/approve`, { method: "POST" });
    onRefresh();
  }

  async function handleReject() {
    if (!confirm(t("confirmReject"))) return;
    await fetch(`/api/products/${product.id}/reject`, { method: "POST" });
    onRefresh();
  }

  async function handleDelete() {
    if (!confirm(t("confirmDelete"))) return;
    await fetch(`/api/products/${product.id}`, { method: "DELETE" });
    onRefresh();
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 flex gap-4 items-center hover:shadow-sm transition">
      <Link
        href={`/products/${product.id}`}
        className="shrink-0 w-24 h-20 rounded-xl overflow-hidden relative"
      >
        {cover ? (
          <Image
            src={cover}
            alt={product.title}
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-slate-100 flex items-center justify-center">
            <House className="w-6 h-6 text-slate-300" />
          </div>
        )}
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Link
            href={`/products/${product.id}`}
            className="font-semibold text-slate-800 hover:text-indigo-600 transition truncate"
          >
            {product.title}
          </Link>
          <span
            className={
              "text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 " +
              cat.bg +
              " " +
              cat.text
            }
          >
            {product.category}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="font-bold text-indigo-700">
            €{product.price.toLocaleString("de-DE")}
          </span>
          {product.city && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {product.city}
            </span>
          )}
          <span
            className={
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium " +
              sStyle.bg +
              " " +
              sStyle.text
            }
          >
            <span className={"w-1.5 h-1.5 rounded-full " + sStyle.dot} />
            {statusLabel(
              product.status || (product.sold ? "rented" : "active"),
              t,
            )}
          </span>
          <span className="text-slate-400">— {product.seller?.name}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {product.status === "pending" && (
          <>
            <button
              onClick={handleApprove}
              className="text-xs px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition font-medium flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t("approve")}
            </button>
            <button
              onClick={handleReject}
              className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition flex items-center gap-1"
            >
              <XCircle className="w-3.5 h-3.5" />
              {t("reject")}
            </button>
          </>
        )}
        <button
          onClick={handleDelete}
          className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function ActivityTab({ activity, loading, t }) {
  if (loading)
    return <p className="text-center py-20 text-slate-400">{t("loading")}</p>;
  if (activity.length === 0) {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center">
        <Clock className="w-12 h-12 mx-auto mb-4 text-slate-300" />
        <p className="text-slate-500 font-medium">{t("noActivity")}</p>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {activity.map((event, i) => (
        <ActivityRow key={i} event={event} t={t} />
      ))}
    </div>
  );
}

function ActivityRow({ event, t }) {
  const date = new Date(event.date);
  const time = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  if (event.type === "listing") {
    return (
      <Link
        href={"/products/" + event.product.id}
        className="flex items-center gap-3 bg-white rounded-xl border border-slate-100 p-3 hover:shadow-sm transition"
      >
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
          <Pencil className="w-4 h-4 text-indigo-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-700 truncate">
            {t("createdListing")}:{" "}
            <span className="font-medium">{event.product.title}</span>
          </p>
          <p className="text-xs text-slate-400">{time}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={"/chat/" + event.conversation.id}
      className="flex items-center gap-3 bg-white rounded-xl border border-slate-100 p-3 hover:shadow-sm transition"
    >
      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
        <MessageCircle className="w-4 h-4 text-emerald-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-700 truncate">
          {t("messagedAbout")}:{" "}
          <span className="font-medium">
            {event.productTitle || event.conversation.product?.title}
          </span>
        </p>
        <p className="text-xs text-slate-400">{time}</p>
      </div>
    </Link>
  );
}
