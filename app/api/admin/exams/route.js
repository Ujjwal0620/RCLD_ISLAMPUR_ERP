import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

const examSchema=z.object({batchId:z.string(),title:z.string().trim().min(2).max(160),instructions:z.string().trim().max(2000).optional().or(z.literal("")),durationMinutes:z.coerce.number().int().min(1).max(600),negativeMarking:z.boolean().default(false),negativeMarks:z.coerce.number().min(0).max(100).default(0),passMarks:z.coerce.number().min(0).max(100000),maxAttempts:z.coerce.number().int().min(1).max(20),published:z.boolean().default(false)});
const questionSchema=z.object({examId:z.string(),questionText:z.string().trim().min(2).max(5000),type:z.enum(["MCQ","DESCRIPTIVE"]),options:z.array(z.string().trim().min(1).max(500)).max(10).optional(),correctAnswer:z.string().trim().max(500).optional().or(z.literal("")),marks:z.coerce.number().positive().max(1000),sortOrder:z.coerce.number().int().min(0).default(0)});

export async function GET(req){
 const user=await getCurrentUser();if(!user||!hasPermission(user,"exams.view"))return NextResponse.json({error:"Forbidden"},{status:403});
 const batchId=new URL(req.url).searchParams.get("batchId");
 const exams=await db.exam.findMany({where:batchId?{batchId}:undefined,orderBy:{createdAt:"desc"},include:{batch:{select:{code:true,name:true}},_count:{select:{questions:true,attempts:true}}}});
 return NextResponse.json({exams});
}
export async function POST(req){
 const user=await getCurrentUser();if(!user||!hasPermission(user,"exams.manage"))return NextResponse.json({error:"Forbidden"},{status:403});
 try{const d=examSchema.parse(await req.json());const batch=await db.batch.findUnique({where:{id:d.batchId},select:{id:true}});if(!batch)throw new Error("Batch not found.");
 const exam=await db.exam.create({data:{...d,instructions:d.instructions||null}});await db.auditLog.create({data:{actorUserId:user.id,action:"EXAM_CREATED",entityType:"Exam",entityId:exam.id,metadata:{batchId:d.batchId}}});return NextResponse.json({exam},{status:201});
 }catch(e){return NextResponse.json({error:e?.message||"Unable to create exam."},{status:400});}
}
