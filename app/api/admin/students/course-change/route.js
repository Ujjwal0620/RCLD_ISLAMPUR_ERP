import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { calculateCoursePricing } from "@/lib/course-pricing";

const schema=z.object({studentId:z.string(),toBatchId:z.string(),reason:z.string().trim().min(3).max(500)});

export async function POST(req){
 const user=await getCurrentUser();
 if(!user||!hasPermission(user,"students.manage"))return NextResponse.json({error:"Forbidden"},{status:403});
 try{
  const d=schema.parse(await req.json());
  const result=await db.$transaction(async tx=>{
   const current=await tx.batchEnrollment.findFirst({where:{studentId:d.studentId,active:true},include:{batch:{include:{course:true}},feeLedger:true}});
   if(!current||!current.feeLedger)throw new Error("Active admission and fee ledger are required.");
   const target=await tx.batch.findUnique({where:{id:d.toBatchId},include:{course:true}});
   if(!target||["COMPLETED","CANCELLED"].includes(target.status))throw new Error("Target batch is not available.");
   if(target.id===current.batchId)throw new Error("Select a different batch.");
   const count=await tx.batchEnrollment.count({where:{batchId:target.id,active:true}});
   if(count>=target.capacity)throw new Error("Target batch is full.");
   const pricing=calculateCoursePricing(target.course);
   const feeAfter=Number(pricing.finalFee);
   const paid=Number(current.feeLedger.paidAmount);
   const newEnrollment=await tx.batchEnrollment.create({data:{studentId:d.studentId,batchId:target.id,active:true}});
   const newLedger=await tx.feeLedger.create({data:{studentId:d.studentId,batchEnrollmentId:newEnrollment.id,courseFee:Number(pricing.baseFee),discountAmount:Number(pricing.discountAmount),discountTypeAtAdmission:pricing.hasDiscount?pricing.discountType:null,discountValueAtAdmission:pricing.hasDiscount?pricing.discountValue:null,admissionFeeAtAdmission:Number(target.course.admissionFee||0),finalAmount:feeAfter,paidAmount:0,balanceAmount:feeAfter,status:"PENDING"}});
   await tx.batchEnrollment.update({where:{id:current.id},data:{active:false,leftAt:new Date()}});
   const change=await tx.courseChange.create({data:{studentId:d.studentId,fromEnrollmentId:current.id,toEnrollmentId:newEnrollment.id,fromCourseId:current.batch.courseId,toCourseId:target.courseId,fromBatchId:current.batchId,toBatchId:target.id,reason:d.reason,feeBefore:Number(current.feeLedger.finalAmount),feeAfter,adjustmentAmount:feeAfter-paid,approvedByUserId:user.id}});
   await tx.auditLog.create({data:{actorUserId:user.id,action:"STUDENT_COURSE_CHANGED",entityType:"CourseChange",entityId:change.id,metadata:{studentId:d.studentId,fromCourseId:current.batch.courseId,toCourseId:target.courseId,oldPaidAmount:paid,newFee:feeAfter,newLedgerId:newLedger.id,reason:d.reason}}});
   return {change,newEnrollment,newLedger};
  });
  return NextResponse.json({success:true,...result},{status:201});
 }catch(e){return NextResponse.json({error:e?.message||"Unable to change course."},{status:400});}
}
