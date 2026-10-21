import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, LockKeyhole, Sparkles } from "lucide-react";
import StudentLoginForm from "./student-login-form";

export default function StudentLogin(){
 return <main className="site-shell relative min-h-screen overflow-hidden">
  <div className="absolute inset-0 grid-pattern opacity-60"/>
  <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-6 py-12 lg:grid-cols-[1fr_520px]">
   <section className="hidden lg:block">
    <Link href="/" className="inline-flex items-center gap-2 text-sm font-black text-slate-500"><ArrowLeft size={16}/> Back to RCLD Islampur</Link>
    <div className="mt-16 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/60 px-4 py-2 text-xs font-black uppercase tracking-[.18em] text-blue-700 backdrop-blur-xl"><Sparkles size={15}/> RCLD Online Learning</div>
    <h1 className="mt-7 max-w-2xl text-6xl font-black leading-[.95] tracking-[-.05em] text-slate-950">Your learning journey, <span className="text-gradient">one login away.</span></h1>
    <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">Access your enrolled courses, lessons, resources and learning progress from one focused student workspace.</p>
    <div className="mt-10 grid max-w-xl gap-3 sm:grid-cols-2">{[["Secure account","Separate online student authentication",LockKeyhole],["Course access","Your enrolled learning stays organized",BookOpen],["Track progress","Complete lessons and build momentum",CheckCircle2],["Learn anywhere","Continue from desktop or mobile",ArrowRight]].map(([t,d,I])=><div key={t} className="glass rounded-2xl p-5"><I size={20} className="text-blue-600"/><p className="mt-3 font-black">{t}</p><p className="mt-1 text-sm text-slate-500">{d}</p></div>)}</div>
   </section>
   <section className="glass-strong rounded-[2rem] p-6 shadow-2xl shadow-blue-900/10 sm:p-9">
    <div className="mb-7 flex items-center justify-between"><Link href="/" className="font-black text-slate-900">RCLD <span className="text-blue-600">Islampur</span></Link><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">STUDENT PORTAL</span></div>
    <h2 className="text-3xl font-black tracking-tight">Welcome back.</h2>
    <p className="mt-2 text-sm leading-6 text-slate-500">Sign in to continue learning or create your free online student account.</p>
    <StudentLoginForm/>
    <div className="mt-7 border-t border-slate-200/70 pt-6 text-center"><p className="text-xs text-slate-500">Institute employee or offline student?</p><Link href="/login" className="mt-2 inline-flex items-center gap-2 text-sm font-black text-blue-600">Open ERP Login <ArrowRight size={15}/></Link></div>
   </section>
  </div>
 </main>;
}