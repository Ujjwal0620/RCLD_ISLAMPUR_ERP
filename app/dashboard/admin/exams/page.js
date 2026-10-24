import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission, isSuperAdmin } from "@/lib/permissions";
import { db } from "@/lib/db";
import ExamStudio from "./exam-studio";

export default async function ExamsPage(){
 const user=await getCurrentUser();if(!user)redirect("/login");if(!hasPermission(user,"exams.view"))redirect("/dashboard");
 const facultyEmployeeId=user.employee?.id||null; const superAdmin=isSuperAdmin(user);
 const batchScope=superAdmin?{}:facultyEmployeeId?{faculties:{some:{employeeId:facultyEmployeeId}}}:{id:"__none__"};
 const examScope=superAdmin?{}:facultyEmployeeId?{OR:[{batch:{faculties:{some:{employeeId:facultyEmployeeId}}}},{course:{batches:{some:{faculties:{some:{employeeId:facultyEmployeeId}}}}}}]}:{id:"__none__"};
 const [batches,courses,exams]=await Promise.all([
  db.batch.findMany({where:{status:{in:["PLANNED","ACTIVE"]},...batchScope},orderBy:{startsAt:"asc"},select:{id:true,code:true,name:true}}),
  db.course.findMany({where:{active:true,...(superAdmin?{}:{batches:{some:batchScope}})},orderBy:{code:"asc"},select:{id:true,code:true,name:true}}),
  db.exam.findMany({where:examScope,orderBy:{createdAt:"desc"},take:50,include:{batch:{select:{code:true,name:true}},course:{select:{code:true,name:true}},questions:{orderBy:{sortOrder:"asc"}},_count:{select:{attempts:true}}}})
 ]);
 return <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10"><div className="mx-auto max-w-[1450px]"><Link href="/dashboard" className="text-xs font-black text-blue-700">← Command Center</Link><section className="mt-4 rounded-[30px] bg-slate-950 p-7 text-white sm:p-9"><span className="text-[10px] font-black uppercase tracking-[.2em] text-blue-200">Assessment Studio</span><h1 className="mt-4 text-3xl font-black tracking-[-.04em] sm:text-5xl">Exams & Results</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Create timed assessments, configure marking rules and build MCQ or descriptive questions.</p></section><div className="mt-5"><ExamStudio batches={batches} courses={courses} initialExams={exams.map(e=>({id:e.id,title:e.title,batch:e.batch,course:e.course,questions:e.questions.map(q=>({id:q.id,text:q.questionText,type:q.type,marks:Number(q.marks),options:Array.isArray(q.options)?q.options:[],correctAnswer:q.correctAnswer})),durationMinutes:e.durationMinutes,negativeMarking:e.negativeMarking,negativeMarks:Number(e.negativeMarks),passMarks:Number(e.passMarks),maxAttempts:e.maxAttempts,published:e.published,attempts:e._count.attempts}))} canManage={hasPermission(user,"exams.manage")}/></div></div></main>;
}