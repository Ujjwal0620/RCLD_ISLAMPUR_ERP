import Link from "next/link";
import {
  ArrowRight,
  GraduationCap,
  Laptop,
  ShieldCheck,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { db } from "@/lib/db";
import PublicNavbar from "@/components/public-navbar";
import PublicFooter from "@/components/public-footer";
import PublicCourseCard from "@/components/public-course-card";
import HomeHeroSlider from "@/components/home-hero-slider";
import { serializeCourse } from "@/lib/course-pricing";

export const dynamic = "force-dynamic";

async function getCourses() {
  try {
    const rows = await db.course.findMany({
      where: { active: true, onlinePublished: true },
      orderBy: [{ displayOrder: "asc" }, { code: "asc" }],
      take: 6,
    });
    return rows.map(serializeCourse);
  } catch {
    return [];
  }
}

export default async function Home() {
  const courses = await getCourses();
  let homeSlides = [];
  try {
    homeSlides = await db.homeSlide.findMany({ where: { active: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }], take: 3 });
  } catch {}
  homeSlides = homeSlides.map((slide) => ({ ...slide, createdAt: undefined, updatedAt: undefined }));

  const learnerFeatures = [
    [Target, "Clear learning paths", "Know exactly what to learn next."],
    [Laptop, "Learn anywhere", "Continue from your protected student workspace."],
    [Zap, "Practical focus", "Build useful skills through guided practice."],
    [ShieldCheck, "Secure access", "Separate online learning and institutional ERP access."],
  ];

  const process = [
    ["01", "Discover", "Compare programs and learning outcomes."],
    ["02", "Enrol", "Create your online student account."],
    ["03", "Learn", "Watch lessons and use structured resources."],
    ["04", "Achieve", "Complete assessments and track your progress."],
  ];

  return (
    <main className="public-site min-h-screen">
      <PublicNavbar />

      <HomeHeroSlider initialSlides={homeSlides} />

      <section className="public-section">
        <div className="mx-auto max-w-7xl px-6">
          <div className="public-section-head">
            <div>
              <span className="public-eyebrow">Popular programs</span>
              <h2>Choose a skill path built for real progress.</h2>
            </div>
            <Link href="/courses">
              View all courses <ArrowRight size={15} />
            </Link>
          </div>

          {courses.length ? (
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => <PublicCourseCard key={course.code} course={course} />)}
            </div>
          ) : (
            <div className="mt-10 rounded-3xl border border-white/10 bg-white/[.025] p-10 text-center">
              <p className="text-sm font-black text-white">Course catalogue is being prepared.</p>
              <p className="mt-2 text-sm text-slate-400">Published programmes will appear here automatically.</p>
            </div>
          )}
        </div>
      </section>

      <section className="public-section border-y border-white/[.06] bg-white/[.018]">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="public-eyebrow">Built around the learner</span>
            <h2 className="mt-4 text-4xl font-black tracking-[-.035em] text-white sm:text-5xl">
              A clearer way to learn computer skills.
            </h2>
            <p className="mt-5 max-w-xl leading-7 text-slate-300">
              Move from course discovery to completion through one connected experience
              instead of scattered videos, notes and disconnected tools.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {learnerFeatures.map(([Icon, title, description]) => (
                <div key={title} className="public-feature">
                  <Icon size={19} />
                  <div>
                    <p>{title}</p>
                    <span>{description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="public-process">
            {process.map(([number, title, description]) => (
              <div key={number} className="public-process-row">
                <span>{number}</span>
                <div>
                  <p>{title}</p>
                  <small>{description}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              [Users, "Student-first experience", "Simple navigation, focused dashboards and clear progress."],
              [GraduationCap, "Outcome-focused programs", "Practical courses designed around useful digital capability."],
              [ShieldCheck, "Separate secure portals", "Online students and institutional ERP users stay in distinct experiences."],
            ].map(([Icon, title, description]) => (
              <article key={title} className="public-card">
                <Icon className="text-cyan-300" size={26} />
                <h3 className="mt-6 text-xl font-black text-white">{title}</h3>
                <p className="mt-3 leading-7 text-slate-400">{description}</p>
              </article>
            ))}
          </div>

          <div className="public-cta mt-16">
            <div>
              <span className="public-eyebrow">Start your next skill</span>
              <h2 className="mt-4 text-4xl font-black tracking-tight text-white">
                Your learning space is ready.
              </h2>
              <p className="mt-3 max-w-2xl text-slate-300">
                Explore RCLD programs and enter a learning experience designed to be clear,
                modern and focused from the first click.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/courses" className="public-btn-primary">
                Browse courses <ArrowRight size={16} />
              </Link>
              <Link href="/student/login" className="public-btn-secondary">
                Student login
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
