import Link from "next/link";
import {
  ArrowRight, BookOpen, CheckCircle2, Clock3, GraduationCap, PlayCircle,
  ShieldCheck, Sparkles, Users, Zap, Laptop, Target, Award, MessageCircle,
  Layers3, FileText, Headphones
} from "lucide-react";
import { db } from "@/lib/db";
import PublicNavbar from "@/components/public-navbar";
import PublicFooter from "@/components/public-footer";

export const dynamic = "force-dynamic";

const fallback = [
  ["CCA","Certificate in Computer Applications","Build confident everyday computer and digital skills."],
  ["DCA","Diploma in Computer Applications","Practical office productivity, applications and professional computer skills."],
  ["ADCA","Advanced Diploma in Computer Applications","Advanced office, design and digital skills for career growth."],
  ["CCC","Course on Computer Concepts","A foundation for computer, internet and digital literacy."],
  ["CAO","Computer Accounting & Office","Computerized office workflows and accounting fundamentals."],
  ["DWPD","Diploma in Web & Programming Development","Web design, programming and development fundamentals."]
];

const images = {
  hero: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=85",
  learning: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=85",
  coding: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=85",
  classroom: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=85"
};

async function getCourses() {
  try {
    const rows = await db.course.findMany({
      where: { active: true, onlinePublished: true },
      orderBy: { code: "asc" },
      take: 6
    });
    return rows.length ? rows : fallback.map(([code, name, shortDescription]) => ({ code, name, shortDescription }));
  } catch {
    return fallback.map(([code, name, shortDescription]) => ({ code, name, shortDescription }));
  }
}

