import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission, isSuperAdmin } from "@/lib/permissions";
import { db } from "@/lib/db";
import { calculateCoursePricing, serializeCourse } from "@/lib/course-pricing";
import CourseManager from "./course-manager";

export default async function CoursesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!hasPermission(user, "courses.manage")) redirect("/dashboard");

  const records = await db.course.findMany({
    orderBy: [{ displayOrder: "asc" }, { code: "asc" }],
    include: { _count: { select: { batches: true, modules: true, onlineEnrollments: true } } },
  });
  const courses = records.map(serializeCourse);
  const active = courses.filter((course) => course.active).length;
  const published = courses.filter((course) => course.onlinePublished).length;
  const discounted = courses.filter((course) => calculateCoursePricing(course).hasDiscount).length;

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1500px]">
        <Link href="/dashboard/admin" className="inline-flex text-xs font-black text-blue-700">← Control Center</Link>
        <section className="mt-4 overflow-hidden rounded-[30px] border border-slate-800 bg-slate-950 p-7 text-white shadow-[0_24px_80px_rgba(15,23,42,.16)] sm:p-9">
          <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.06] px-3 py-1.5 text-[10px] font-black uppercase tracking-[.18em] text-blue-200"><BookOpen size={12} /> Academic Catalogue</span>
              <h1 className="mt-5 text-3xl font-black tracking-[-.04em] sm:text-5xl">Course Control</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Configure official programmes, fees, discounts, syllabus and online publishing from one workspace.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Metric label="Courses" value={courses.length} />
              <Metric label="Active" value={active} />
              <Metric label="Online" value={published} />
              <Metric label="Discounted" value={discounted} />
            </div>
          </div>
        </section>
        <div className="mt-5"><Link href="/dashboard/admin/courses/structure" className="inline-flex rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-black text-blue-700">Manage Subjects & Chapters →</Link></div>
        <CourseManager courses={courses} superAdmin={isSuperAdmin(user)} />
      </div>
    </main>
  );
}

function Metric({ label, value }) {
  return <div className="rounded-xl border border-white/10 bg-white/[.06] px-3 py-3 text-center"><div className="text-lg font-black">{value}</div><div className="mt-0.5 text-[9px] font-black uppercase tracking-[.14em] text-slate-400">{label}</div></div>;
}
