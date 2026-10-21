import Link from "next/link";
import { BookOpen, ChevronDown, GraduationCap, HelpCircle, Info, LayoutDashboard, Menu, Sparkles } from "lucide-react";

export default function PublicNavbar() {
  return <header className="sticky top-0 z-50 px-4 pt-3 sm:px-6">
    <div className="glass-nav mx-auto flex max-w-7xl items-center justify-between rounded-2xl px-4 py-3 sm:px-5">
      <Link href="/" className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg"><GraduationCap size={21}/></span>
        <span><span className="block text-lg font-black tracking-tight text-slate-950">RCLD <span className="text-blue-600">Islampur</span></span><span className="hidden text-[10px] font-bold uppercase tracking-[.18em] text-slate-500 sm:block">Learn • Practice • Grow</span></span>
      </Link>
      <nav className="hidden items-center gap-1 lg:flex">
        <Link className="rounded-xl px-4 py-2 text-sm font-bold text-slate-700 hover:bg-white/70" href="/">Home</Link>
        <div className="group relative">
          <button className="flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 hover:bg-white/70">Explore <ChevronDown size={15}/></button>
          <div className="invisible absolute left-0 top-full w-72 pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100">
            <div className="glass-strong rounded-2xl p-3">
              <Link href="/courses" className="flex gap-3 rounded-xl p-3 hover:bg-blue-50"><BookOpen className="text-blue-600"/><span><b className="block">All Courses</b><small className="text-slate-500">Explore programs & curriculum</small></span></Link>
              <Link href="/learning" className="flex gap-3 rounded-xl p-3 hover:bg-blue-50"><Sparkles className="text-blue-600"/><span><b className="block">How Learning Works</b><small className="text-slate-500">Understand the online experience</small></span></Link>
            </div>
          </div>
        </div>
        <Link className="rounded-xl px-4 py-2 text-sm font-bold text-slate-700 hover:bg-white/70" href="/about">About</Link>
        <Link className="rounded-xl px-4 py-2 text-sm font-bold text-slate-700 hover:bg-white/70" href="/faq">FAQ</Link>
        <Link className="rounded-xl px-4 py-2 text-sm font-bold text-slate-700 hover:bg-white/70" href="/contact">Contact</Link>
      </nav>
      <div className="flex items-center gap-2">
        <Link href="/student/login" className="hidden rounded-xl border border-slate-200 bg-white/70 px-4 py-2 text-sm font-bold text-slate-700 sm:block">Student Login</Link>
        <Link href="/courses" className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-slate-900/10">Explore Courses</Link>
        <details className="relative lg:hidden">
          <summary className="grid h-10 w-10 cursor-pointer list-none place-items-center rounded-xl border border-slate-200 bg-white/70"><Menu size={20}/></summary>
          <div className="glass-strong absolute right-0 top-12 w-64 rounded-2xl p-3">
            {[["Home","/"],["Courses","/courses"],["How Learning Works","/learning"],["About","/about"],["FAQ","/faq"],["Contact","/contact"],["Student Login","/student/login"]].map(([label,href])=><Link key={href} href={href} className="block rounded-xl px-4 py-3 text-sm font-bold hover:bg-blue-50">{label}</Link>)}
          </div>
        </details>
      </div>
    </div>
  </header>;
}
