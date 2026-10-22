import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Code2,
  GraduationCap,
  Laptop,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { db } from "@/lib/db";
import PublicNavbar from "@/components/public-navbar";
import PublicFooter from "@/components/public-footer";

export const dynamic = "force-dynamic";

const fallback = [
  ["CCA", "Certificate in Computer Applications", "Build confident everyday computer and digital skills."],
  ["DCA", "Diploma in Computer Applications", "Practical office productivity, applications and professional computer skills."],
  ["ADCA", "Advanced Diploma in Computer Applications", "Advanced office, design and digital skills for career growth."],
  ["CCC", "Course on Computer Concepts", "A foundation for computer, internet and digital literacy."],
  ["CAO", "Computer Accounting & Office", "Computerized office workflows and accounting fundamentals."],
  ["DWPD", "Diploma in Web & Programming Development", "Web design, programming and development fundamentals."],
];

async function getCourses() {
  try {
    const rows = await db.course.findMany({
      where: { active: true, onlinePublished: true },
      orderBy: { code: "asc" },
      take: 6,
    });

    return rows.length
      ? rows
      : fallback.map(([code, name, shortDescription]) => ({
          code,
          name,
          shortDescription,
        }));
  } catch {
    return fallback.map(([code, name, shortDescription]) => ({
      code,
      name,
      shortDescription,
    }));
  }
}

export default async function Home() {
  const courses = await getCourses();

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

      <section className="public-hero">
        <div className="public-grid" />
        <div className="public-orb public-orb-a" />
        <div className="public-orb public-orb-b" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 pb-24 pt-16 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:pb-32 lg:pt-24">
          <div>
            <span className="public-pill">
              <Sparkles size={14} />
              Modern computer education · Islampur
            </span>

            <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[.98] tracking-[-.055em] text-white sm:text-6xl lg:text-[5rem]">
              Build digital skills.
              <br />
              <span className="public-gradient-text">Create your next move.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              Learn practical computer skills through structured courses, focused lessons,
              resources, assessments and progress tracking in one modern learning platform.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/courses" className="public-btn-primary">
                Explore programs <ArrowRight size={17} />
              </Link>
              <Link href="/student/login" className="public-btn-secondary">
                <PlayCircle size={17} />
                Enter student portal
              </Link>
            </div>

            <div className="mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["10+", "Programs"],
                ["Online", "Learning"],
                ["Practical", "Curriculum"],
                ["Secure", "Portal"],
              ].map(([value, label]) => (
                <div key={label} className="public-mini-stat">
                  <p className="text-xl font-black text-white">{value}</p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[.16em] text-slate-400">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="public-showcase">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div className="flex gap-2">
                  <i />
                  <i />
                  <i />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[.2em] text-slate-400">
                  RCLD Learning OS
                </span>
              </div>

              <div className="p-5 sm:p-7">
                <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-cyan-300/10 via-blue-500/[.08] to-indigo-500/10 p-6">
                  <div className="flex items-center justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-300 text-slate-950">
                      <Code2 size={23} />
                    </span>
                    <span className="rounded-full border border-emerald-300/20 bg-emerald-300/[.08] px-3 py-1 text-[10px] font-black text-emerald-200">
                      LEARNING ACTIVE
                    </span>
                  </div>

                  <p className="mt-10 text-xs font-black uppercase tracking-[.2em] text-cyan-200">
                    Your learning journey
                  </p>
                  <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                    Learn. Practice.
                    <br />
                    Progress.
                  </h2>

                  <div className="mt-7 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-cyan-300 to-blue-500" />
                  </div>

                  <div className="mt-3 flex justify-between text-[10px] font-bold text-slate-400">
                    <span>Structured path</span>
                    <span>Progress tracked</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    [BookOpen, "Courses"],
                    [PlayCircle, "Lessons"],
                    [CheckCircle2, "Results"],
                  ].map(([Icon, label]) => (
                    <div key={label} className="rounded-2xl border border-white/10 bg-white/[.04] p-4">
                      <Icon size={18} className="text-cyan-300" />
                      <p className="mt-2 text-xs font-black text-slate-200">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Link
                href={"/courses/" + course.code.toLowerCase()}
                key={course.code}
                className="public-card group"
              >
                <div className="flex items-center justify-between">
                  <span className="public-code">{course.code}</span>
                  <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-slate-400 transition group-hover:border-cyan-300/30 group-hover:text-cyan-300">
                    <ArrowRight size={16} />
                  </span>
                </div>

                <h3 className="mt-8 text-xl font-black text-white">{course.name}</h3>
                <p className="mt-3 min-h-12 text-sm leading-6 text-slate-400">
                  {course.shortDescription || "Practical, structured computer skill development."}
                </p>

                <div className="mt-7 flex items-center gap-4 border-t border-white/10 pt-4 text-[10px] font-black uppercase tracking-[.12em] text-slate-400">
                  <span>Structured</span>
                  <span>•</span>
                  <span>Practical</span>
                  <span>•</span>
                  <span>Online</span>
                </div>
              </Link>
            ))}
          </div>
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
