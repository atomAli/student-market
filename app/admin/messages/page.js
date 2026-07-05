"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "../../components/LanguageContext";

export default function AdminMessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, lang } = useLanguage();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.id) {
      router.push("/login?callbackUrl=/admin/messages");
      return;
    }
    if (!session.user.isAdmin) {
      router.push("/");
      return;
    }
    fetch("/api/chat/conversations")
      .then((r) => r.json())
      .then((data) => { setConversations(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [status, session, router]);

  if (status === "loading") return <p className="text-center mt-20 text-slate-400">{t("loading")}</p>;
  if (!session || !session.user.isAdmin) return null;

  function previewText(conversation) {
    const lastMessage = conversation.messages?.[0];
    return lastMessage ? lastMessage.content : t("noMessages");
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t("adminMessagesTitle")}</h1>
          <p className="text-sm text-slate-500 mt-1">{t("adminMessagesSubtitle")}</p>
        </div>
        <Link
          href="/chat"
          className="text-sm font-medium px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-indigo-300"
        >
          {t("adminMessagesPanel")}
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-400">{t("loading")}</div>
      ) : conversations.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center text-slate-500">
          {t("noConversationsRegistered")}
        </div>
      ) : (
        <div className="grid gap-3">
          {conversations.map((conversation) => {
            const lastMessage = conversation.messages?.[0];
            return (
              <Link
                key={conversation.id}
                href={`/admin/messages/${conversation.id}`}
                className="bg-white border border-slate-100 rounded-2xl p-4 hover:border-indigo-200 hover:shadow-sm transition flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h2 className={"truncate " + (conversation.unreadCount > 0 ? "font-bold text-slate-900" : "font-semibold text-slate-800")}>
                      {conversation.product.title}
                    </h2>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {conversation.buyer.name}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                      {conversation.product.seller.name}
                    </span>
                    {conversation.unreadCount > 0 && (
                      <span className="shrink-0 bg-red-500 text-white text-[11px] font-bold min-w-[20px] h-[20px] flex items-center justify-center rounded-full px-1.5 leading-none">
                        {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className={"text-sm line-clamp-1 " + (conversation.unreadCount > 0 ? "font-medium text-slate-700" : "text-slate-500")}>
                    {previewText(conversation)}
                  </p>
                </div>
                <div className="text-xs text-slate-400 shrink-0">
                  {lastMessage
                    ? new Date(lastMessage.createdAt).toLocaleString(lang === "fa" ? "fa-IR" : lang === "it" ? "it-IT" : "en-US")
                    : ""}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
