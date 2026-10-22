import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

const schema=z.object({grades:z.record(z.string(),z.coerce.number().min(0))});

export async function POST(req,{params}){
 const user=await getCurrentUser();if(!user||!hasPermission(user,"exams.manage"))return NextResponse.json({error:"Forbidden"},{status:403});
 try{
  const {id}=await params;const d=schema.parse(await req.json());
  const attempt=await db.examAttempt.findUnique({where:{id},include:{exam:{include:{questions:true}}}});
  if(!attempt)throw new Error("Attempt not found.");
  const answers=attempt.answers&&typeof attempt.answers==="object"?attempt.answers:{};
  let score=0,max=0;
  const grading={};
  for(const q of attempt.exam.questions){
   const marks=Number(q.marks);max+=marks;
   if(q.type==="MCQ"){const a=answers[q.id];if(a&&a===q.correctAnswer)score+=marks;else if(a&&attempt.exam.negativeMarking)score-=Number(attempt.exam.negativeMarks);}
   else{const grade=Math.min(marks,Math.max(0,Number(d.grades[q.id]??0)));grading[q.id]=grade;score+=grade;}
  }
  score=Math.max(0,score);const percentage=max?Math.round(score/max*10000)/100:0;const passed=score>=Number(attempt.exam.passMarks);
  const updated=await db.examAttempt.update({where:{id},data:{grading,score,percentage,passed,status:"GRADED",gradedAt:new Date()}});
  await db.auditLog.create({data:{actorUserId:user.id,action:"EXAM_ATTEMPT_GRADED",entityType:"ExamAttempt",entityId:id,metadata:{score,percentage,passed}}});
  return NextResponse.json({success:true,attempt:updated});
 }catch(e){return NextResponse.json({error:e?.message||"Unable to grade attempt."},{status:400});}
}
