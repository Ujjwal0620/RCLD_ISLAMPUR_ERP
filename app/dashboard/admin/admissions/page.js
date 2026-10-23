import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, ClipboardList, UserPlus } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission, isSuperAdmin } from "@/lib/permissions";
import { db } from "@/lib/db";
import AdmissionForm from "./admission-form";
import { REGISTRATION_STATUS_LABELS } from "@/lib/registration";
import { calculateCoursePricing } from "@/lib/course-pricing";

export default async function AdmissionsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!hasPermission(user, "crm.view") && !hasPermission(user, "students.view")) redirect("/dashboard");
  const [students, courses, batches, recent, registrationCount, pendingRegistrations, recentRegistrations] = await Promise.all([
    db.student.findMany({ where: { studentType: "OFFLINE" }, orderBy: { name: "asc" }, take: 500, select: { id: true, name: true, registrationNo: true, phone: true } }),
    db.course.findMany({
      where: { active: true },
      orderBy: [{ displayOrder: "asc" }, { code: "asc" }],
      select: {
        id: true,
        code: true,
        name: true,
        standardFee: true,
        admissionFee: true,
        discountType: true,
        discountValue: true,
        discountActive: true,
      },
    }),
    db.batch.findMany({ where: { status: { in: ["PLANNED", "ACTIVE"] } }, orderBy: { startsAt: "asc" }, include: { course: { select: { id: true, code: true, name: true } }, _count: { select: { enrollments: true } } } }),
    db.student.findMany({ where: { studentType: "OFFLINE" }, orderBy: { createdAt: "desc" }, take: 8, select: { id: true, name: true, phone: true, registrationNo: true, status: true, createdAt: true } }),
    db.registration.count(),
    db.registration.count({ where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } } }),
    db.registration.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, applicantName: true, formNo: true, status: true, courseCode: true } }),
  ]);
  const availableBatches = batches.filter(b => b._count.enrollments < b.capacity);
  return <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10"><div className="mx-auto max-w-[1500px]">
    <Link href="/dashboard" className="text-xs font-black text-blue-700">Back to Command Center</Link>
    <section className="mt-4 rounded-[30px] bg-slate-950 p-7 text-white sm:p-9"><span className="text-[10px] font-black uppercase tracking-[.2em] text-blue-200">Admissions Operations</span><h1 className="mt-4 text-3xl font-black tracking-[-.04em] sm:text-5xl">Admission Desk</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Register a learner, allocate a course batch and generate the fee ledger with installments in one transaction.</p></section>
    <div className="mt-5 grid gap-4 lg:grid-cols-2">
      <Link href="/dashboard/admin/admissions/register" className="group flex items-start gap-4 rounded-2xl border border-slate-800 bg-slate-950 p-5 text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10 text-cyan-300"><UserPlus size={20}/></span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2 text-sm font-black">Open RCLD registration form <ArrowRight size={16} className="transition group-hover:translate-x-1"/></span>
          <span className="mt-1 block text-xs leading-5 text-slate-300">Capture the official paper form, educational history, payment details and declaration for a new offline applicant.</span>
        </span>
      </Link>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700"><ClipboardList size={20}/></span>
            <div><p className="text-sm font-black">Registration queue</p><p className="mt-1 text-xs leading-5 text-slate-500">{registrationCount} saved form{registrationCount===1?"":"s"} · {pendingRegistrations} awaiting review</p></div>
          </div>
          <Link href="/dashboard/admin/admissions/registrations" className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-black text-slate-700 hover:bg-slate-50">View all</Link>
        </div>
        <div className="mt-3 divide-y divide-slate-100">
          {recentRegistrations.map((item) => (
            <Link key={item.id} href={"/dashboard/admin/admissions/registrations/"+item.id} className="flex items-center justify-between gap-3 py-2 text-xs hover:text-blue-700">
              <span className="min-w-0 truncate"><b className="font-black">{item.applicantName}</b><span className="text-slate-400"> · {item.courseCode || item.formNo}</span></span>
              <span className="shrink-0 font-bold text-slate-500">{REGISTRATION_STATUS_LABELS[item.status] || item.status}</span>
            </Link>
          ))}
          {!recentRegistrations.length && <p className="py-3 text-xs text-slate-400">No registration forms saved yet.</p>}
        </div>
      </div>
    </div>
    <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
      <AdmissionForm
        students={students}
        courses={courses.map((course) => {
          const pricing = calculateCoursePricing(course);
          return {
            id: course.id,
            code: course.code,
            name: course.name,
            standardFee: pricing.baseFee,
            admissionFee: course.admissionFee == null ? null : Number(course.admissionFee),
            pricing,
          };
        })}
        canDiscount={isSuperAdmin(user)}
        batches={availableBatches.map(b=>({id:b.id,code:b.code,name:b.name,courseId:b.courseId,capacity:b.capacity,used:b._count.enrollments}))}
      />
      <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 p-5"><h2 className="font-black">Recent admissions</h2><p className="mt-1 text-xs text-slate-500">Latest offline learners.</p></div><div className="divide-y divide-slate-100">{recent.map(s=><div key={s.id} className="p-4"><div className="font-black text-sm">{s.name}</div><div className="mt-1 text-xs text-slate-500">{s.registrationNo || "Registration pending"} · {s.phone || "No phone"}</div></div>)}{!recent.length&&<div className="p-8 text-center text-sm text-slate-500">No admissions yet.</div>}</div></aside>
    </div>
  </div></main>;
}