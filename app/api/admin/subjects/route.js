import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

const schema=z.object({courseId:z.string().min(1),name:z.string().trim().min(2).max(120),code:z.string().trim().max(30).optional().or(z.literal("")),chapters:z.array(z.string().trim().min(1).max(160)).default([])});
export async function POST(req){
 const user=await getCurrentUser();
 if(!user||!hasPermission(user,"courses.manage")) return NextResponse.json({error:"Forbidden"},{status:403});
 try{
  const d=schema.parse(await req.json());
  const course=await db.course.findUnique({where:{id:d.courseId},select:{id:true}});
  if(!course) return NextResponse.json({error:"Course not found."},{status:404});
  const subject=await db.subject.create({data:{courseId:d.courseId,name:d.name,code:d.code||null,chapters:{create:d.chapters.map((title,i)=>({title,sortOrder:i}))}},include:{chapters:{orderBy:{sortOrder:"asc"}}}});
  await db.auditLog.create({data:{actorUserId:user.id,action:"SUBJECT_CREATED",entityType:"Subject",entityId:subject.id,metadata:{courseId:d.courseId,name:d.name}}});
  return NextResponse.json({subject},{status:201});
 }catch(e){if(e?.code==="P2002")return NextResponse.json({error:"This subject already exists in the course."},{status:409});return NextResponse.json({error:e?.issues?.[0]?.message||"Unable to create subject."},{status:400});}
}