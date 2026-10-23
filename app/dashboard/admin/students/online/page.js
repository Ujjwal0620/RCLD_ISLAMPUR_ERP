import Link from "next/link";
import { redirect } from "next/navigation";
import { MonitorPlay, Users, BookOpen, CreditCard } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { db } from "@/lib/db";
import DeleteAction from "@/components/delete-action";

export default async function OnlineStudentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!hasPermission(user, "students.view")) redirect("/dashboard");

  const students = await db.student.findMany({
    where: { studentType: "ONLINE" },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      onlineEnrollments: { include: { course: true } },
    },
  });
  const activeEnrollments = students.reduce((n,s)=>n+s.onlineEnrollments.filter(e=>e.status==="ACTIVE").length,0);
  const paid = students.reduce((n,s)=>n+s.onlineEnrollments.reduce((a,e)=>a+Number(e.paidAmount||0),0),0);
  const canManage = hasPermission(user, "students.manage");

  return <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10"><div className="mx-auto max-w-[1500px]">
    <Link href="/dashboard" className="text-xs font-black text-blue-700">← Command Center</Link>
    <section className="mt-4 rounded-[30px] bg-gradient-to-br from-indigo-950 via-slate-950 to-blue-950 p-7 text-white sm:p-9">
      <span className="text-[10px] font-black uppercase tracking-[.22em] text-cyan-300">Digital Learning</span><h1 className="mt-3 text-3xl font-black tracking-[-.04em] sm:text-5xl">Online Students</h1><p className="mt-2 max-w-2xl text-sm text-slate-300">A dedicated workspace for LMS learners, online enrollments, payment state and course access.</p>
    </section>
    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Metric icon={Users} label="Online students" value={students.length}/><Metric icon={BookOpen} label="Active enrollments" value={activeEnrollments}/><Metric icon={CreditCard} label="Recorded paid" value={money(paid)}/><Metric icon={MonitorPlay} label="LMS mode" value="ONLINE ONLY"/></div>
    <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-4">Student</th><th>Courses</th><th>Enrollment</th><th>Payment</th><th>Created</th><th className="pr-5 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{students.map(s=><tr key={s.id} className="hover:bg-slate-50"><td className="px-5 py-4"><b>{s.name}</b><div className="text-xs text-slate-400">{s.email||s.phone||"No contact"}</div></td><td>{s.onlineEnrollments.map(e=><span key={e.id} className="mr-1 inline-flex rounded-full bg-blue-50 px-2 py-1 text-[10px] font-black text-blue-700">{e.course.code}</span>)}</td><td>{s.onlineEnrollments.map(e=><div key={e.id} className="text-xs font-bold">{e.course.name} · {e.status}</div>)}</td><td>{s.onlineEnrollments.map(e=><div key={e.id} className="text-xs">{e.paymentStatus} · {money(Number(e.paidAmount||0))}</div>)}</td><td className="text-xs text-slate-500">{s.createdAt.toLocaleDateString("en-IN")}</td><td className="pr-5 text-right">{canManage && <DeleteAction compact endpoint={"/api/admin/students/"+s.id} label={"Delete "+s.name} confirmMessage={"Delete "+s.name+"? Linked enrollment and payment records will block deletion."}/>}</td></tr>)}</tbody></table></div>
      <div className="divide-y divide-slate-100 md:hidden">{students.map(s=><div key={s.id} className="p-4"><b>{s.name}</b><p className="mt-1 text-xs text-slate-500">{s.email||s.phone||"No contact"}</p>{s.onlineEnrollments.map(e=><div key={e.id} className="mt-3 rounded-xl bg-slate-50 p-3 text-xs"><b>{e.course.code} · {e.course.name}</b><div className="mt-1">{e.status} · {e.paymentStatus} · {money(Number(e.paidAmount||0))}</div></div>)}{canManage && <div className="mt-3"><DeleteAction endpoint={"/api/admin/students/"+s.id} label="Delete student" confirmMessage={"Delete "+s.name+"? Linked enrollment and payment records will block deletion."}/></div>}</div>)}</div>
    </section>
  </div></main>;
}
function Metric({icon:Icon,label,value}){return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-500">{label}<Icon size={17} className="text-blue-600"/></div><div className="mt-3 text-2xl font-black">{value}</div></div>}
function money(v){return "INR "+v.toLocaleString("en-IN",{maximumFractionDigits:2})}
