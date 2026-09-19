"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { authenticate, getStoredUser, type UserRole } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("buyer");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const user = getStoredUser();
    if (user) router.push("/");
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);
    try {
      const result = await authenticate(mode, { email, password, ...(mode === "register" ? { role } : {}) });
      window.localStorage.setItem("access_token", result.access_token);
      window.localStorage.setItem("auth_user", JSON.stringify(result.user));
      window.dispatchEvent(new Event("auth-changed"));
      router.push(result.user.role === "seller" ? "/seller" : "/");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-200 text-neutral-900">
      <Header />
      <main className="mx-auto max-w-md px-4 py-12">
        <div className="rounded-xl border border-neutral-300 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-neutral-900 mb-6">
            {mode === "login" ? "Sign in" : "Create account"}
          </h1>

          <div className="flex gap-3 mb-6 border-b border-neutral-200">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`pb-3 text-sm font-semibold ${mode === "login" ? "border-b-2 border-teal-500 text-teal-700" : "text-neutral-500 hover:text-neutral-700"}`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`pb-3 text-sm font-semibold ${mode === "register" ? "border-b-2 border-teal-500 text-teal-700" : "text-neutral-500 hover:text-neutral-700"}`}
            >
              Create account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4">
            <label className="grid gap-1.5 text-sm font-medium text-neutral-700">
              Email
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-neutral-700">
              Password
              <input
                required
                minLength={8}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </label>

            {mode === "register" && (
              <label className="grid gap-1.5 text-sm font-medium text-neutral-700">
                Account type
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                  <option value="buyer">Buyer</option>
                  <option value="seller">Seller</option>
                </select>
              </label>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-teal-400 py-3 text-sm font-bold text-slate-900 hover:bg-teal-300 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
            </button>

            {message && <p role="alert" className="text-sm text-red-600">{message}</p>}
          </form>

          <div className="mt-6 border-t border-neutral-200 pt-4 text-center text-xs text-neutral-500">
            By continuing, you agree to BuildWithBharat&apos;s Terms of Use and Privacy Notice.
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
