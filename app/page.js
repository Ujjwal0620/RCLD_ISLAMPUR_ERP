import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Clock3, GraduationCap, PlayCircle, ShieldCheck, Sparkles, Users, Zap } from "lucide-react";
import { db } from "@/lib/db";
import PublicNavbar from "@/components/public-navbar";
import PublicFooter from "@/components/public-footer";

export const dynamic="force-dynamic";

const fallback=[
["CCA","Certificate in Computer Applications","Build confident everyday computer and digital skills."],
["DCA","Diploma in Computer Applications","Practical office productivity, applications and professional computer skills."],
["ADCA","Advanced Diploma in Computer Applications","A broader program for advanced office, design and digital skills."],
["CCC","Course on Computer Concepts","A foundation for computer, internet and digital literacy."],
["CAO","Computer Accounting & Office","Computerized office workflows and accounting fundamentals."],
["DWPD","Diploma in Web & Programming Development","Web design, programming and development fundamentals."]
];

async function getCourses(){
 try{const rows=await db.course.findMany({where:{active:true,onlinePublished:true},orderBy:{code:"asc"},take:6});return rows.length?rows:fallback.map(([code,name,shortDescription])=>({code,name,shortDescription}));}
 catch{return fallback.map(([code,name,shortDescription])=>({code,name,shortDescription}));}
}

