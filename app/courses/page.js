import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Clock3, GraduationCap } from "lucide-react";
import { db } from "@/lib/db";

export const dynamic="force-dynamic";

const fallback=[
["CCA","Certificate in Computer Applications","Foundation computer skills for everyday and professional use."],
["DCA","Diploma in Computer Applications","Practical computer applications, office productivity and digital skills."],
["ADCA","Advanced Diploma in Computer Applications","Advanced office, design, internet and professional computer skills."],
["CCC","Course on Computer Concepts","Essential digital literacy, internet, office and computer fundamentals."],
["CAO","Computer Accounting & Office","Office productivity with accounting and computerised business workflows."],
["DWPD","Diploma in Web & Programming Development","Web design, programming and modern development fundamentals."],
["DOM","Diploma in Office Management","Office administration, documentation and productivity skills."],
["DCST","Diploma in Computer Software Technology","Software tools, productivity applications and practical computer technology."],
["DCAP","Diploma in Computer Application Programming","Programming and application development fundamentals."],
["DHNT","Diploma in Hardware & Networking Technology","Computer hardware, maintenance and networking fundamentals."]
];

async function getCourses(){
  try{
    const rows=await db.course.findMany({where:{active:true,onlinePublished:true},orderBy:{code:"asc"}});
    return rows.length?rows:fallback.map(([code,name,shortDescription])=>({code,name,shortDescription}));
  }catch{return fallback.map(([code,name,shortDescription])=>({code,name,shortDescription}));}
}

export default async function CoursesPage(){
  const courses=await getCourses();
  return <main className="site-shell min-h-screen">
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-black text-slate-900">RCLD <span className="text-blue-600">Islampur</span></Link>
        <div className="flex items-center gap-3"><Link href="/student/login" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">Student Login</Link><Link href="/login" className="text-sm font-semibold text-slate-600">ERP Login</Link></div>
      </div>
    </header>
    <section className="hero-glow border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <p className="text-sm font-bold uppercase tracking-[.24em] text-blue-600">Learn online</p>
        <h1 className="mt-3 max-w-3xl text-5xl font-black tracking-tight text-slate-950 sm:text-6xl">Build practical computer skills with RCLD Islampur.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Choose a course, explore the curriculum, and continue into your personal learning space with lessons, resources, quizzes and progress tracking.</p>
      </div>
    </section>
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-8"><p className="text-sm font-bold text-blue-600">COURSES</p><h2 className="mt-2 text-3xl font-black">Explore our programs</h2></div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map(c=><article key={c.code} className="surface surface-hover overflow-hidden rounded-3xl">
          <div className="course-banner relative flex h-44 items-end p-6"><div className="absolute right-5 top-5 rounded-2xl bg-white/80 p-3 text-blue-600"><GraduationCap size={24}/></div><div><span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">{c.code}</span><h3 className="mt-3 text-2xl font-black text-slate-950">{c.name}</h3></div></div>
          <div className="p-6"><p className="min-h-14 text-sm leading-6 text-slate-600">{c.shortDescription||"Practical, structured learning designed for real-world computer skills."}</p><div className="mt-5 grid grid-cols-2 gap-3 text-xs font-semibold text-slate-500"><span className="flex items-center gap-2"><BookOpen size={15}/>Recorded lessons</span><span className="flex items-center gap-2"><Clock3 size={15}/>Self-paced</span><span className="flex items-center gap-2"><CheckCircle2 size={15}/>Resources</span><span className="flex items-center gap-2"><GraduationCap size={15}/>Certificate</span></div><Link href={"/courses/"+c.code.toLowerCase()} className="mt-6 flex items-center justify-between rounded-xl bg-slate-950 px-4 py-3 font-bold text-white">View course <ArrowRight size={18}/></Link></div>
        </article>)}
      </div>
    </section>
    <footer className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-black">RCLD Islampur</p><p className="mt-1 text-sm text-slate-500">Learn. Practice. Grow.</p></div><div className="flex gap-5 text-sm font-semibold"><Link href="/student/login">Online Student Login</Link><Link href="/login">ERP Login — Offline Students & Employees</Link></div></div></footer>
  </main>;
}
