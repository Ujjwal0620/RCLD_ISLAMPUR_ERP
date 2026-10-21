import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, LockKeyhole, Sparkles, ShieldCheck } from "lucide-react";
import StudentLoginForm from "./student-login-form";

export const metadata = {
  title: "Online Student Login | RCLD Islampur",
  description: "Secure online student portal for RCLD Islampur courses, lessons, resources and learning progress.",
};

export default function StudentLogin() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,.22),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(14,165,233,.18),transparent_28%),radial-gradient(circle_at_50%_100%,rgba(99,102,241,.16),transparent_34%)]" />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-5 py-8 sm:px-8 lg:grid-cols-[1fr_520px] lg:py-12">
        <section className="hidden lg:block">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 transition hover:text-white"><ArrowLeft size={16}/> Back to RCLD Islampur</Link>
          <div className="mt-16 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-black uppercase tracking-[.2em] text-cyan-200"><Sparkles size={14}/> RCLD Online Learning</div>
          <h1 className="mt-7 max-w-2xl text-6xl font-black leading-[.93] tracking-[-.055em]">Learn smarter.<br/><span className="text-cyan-300">Move forward.</span></h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-slate-400">One secure student identity for your enrolled courses, lessons, resources and learning progress.</p>
          <div className="mt-10 grid max-w-2xl grid-cols-2 gap-4">
            {[
              ["Secure account","Protected online student session",LockKeyhole],
              ["Course access","Your enrolled courses in one place",BookOpen],
              ["Track progress","Resume lessons and completion status",CheckCircle2],
              ["Always available","Continue learning across devices",ShieldCheck],
            ].map(([title,description,Icon]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/[.06] p-5 shadow-xl backdrop-blur-xl">
                <Icon size={20} className="text-cyan-300"/><p className="mt-3 font-black">{title}</p><p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[.09] p-5 shadow-2xl shadow-cyan-950/40 backdrop-blur-2xl sm:p-8">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl"/>
          <div className="relative">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-lg font-black">RCLD <span className="text-cyan-300">Islampur</span></Link>
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[10px] font-black tracking-[.18em] text-cyan-200">STUDENT PORTAL</span>
            </div>
            <div className="mt-9">
              <p className="text-xs font-black uppercase tracking-[.2em] text-cyan-300">Online learning</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">Welcome back.</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">Sign in to continue learning, or create your online student account in seconds.</p>
            </div>
            <StudentLoginForm />
            <div className="mt-7 border-t border-white/10 pt-6 text-center">
              <p className="text-xs text-slate-500">Institute employee or offline student?</p>
              <Link href="/login" className="mt-2 inline-flex items-center gap-2 text-sm font-black text-cyan-300">Open ERP Login <ArrowRight size={15}/></Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
