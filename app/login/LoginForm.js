"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "../components/LanguageContext";
import { KeyRound, TriangleAlert } from "lucide-react";

export default function LoginForm({ callbackUrl = "/" }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) setError(t("wrongCredentials"));
    else router.push(callbackUrl);
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-100 w-full max-w-md">
        <div className="text-center mb-6">
          <KeyRound className="w-10 h-10 mx-auto mb-2" style={{ color: "var(--color-primary)" }} />
          <h1 className="text-2xl font-bold text-slate-800">{t("loginTitle")}</h1>
          <p className="text-slate-500 text-sm mt-1">{t("loginSubtitle")}</p>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 mb-4 text-sm">
            <TriangleAlert className="w-4 h-4 inline mr-1" />{error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              {t("emailLabel")}
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              placeholder="example@email.com"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              {t("passwordLabel")}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              placeholder="••••••••"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full text-white py-3 rounded-xl font-semibold transition shadow-sm disabled:opacity-60"
            style={{ background: "var(--color-primary)" }}
          >
            {loading ? t("loggingIn") : t("loginBtn")}
          </button>
        </form>
        <p className="text-center text-sm text-slate-400 mt-5">
          {t("noAccount")}{" "}
          <Link href="/register" className="text-indigo-600 hover:underline font-semibold">
            {t("signupLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
