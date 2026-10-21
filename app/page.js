import Link from "next/link";
import { ArrowRight, BookOpen, BrainCircuit, Building2, GraduationCap, ShieldCheck, Users } from "lucide-react";

const modules = [
  ["Admissions & CRM", "Leads, counselling, admissions and conversion pipeline.", Users],
  ["Courses & Batches", "Course master, faculty allocation, capacity and transfers.", BookOpen],
  ["Finance", "Fees, installments, payments, expenses, payroll and reports.", Building2],
  ["Learning", "Offline learning resources and a separate online LMS.", GraduationCap],
  ["HR & Tasks", "Attendance, breaks, leave, tasks and employee performance.", ShieldCheck],
  ["AI Platform", "Course-aware tutor, employee assistant and management insights.", BrainCircuit]
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <div className="grid-bg absolute inset-0 opacity-50" />
      <div className="relative mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <nav className="glass flex items-center justify-between rounded-2xl px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.3em] text-cyan-300">RCLD Islampur</p>
            <h1 className="text-lg font-bold">Digital Platform</h1>
          </div>
          <Link href="/login" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-100">
            Login
          </Link>
        </nav>

        <section className="grid min-h-[620px] items-center gap-12 py-20 lg:grid-cols-[1.2fr_.8fr]">
          <div>
            <div className="glass mb-6 inline-flex rounded-full px-4 py-2 text-sm text-cyan-200">
              ERP • CRM • LMS • HR • Finance • AI
            </div>
            <h2 className="max-w-4xl text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl">
              One connected platform for the complete RCLD Islampur journey.
            </h2>
            <p className="text-muted mt-6 max-w-2xl text-lg leading-8">
              From enquiry and admission to batches, fees, attendance, examinations, certificates, employees and online learning—managed from one secure system.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login" className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 font-bold text-slate-950">
                Open ERP <ArrowRight size={18} />
              </Link>
              <a href="#modules" className="glass rounded-xl px-5 py-3 font-semibold">Explore modules</a>
            </div>
          </div>

          <div className="glass relative rounded-[2rem] p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Platform status</p>
                <p className="text-2xl font-bold">Foundation Build</p>
              </div>
              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-300">v0.1</span>
            </div>
            <div className="space-y-3">
              {["RBAC-ready architecture", "Neon PostgreSQL foundation", "Configurable course & batch master", "AI provider abstraction", "Audit-first design"].map((x) => (
                <div key={x} className="glass rounded-xl p-4 text-sm text-slate-200">{x}</div>
              ))}
            </div>
          </div>
        </section>

        <section id="modules" className="pb-24">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[.25em] text-cyan-300">Core modules</p>
            <h3 className="mt-2 text-3xl font-bold">Built around RCLD's real workflow</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {modules.map(([title, text, Icon]) => (
              <div key={title} className="glass glass-hover rounded-2xl p-6">
                <Icon className="mb-5 text-cyan-300" size={26} />
                <h4 className="text-lg font-bold">{title}</h4>
                <p className="text-muted mt-2 text-sm leading-6">{text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
