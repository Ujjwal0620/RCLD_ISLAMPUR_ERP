import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

const issueSchema=z.object({studentId:z.string().min(1),courseId:z.string().min(1),batchId:z.string().optional().nullable(),grade:z.string().max(40).optional(),remarks:z.string().max(500).optional()});

function certificateNo(){const d=new Date();return `RCLD-${d.getFullYear()}-${String(Date.now()).slice(-8)}`;}
function verificationCode(){return crypto.randomUUID().replaceAll("-","").slice(0,16).toUpperCase();}

export async function POST(request){
 const user=await getCurrentUser();
 if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 if(!hasPermission(user,"certificates.issue"))return NextResponse.json({error:"Permission denied"},{status:403});
 try{
  const data=issueSchema.parse(await request.json());
  const student=await db.student.findUnique({where:{id:data.studentId},include:{
   feeLedgers:{include:{batchEnrollment:{include:{batch:true}}}},
   examAttempts:{where:{passed:true},include:{exam:true}}
  }});
  if(!student)return NextResponse.json({error:"Student not found"},{status:404});
  const course=await db.course.findUnique({where:{id:data.courseId}});
  if(!course)return NextResponse.json({error:"Course not found"},{status:404});
  const passed=student.examAttempts.some(a=>a.exam.courseId===data.courseId || (data.batchId&&a.exam.batchId===data.batchId));
  if(!passed)return NextResponse.json({error:"Student must pass a course or batch exam before certificate issuance."},{status:409});
  const relevantLedgers=student.feeLedgers.filter(l=>l.batchEnrollment.batch.courseId===data.courseId);
  if(relevantLedgers.some(l=>Number(l.balanceAmount)>0))return NextResponse.json({error:"Outstanding course fees must be cleared before certificate issuance."},{status:409});
  const existing=await db.certificate.findUnique({where:{studentId_courseId:{studentId:data.studentId,courseId:data.courseId}}});
  if(existing)return NextResponse.json({error:"Certificate already issued for this student and course.",certificateId:existing.id},{status:409});
  const cert=await db.$transaction(async tx=>{
   const created=await tx.certificate.create({data:{certificateNo:certificateNo(),verificationCode:verificationCode(),studentId:data.studentId,courseId:data.courseId,batchId:data.batchId||null,issuedById:user.id,grade:data.grade||null,remarks:data.remarks||null}});
   await tx.auditLog.create({data:{actorUserId:user.id,action:"CERTIFICATE_ISSUED",entityType:"Certificate",entityId:created.id,metadata:{studentId:data.studentId,courseId:data.courseId,certificateNo:created.certificateNo}}});
   return created;
  });
  return NextResponse.json({ok:true,certificate:cert},{status:201});
 }catch(error){if(error instanceof z.ZodError)return NextResponse.json({error:error.issues[0]?.message||"Invalid certificate data"},{status:400});console.error("Certificate issuance failed",error);return NextResponse.json({error:"Unable to issue certificate"},{status:500});}
}
