import { redirect,notFound } from "next/navigation";
import { getCurrentStudent } from "@/lib/student-auth";
import { db } from "@/lib/db";
import ExamAttempt from "./exam-attempt";

export default async function TakeExamPage({params}){
 const student=await getCurrentStudent();if(!student)redirect("/student/login");
 const {id}=await params;
 const exam=await db.exam.findFirst({where:{id,published:true,course:{onlineEnrollments:{some:{studentId:student.id,status:"ACTIVE"}}}},include:{course:{select:{code:true,name:true}},questions:{orderBy:{sortOrder:"asc"},select:{id:true,questionText:true,type:true,options:true,marks:true}}}});
 if(!exam)notFound();
 return <main className="px-4 py-5 sm:px-6 lg:px-8"><div className="mx-auto max-w-[1000px] pl-12 lg:pl-0"><ExamAttempt exam={{id:exam.id,title:exam.title,course:exam.course,durationMinutes:exam.durationMinutes,questions:exam.questions.map(q=>({id:q.id,text:q.questionText,type:q.type,options:Array.isArray(q.options)?q.options:[],marks:Number(q.marks)}))}}/></div></main>;
}