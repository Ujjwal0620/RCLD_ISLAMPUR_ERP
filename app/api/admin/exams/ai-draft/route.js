import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { db } from "@/lib/db";

const schema=z.object({examId:z.string(),topic:z.string().trim().min(2).max(300),count:z.coerce.number().int().min(1).max(20).default(5),difficulty:z.enum(["easy","medium","hard","mixed"]).default("mixed")});
export async function POST(request){
 const user=await getCurrentUser();if(!user||!hasPermission(user,"exams.manage"))return NextResponse.json({error:"Forbidden"},{status:403});
 try{
  const d=schema.parse(await request.json());const exam=await db.exam.findUnique({where:{id:d.examId},include:{batch:{include:{faculties:true,course:true}},course:true}});
  if(!exam)return NextResponse.json({error:"Exam not found."},{status:404});
  const superAdmin=user.userRoles?.some(x=>x.role.name==="SUPERADMIN");const employeeId=user.employee?.id;
  if(!superAdmin&&(!employeeId||!exam.batch?.faculties.some(x=>x.employeeId===employeeId)))return NextResponse.json({error:"You can generate questions only for your assigned exam."},{status:403});
  const key=process.env.GROQ_API_KEY;if(!key)return NextResponse.json({error:"AI exam assistance is not configured. Add GROQ_API_KEY locally."},{status:503});
  const course=exam.course||exam.batch?.course;const prompt="Create "+d.count+" "+d.difficulty+" MCQ questions for RCLD course "+(course?.code||"")+" "+(course?.name||"")+" on topic: "+d.topic+". Return ONLY valid JSON array. Each item: {questionText:string,options:string[4],correctAnswer:string,marks:number}. correctAnswer must exactly equal one option. Avoid ambiguous or duplicate questions.";
  const response=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+key},body:JSON.stringify({model:process.env.GROQ_MODEL||"llama-3.3-70b-versatile",temperature:.25,max_tokens:2500,response_format:{type:"json_object"},messages:[{role:"system",content:"You assist authorized faculty in drafting assessment questions. Faculty must review all generated content before saving. Return JSON as {questions:[...]}"},{role:"user",content:prompt}]})});
  const data=await response.json().catch(()=>({}));if(!response.ok)return NextResponse.json({error:"AI question drafting is temporarily unavailable."},{status:502});
  let parsed;try{parsed=JSON.parse(data?.choices?.[0]?.message?.content||"{}")}catch{return NextResponse.json({error:"AI returned an invalid draft. Try again."},{status:502})}
  const questions=Array.isArray(parsed.questions)?parsed.questions.slice(0,d.count):[];
  await db.auditLog.create({data:{actorUserId:user.id,action:"AI_EXAM_DRAFT_GENERATED",entityType:"Exam",entityId:exam.id,metadata:{topic:d.topic,count:questions.length}}}).catch(()=>{});
  return NextResponse.json({questions,notice:"AI-generated draft. Review every question, option and correct answer before saving."});
 }catch(e){if(e?.name==="ZodError")return NextResponse.json({error:e.issues?.[0]?.message||"Invalid request."},{status:400});return NextResponse.json({error:"Unable to generate question draft."},{status:500})}
}