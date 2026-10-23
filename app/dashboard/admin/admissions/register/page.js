import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ClipboardList, PlusCircle, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { db } from "@/lib/db";
import RegistrationForm from "./registration-form";

export const metadata = {
  title: "RCLD Registration Form",
};

export default async function RegistrationFormPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!hasPermission(user, "students.manage")) redirect("/dashboard/admin/admissions");

  const courses = await db.course.findMany({
    where: { active: true },
    orderBy: [{ displayOrder: "asc" }, { code: "asc" }],
    select: {
      id: true,
      code: true,
      name: true,
      duration: true,
      eligibility: true,
      standardFee: true,
    },
  });

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1500px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/dashboard/admin/admissions" className="inline-flex items-center gap-1.5 text-xs font-black text-blue-700 hover:text-blue-800">
            <ArrowLeft size={14} /> Admission desk
          </Link>
          <Link href="/dashboard/admin/admissions/registrations" className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 shadow-sm hover:bg-slate-50">
            <ClipboardList size={14} /> Registration queue
          </Link>
        </div>

        <section className="mt-4 overflow-hidden rounded-[30px] border border-slate-800 bg-slate-950 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,.16)] sm:p-9">
          <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.06] px-3 py-1.5 text-[10px] font-black uppercase tracking-[.18em] text-blue-200">
                <PlusCircle size={12} /> Offline student registration
              </span>
              <h1 className="mt-5 text-3xl font-black tracking-[-.04em] sm:text-5xl">RCLD Registration Form</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                Capture the official applicant details, education history, course selection, payment information and declaration. Administrative fields are protected and controlled by authorized staff.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[.05] p-4 text-xs leading-5 text-slate-300">
              <div className="flex items-center gap-2 font-black text-white"><ShieldCheck size={16} className="text-cyan-300" /> Secure office workflow</div>
              <p className="mt-2 max-w-xs">Drafts can be saved at any time. Submission requires the declaration and a selected course.</p>
            </div>
          </div>
        </section>

        <div className="mt-5">
          <RegistrationForm
            courses={courses.map((course) => ({
              ...course,
              standardFee: course.standardFee == null ? null : Number(course.standardFee),
            }))}
          />
        </div>
      </div>
    </main>
  );
}
