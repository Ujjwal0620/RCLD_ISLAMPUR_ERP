import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Clock3, GraduationCap, PlayCircle, Sparkles } from "lucide-react";
import { db } from "@/lib/db";

export const dynamic="force-dynamic";

const fallback=[
["CCA","Certificate in Computer Applications","Foundation computer skills for everyday and professional use."],
["DCA","Diploma in Computer Applications","Practical computer applications, office productivity and digital skills."],
["ADCA","Advanced Diploma in Computer Applications","Advanced office, design, internet and professional computer skills."],
["CCC","Course on Computer Concepts","Essential digital literacy, internet, office and computer fundamentals."],
["CAO","Computer Accounting & Office","Office productivity with accounting and computerised business workflows."],
["DWPD","Diploma in Web & Programming Development","Web design, programming and modern development fundamentals."]
];
async function getCourses(){
  try{const rows=await db.course.findMany({where:{active:true,onlinePublished:true},orderBy:{code:"asc"},take:10});return rows.length?rows:fallback.map(([code,name,shortDescription])=>({code,name,shortDescription}));}
  catch{return fallback.map(([code,name,shortDescription])=>({code,name,shortDescription}));}
}
export default async function HomePage(){
 const courses=await getCourses();
 return <main className="site-shell min-h-screen">
  <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
   <Link href="/" className="text-xl font-black tracking-tight">RCLD <span className="text-blue-600">Islampur</span></Link>
   <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex"><a href="#courses">Courses</a><a href="#why">Why RCLD</a><a href="#how">How it works</a></nav>
   <div className="flex items-center gap-2"><Link href="/student/login" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">Student Login</Link></div>
  </div></header>
  <section className="hero-glow overflow-hidden"><div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-20 lg:grid-cols-[1.1fr_.9fr] lg:py-28">
   <div><div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700"><Sparkles size={16}/> Practical online learning</div>
   <h1 className="mt-6 text-5xl font-black leading-[1.02] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">Learn skills that move you forward.</h1>
   <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Explore computer courses from RCLD Islampur and learn through structured online lessons, study resources, practice and progress tracking.</p>
   <div className="mt-8 flex flex-wrap gap-3"><Link href="#courses" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-bold text-white">Explore Courses <ArrowRight size={18}/></Link><Link href="/student/login" className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-bold text-slate-800">Continue Learning</Link></div></div>
   <div className="relative"><div className="surface rounded-[2rem] p-4"><div className="course-banner flex min-h-[390px] flex-col justify-between rounded-[1.5rem] p-7"><div className="flex justify-between"><span className="rounded-full bg-white/90 px-3 py-1 text-xs font-black text-blue-700">RCLD ONLINE</span><PlayCircle className="text-blue-600" size={34}/></div><div><p className="text-sm font-bold text-blue-700">YOUR LEARNING SPACE</p><h2 className="mt-2 text-4xl font-black text-slate-950">Courses. Lessons. Progress.</h2><p className="mt-3 max-w-md text-slate-600">A focused student experience for recorded learning and digital resources.</p></div></div></div></div>
  </div></section>
  <section id="courses" className="mx-auto max-w-7xl px-6 py-16"><div className="flex items-end justify-between gap-4"><div><p className="text-sm font-black uppercase tracking-[.2em] text-blue-600">Our courses</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">Choose what you want to learn</h2></div><Link href="/courses" className="hidden text-sm font-bold text-blue-600 sm:block">View all courses →</Link></div>
   <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{courses.map(c=><article key={c.code} className="surface surface-hover overflow-hidden rounded-3xl"><div className="course-banner flex h-48 items-end p-6"><div><span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">{c.code}</span><h3 className="mt-3 text-2xl font-black">{c.name}</h3></div></div><div className="p-6"><p className="min-h-14 text-sm leading-6 text-slate-600">{c.shortDescription}</p><Link href={"/courses/"+c.code.toLowerCase()} className="mt-5 flex items-center justify-between rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white">Explore course <ArrowRight size={17}/></Link></div></article>)}</div>
  </section>
  <section id="why" className="bg-slate-50 py-20"><div className="mx-auto max-w-7xl px-6"><p className="text-sm font-black uppercase tracking-[.2em] text-blue-600">Why learn here</p><h2 className="mt-2 text-3xl font-black">Everything you need to keep learning</h2><div className="mt-8 grid gap-5 md:grid-cols-3">{[["Structured courses","Clear modules and lessons so you always know what to learn next.",BookOpen],["Learn at your pace","Access your learning space and continue from where you stopped.",Clock3],["Practical outcomes","Study resources, assignments and practice built around useful skills.",CheckCircle2]].map(([t,d,I])=><div key={t} className="surface rounded-2xl p-6"><I className="text-blue-600" size={26}/><h3 className="mt-5 text-lg font-black">{t}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{d}</p></div>)}</div></div></section>
  <section id="how" className="mx-auto max-w-7xl px-6 py-20"><div className="surface rounded-[2rem] p-8 sm:p-12"><div className="max-w-2xl"><p className="text-sm font-black uppercase tracking-[.2em] text-blue-600">Simple learning journey</p><h2 className="mt-2 text-3xl font-black">Pick a course. Start learning. Track your progress.</h2><p className="mt-4 leading-7 text-slate-600">Create your online student account, choose a course, complete the enrolment process and access your learning dashboard.</p><Link href="/courses" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white">Browse all courses <ArrowRight size={18}/></Link></div></div></section>
  <footer className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10"><div className="flex flex-col justify-between gap-5 sm:flex-row"><div><p className="text-xl font-black">RCLD Islampur</p><p className="mt-1 text-sm text-slate-500">Online learning for practical computer skills.</p></div><div className="flex flex-wrap gap-5 text-sm font-semibold text-slate-600"><Link href="/courses">Courses</Link><Link href="/student/login">Online Student Login</Link><Link href="/login">ERP Login — Offline Students, Employees & Superadmins</Link></div></div><p className="text-xs text-slate-400">© {new Date().getFullYear()} RCLD Islampur. All rights reserved.</p></div></footer>
 </main>
}
