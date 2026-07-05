"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "../../../components/LanguageContext";

export default function AdminConversationPage() {
  const { conversationId } = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, lang } = useLanguage();
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");

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
    fetchConversation();
  }, [conversationId, status, session, router]);

  async function fetchConversation() {
    try {
      const res = await fetch(`/api/chat/conversations/${conversationId}`);
      if (!res.ok) { setLoading(false); setConversation(null); return; }
      const data = await res.json();
      setConversation(data);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      await fetch(`/api/chat/conversations/${conversationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      });
      setNewMessage("");
      await fetchConversation();
    } catch {}
    setSending(false);
  }

  async function handleDeleteConversation() {
    if (!confirm(t("confirmDelete"))) return;
    try {
      await fetch(`/api/chat/conversations/${conversationId}`, { method: "DELETE" });
      router.push("/admin/messages");
    } catch {}
  }

  async function handleDeleteMessage(messageId) {
    if (!confirm(t("confirmDelete"))) return;
    try {
      await fetch(`/api/chat/conversations/${conversationId}/messages/${messageId}`, { method: "DELETE" });
      await fetchConversation();
    } catch {}
  }

  if (status === "loading" || loading) return <p className="text-center mt-20 text-slate-400">{t("loading")}</p>;
  if (!session || !session.user.isAdmin) return null;
  if (!conversation) {
    router.push("/admin/messages");
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <Link href="/admin/messages" className="text-sm text-indigo-600 hover:underline">
            {t("backToAdminMessages")}
          </Link>
          <h1 className="text-2xl font-bold text-slate-800 mt-2">{conversation.product.title}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {t("buyer")}: {conversation.buyer.name} - {t("seller")}: {conversation.product.seller.name}
          </p>
        </div>
        <button
          onClick={handleDeleteConversation}
          className="px-4 py-2 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition"
        >
          {t("deleteConversation")}
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3 bg-slate-50">
          {conversation.messages.length === 0 ? (
            <div className="text-center text-slate-500 py-16">
              {t("noMessagesYet")}
            </div>
          ) : (
            conversation.messages.map((message) => {
              const mine = message.senderId === session.user.id;
              return (
                <div
                  key={message.id}
                  className={"flex " + (mine ? "justify-end" : "justify-start")}
                >
                  <div
                    className={
                      "max-w-[78%] rounded-2xl px-4 py-3 shadow-sm " +
                      (mine
                        ? "bg-indigo-600 text-white rounded-br-md"
                        : "bg-white text-slate-700 border border-slate-100 rounded-bl-md")
                    }
                  >
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <div className={"text-xs " + (mine ? "text-indigo-100" : "text-slate-400")}>
                        {message.sender.name}
                      </div>
                      <button
                        onClick={() => handleDeleteMessage(message.id)}
                        className={"text-[11px] underline " + (mine ? "text-indigo-100" : "text-rose-600")}
                      >
                        {t("removePhoto")}
                      </button>
                    </div>
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    <div className={"text-[11px] mt-2 " + (mine ? "text-indigo-100/80" : "text-slate-400")}>
                      {new Date(message.createdAt).toLocaleString(lang === "fa" ? "fa-IR" : lang === "it" ? "it-IT" : "en-US")}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <form onSubmit={handleSend} className="border-t border-slate-100 p-4 bg-white">
          <label className="block text-sm font-medium text-slate-700 mb-2">{t("sendAsAdmin")}</label>
          <textarea
            name="content"
            rows="4"
            required
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t("adminPlaceholder")}
            className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <div className="mt-3 flex items-center justify-end">
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition disabled:opacity-60"
            >
              {sending ? t("loading") : t("send")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
