import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

const schema=z.object({centreId:z.string(),name:z.string().trim().min(4).max(30),startsAt:z.string(),endsAt:z.string(),deactivatePrevious:z.boolean().default(true)});

export async function POST(req){
 const user=await getCurrentUser();
 if(!user||!hasPermission(user,"batches.manage"))return NextResponse.json({error:"Forbidden"},{status:403});
 try{
  const d=schema.parse(await req.json());const startsAt=new Date(d.startsAt),endsAt=new Date(d.endsAt);
  if(Number.isNaN(startsAt.getTime())||Number.isNaN(endsAt.getTime())||endsAt<=startsAt)throw new Error("Enter a valid academic-session date range.");
  const session=await db.$transaction(async tx=>{
   if(d.deactivatePrevious)await tx.academicSession.updateMany({where:{centreId:d.centreId,active:true},data:{active:false}});
   const created=await tx.academicSession.create({data:{centreId:d.centreId,name:d.name,startsAt,endsAt,active:true}});
   await tx.auditLog.create({data:{actorUserId:user.id,action:"ACADEMIC_SESSION_ROLLED_OVER",entityType:"AcademicSession",entityId:created.id,metadata:{centreId:d.centreId,name:d.name,historyPolicy:"Existing students, batches, enrollments, fees, exams and certificates remain linked to their original records. New cohorts must use the new session."}}});
   return created;
  });
  return NextResponse.json({success:true,session},{status:201});
 }catch(e){return NextResponse.json({error:e?.message||"Unable to create academic session."},{status:e?.code==="P2002"?409:400});}
}
