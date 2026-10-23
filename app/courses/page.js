import { BookOpen, GraduationCap, Percent } from "lucide-react";
import { db } from "@/lib/db";
import PublicNavbar from "@/components/public-navbar";
import PublicFooter from "@/components/public-footer";
import PublicCourseCard from "@/components/public-course-card";
import { calculateCoursePricing, serializeCourse } from "@/lib/course-pricing";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Courses | RCLD Islampur",
  description: "Explore RCLD computer courses, diploma programmes and practical skill paths.",
};

async function getCourses() {
  try {
    const rows = await db.course.findMany({
      where: { active: true, onlinePublished: true },
      orderBy: [{ displayOrder: "asc" }, { code: "asc" }],
    });
    return rows.map(serializeCourse);
  } catch {
    return [];
  }
}

export default async function Courses() {
  const courses = await getCourses();
  const discounted = courses.filter((course) => calculateCoursePricing(course).hasDiscount).length;

  return (
    <main className="public-site min-h-screen">
      <PublicNavbar />
      <section className="public-page-hero">
        <div className="public-grid" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <span className="public-pill"><BookOpen size={14} /> Program catalogue</span>
          <h1 className="mt-7 max-w-5xl text-5xl font-black leading-[.98] tracking-[-.05em] text-white sm:text-7xl">
            Choose your <span className="public-gradient-text">skill path.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-400">
            Explore practical programmes across computer applications, office productivity, programming, accounting, hardware and digital skills.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-white/[.035] px-3 py-2 text-[11px] font-black text-slate-300">
              <GraduationCap className="mr-1.5 inline" size={13} /> {courses.length} programmes
            </span>
            <span className="rounded-full border border-white/10 bg-white/[.035] px-3 py-2 text-[11px] font-black text-slate-300">
              <BookOpen className="mr-1.5 inline" size={13} /> Classroom & online
            </span>
            {discounted > 0 && (
              <span className="rounded-full border border-rose-300/20 bg-rose-400/10 px-3 py-2 text-[11px] font-black text-rose-200">
                <Percent className="mr-1.5 inline" size={13} /> {discounted} current offers
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="mx-auto max-w-7xl px-6">
          {courses.length ? (
            <>
              <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                  <span className="public-eyebrow">All programmes</span>
                  <h2 className="mt-3 text-3xl font-black tracking-tight text-white">Built for practical progress.</h2>
                </div>
                <p className="hidden max-w-sm text-right text-xs leading-6 text-slate-500 sm:block">
                  Fees shown are current course fees. Online enrolment pricing is displayed on each programme page.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => <PublicCourseCard key={course.code} course={course} />)}
              </div>
            </>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/[.025] p-12 text-center">
              <BookOpen className="mx-auto text-slate-600" size={34} />
              <h2 className="mt-4 text-xl font-black text-white">Catalogue coming soon</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                Published programmes will appear here automatically once they are configured by the academic team.
              </p>
            </div>
          )}
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