export default async function HomePage() {
  const courses = await getCourses();

  return (
    <main className="site-shell min-h-screen">
      <PublicNavbar />

      <section className="hero-glow grid-pattern">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-16 lg:grid-cols-[1.02fr_.98fr] lg:pb-28 lg:pt-24">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/65 px-4 py-2 text-sm font-black text-blue-700 shadow-sm backdrop-blur">
              <Sparkles size={16} /> Learn online. Build practical skills.
            </div>
            <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[.98] tracking-[-.045em] text-slate-950 sm:text-6xl lg:text-[5.35rem]">
              Learn skills that <span className="text-gradient">move you forward.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">
              Explore computer and digital courses from RCLD Islampur with structured lessons,
              practical learning, resources and a focused online student experience.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/courses" className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 font-black text-white shadow-xl shadow-slate-900/15">
                Explore Courses <ArrowRight size={18} />
              </Link>
              <Link href="/student/login" className="rounded-xl border border-white/90 bg-white/70 px-6 py-3.5 font-black text-slate-800 backdrop-blur">
                Start Learning
              </Link>
            </div>
            <div className="mt-9 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
              {[["10+","Programs"],["24/7","Learn at your pace"],["Online","Student portal"],["Practical","Skill focus"]].map(([value,label]) => (
                <div key={label} className="glass rounded-2xl p-4">
                  <p className="text-xl font-black text-slate-950">{value}</p>
                  <p className="mt-1 text-xs font-bold text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10">
            <div className="glass-strong rounded-[2rem] p-3 sm:p-4">
              <div className="relative min-h-[500px] overflow-hidden rounded-[1.6rem]">
                <img src={images.hero} alt="Students learning together" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
                <div className="relative flex items-center justify-between p-5">
                  <span className="rounded-full bg-white/85 px-3 py-1.5 text-xs font-black text-blue-700 backdrop-blur">RCLD ONLINE</span>
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/85 text-blue-600 shadow-sm"><PlayCircle size={25}/></span>
                </div>
                <div className="absolute bottom-24 left-6 right-6 text-white sm:left-8 sm:right-8">
                  <p className="text-sm font-black uppercase tracking-[.2em] text-blue-200">Your learning space</p>
                  <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Courses. Practice. Progress.</h2>
                  <p className="mt-4 max-w-lg leading-7 text-white/80">A simple learning journey that helps you discover a course, learn consistently and track your progress.</p>
                </div>
                <div className="absolute bottom-5 left-5 right-5 grid grid-cols-3 gap-2 sm:left-8 sm:right-8">
                  {[["Courses",BookOpen],["Lessons",PlayCircle],["Progress",CheckCircle2]].map(([label,Icon]) => (
                    <div key={label} className="rounded-2xl border border-white/25 bg-white/15 p-3 text-white backdrop-blur-xl">
                      <Icon size={18}/><p className="mt-1 text-xs font-black">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-8 max-w-7xl px-6">
        <div className="glass-strong grid gap-4 rounded-3xl p-4 sm:grid-cols-4 sm:p-5">
          {[["Structured learning","Clear modules and lessons",Layers3],["Practical resources","Study materials and practice",FileText],["Flexible learning","Learn at your own pace",Clock3],["Student support","A focused student portal",Headphones]].map(([title,desc,Icon]) => (
            <div key={title} className="rounded-2xl bg-white/55 p-5">
              <Icon size={20} className="text-blue-600"/>
              <p className="mt-3 font-black">{title}</p>
              <p className="mt-1 text-sm text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="courses" className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="font-black uppercase tracking-[.2em] text-blue-600">Explore programs</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Find the course that fits your goals.</h2>
            <p className="mt-3 max-w-2xl text-slate-500">Choose from computer applications, office skills, programming, accounting, hardware and more.</p>
          </div>
          <Link href="/courses" className="font-black text-blue-600">View all courses →</Link>
        </div>
        <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c, index) => (
            <article key={c.code} className="glass surface-hover overflow-hidden rounded-3xl">
              <div className="relative h-48 overflow-hidden">
                <img src={[images.coding,images.learning,images.classroom][index % 3]} alt={c.name} className="h-full w-full object-cover transition duration-500 hover:scale-105"/>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent"/>
                <span className="absolute left-5 top-5 rounded-full bg-blue-600 px-3 py-1 text-xs font-black text-white">{c.code}</span>
                <h3 className="absolute bottom-5 left-5 right-5 text-xl font-black text-white">{c.name}</h3>
              </div>
              <div className="p-6">
                <p className="min-h-12 text-sm leading-6 text-slate-600">{c.shortDescription}</p>
                <Link href={"/courses/"+c.code.toLowerCase()} className="mt-5 flex items-center justify-between rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white">
                  Explore course <ArrowRight size={17}/>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200/60 bg-white/45 py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:items-center">
          <div className="relative overflow-hidden rounded-[2rem] shadow-2xl">
            <img src={images.learning} alt="Online computer learning" className="h-[420px] w-full object-cover"/>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent"/>
            <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/20 bg-white/15 p-5 text-white backdrop-blur-xl">
              <p className="font-black">Learn with a clear path</p>
              <p className="mt-1 text-sm text-white/75">Discover → Enrol → Learn → Practice → Progress</p>
            </div>
          </div>
          <div>
            <p className="font-black uppercase tracking-[.2em] text-blue-600">How learning works</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Everything you need for a smoother learning journey.</h2>
            <div className="mt-8 space-y-4">
              {[
                [Target,"Choose your direction","Browse course details, eligibility, curriculum and learning outcomes before you decide."],
                [Laptop,"Learn from anywhere","Access your student account and continue lessons at a pace that works for you."],
                [Award,"Build completion momentum","Track lessons, complete learning activities and work towards course completion."]
              ].map(([Icon,title,desc]) => (
                <div key={title} className="glass flex gap-4 rounded-2xl p-5">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600"><Icon size={21}/></div>
                  <div><h3 className="font-black">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-500">{desc}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-3xl">
          <p className="font-black uppercase tracking-[.2em] text-blue-600">Why RCLD</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">More than a course catalogue.</h2>
          <p className="mt-4 leading-7 text-slate-500">The platform is being built around the complete student journey: discovering programs, learning from structured content, accessing resources and staying connected with your progress.</p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            [BookOpen,"Structured curriculum","Know what to study next with organized modules and lessons."],
            [Users,"Student-first platform","Your account, courses and learning activity stay in one place."],
            [MessageCircle,"Clear communication","Keep important course information and learning updates easy to find."],
            [ShieldCheck,"Secure accounts","Student and ERP access remain separated so each audience sees the right experience."],
            [Zap,"Fast and focused","A clean interface designed to reduce distractions and get you to learning quickly."],
            [CheckCircle2,"Progress-focused","Complete lessons and build a visible learning journey over time."]
          ].map(([Icon,title,desc]) => (
            <div key={title} className="glass surface-hover rounded-3xl p-7">
              <Icon className="text-blue-600" size={29}/>
              <h3 className="mt-5 text-xl font-black">{title}</h3>
              <p className="mt-2 leading-7 text-slate-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="glass-strong relative overflow-hidden rounded-[2rem] p-8 sm:p-12">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-400/15 blur-3xl"/>
          <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-3xl">
              <p className="font-black uppercase tracking-[.2em] text-blue-600">Ready to begin?</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight">Your next skill can start today.</h2>
              <p className="mt-4 leading-7 text-slate-600">Browse the catalogue, compare programs and create your online student account when you are ready.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/courses" className="rounded-xl bg-slate-950 px-5 py-3 font-black text-white">Browse Courses</Link>
                <Link href="/student/login" className="rounded-xl border border-slate-200 bg-white/70 px-5 py-3 font-black">Student Login</Link>
              </div>
            </div>
            <div className="hidden rounded-3xl border border-white/80 bg-white/55 p-6 shadow-xl backdrop-blur lg:block">
              <GraduationCap size={54} className="text-blue-600"/>
              <p className="mt-4 text-2xl font-black">Learn. Practice.</p>
              <p className="text-2xl font-black text-blue-600">Grow.</p>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
