"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../components/LanguageContext";
import { Trash2, TriangleAlert } from "lucide-react";

const ICONS = ["📚","💻","📱","✏️","👕","📦","🎮","🏠","🚲","🎵","📷","🔧","👜","🧸","🍳","⚽","🎨","📺"];

export default function AdminCategoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("📦");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(setCategories);
  }, []);

  if (status === "loading") return <p className="text-center mt-20 text-slate-400">{t("loading")}</p>;
  if (!session) { router.push("/login"); return null; }

  function showSuccess(msg) {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  }

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, icon: newIcon }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    setCategories(prev => [...prev, data]);
    setNewName("");
    setNewIcon("📦");
    showSuccess(t("categoryAdded"));
  }

  async function handleDelete(id, name) {
    if (!confirm(t("confirmDeleteCategory"))) return;
    const res = await fetch("/api/categories/" + id, { method: "DELETE" });
    if (res.ok) {
      setCategories(prev => prev.filter(c => c.id !== id));
      showSuccess(t("categoryDeleted"));
    }
  }

  return (
    <div className="max-w-2xl mx-auto" dir={t("dir")}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t("categoryManagement")}</h1>
          <p className="text-slate-500 text-sm mt-1">{t("addRemoveCategory")}</p>
        </div>
        <button onClick={() => router.push("/")}
          className="text-sm text-slate-500 hover:text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-xl">
          {t("back")}
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 mb-4 text-sm flex items-center gap-1"><TriangleAlert className="w-4 h-4 shrink-0" />{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 mb-4 text-sm">{success}</div>}

      {/* فرم اضافه کردن */}
      <form onSubmit={handleAdd} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-5">
        <h2 className="font-bold text-slate-700 mb-4">{t("newCategory")}</h2>

        {/* انتخاب آیکون */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-700 mb-2">{t("icon")}</label>
          <div className="flex flex-wrap gap-2">
            {ICONS.map(icon => (
              <button key={icon} type="button" onClick={() => setNewIcon(icon)}
                className={"w-10 h-10 rounded-xl text-xl flex items-center justify-center transition border-2 " +
                  (newIcon === icon ? "border-indigo-500 bg-indigo-50" : "border-transparent bg-slate-50 hover:bg-slate-100")}>
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* نام */}
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-indigo-50 border border-indigo-100 shrink-0">
            {newIcon}
          </div>
          <input
            type="text" value={newName} onChange={e => setNewName(e.target.value)}
            required placeholder={t("categoryNamePlaceholder")}
            className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button type="submit" disabled={loading}
            className="px-5 py-2.5 text-white rounded-xl font-semibold transition disabled:opacity-60 shrink-0"
            style={{ background: "var(--color-primary)" }}>
            {loading ? "..." : t("add")}
          </button>
        </div>
      </form>

      {/* لیست دسته‌بندی‌ها */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <h2 className="font-bold text-slate-700 mb-4">{t("currentCategories")} ({categories.length})</h2>
        {categories.length === 0 ? (
          <p className="text-slate-400 text-center py-8">{t("noCategories")}</p>
        ) : (
          <div className="space-y-2">
            {categories.map(cat => (
              <div key={cat.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition group">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="font-medium text-slate-700">{cat.name}</span>
                </div>
                <button onClick={() => handleDelete(cat.id, cat.name)}
                  className="text-red-400 hover:text-red-600 hover:bg-red-50 w-8 h-8 rounded-lg flex items-center justify-center transition opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
