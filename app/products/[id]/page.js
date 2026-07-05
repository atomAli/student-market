"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useLanguage } from "../../components/LanguageContext";
import { Package, MapPin } from "lucide-react";
import Image from "next/image";

const RentalMap = dynamic(() => import("../../components/RentalMap"), {
  ssr: false,
});

export default function ProductPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImg, setActiveImg] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [imgFailed, setImgFailed] = useState({});
  const [favorited, setFavorited] = useState(false);
  const markFailed = (i) => setImgFailed((prev) => ({ ...prev, [i]: true }));

  useEffect(() => {
    fetch("/api/products/" + id)
      .then(async (r) => {
        const text = await r.text();
        if (!text) throw new Error();
        return JSON.parse(text);
      })
      .then((data) => {
        if (data.error) setError(data.error);
        else setProduct(data);
        setLoading(false);
      })
      .catch(() => {
        setError(t("errorOccurred"));
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch("/api/favorites/ids").then(r => r.json()).then(data => {
      setFavorited(data.ids?.includes(id) ?? false);
    }).catch(() => {});
  }, [id, session?.user?.id]);

  async function toggleFavorite() {
    if (!session?.user?.id) {
      router.push("/login?callbackUrl=" + encodeURIComponent("/products/" + id));
      return;
    }
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: id }),
    });
    if (res.ok) {
      const data = await res.json();
      setFavorited(data.favorited);
    }
  }

  async function markAsSold() {
    setActionLoading(true);
    await fetch("/api/products/" + id, { method: "PATCH" });
    setProduct((p) => ({ ...p, sold: true }));
    setActionLoading(false);
  }

  async function deleteProduct() {
    if (!confirm(t("confirmDelete"))) return;
    setActionLoading(true);
    await fetch("/api/products/" + id, { method: "DELETE" });
    router.push("/");
  }

  if (loading)
    return <p className="text-center mt-20 text-slate-400">{t("loading")}</p>;
  if (error || !product)
    return (
      <div className="text-center mt-20">
        <p className="text-slate-500 mb-4">{error || t("errorOccurred")}</p>
        <Link href="/" className="text-indigo-600 hover:underline">
          {t("backToList")}
        </Link>
      </div>
    );

  const images = Array.isArray(product.images)
    ? product.images
    : product.image
      ? [product.image]
      : [];
  const perMonth = t("perMonth");
  const isOwner = session?.user?.id === product.sellerId;
  const canChat = !!session?.user?.id && !isOwner && !product.sold;

  async function startConversation() {
    if (!session?.user?.id) {
      router.push(
        "/login?callbackUrl=" + encodeURIComponent("/products/" + id),
      );
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });

      const raw = await res.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        throw new Error(raw || "Invalid server response");
      }

      if (res.status === 401) {
        router.push(
          "/login?callbackUrl=" + encodeURIComponent("/products/" + id),
        );
        return;
      }

      if (!res.ok || !data.conversationId) {
        alert(data.error || t("errorOccurred"));
        return;
      }

      router.push(`/chat/${data.conversationId}`);
    } catch (error) {
      console.error("startConversation failed:", error);
      alert(t("errorOccurred"));
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/"
        className="text-indigo-600 hover:underline text-sm mb-4 inline-block"
      >
        {t("backToList")}
      </Link>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* گالری عکس */}
        {images.length > 0 && !imgFailed[activeImg] ? (
          <div>
            <div className="relative h-80">
              <Image
                src={images[activeImg]}
                alt={product.title}
                fill
                sizes="(max-width: 768px) 100vw, 800px"
                className="object-cover"
                onError={() => markFailed(activeImg)}
              />
              {product.sold && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="bg-red-500 text-white text-2xl font-bold px-6 py-2 rounded-xl rotate-[-10deg]">
                    {t("sold")}
                  </span>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 p-3 bg-slate-50 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={
                      "rounded-lg overflow-hidden border-2 shrink-0 transition " +
                      (activeImg === i
                        ? "border-indigo-500"
                        : "border-transparent opacity-60 hover:opacity-100")
                    }
                  >
                    <Image src={img} alt="" width={64} height={64} className="object-cover" onError={() => markFailed(i)} />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="h-72 bg-gradient-to-br from-indigo-50 to-slate-100 flex items-center justify-center">
            <Package className="w-24 h-24 text-slate-300" />
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-2xl font-bold text-slate-800">
              {product.title}
            </h1>
            <div className="flex gap-2 shrink-0 items-center">
              {session?.user?.id && (
                <button onClick={toggleFavorite}
                  className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm hover:border-indigo-300 transition"
                >
                  <svg className={"w-4 h-4 " + (favorited ? "text-indigo-600" : "text-slate-400")} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={favorited ? "currentColor" : "none"}>
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                </button>
              )}
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                {product.category}
              </span>
              {product.sold && (
                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
                  {t("sold")}
                </span>
              )}
            </div>
          </div>
          <p className="text-slate-600 leading-relaxed mb-6">
            {product.description}
          </p>

          {product.city && (
            <div className="mb-4 text-slate-600 text-sm">
              <span className="font-medium flex items-center gap-1"><MapPin className="w-3 h-3" />{t("city")}:</span> {product.city}
            </div>
          )}

          {(product.address ||
            (typeof product.latitude === "number" &&
              typeof product.longitude === "number")) && (
            <div className="mb-6 bg-slate-50 border border-slate-100 rounded-2xl p-4">
              <h2 className="font-bold text-slate-800 mb-2">{t("location")}</h2>
              {product.address && (
                <p className="text-slate-600 text-sm mb-3">{product.address}</p>
              )}
              {typeof product.latitude === "number" &&
                typeof product.longitude === "number" && (
                  <RentalMap
                    selected={{ lat: product.latitude, lng: product.longitude }}
                    height="300px"
                    zoom={15}
                  />
                )}
            </div>
          )}

          <div className="border-t pt-4 flex items-center justify-between flex-wrap gap-4">
            <div>
              <p
                className="text-3xl font-bold"
                style={{ color: "var(--color-accent)" }}
              >
                €
                {product.price.toLocaleString("de-DE", {
                  minimumFractionDigits: 0,
                })}
                <span className="text-sm font-normal text-slate-400 ms-2">
                  / {perMonth}
                </span>
              </p>
              <p className="text-slate-500 text-sm mt-1">
                {t("seller")}: {product.seller?.name}
              </p>
            </div>
            {canChat && (
              <button
                onClick={startConversation}
                disabled={actionLoading}
                className="text-white px-6 py-3 rounded-xl font-medium transition text-center disabled:opacity-60"
                style={{ background: "#10b981" }}
              >
                {actionLoading ? t("loading") : t("contactSeller")}
              </button>
            )}
            {!session?.user?.id && !product.sold && !isOwner && (
              <button
                onClick={() =>
                  router.push(
                    "/login?callbackUrl=" +
                      encodeURIComponent("/products/" + id),
                  )
                }
                className="text-white px-6 py-3 rounded-xl font-medium transition text-center"
                style={{ background: "#10b981" }}
              >
                {t("loginBtn")}
              </button>
            )}
            {isOwner && (
              <div className="flex gap-2">
                {!product.sold && (
                  <button
                    onClick={markAsSold}
                    disabled={actionLoading}
                    className="bg-amber-500 text-white px-4 py-2 rounded-xl hover:bg-amber-600 transition disabled:opacity-60"
                  >
                    {t("markSold")}
                  </button>
                )}
                <button
                  onClick={deleteProduct}
                  disabled={actionLoading}
                  className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition disabled:opacity-60"
                >
                  {t("deleteListing")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
