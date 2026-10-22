import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentStudent } from "@/lib/student-auth";
import { db } from "@/lib/db";

export default async function StudentExamsPage(){
 const student=await getCurrentStudent();if(!student)redirect("/student/login");
 const exams=await db.exam.findMany({where:{published:true,course:{onlineEnrollments:{some:{studentId:student.id,status:"ACTIVE"}}}},orderBy:{createdAt:"desc"},include:{course:{select:{code:true,name:true}},_count:{select:{questions:true}}}});
 return <main className="px-4 py-5 sm:px-6 lg:px-8"><div className="mx-auto max-w-[1100px]"><div className="pl-12 lg:pl-0"><p className="text-xs font-black uppercase tracking-[.2em] text-blue-600">Assessment</p><h1 className="mt-2 text-3xl font-black">My Exams</h1><p className="mt-2 text-sm text-slate-500">Timed assessments available through your active online courses.</p></div><div className="mt-6 grid gap-4 md:grid-cols-2">{exams.map(e=><article key={e.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><span className="text-[10px] font-black uppercase tracking-wider text-blue-600">{e.course.code}</span><h2 className="mt-2 text-lg font-black">{e.title}</h2><p className="mt-2 text-xs text-slate-500">{e._count.questions} questions · {e.durationMinutes} minutes · {e.maxAttempts} attempt(s)</p><Link href={"/student/exams/"+e.id} className="mt-5 block rounded-xl bg-slate-950 px-4 py-3 text-center text-sm font-black text-white">Open exam</Link></article>)}{!exams.length&&<div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 md:col-span-2">No exams are currently available.</div>}</div></div></main>;
}