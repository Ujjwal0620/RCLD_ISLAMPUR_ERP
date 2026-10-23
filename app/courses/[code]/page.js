import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Layers3,
  Percent,
} from "lucide-react";
import { db } from "@/lib/db";
import PublicNavbar from "@/components/public-navbar";
import PublicFooter from "@/components/public-footer";
import EnrollButton from "./enroll-button";
import {
  calculateCoursePricing,
  discountBadgeLabel,
  formatCourseMoneyCompact,
  normalizeSyllabus,
  serializeCourse,
} from "@/lib/course-pricing";

export const dynamic = "force-dynamic";

async function getCourse(code) {
  try {
    const record = await db.course.findFirst({
      where: { code: code.toUpperCase(), active: true, onlinePublished: true },
      include: {
        modules: {
          where: { published: true },
          orderBy: { sortOrder: "asc" },
          include: { lessons: { where: { published: true }, orderBy: { sortOrder: "asc" } } },
        },
      },
    });
    return record ? serializeCourse(record) : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { code } = await params;
  const course = await getCourse(code);
  if (!course) return { title: "Course not found | RCLD Islampur" };
  return {
    title: course.name + " | RCLD Islampur",
    description: course.shortDescription || course.description || "Explore this programme at RCLD Islampur.",
  };
}

export default async function CourseDetail({ params }) {
  const { code } = await params;
  const course = await getCourse(code);
  if (!course) notFound();

  const pricing = course.pricing || calculateCoursePricing(course);
  const modules = course.modules || [];
  const syllabus = normalizeSyllabus(course.syllabus);
  const features = Array.isArray(course.features) ? course.features.filter(Boolean) : [];
  const mode = course.deliveryMode === "ONLINE" ? "Online" : course.deliveryMode === "HYBRID" ? "Hybrid" : "Classroom";
  const badge = discountBadgeLabel(pricing);

  return (
    <main className="public-site min-h-screen">
      <PublicNavbar />

      <section className="public-page-hero">
        <div className="public-grid" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-24">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-black text-white">{course.code}</span>
            {badge && <span className="rounded-full bg-rose-400/15 px-3 py-1 text-xs font-black text-rose-200">{badge}</span>}
            {course.featured && <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-black text-amber-200">Featured</span>}
          </div>
          <h1 className="mt-6 max-w-5xl text-4xl font-black leading-tight tracking-tight text-white sm:text-6xl">{course.name}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">{course.description || course.shortDescription || "Programme details will be published soon."}</p>

          <div className="mt-8 flex flex-wrap gap-2 text-[11px] font-black uppercase tracking-[.1em] text-slate-300">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[.035] px-3 py-2"><Clock3 size={13} /> {course.duration || "Flexible duration"}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[.035] px-3 py-2"><GraduationCap size={13} /> {mode}</span>
            {course.eligibility && <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[.035] px-3 py-2"><BadgeCheck size={13} /> {course.eligibility}</span>}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[1.45fr_.65fr]">
        <div>
          {features.length > 0 && (
            <>
              <h2 className="text-3xl font-black text-white">What you get</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {features.map((feature) => (
                  <div key={feature} className="public-panel rounded-2xl p-5">
                    <CheckCircle2 className="text-cyan-300" size={21} />
                    <p className="mt-3 font-black text-white">{feature}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          <h2 className="mt-14 text-3xl font-black text-white">Course curriculum</h2>
          <div className="mt-6 space-y-3">
            {modules.length > 0 ? (
              modules.map((module, index) => (
                <div key={module.id} className="public-panel rounded-2xl p-5">
                  <div className="flex items-center gap-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cyan-300/10 text-sm font-black text-cyan-300">{index + 1}</span>
                    <div>
                      <p className="font-black text-white">{module.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{module.lessons?.length || 0} lessons</p>
                    </div>
                  </div>
                  {module.lessons?.length > 0 && (
                    <ul className="mt-4 space-y-2 border-t border-white/[.06] pt-4">
                      {module.lessons.map((lesson) => (
                        <li key={lesson.id} className="flex items-start gap-2 text-sm text-slate-400">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/60" />
                          {lesson.title}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            ) : syllabus.length > 0 ? (
              syllabus.map((section, index) => (
                <div key={section.title + index} className="public-panel rounded-2xl p-5">
                  <div className="flex items-center gap-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cyan-300/10 text-sm font-black text-cyan-300">{index + 1}</span>
                    <p className="font-black text-white">{section.title}</p>
                  </div>
                  {section.topics.length > 0 && (
                    <ul className="mt-4 grid gap-2 border-t border-white/[.06] pt-4 sm:grid-cols-2">
                      {section.topics.map((topic) => (
                        <li key={topic} className="flex items-start gap-2 text-sm text-slate-400">
                          <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-cyan-300/70" />
                          {topic}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            ) : (
              <div className="public-panel rounded-2xl p-6 text-sm leading-7 text-slate-400">
                Detailed curriculum will be published soon. Contact the campus for the current module outline.
              </div>
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="public-panel overflow-hidden rounded-3xl">
            <div className="border-b border-white/[.07] p-6">
              <p className="text-[10px] font-black uppercase tracking-[.18em] text-slate-500">Course fee</p>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-4xl font-black tracking-tight text-white">{formatCourseMoneyCompact(pricing.finalFee)}</span>
                {pricing.hasDiscount && <span className="text-sm font-bold text-slate-500 line-through">{formatCourseMoneyCompact(pricing.baseFee)}</span>}
              </div>
              {pricing.hasDiscount && (
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-rose-400/10 px-2.5 py-1 text-[10px] font-black text-rose-200">
                  <Percent size={11} /> Save {formatCourseMoneyCompact(pricing.discountAmount)} · {badge}
                </p>
              )}
              <div className="mt-5 space-y-2 border-t border-white/[.07] pt-4 text-xs">
                <Row label="Base fee" value={formatCourseMoneyCompact(pricing.baseFee)} />
                {pricing.hasDiscount && <Row label="Discount" value={"− " + formatCourseMoneyCompact(pricing.discountAmount)} accent />}
                {course.admissionFee != null && <Row label="Admission fee" value={formatCourseMoneyCompact(course.admissionFee)} />}
                {course.onlineFee != null && <Row label="Online fee" value={formatCourseMoneyCompact(course.onlineFee)} />}
              </div>
            </div>
            <div className="p-6">
              <EnrollButton courseCode={course.code} onlineFee={course.onlineFee} />
              <Link href="/courses" className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-black text-slate-300 transition hover:border-cyan-300/30 hover:text-white">
                Compare courses <ArrowRight size={15} />
              </Link>
              <p className="mt-4 text-center text-[10px] leading-5 text-slate-500">
                Online enrolment uses the online fee. Classroom admissions are completed through the RCLD campus office.
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="public-panel rounded-2xl p-4">
              <Layers3 size={16} className="text-cyan-300" />
              <p className="mt-2 text-[9px] font-black uppercase tracking-[.12em] text-slate-500">Curriculum</p>
              <p className="mt-1 text-xs font-black text-white">{modules.length || syllabus.length || "Flexible"} units</p>
            </div>
            <div className="public-panel rounded-2xl p-4">
              <BookOpen size={16} className="text-cyan-300" />
              <p className="mt-2 text-[9px] font-black uppercase tracking-[.12em] text-slate-500">Mode</p>
              <p className="mt-1 text-xs font-black text-white">{mode}</p>
            </div>
          </div>
        </aside>
      </section>

      <section className="public-section border-t border-white/[.06]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="public-cta">
            <div>
              <span className="public-eyebrow">Ready to begin?</span>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">Take the next step with {course.code}.</h2>
              <p className="mt-3 max-w-2xl text-slate-300">Join the programme online or visit the campus for admission guidance and batch details.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/courses" className="public-btn-primary">Browse courses <ArrowRight size={16} /></Link>
              <Link href="/contact" className="public-btn-secondary">Contact campus</Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}

function Row({ label, value, accent = false }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className={accent ? "font-black text-rose-200" : "font-black text-slate-200"}>{value}</span>
    </div>
  );
}