export default async function HomePage(){
 const courses=await getCourses();
 return <main className="site-shell min-h-screen">
  <PublicNavbar/>
  <section className="hero-glow grid-pattern">
   <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-20 lg:grid-cols-[1.05fr_.95fr] lg:pb-28 lg:pt-24">
    <div className="relative z-10">
     <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/65 px-4 py-2 text-sm font-black text-blue-700 shadow-sm backdrop-blur"><Sparkles size={16}/> Modern online computer learning</div>
     <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[.98] tracking-[-.045em] text-slate-950 sm:text-6xl lg:text-[5.4rem]">Turn curiosity into <span className="text-gradient">real skills.</span></h1>
     <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">Explore structured computer courses from RCLD Islampur. Learn through recorded lessons, practical resources, practice and a student-first learning dashboard.</p>
     <div className="mt-9 flex flex-wrap gap-3"><Link href="/courses" className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 font-black text-white shadow-xl shadow-slate-900/15">Explore Courses <ArrowRight size={18}/></Link><Link href="/learning" className="rounded-xl border border-white/90 bg-white/70 px-6 py-3.5 font-black text-slate-800 backdrop-blur">See How It Works</Link></div>
     <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-sm font-bold text-slate-600"><span className="flex items-center gap-2"><ShieldCheck className="text-blue-600" size={17}/> Student-first experience</span><span className="flex items-center gap-2"><Zap className="text-blue-600" size={17}/> Learn at your pace</span></div>
    </div>
    <div className="relative z-10">
      <div className="glass-strong rounded-[2rem] p-3 sm:p-4">
       <div className="course-banner relative min-h-[430px] overflow-hidden rounded-[1.6rem] p-7 sm:p-9">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-400/20 blur-3xl"/>
        <div className="relative flex items-center justify-between"><span className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-black text-blue-700">RCLD ONLINE</span><span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/80 text-blue-600 shadow-sm"><PlayCircle size={25}/></span></div>
        <div className="relative mt-24"><p className="text-sm font-black uppercase tracking-[.2em] text-blue-700">Your learning space</p><h2 className="mt-3 max-w-md text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">Courses. Lessons. Progress.</h2><p className="mt-4 max-w-md leading-7 text-slate-600">A focused online experience built to make learning computer skills feel clear and motivating.</p></div>
        <div className="absolute bottom-7 left-7 right-7 grid grid-cols-3 gap-3"><div className="glass rounded-2xl p-4"><BookOpen className="text-blue-600" size={19}/><p className="mt-2 text-xs font-black">Courses</p></div><div className="glass rounded-2xl p-4"><PlayCircle className="text-blue-600" size={19}/><p className="mt-2 text-xs font-black">Lessons</p></div><div className="glass rounded-2xl p-4"><CheckCircle2 className="text-blue-600" size={19}/><p className="mt-2 text-xs font-black">Progress</p></div></div>
       </div>
      </div>
    </div>
   </div>
  </section>
  <section className="relative z-10 mx-auto -mt-8 max-w-7xl px-6">
   <div className="glass-strong grid gap-4 rounded-3xl p-4 sm:grid-cols-3 sm:p-5">
    {[["Structured learning","Clear modules and lessons"],["Practical resources","Study materials and practice"],["Student dashboard","Keep your learning organized"]].map(([t,d])=><div key={t} className="rounded-2xl bg-white/55 p-5"><p className="font-black">{t}</p><p className="mt-1 text-sm text-slate-500">{d}</p></div>)}
   </div>
  </section>
  <section id="courses" className="mx-auto max-w-7xl px-6 py-24">
   <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="font-black uppercase tracking-[.2em] text-blue-600">Popular programs</p><h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Find the course that fits you.</h2><p className="mt-3 max-w-2xl text-slate-500">Explore programs designed around useful computer and digital skills.</p></div><Link href="/courses" className="font-black text-blue-600">View all courses →</Link></div>
   <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{courses.map(c=><article key={c.code} className="glass surface-hover overflow-hidden rounded-3xl"><div className="course-banner relative h-44 p-6"><span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-black text-white">{c.code}</span><GraduationCap className="absolute bottom-5 right-5 text-blue-600/40" size={58}/><h3 className="absolute bottom-5 left-6 max-w-[80%] text-xl font-black">{c.name}</h3></div><div className="p-6"><p className="min-h-12 text-sm leading-6 text-slate-600">{c.shortDescription}</p><Link href={"/courses/"+c.code.toLowerCase()} className="mt-5 flex items-center justify-between rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white">Explore course <ArrowRight size={17}/></Link></div></article>)}</div>
  </section>
  <section className="border-y border-slate-200/60 bg-white/45 py-24"><div className="mx-auto max-w-7xl px-6"><div className="max-w-3xl"><p className="font-black uppercase tracking-[.2em] text-blue-600">Why RCLD</p><h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Built to keep students moving forward.</h2></div><div className="mt-10 grid gap-5 md:grid-cols-3">{[[BookOpen,"Structured curriculum","Know what to study next with organized modules and lessons."],[Users,"Student-first platform","Your account, courses and learning activity stay in one place."],[CheckCircle2,"Progress-focused","Complete lessons and build a visible learning journey over time."]].map(([I,t,d])=><div key={t} className="glass rounded-3xl p-7"><I className="text-blue-600" size={29}/><h3 className="mt-5 text-xl font-black">{t}</h3><p className="mt-2 leading-7 text-slate-600">{d}</p></div>)}</div></div></section>
  <section className="mx-auto max-w-7xl px-6 py-24"><div className="glass-strong relative overflow-hidden rounded-[2rem] p-8 sm:p-12"><div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-400/15 blur-3xl"/><div className="relative max-w-3xl"><p className="font-black uppercase tracking-[.2em] text-blue-600">Start learning</p><h2 className="mt-3 text-4xl font-black tracking-tight">Your next skill can start today.</h2><p className="mt-4 leading-7 text-slate-600">Browse the catalogue, compare programs and create your online student account when you are ready.</p><div className="mt-7 flex flex-wrap gap-3"><Link href="/courses" className="rounded-xl bg-slate-950 px-5 py-3 font-black text-white">Browse Courses</Link><Link href="/student/login" className="rounded-xl border border-slate-200 bg-white/70 px-5 py-3 font-black">Student Login</Link></div></div></div></section>
  <PublicFooter/>
 </main>;
}