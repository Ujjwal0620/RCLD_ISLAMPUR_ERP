import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { db } from "@/lib/db";
import AdmissionForm from "./admission-form";

export default async function AdmissionsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!hasPermission(user, "crm.view") && !hasPermission(user, "students.view")) redirect("/dashboard");
  const [students, courses, batches, recent] = await Promise.all([
    db.student.findMany({ where: { studentType: "OFFLINE" }, orderBy: { name: "asc" }, take: 500, select: { id: true, name: true, registrationNo: true, phone: true } }),
    db.course.findMany({ where: { active: true }, orderBy: { code: "asc" }, select: { id: true, code: true, name: true, standardFee: true } }),
    db.batch.findMany({ where: { status: { in: ["PLANNED", "ACTIVE"] } }, orderBy: { startsAt: "asc" }, include: { course: { select: { id: true, code: true, name: true } }, _count: { select: { enrollments: true } } } }),
    db.student.findMany({ where: { studentType: "OFFLINE" }, orderBy: { createdAt: "desc" }, take: 8, select: { id: true, name: true, phone: true, registrationNo: true, status: true, createdAt: true } }),
  ]);
  const availableBatches = batches.filter(b => b._count.enrollments < b.capacity);
  return <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10"><div className="mx-auto max-w-[1500px]">
    <Link href="/dashboard" className="text-xs font-black text-blue-700">Back to Command Center</Link>
    <section className="mt-4 rounded-[30px] bg-slate-950 p-7 text-white sm:p-9"><span className="text-[10px] font-black uppercase tracking-[.2em] text-blue-200">Admissions Operations</span><h1 className="mt-4 text-3xl font-black tracking-[-.04em] sm:text-5xl">Admission Desk</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Register a learner, allocate a course batch and generate the fee ledger with installments in one transaction.</p></section>
    <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
      <AdmissionForm students={students} courses={courses.map(c=>({...c,standardFee:c.standardFee?Number(c.standardFee):0}))} batches={availableBatches.map(b=>({id:b.id,code:b.code,name:b.name,courseId:b.courseId,capacity:b.capacity,used:b._count.enrollments}))}/>
      <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 p-5"><h2 className="font-black">Recent admissions</h2><p className="mt-1 text-xs text-slate-500">Latest offline learners.</p></div><div className="divide-y divide-slate-100">{recent.map(s=><div key={s.id} className="p-4"><div className="font-black text-sm">{s.name}</div><div className="mt-1 text-xs text-slate-500">{s.registrationNo || "Registration pending"} · {s.phone || "No phone"}</div></div>)}{!recent.length&&<div className="p-8 text-center text-sm text-slate-500">No admissions yet.</div>}</div></aside>
    </div>
  </div></main>;
}