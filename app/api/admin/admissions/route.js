import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

const schema=z.object({
 studentId:z.string().optional(),
 name:z.string().trim().min(2).max(120).optional(),
 phone:z.string().trim().max(30).optional().or(z.literal("")),
 email:z.string().trim().email().max(160).optional().or(z.literal("")),
 courseId:z.string().min(1),
 batchId:z.string().min(1),
 courseFee:z.coerce.number().nonnegative(),
 discountAmount:z.coerce.number().nonnegative().default(0),
 installmentCount:z.coerce.number().int().min(1).max(12).default(1),
 firstDueDate:z.string().optional().or(z.literal(""))
});

export async function POST(req){
 const user=await getCurrentUser();
 if(!user||!hasPermission(user,"students.manage")) return NextResponse.json({error:"Forbidden"},{status:403});
 try{
  const d=schema.parse(await req.json());
  const isSuperadmin=user.userRoles?.some(a=>a.role.name==="SUPERADMIN");
  if(d.discountAmount>0 && !isSuperadmin) return NextResponse.json({error:"Only Superadmin can apply admission discounts."},{status:403});
  const result=await db.$transaction(async tx=>{
   let student;
   if(d.studentId) student=await tx.student.findUnique({where:{id:d.studentId}});
   else {
    if(!d.name) throw new Error("Student name is required.");
    const registrationNo="RCLD-"+new Date().getFullYear()+"-"+String(Date.now()).slice(-6);
    student=await tx.student.create({data:{registrationNo,name:d.name,phone:d.phone||null,email:d.email||null,studentType:"OFFLINE",status:"ACTIVE"}});
   }
   if(!student) throw new Error("Student not found.");
   const batch=await tx.batch.findUnique({where:{id:d.batchId},include:{course:{select:{id:true,standardFee:true}}}});
   if(!batch||batch.courseId!==d.courseId) throw new Error("Selected batch and course do not match.");
   if(batch.status==="CANCELLED"||batch.status==="COMPLETED") throw new Error("This batch is not accepting admissions.");
   const current=await tx.batchEnrollment.count({where:{batchId:d.batchId,active:true}});
   if(current>=batch.capacity) throw new Error("Batch capacity is full.");
   const finalAmount=Math.max(0,d.courseFee-d.discountAmount);
   if(d.discountAmount>d.courseFee) throw new Error("Discount cannot exceed course fee.");
   const enrollment=await tx.batchEnrollment.create({data:{studentId:student.id,batchId:d.batchId}});
   const per=Math.round((finalAmount/d.installmentCount)*100)/100;
   const installments=Array.from({length:d.installmentCount},(_,i)=>{
    const amount=i===d.installmentCount-1?Math.round((finalAmount-per*(d.installmentCount-1))*100)/100:per;
    const date=d.firstDueDate?new Date(d.firstDueDate):new Date();
    date.setMonth(date.getMonth()+i);
    return {installmentNo:i+1,dueDate:date,amount};
   });
   const ledger=await tx.feeLedger.create({data:{studentId:student.id,batchEnrollmentId:enrollment.id,courseFee:d.courseFee,discountAmount:d.discountAmount,finalAmount,paidAmount:0,balanceAmount:finalAmount,installments:{create:installments}}});
   await tx.auditLog.create({data:{actorUserId:user.id,action:"ADMISSION_CREATED",entityType:"BatchEnrollment",entityId:enrollment.id,metadata:{studentId:student.id,batchId:d.batchId,feeLedgerId:ledger.id,finalAmount}}});
   return {student,enrollment,ledger};
  });
  return NextResponse.json(result,{status:201});
 }catch(e){return NextResponse.json({error:e?.message||"Unable to complete admission."},{status:e?.code==="P2002"?409:400});}
}