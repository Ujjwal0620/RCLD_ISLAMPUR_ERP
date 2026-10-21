"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2, LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import Link from "next/link";

const initialForm = { name: "", phone: "", email: "", password: "" };

export default function StudentLoginForm() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/api/student/login" : "/api/student/register";
      const body = mode === "login"
        ? { email: form.email.trim(), password: form.password }
        : { ...form, name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim() };
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to complete authentication.");
      window.location.assign("/student/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setError("");
    setShowPassword(false);
  }

  const inputBase = "w-full rounded-2xl border border-white/10 bg-black/20 py-3.5 pl-11 pr-12 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-cyan-300/60 focus:bg-black/30 focus:ring-4 focus:ring-cyan-300/10 disabled:opacity-60";
  return (
    <div className="mt-7">
      <div className="grid grid-cols-2 rounded-2xl border border-white/10 bg-black/20 p-1">
        {["login","register"].map((item) => (
          <button key={item} type="button" onClick={() => switchMode(item)} className={mode === item ? "rounded-xl bg-white px-3 py-2.5 text-sm font-black text-slate-950 shadow-lg" : "rounded-xl px-3 py-2.5 text-sm font-bold text-slate-500 transition hover:text-white"}>
            {item === "login" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-6 space-y-4">
        {mode === "register" && <>
          <Field icon={UserRound} label="Full name"><input required minLength={2} maxLength={100} autoComplete="name" placeholder="Enter your full name" value={form.name} onChange={update("name")} className={inputBase}/></Field>
          <Field icon={Phone} label="Phone number"><input required minLength={8} maxLength={20} autoComplete="tel" inputMode="tel" placeholder="Enter your phone number" value={form.phone} onChange={update("phone")} className={inputBase}/></Field>
        </>}
        <Field icon={Mail} label="Email address"><input required type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={update("email")} className={inputBase}/></Field>
        <div>
          <label className="text-sm font-bold text-slate-300">Password</label>
          <div className="relative mt-2">
            <LockKeyhole size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"/>
            <input required minLength={8} maxLength={100} type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="Minimum 8 characters" value={form.password} onChange={update("password")} className={inputBase}/>
            <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-500 transition hover:bg-white/10 hover:text-white">
              {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
          </div>
        </div>
        {error && <div role="alert" className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-semibold leading-5 text-red-200">{error}</div>}
        <button type="submit" disabled={loading} className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-4 py-3.5 font-black text-slate-950 transition hover:bg-cyan-200 hover:shadow-lg hover:shadow-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? <><Loader2 size={18} className="animate-spin"/> Please wait…</> : mode === "login" ? "Sign in to Student Portal" : "Create Student Account"}
        </button>
      </form>

      <div className="mt-5 flex items-center gap-3 text-xs text-slate-600"><span className="h-px flex-1 bg-white/10"/><span>SECURE ACCESS</span><span className="h-px flex-1 bg-white/10"/></div>
      <Link href="/courses" className="mt-5 block text-center text-sm font-bold text-cyan-300 transition hover:text-cyan-200">Browse courses before enrolling →</Link>
    </div>
  );
}

function Field({ icon: Icon, label, children }) {
  return <div><label className="text-sm font-bold text-slate-300">{label}</label><div className="relative mt-2"><Icon size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"/>{children}</div></div>;
}
