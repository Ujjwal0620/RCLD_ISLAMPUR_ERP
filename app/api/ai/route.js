import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
const schema=z.object({message:z.string().min(2).max(2000),path:z.string().max(300).optional()});
export async function POST(request){
 try{
  const user=await getCurrentUser();if(!user)return NextResponse.json({error:"Authentication required."},{status:401});
  const parsed=schema.safeParse(await request.json().catch(()=>({})));if(!parsed.success)return NextResponse.json({error:"Please enter a valid question."},{status:400});
  const key=process.env.GROQ_API_KEY;if(!key)return NextResponse.json({reply:"The workspace assistant is not configured on this deployment yet. The ERP itself is available normally."});
  const path=parsed.data.path||"/dashboard";const roles=user.userRoles?.map(x=>x.role.name).join(", ")||"authorized user";
  const privileged=user.userRoles?.some(x=>x.role.name==="SUPERADMIN");
  let liveContext="";
  if(privileged){
   const [employees,batches,tasks]=await Promise.all([
    db.employee.findMany({where:{user:{status:"ACTIVE"}},take:100,select:{employeeCode:true,designation:true,user:{select:{name:true}},batchFaculties:{select:{batch:{select:{code:true,name:true,startTime:true,endTime:true,room:true,status:true,course:{select:{code:true,name:true}}}}}}}}),
    db.batch.findMany({where:{status:"ACTIVE"},take:100,select:{code:true,name:true,startTime:true,endTime:true,room:true,course:{select:{code:true,name:true}},faculties:{select:{employee:{select:{employeeCode:true,user:{select:{name:true}}}}}}}}),
    db.employeeTask.findMany({where:{status:{notIn:["COMPLETED","CANCELLED"]}},take:100,select:{title:true,status:true,priority:true,dueAt:true,assignee:{select:{name:true,employee:{select:{employeeCode:true,designation:true}}}}}})
   ]);
   liveContext="\nLive authorized ERP context (use only this data for factual staff/schedule/task answers): "+JSON.stringify({employees,batches,tasks});
  }
  const system="You are the private operational assistant inside RCLD Islampur ERP. Never mention your underlying model, provider, API, or implementation. Be concise, practical, and beginner-friendly. The user is an authorized "+roles+". Current workspace: "+path+". Explain workflows, suggest next actions, and answer operational questions from the authorized live ERP context when present. For questions like where an employee is, infer only from ACTIVE batch time slots and room/lab assignments; if current-day/day-of-week scheduling is not stored, clearly say the schedule is a configured batch time slot rather than claiming physical presence. Identify potentially free employees only when the supplied schedules support that conclusion. Never invent database values, payment success, attendance, exam results, permissions, physical location, or completed actions. Never claim to have changed ERP data. If a request requires a real transaction, tell the user which ERP action should be performed."+liveContext;
  const response=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+key},body:JSON.stringify({model:process.env.GROQ_MODEL||"llama-3.3-70b-versatile",temperature:.2,max_tokens:700,messages:[{role:"system",content:system},{role:"user",content:parsed.data.message}]})});
  const data=await response.json().catch(()=>({}));if(!response.ok)return NextResponse.json({error:"The assistant is temporarily unavailable."},{status:502});
  const reply=data?.choices?.[0]?.message?.content?.trim();await db.auditLog.create({data:{actorUserId:user.id,action:"AI_ASSISTANT_USED",entityType:"AI",metadata:{path}}}).catch(()=>{});
  return NextResponse.json({reply:reply||"I could not produce a useful answer. Please try again."});
 }catch(error){console.error("AI assistant error",error);return NextResponse.json({error:"The assistant is temporarily unavailable."},{status:503});}
}
