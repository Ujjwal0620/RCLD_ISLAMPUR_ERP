import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentStudent } from "@/lib/student-auth";

const startSchema=z.object({examId:z.string(),action:z.literal("START")});
const submitSchema=z.object({examId:z.string(),attemptId:z.string(),action:z.literal("SUBMIT"),answers:z.record(z.string(),z.string().trim().max(5000))});

async function access(studentId,examId){
 return db.exam.findFirst({
  where:{id:examId,published:true,OR:[
   {course:{onlineEnrollments:{some:{studentId,status:"ACTIVE"}}}},
   {batch:{enrollments:{some:{studentId,active:true}}}}
  ]},
  include:{questions:{orderBy:{sortOrder:"asc"},select:{id:true,questionText:true,type:true,options:true,marks:true,correctAnswer:true}},course:{select:{code:true,name:true}},batch:{select:{code:true,name:true,course:{select:{code:true,name:true}}}}}
 });
}
async function outstandingFees(studentId, exam){
 if(!exam.batchId) return false;
 const ledger=await db.feeLedger.findFirst({where:{studentId,batchEnrollment:{batchId:exam.batchId}},select:{balanceAmount:true}});
 return Boolean(ledger&&Number(ledger.balanceAmount)>0);
}
export async function GET(req){
 const student=await getCurrentStudent();if(!student)return NextResponse.json({error:"Unauthorized"},{status:401});
 const examId=new URL(req.url).searchParams.get("examId");
 const exams=examId?[await access(student.id,examId)].filter(Boolean):await db.exam.findMany({where:{published:true,OR:[{course:{onlineEnrollments:{some:{studentId:student.id,status:"ACTIVE"}}}},{batch:{enrollments:{some:{studentId:student.id,active:true}}}}]},orderBy:{createdAt:"desc"},include:{course:{select:{code:true,name:true}},batch:{select:{code:true,name:true,course:{select:{code:true,name:true}}}},_count:{select:{questions:true}}}});
 const examIds=exams.map(e=>e.id);
 const bestRows=examIds.length?await db.examAttempt.groupBy({by:["examId"],where:{studentId:student.id,examId:{in:examIds},status:"GRADED"},_max:{score:true,percentage:true}}):[];
 const bestByExam=Object.fromEntries(bestRows.map(r=>[r.examId,{score:r._max.score===null?null:Number(r._max.score),percentage:r._max.percentage===null?null:Number(r._max.percentage)}]));
 return NextResponse.json({exams,bestResults:bestByExam});
}
export async function POST(req){
 const student=await getCurrentStudent();if(!student)return NextResponse.json({error:"Unauthorized"},{status:401});
 try{
  const body=await req.json();
  if(body.action==="START"){
   const d=startSchema.parse(body);const exam=await access(student.id,d.examId);if(!exam)throw new Error("Exam is not available for your active course or batch.");
   if(await outstandingFees(student.id,exam))throw new Error("Outstanding course fees must be cleared before starting this exam.");
   const attempts=await db.examAttempt.count({where:{examId:exam.id,studentId:student.id,status:{not:"CANCELLED"}}});if(exam.maxAttempts>0&&attempts>=exam.maxAttempts)throw new Error("Maximum attempts reached.");
   const existing=await db.examAttempt.findFirst({where:{examId:exam.id,studentId:student.id,status:"IN_PROGRESS"},orderBy:{startedAt:"desc"}});if(existing)return NextResponse.json({attemptId:existing.id,startedAt:existing.startedAt});
   const attempt=await db.examAttempt.create({data:{examId:exam.id,studentId:student.id,attemptNo:attempts+1}});
   return NextResponse.json({attemptId:attempt.id,startedAt:attempt.startedAt});
  }
  const d=submitSchema.parse(body);const exam=await access(student.id,d.examId);if(!exam)throw new Error("Exam is not available.");
  const attempt=await db.examAttempt.findFirst({where:{id:d.attemptId,examId:exam.id,studentId:student.id,status:"IN_PROGRESS"}});if(!attempt)throw new Error("Active attempt not found.");
  const now=Date.now();const deadline=attempt.startedAt.getTime()+exam.durationMinutes*60000;if(now>deadline)throw new Error("The exam time has expired.");
  let score=0,max=0,hasDescriptive=false;
  for(const q of exam.questions){const marks=Number(q.marks);max+=marks;const answer=d.answers[q.id];if(q.type==="DESCRIPTIVE"){hasDescriptive=true;continue;}if(answer&&answer===q.correctAnswer)score+=marks;else if(answer&&exam.negativeMarking)score-=Number(exam.negativeMarks);}
  score=Math.max(0,score);const percentage=max?Math.round(score/max*10000)/100:0;const passed=!hasDescriptive&&score>=Number(exam.passMarks);
  const updated=await db.examAttempt.update({where:{id:attempt.id},data:{answers:d.answers,score,percentage,passed:hasDescriptive?null:passed,status:hasDescriptive?"SUBMITTED":"GRADED",submittedAt:new Date(),gradedAt:hasDescriptive?null:new Date()}});
  return NextResponse.json({success:true,attempt:exam.resultsPublished?updated:{id:updated.id,status:updated.status},resultsPublished:exam.resultsPublished,requiresManualGrading:hasDescriptive});
 }catch(e){return NextResponse.json({error:e?.message||"Unable to process exam."},{status:400});}
}
