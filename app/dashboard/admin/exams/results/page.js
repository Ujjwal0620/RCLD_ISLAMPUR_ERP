import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { db } from "@/lib/db";
import ResultsStudio from "./results-studio";

export default async function ResultsPage(){
 const user=await getCurrentUser();if(!user)redirect("/login");if(!hasPermission(user,"exams.view"))redirect("/dashboard");
 const attempts=await db.examAttempt.findMany({orderBy:{startedAt:"desc"},take:100,include:{student:{select:{name:true,registrationNo:true}},exam:{select:{id:true,title:true,passMarks:true,course:{select:{code:true}}},},}});
 return <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10"><div className="mx-auto max-w-[1400px]"><Link href="/dashboard/admin/exams" className="text-xs font-black text-blue-700">← Exam Studio</Link><section className="mt-4 rounded-[30px] bg-slate-950 p-7 text-white sm:p-9"><span className="text-[10px] font-black uppercase tracking-[.2em] text-blue-200">Assessment Results</span><h1 className="mt-4 text-3xl font-black sm:text-5xl">Results & Grading</h1><p className="mt-3 text-sm text-slate-300">Review attempts and manually grade descriptive responses.</p></section><div className="mt-5"><ResultsStudio attempts={attempts.map(a=>({id:a.id,status:a.status,student:a.student,exam:a.exam,score:a.score?Number(a.score):null,percentage:a.percentage?Number(a.percentage):null,passed:a.passed,answers:a.answers,startedAt:a.startedAt}))} canManage={hasPermission(user,"exams.manage")}/></div></div></main>;
}