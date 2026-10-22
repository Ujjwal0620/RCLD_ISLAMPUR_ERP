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
  const system="You are the private operational assistant inside RCLD Islampur ERP. Never mention your underlying model, provider, API, or implementation. Be concise, practical, and beginner-friendly. The user is an authorized "+roles+". Current workspace: "+path+". Explain workflows, suggest next actions, summarize operational concepts, help interpret records supplied in the conversation, and flag likely data issues. Never invent database values, payment success, attendance, exam results, permissions, or completed actions. Never claim to have changed ERP data. If a request requires a real transaction, tell the user which ERP action should be performed.";
  const response=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+key},body:JSON.stringify({model:process.env.GROQ_MODEL||"llama-3.3-70b-versatile",temperature:.2,max_tokens:700,messages:[{role:"system",content:system},{role:"user",content:parsed.data.message}]})});
  const data=await response.json().catch(()=>({}));if(!response.ok)return NextResponse.json({error:"The assistant is temporarily unavailable."},{status:502});
  const reply=data?.choices?.[0]?.message?.content?.trim();await db.auditLog.create({data:{actorUserId:user.id,action:"AI_ASSISTANT_USED",entityType:"AI",metadata:{path}}}).catch(()=>{});
  return NextResponse.json({reply:reply||"I could not produce a useful answer. Please try again."});
 }catch(error){console.error("AI assistant error",error);return NextResponse.json({error:"The assistant is temporarily unavailable."},{status:503});}
}
