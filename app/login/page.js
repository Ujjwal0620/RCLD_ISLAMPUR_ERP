"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Fingerprint, Loader2, LockKeyhole, Mail, ShieldCheck, Sparkles, Zap } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.email.trim(), password: form.password }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { setError(data.error || "Invalid credentials. Please try again."); return; }
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputBase = "w-full rounded-2xl border border-white/10 bg-black/20 py-3.5 pl-11 pr-12 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-cyan-300/60 focus:bg-black/30 focus:ring-4 focus:ring-cyan-300/10 disabled:opacity-60";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030712] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(34,211,238,.18),transparent_30%),radial-gradient(circle_at_88%_12%,rgba(59,130,246,.18),transparent_28%),radial-gradient(circle_at_50%_100%,rgba(99,102,241,.12),transparent_35%)]"/>
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.045)_1px,transparent_1px)] [background-size:44px_44px]"/>
      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-5 py-8 sm:px-8 lg:grid-cols-[1fr_500px] lg:py-12">
        <section className="hidden lg:block">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 transition hover:text-white"><ArrowLeft size={16}/> Public website</Link>
          <div className="mt-16 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/5 px-4 py-2 text-xs font-black uppercase tracking-[.2em] text-cyan-200"><Sparkles size={14}/> Institutional command portal</div>
          <h1 className="mt-7 max-w-3xl text-6xl font-black leading-[.92] tracking-[-.055em]">RCLD <span className="text-cyan-300">ERP</span><br/><span className="text-white">secure access.</span></h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-slate-400">A secure, role-aware workspace for superadmins, employees, faculty and authorized offline operations.</p>
          <div className="mt-10 grid max-w-2xl grid-cols-2 gap-4">
            {[
              ["Role-based","Permission-aware modules",ShieldCheck],
              ["Protected","HTTP-only session security",LockKeyhole],
              ["Operational","Students, courses and finance",Zap],
              ["Controlled","Institutional access only",Fingerprint],
            ].map(([title,description,Icon]) => <div key={title} className="rounded-2xl border border-white/10 bg-white/[.045] p-5 backdrop-blur-xl"><Icon size={21} className="text-cyan-300"/><p className="mt-3 font-black">{title}</p><p className="mt-1 text-sm text-slate-500">{description}</p></div>)}
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[.075] p-5 shadow-2xl shadow-cyan-950/40 backdrop-blur-2xl sm:p-9">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl"/>
          <div className="relative">
            <div className="flex items-center justify-between"><Link href="/" className="text-lg font-black">RCLD <span className="text-cyan-300">Islampur</span></Link><span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-black tracking-[.18em] text-slate-400">ERP CORE</span></div>
            <div className="mt-9"><p className="text-xs font-black uppercase tracking-[.2em] text-cyan-300">Authorized personnel</p><h2 className="mt-3 text-3xl font-black">Sign in to command.</h2><p className="mt-2 text-sm leading-6 text-slate-400">Use your authorized institutional credentials. Available modules depend on your assigned roles.</p></div>
            <form onSubmit={submit} className="mt-8 space-y-5">
              <div><label className="text-sm font-bold text-slate-300">Email address</label><div className="relative mt-2"><Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"/><input required type="email" autoComplete="username" placeholder="admin@rcld.in" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} className={inputBase}/></div></div>
              <div><label className="text-sm font-bold text-slate-300">Password</label><div className="relative mt-2"><LockKeyhole size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"/><input required minLength={8} type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} className={inputBase}/><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={()=>setShowPassword((v)=>!v)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-500 transition hover:bg-white/10 hover:text-white">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div></div>
              {error && <div role="alert" className="rounded-2xl border border-red-400/20 bg-red-400/10 p-3.5 text-sm font-semibold leading-5 text-red-200">{error}</div>}
              <button type="submit" disabled={loading} className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-4 py-3.5 font-black text-slate-950 transition hover:bg-cyan-200 hover:shadow-lg hover:shadow-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-60">{loading ? <><Loader2 size={18} className="animate-spin"/> Authenticating…</> : <>Enter ERP <ArrowRight size={18} className="transition group-hover:translate-x-1"/></>}</button>
            </form>
            <div className="mt-7 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[.035] p-4 text-xs leading-5 text-slate-500"><ShieldCheck size={17} className="mt-0.5 shrink-0 text-cyan-300"/> ERP access is restricted to authorized RCLD accounts. Online students should use the separate Student Portal.</div>
            <Link href="/student/login" className="mt-6 flex items-center justify-center gap-2 text-sm font-black text-cyan-300 transition hover:text-cyan-200">Go to Student Portal <ArrowRight size={15}/></Link>
          </div>
        </section>
      </div>
    </main>
  );
}
