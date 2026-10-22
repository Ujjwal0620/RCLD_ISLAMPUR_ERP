import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, Globe2, Layers3, IndianRupee } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { db } from "@/lib/db";
import CourseForm from "./course-form";

export default async function CoursesPage(){
 const user=await getCurrentUser();
 if(!user) redirect("/login");
 if(!hasPermission(user,"courses.manage")) redirect("/dashboard");
 const courses=await db.course.findMany({orderBy:{code:"asc"},include:{_count:{select:{batches:true,modules:true,onlineEnrollments:true}}}});
 const active=courses.filter(c=>c.active).length;
 const published=courses.filter(c=>c.onlinePublished).length;
 return <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
  <div className="mx-auto max-w-[1500px]">
   <Link href="/dashboard/admin" className="inline-flex text-xs font-black text-blue-700">← Control Center</Link>
   <section className="mt-4 overflow-hidden rounded-[30px] border border-slate-800 bg-slate-950 p-7 text-white shadow-[0_24px_80px_rgba(15,23,42,.16)] sm:p-9">
    <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end"><div>
     <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.06] px-3 py-1.5 text-[10px] font-black uppercase tracking-[.18em] text-blue-200"><BookOpen size={12}/> Academic Catalogue</span>
     <h1 className="mt-5 text-3xl font-black tracking-[-.04em] sm:text-5xl">Course Control</h1>
     <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Configure offline and online programmes, pricing and publishing from one sharp workspace.</p>
    </div><div className="grid grid-cols-3 gap-2"><Metric label="Courses" value={courses.length}/><Metric label="Active" value={active}/><Metric label="Online" value={published}/></div></div>
   </section>
   <div className="mt-5 grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
    <CourseForm/>
    <section><div className="mb-3 flex items-center justify-between"><div><h2 className="text-base font-black">Configured catalogue</h2><p className="mt-1 text-xs text-slate-500">{active} active programmes · {published} published online</p></div><Link href="/dashboard/admin/courses/content" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700">Open LMS Studio</Link></div>
     <div className="grid gap-3 sm:grid-cols-2">
      {courses.map(c=><article key={c.id} className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,.045)] transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_18px_50px_rgba(37,99,235,.09)]">
       <div className="flex items-start justify-between gap-3"><div><span className="font-mono text-[10px] font-black tracking-[.15em] text-blue-600">{c.code}</span><h3 className="mt-1 text-base font-black">{c.name}</h3></div><span className={"rounded-full px-2.5 py-1 text-[10px] font-black "+(c.active?"bg-emerald-50 text-emerald-700":"bg-slate-100 text-slate-500")}>{c.active?"Active":"Inactive"}</span></div>
       <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{c.shortDescription||"Programme description not configured yet."}</p>
       <div className="mt-4 grid grid-cols-2 gap-2"><Info icon={IndianRupee} label="Fee" value={c.standardFee==null?"Not set":"₹"+c.standardFee.toString()}/><Info icon={Globe2} label="Online" value={c.onlineFee==null?"Not set":"₹"+c.onlineFee.toString()}/><Info icon={Layers3} label="Batches" value={c._count.batches}/><Info icon={BookOpen} label="Modules" value={c._count.modules}/></div>
       <div className="mt-3 flex items-center justify-between text-[10px] font-bold text-slate-400"><span>{c.duration||"Duration not set"}</span><span>{c.onlinePublished?"Online published":"Draft online"}</span></div>
      </article>)}
     </div>
    </section>
   </div>
  </div>
 </main>;
}
function Metric({label,value}){return <div className="rounded-xl border border-white/10 bg-white/[.06] px-3 py-3 text-center"><div className="text-lg font-black">{value}</div><div className="mt-0.5 text-[9px] font-black uppercase tracking-[.14em] text-slate-400">{label}</div></div>}
function Info({icon:Icon,label,value}){return <div className="rounded-xl bg-slate-50 p-2.5"><div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400"><Icon size={12}/>{label}</div><div className="mt-1 text-xs font-black text-slate-800">{value}</div></div>}
