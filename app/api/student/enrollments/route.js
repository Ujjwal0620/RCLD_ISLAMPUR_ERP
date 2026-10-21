import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentStudent } from "@/lib/student-auth";

export async function GET(){
  try{
    const student=await getCurrentStudent();
    if(!student) return NextResponse.json({error:"Please log in as an online student first."},{status:401});
    const enrollments=await db.onlineEnrollment.findMany({where:{studentId:student.id},include:{course:{select:{code:true,name:true,onlineFee:true}}},orderBy:{enrolledAt:"desc"}});
    return NextResponse.json({ok:true,enrollments:enrollments.map(e=>({id:e.id,status:e.status,paymentStatus:e.paymentStatus,amount:e.paidAmount?.toString()||null,enrolledAt:e.enrolledAt,course:e.course}))});
  }catch(error){console.error("student enrollments error",error);return NextResponse.json({error:"Unable to load enrollments right now."},{status:500});}
}
