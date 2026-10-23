import Link from "next/link";
import { redirect } from "next/navigation";
import { Users, UserPlus, WalletCards, Layers3 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { db } from "@/lib/db";
import DeleteAction from "@/components/delete-action";
import StudentStatusControl from "./student-status-control";

export default async function OfflineStudentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!hasPermission(user, "students.view")) redirect("/dashboard");

  const students = await db.student.findMany({
    where: { studentType: "OFFLINE" },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      name: true,
      registrationNo: true,
      phone: true,
      email: true,
      status: true,
      createdAt: true,
      enrollments: {
        orderBy: { joinedAt: "desc" },
        take: 1,
        select: {
          batch: {
            select: {
              code: true,
              course: { select: { code: true, name: true } },
            },
          },
        },
      },
      feeLedgers: {
        select: { finalAmount: true, paidAmount: true, balanceAmount: true, status: true },
      },
    },
  });

  const billed = students.reduce((n, s) => n + s.feeLedgers.reduce((a, l) => a + Number(l.finalAmount), 0), 0);
  const collected = students.reduce((n, s) => n + s.feeLedgers.reduce((a, l) => a + Number(l.paidAmount), 0), 0);
  const active = students.filter((s) => s.status === "ACTIVE").length;
  const canManage = hasPermission(user, "students.manage");

  return <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10"><div className="mx-auto max-w-[1500px]">
    <Link href="/dashboard" className="text-xs font-black text-blue-700">← Command Center</Link>
    <section className="mt-4 rounded-[30px] bg-slate-950 p-7 text-white sm:p-9">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div><span className="text-[10px] font-black uppercase tracking-[.22em] text-blue-300">Institutional Students</span><h1 className="mt-3 text-3xl font-black tracking-[-.04em] sm:text-5xl">Offline Students</h1><p className="mt-2 max-w-2xl text-sm text-slate-300">Admissions, batches and fee-ledger operations for students attending the physical centre.</p></div>
        <Link href="/dashboard/admin/admissions" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-950"><UserPlus size={17}/> New admission</Link>
      </div>
    </section>
    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Metric icon={Users} label="Students" value={students.length}/><Metric icon={Users} label="Active" value={active}/><Metric icon={WalletCards} label="Billed" value={money(billed)}/><Metric icon={WalletCards} label="Collected" value={money(collected)}/></div>
    <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[1080px] text-left text-sm"><thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-4">Student</th><th>Course</th><th>Batch</th><th>Status</th><th>Fees</th><th>Created</th><th className="pr-5 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{students.map(s=>{const enrollment=s.enrollments[0];const courseCode=enrollment?.batch?.course?.code||"—";const batchCode=enrollment?.batch?.code||"—";return <tr key={s.id} className="hover:bg-slate-50"><td className="px-5 py-4"><b>{s.name}</b><div className="text-xs text-slate-400">{s.registrationNo||"No registration"} · {s.phone||s.email||"No contact"}</div></td><td>{courseCode}</td><td>{batchCode}</td><td><StudentStatusControl studentId={s.id} value={s.status} canManage={canManage}/></td><td><div className="font-bold">{money(s.feeLedgers.reduce((a,l)=>a+Number(l.finalAmount),0))}</div><div className="text-xs text-emerald-600">Paid {money(s.feeLedgers.reduce((a,l)=>a+Number(l.paidAmount),0))}</div></td><td className="text-xs text-slate-500">{s.createdAt.toLocaleDateString("en-IN")}</td><td className="pr-5 text-right">{canManage && <DeleteAction compact endpoint={"/api/admin/students/"+s.id} label={"Delete "+s.name} confirmMessage={"Delete "+s.name+"? Linked academic and financial records will block deletion."}/>}</td></tr>})}</tbody></table></div>
      <div className="divide-y divide-slate-100 md:hidden">{students.map(s=>{const enrollment=s.enrollments[0];const courseCode=enrollment?.batch?.course?.code||"—";const batchCode=enrollment?.batch?.code||"—";return <div key={s.id} className="p-4"><div className="flex justify-between gap-3"><div><b>{s.name}</b><p className="mt-1 text-xs text-slate-500">{s.registrationNo||"No registration"}</p></div><Status value={s.status}/></div><div className="mt-2"><StudentStatusControl studentId={s.id} value={s.status} canManage={canManage}/></div><div className="mt-3 grid grid-cols-2 gap-2 text-xs"><span>Course <b>{courseCode}</b></span><span>Batch <b>{batchCode}</b></span><span>Paid <b className="text-emerald-700">{money(s.feeLedgers.reduce((a,l)=>a+Number(l.paidAmount),0))}</b></span><span>Due <b className="text-rose-600">{money(s.feeLedgers.reduce((a,l)=>a+Number(l.balanceAmount),0))}</b></span></div>{canManage && <div className="mt-3"><DeleteAction endpoint={"/api/admin/students/"+s.id} label="Delete student" confirmMessage={"Delete "+s.name+"? Linked academic and financial records will block deletion."}/></div>}</div>})}</div>
    </section>
  </div></main>;
}
function Metric({icon:Icon,label,value}){return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-500">{label}<Icon size={17} className="text-blue-600"/></div><div className="mt-3 text-2xl font-black">{value}</div></div>}
function Status({value}){return <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black">{String(value).replaceAll("_"," ")}</span>}
function money(v){return "INR "+v.toLocaleString("en-IN",{maximumFractionDigits:2})}
