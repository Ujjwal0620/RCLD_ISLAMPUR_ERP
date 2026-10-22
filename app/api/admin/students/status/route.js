import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

const schema=z.object({studentId:z.string(),status:z.enum(["ACTIVE","COMPLETED","TRANSFERRED","DROPPED_OUT","SUSPENDED","CANCELLED"]),reason:z.string().trim().max(300).optional().or(z.literal(""))});

export async function POST(req){
 const user=await getCurrentUser();
 if(!user||!hasPermission(user,"students.manage"))return NextResponse.json({error:"Forbidden"},{status:403});
 try{
  const d=schema.parse(await req.json());
  const result=await db.$transaction(async tx=>{
   const student=await tx.student.findUnique({where:{id:d.studentId},select:{id:true,name:true,status:true}});
   if(!student)throw new Error("Student not found.");
   if(student.status===d.status)throw new Error("Student already has this status.");
   const deactivate=["COMPLETED","DROPPED_OUT","CANCELLED"].includes(d.status);
   if(deactivate)await tx.batchEnrollment.updateMany({where:{studentId:d.studentId,active:true},data:{active:false,leftAt:new Date()}});
   const updated=await tx.student.update({where:{id:d.studentId},data:{status:d.status}});
   await tx.auditLog.create({data:{actorUserId:user.id,action:"STUDENT_STATUS_CHANGED",entityType:"Student",entityId:d.studentId,metadata:{from:student.status,to:d.status,reason:d.reason||null}}});
   return updated;
  });
  return NextResponse.json({success:true,student:{id:result.id,name:result.name,status:result.status}});
 }catch(e){return NextResponse.json({error:e?.message||"Unable to update student status."},{status:400});}
}
