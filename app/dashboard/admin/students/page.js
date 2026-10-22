import Link from "next/link";
import { redirect } from "next/navigation";
import { GraduationCap, MonitorPlay, Users, ArrowRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { db } from "@/lib/db";

export default async function StudentOperationsPage(){
 const user=await getCurrentUser();
 if(!user) redirect("/login");
 if(!hasPermission(user,"students.view")) redirect("/dashboard");
 const [offline,online]=await Promise.all([
  db.student.count({where:{studentType:"OFFLINE"}}),
  db.student.count({where:{studentType:"ONLINE"}}),
 ]);
 return <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10"><div className="mx-auto max-w-6xl">
  <Link href="/dashboard" className="text-xs font-black text-blue-700">← Command Center</Link>
  <section className="mt-4 rounded-[30px] bg-slate-950 p-8 text-white sm:p-10"><span className="text-[10px] font-black uppercase tracking-[.22em] text-blue-300">People Directory</span><h1 className="mt-3 text-4xl font-black tracking-[-.04em]">Student Operations</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Student populations are intentionally separated. Choose the operational workspace you need instead of mixing offline centre students with online LMS learners.</p></section>
  <div className="mt-6 grid gap-5 md:grid-cols-2">
   <Workspace href="/dashboard/admin/students/offline" icon={GraduationCap} title="Offline Students" description="Admissions, batches, academic status and fee-ledger operations for centre-based students." count={offline} label="centre students"/>
   <Workspace href="/dashboard/admin/students/online" icon={MonitorPlay} title="Online Students" description="Online course enrollment, payment state and LMS learner operations." count={online} label="LMS learners"/>
  </div>
  <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm"><div className="flex items-center gap-3"><Users size={18} className="text-blue-600"/><span><b className="text-slate-950">Design rule:</b> employees are managed separately under Employees, and online/offline students never share the same operational list.</span></div></div>
 </div></main>;
}
function Workspace({href,icon:Icon,title,description,count,label}){return <Link href={href} className="group rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"><div className="flex items-start justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-700"><Icon size={22}/></span><ArrowRight size={19} className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600"/></div><h2 className="mt-7 text-2xl font-black">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{description}</p><div className="mt-7 flex items-end justify-between"><div><div className="text-3xl font-black">{count}</div><div className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</div></div><span className="rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white">Open workspace</span></div></Link>}
