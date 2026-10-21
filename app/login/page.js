"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {ArrowLeft, ArrowRight, Fingerprint, LockKeyhole, ShieldCheck, Sparkles, Zap} from "lucide-react";

export default function LoginPage(){
 const router=useRouter(); const [form,setForm]=useState({email:"",password:""}); const [error,setError]=useState(""); const [loading,setLoading]=useState(false);
 async function submit(e){e.preventDefault();setLoading(true);setError("");try{const response=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});const data=await response.json();if(!response.ok){setError(data.error||"Unable to sign in.");return;}router.push("/dashboard");router.refresh();}catch{setError("Network error. Please try again.")}finally{setLoading(false)}}
 return <main className="min-h-screen overflow-hidden bg-[#050816] text-white">
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,.16),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,.16),transparent_28%),radial-gradient(circle_at_50%_90%,rgba(14,165,233,.10),transparent_30%)]"/>
  <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-6 py-10 lg:grid-cols-[1.05fr_.75fr]">
   <section className="hidden lg:block">
    <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white"><ArrowLeft size={16}/> Public website</Link>
    <div className="mt-16 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/5 px-4 py-2 text-xs font-black uppercase tracking-[.2em] text-cyan-200"><Sparkles size={14}/> Institutional command portal</div>
    <h1 className="mt-7 max-w-3xl text-6xl font-black leading-[.94] tracking-[-.05em]">RCLD <span className="text-cyan-300">ERP</span><br/>secure access.</h1>
    <p className="mt-7 max-w-xl text-lg leading-8 text-slate-400">A role-aware workspace for superadmins, employees, faculty and authorized offline operations.</p>
    <div className="mt-10 grid max-w-2xl grid-cols-2 gap-4">{[["Role-based","Permission-aware modules",ShieldCheck],["Protected","HTTP-only authentication",LockKeyhole],["Operational","Students, courses & finance",Zap],["Controlled","Institutional access only",Fingerprint]].map(([t,d,I])=><div key={t} className="rounded-2xl border border-white/10 bg-white/[.045] p-5 backdrop-blur-xl"><I size={21} className="text-cyan-300"/><p className="mt-3 font-black">{t}</p><p className="mt-1 text-sm text-slate-500">{d}</p></div>)}</div>
   </section>
   <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[.07] p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur-2xl sm:p-9">
    <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-300/10 blur-3xl"/>
    <div className="relative"><div className="flex items-center justify-between"><Link href="/" className="font-black">RCLD <span className="text-cyan-300">Islampur</span></Link><span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-black tracking-[.18em] text-slate-400">ERP CORE</span></div>
    <div className="mt-10"><p className="text-xs font-black uppercase tracking-[.2em] text-cyan-300">Authorized personnel</p><h2 className="mt-3 text-3xl font-black">Sign in to command.</h2><p className="mt-2 text-sm leading-6 text-slate-400">Use your authorized institutional credentials. Your available modules depend on your assigned roles.</p></div>
    <form onSubmit={submit} className="mt-8 space-y-5"><div><label className="text-sm font-bold text-slate-300">Email address</label><input required type="email" autoComplete="username" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 outline-none transition focus:border-cyan-300/60 focus:ring-4 focus:ring-cyan-300/10"/></div><div><label className="text-sm font-bold text-slate-300">Password</label><input required type="password" autoComplete="current-password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 outline-none transition focus:border-cyan-300/60 focus:ring-4 focus:ring-cyan-300/10"/></div>{error&&<p className="rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm font-semibold text-red-200">{error}</p>}<button disabled={loading} className="group flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-3.5 font-black text-slate-950 transition hover:bg-cyan-200 disabled:opacity-60">{loading?"Authenticating…":"Enter ERP"}<ArrowRight size={18} className="transition group-hover:translate-x-1"/></button></form>
    <div className="mt-7 flex items-start gap-3 rounded-xl border border-white/10 bg-white/[.035] p-4 text-xs leading-5 text-slate-500"><ShieldCheck size={17} className="mt-0.5 shrink-0 text-cyan-300"/> ERP access is restricted to authorized RCLD accounts. Online students should use the separate Student Portal.</div>
    <Link href="/student/login" className="mt-6 flex items-center justify-center gap-2 text-sm font-black text-cyan-300">Go to Student Portal <ArrowRight size={15}/></Link></div>
   </section>
  </div>
 </main>;
}