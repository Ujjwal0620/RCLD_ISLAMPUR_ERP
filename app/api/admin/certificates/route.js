import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission, isSuperAdmin } from "@/lib/permissions";
import { evaluateCourseCompletion } from "@/lib/course-completion";

const issueSchema=z.object({studentId:z.string().min(1),courseId:z.string().min(1),batchId:z.string().optional().nullable(),grade:z.string().max(40).optional(),remarks:z.string().max(500).optional(),override:z.boolean().default(false),overrideReason:z.string().trim().max(500).optional().or(z.literal(""))});

function certificateNo(){const d=new Date();return `RCLD-${d.getFullYear()}-${String(Date.now()).slice(-8)}`;}
function verificationCode(){return crypto.randomUUID().replaceAll("-","").slice(0,16).toUpperCase();}

export async function POST(request){
 const user=await getCurrentUser();
 if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 if(!hasPermission(user,"certificates.issue"))return NextResponse.json({error:"Permission denied"},{status:403});
 try{
  const data=issueSchema.parse(await request.json());
  const student=await db.student.findUnique({where:{id:data.studentId}});
  if(!student)return NextResponse.json({error:"Student not found"},{status:404});
  const course=await db.course.findUnique({where:{id:data.courseId}});
  if(!course)return NextResponse.json({error:"Course not found"},{status:404});
  const completion=await evaluateCourseCompletion({studentId:data.studentId,courseId:data.courseId,batchId:data.batchId||null});
  if(!completion.eligible){
   if(!data.override)return NextResponse.json({error:"Course completion requirements are not satisfied.",completion},{status:409});
   if(!isSuperAdmin(user))return NextResponse.json({error:"Only Super Admin can override certificate eligibility."},{status:403});
   if(!data.overrideReason)return NextResponse.json({error:"Override reason is required."},{status:400});
  }
  const existing=await db.certificate.findUnique({where:{studentId_courseId:{studentId:data.studentId,courseId:data.courseId}}});
  if(existing)return NextResponse.json({error:"Certificate already issued for this student and course.",certificateId:existing.id},{status:409});
  const cert=await db.$transaction(async tx=>{
   const created=await tx.certificate.create({data:{certificateNo:certificateNo(),verificationCode:verificationCode(),studentId:data.studentId,courseId:data.courseId,batchId:data.batchId||null,issuedById:user.id,grade:data.grade||null,remarks:data.remarks||null}});
   await tx.auditLog.create({data:{actorUserId:user.id,action:"CERTIFICATE_ISSUED",entityType:"Certificate",entityId:created.id,metadata:{studentId:data.studentId,courseId:data.courseId,certificateNo:created.certificateNo,eligibilityOverride:!completion.eligible,overrideReason:!completion.eligible?data.overrideReason:null,completion}}});
   return created;
  });
  return NextResponse.json({ok:true,certificate:cert},{status:201});
 }catch(error){if(error instanceof z.ZodError)return NextResponse.json({error:error.issues[0]?.message||"Invalid certificate data"},{status:400});console.error("Certificate issuance failed",error);return NextResponse.json({error:"Unable to issue certificate"},{status:500});}
}
