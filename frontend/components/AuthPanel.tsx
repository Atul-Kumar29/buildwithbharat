"use client";

import { FormEvent, useEffect, useState } from "react";
import { LogIn, LogOut, UserPlus } from "lucide-react";

import { authenticate, type AuthUser, type UserRole } from "@/lib/api";

const USER_STORAGE_KEY = "auth_user";

export default function AuthPanel() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("buyer");
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const storedUser = window.localStorage.getItem(USER_STORAGE_KEY);
    queueMicrotask(() => {
      if (storedUser) setUser(JSON.parse(storedUser));
    });
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    try {
      const result = await authenticate(mode, { email, password, ...(mode === "register" ? { role } : {}) });
      window.localStorage.setItem("access_token", result.access_token);
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(result.user));
      setUser(result.user);
      setEmail("");
      setPassword("");
      setIsOpen(false);
      window.dispatchEvent(new Event("auth-changed"));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed");
    }
  }

  function logout() {
    window.localStorage.removeItem("access_token");
    window.localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
    window.dispatchEvent(new Event("auth-changed"));
  }

  if (user) {
    return (
      <div style={styles.account}>
        <span><strong>{user.role === "seller" ? "Seller" : "Buyer"}</strong> · {user.email}</span>
        <button type="button" onClick={logout} style={styles.secondaryButton}>
          <LogOut size={16} aria-hidden="true" /> Log out
        </button>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <button type="button" onClick={() => setIsOpen((open) => !open)} style={styles.primaryButton}>
        {mode === "login" ? <LogIn size={17} aria-hidden="true" /> : <UserPlus size={17} aria-hidden="true" />}
        {mode === "login" ? "Sign in" : "Create account"}
      </button>
      {isOpen && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.tabs}>
            <button type="button" onClick={() => setMode("login")} style={mode === "login" ? styles.activeTab : styles.tab}>Sign in</button>
            <button type="button" onClick={() => setMode("register")} style={mode === "register" ? styles.activeTab : styles.tab}>Register</button>
          </div>
          <label style={styles.label}>Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} style={styles.input} /></label>
          <label style={styles.label}>Password<input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} style={styles.input} /></label>
          {mode === "register" && (
            <label style={styles.label}>Account type<select value={role} onChange={(event) => setRole(event.target.value as UserRole)} style={styles.input}><option value="buyer">Buyer</option><option value="seller">Seller</option></select></label>
          )}
          <button type="submit" style={styles.primaryButton}>{mode === "login" ? "Sign in" : "Register"}</button>
          {message && <span role="alert" style={styles.error}>{message}</span>}
        </form>
      )}
    </div>
  );
}

const styles = {
  wrapper: { position: "relative" as const },
  account: { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "12px", flexWrap: "wrap" as const, color: "#52606d" },
  form: { position: "absolute" as const, right: 0, top: "48px", zIndex: 5, display: "grid", gap: "12px", width: "min(320px, calc(100vw - 32px))", padding: "18px", border: "1px solid #d8dee9", borderRadius: "8px", background: "white", boxShadow: "0 8px 24px rgba(15, 23, 42, 0.15)" },
  tabs: { display: "flex", gap: "8px", borderBottom: "1px solid #e5e7eb" },
  tab: { padding: "8px 2px", border: 0, borderBottom: "2px solid transparent", background: "transparent", color: "#52606d", cursor: "pointer", fontFamily: "inherit", fontSize: "inherit", fontWeight: 400 },
  activeTab: { padding: "8px 2px", border: 0, borderBottom: "2px solid #d97706", background: "transparent", color: "#162b4d", cursor: "pointer", fontFamily: "inherit", fontSize: "inherit", fontWeight: 700 },
  label: { display: "grid", gap: "6px", fontWeight: 600 },
  input: { padding: "9px 10px", border: "1px solid #b8c2cc", borderRadius: "5px", background: "white", font: "inherit", fontWeight: 400 },
  primaryButton: { display: "inline-flex", justifyContent: "center", alignItems: "center", gap: "7px", padding: "10px 14px", border: 0, borderRadius: "5px", background: "#162b4d", color: "white", cursor: "pointer", font: "inherit", fontWeight: 700 },
  secondaryButton: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "7px 10px", border: "1px solid #b8c2cc", borderRadius: "5px", background: "white", color: "#162b4d", cursor: "pointer", font: "inherit", fontWeight: 700 },
  error: { color: "#b42318", fontSize: "14px" },
};