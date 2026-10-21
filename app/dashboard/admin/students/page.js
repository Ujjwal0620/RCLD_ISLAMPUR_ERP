import Link from "next/link";
import {redirect} from "next/navigation";
import {Users,Search,Plus,GraduationCap,UserCheck,MonitorPlay} from "lucide-react";
import {getCurrentUser} from "@/lib/auth";
import {hasPermission} from "@/lib/permissions";
import {db} from "@/lib/db";
import StudentForm from "./student-form";

export const dynamic="force-dynamic";

const statusLabel={ACTIVE:"Active",COMPLETED:"Completed",TRANSFERRED:"Transferred",DROPPED_OUT:"Dropped out",SUSPENDED:"Suspended",CANCELLED:"Cancelled"};

export default async function StudentsPage({searchParams}){
 const user=await getCurrentUser(); if(!user)redirect("/login"); if(!hasPermission(user,"students.view"))redirect("/dashboard");
 const params=await searchParams; const q=(params?.q||"").trim(); const type=params?.type||"";
 const where={...(q?{OR:[{name:{contains:q,mode:"insensitive"}},{phone:{contains:q,mode:"insensitive"}},{email:{contains:q,mode:"insensitive"}},{registrationNo:{contains:q,mode:"insensitive"}}]}:{}),...(type&&["OFFLINE","ONLINE"].includes(type)?{studentType:type}:{})};
 const [students,total,active,online]=await Promise.all([
  db.student.findMany({where,orderBy:{createdAt:"desc"},take:100,include:{_count:{select:{enrollments:true,onlineEnrollments:true}}}}),
  db.student.count(),db.student.count({where:{status:"ACTIVE"}}),db.student.count({where:{studentType:"ONLINE"}})
 ]);
 return <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10"><div className="mx-auto max-w-7xl">
  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><Link href="/dashboard" className="text-xs font-bold text-blue-700">← Dashboard</Link><h1 className="mt-2 text-3xl font-black tracking-tight">Student Master</h1><p className="mt-1 text-sm text-slate-500">Manage institutional student records from one responsive workspace.</p></div><Link href="#add-student" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white"><Plus size={17}/> Add student</Link></div>
  <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Stat icon={Users} label="Total students" value={total}/><Stat icon={UserCheck} label="Active" value={active}/><Stat icon={MonitorPlay} label="Online" value={online}/><Stat icon={GraduationCap} label="Filtered" value={students.length}/></div>
  <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
   <section className="min-w-0">
    <form className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-3.5 text-slate-400" size={17}/><input name="q" defaultValue={q} placeholder="Search name, phone, email or registration..." className="w-full rounded-xl border border-slate-200 px-10 py-3 text-sm outline-none focus:border-blue-500"/></div><select name="type" defaultValue={type} className="rounded-xl border border-slate-200 px-3 py-3 text-sm"><option value="">All types</option><option value="OFFLINE">Offline</option><option value="ONLINE">Online</option></select><button className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-black">Filter</button></form>
    <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-4">Student</th><th>Registration</th><th>Type</th><th>Status</th><th>Enrollments</th><th className="px-5">Created</th></tr></thead><tbody className="divide-y divide-slate-100">{students.map(s=><tr key={s.id} className="hover:bg-slate-50"><td className="px-5 py-4"><div className="font-black">{s.name}</div><div className="text-xs text-slate-500">{s.phone||s.email||"No contact"}</div></td><td className="font-mono text-xs">{s.registrationNo||"—"}</td><td><Badge>{s.studentType}</Badge></td><td><Badge tone={s.status==="ACTIVE"?"green":"slate"}>{statusLabel[s.status]||s.status}</Badge></td><td>{s._count.enrollments+s._count.onlineEnrollments}</td><td className="px-5 text-xs text-slate-500">{s.createdAt.toLocaleDateString("en-IN")}</td></tr>)}</tbody></table></div>
      <div className="divide-y divide-slate-100 md:hidden">{students.map(s=><div key={s.id} className="p-4"><div className="flex items-start justify-between gap-3"><div><div className="font-black">{s.name}</div><div className="mt-1 text-xs text-slate-500">{s.registrationNo||"No registration"}</div></div><Badge tone={s.status==="ACTIVE"?"green":"slate"}>{statusLabel[s.status]||s.status}</Badge></div><div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600"><div>Type <b>{s.studentType}</b></div><div>Enrollments <b>{s._count.enrollments+s._count.onlineEnrollments}</b></div><div className="col-span-2">{s.phone||s.email||"No contact details"}</div></div></div>)}</div>
    </div>
   </section>
   <aside id="add-student"><StudentForm/></aside>
  </div>
 </div></main>
}
function Stat({icon:Icon,label,value}){return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</span><Icon size={18} className="text-blue-600"/></div><div className="mt-3 text-3xl font-black">{value}</div></div>}
function Badge({children,tone="blue"}){const cls=tone==="green"?"bg-emerald-50 text-emerald-700":"bg-blue-50 text-blue-700";return <span className={"inline-flex rounded-full px-2.5 py-1 text-[11px] font-black "+cls}>{children}</span>}
