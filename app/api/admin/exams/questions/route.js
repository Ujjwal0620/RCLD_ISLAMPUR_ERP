import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

const schema=z.object({examId:z.string(),questionText:z.string().trim().min(2).max(5000),type:z.enum(["MCQ","DESCRIPTIVE"]),options:z.array(z.string().trim().min(1).max(500)).max(10).optional(),correctAnswer:z.string().trim().max(500).optional().or(z.literal("")),marks:z.coerce.number().positive().max(1000),sortOrder:z.coerce.number().int().min(0).default(0)});
export async function POST(req){
 const user=await getCurrentUser();if(!user||!hasPermission(user,"exams.manage"))return NextResponse.json({error:"Forbidden"},{status:403});
 try{const d=schema.parse(await req.json());const exam=await db.exam.findUnique({where:{id:d.examId},select:{id:true}});if(!exam)throw new Error("Exam not found.");if(d.type==="MCQ"&&(!d.options||d.options.length<2||!d.correctAnswer||!d.options.includes(d.correctAnswer)))throw new Error("MCQ requires at least two options and a valid correct answer.");
 const question=await db.examQuestion.create({data:{examId:d.examId,questionText:d.questionText,type:d.type,options:d.options||null,correctAnswer:d.correctAnswer||null,marks:d.marks,sortOrder:d.sortOrder}});
 await db.auditLog.create({data:{actorUserId:user.id,action:"EXAM_QUESTION_CREATED",entityType:"ExamQuestion",entityId:question.id,metadata:{examId:d.examId,type:d.type}}});
 return NextResponse.json({question},{status:201});}catch(e){return NextResponse.json({error:e?.message||"Unable to create question."},{status:400});}
}
