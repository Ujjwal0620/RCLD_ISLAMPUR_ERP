import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentStudent } from "@/lib/student-auth";
import { createPhonePeCheckout, getPaymentProvider, isPaymentConfigured } from "@/lib/payments";

export async function POST(request){
 try{
  const student=await getCurrentStudent();
  if(!student) return NextResponse.json({error:"Please log in as an online student first."},{status:401});
  const body=await request.json().catch(()=>({}));
  if(!body.enrollmentId) return NextResponse.json({error:"Enrollment ID is required."},{status:400});
  const enrollment=await db.onlineEnrollment.findFirst({where:{id:body.enrollmentId,studentId:student.id},include:{course:true}});
  if(!enrollment) return NextResponse.json({error:"Enrollment not found."},{status:404});
  if(enrollment.status==="ACTIVE"&&enrollment.paymentStatus==="PAID") return NextResponse.json({ok:true,alreadyPaid:true,redirectUrl:"/student/dashboard"});
  if(getPaymentProvider()!=="phonepe") return NextResponse.json({error:"Selected payment provider is not enabled yet."},{status:503});
  if(!isPaymentConfigured()) return NextResponse.json({error:"PhonePe payment credentials are not configured."},{status:503});
  const amount=Number(enrollment.course.onlineFee||enrollment.paidAmount||0);
  const amountPaise=Math.round(amount*100);
  if(!Number.isFinite(amountPaise)||amountPaise<100) return NextResponse.json({error:"This course does not have a valid online fee."},{status:400});
  const merchantOrderId=("RCLD-"+enrollment.id+"-"+randomUUID().slice(0,8)).slice(0,63);
  const base=(process.env.NEXT_PUBLIC_APP_URL||new URL(request.url).origin).replace(/\/$/,"");
  const response=await createPhonePeCheckout({merchantOrderId,amountPaise,redirectUrl:base+"/student/payment/return?enrollment="+encodeURIComponent(enrollment.id)+"&order="+encodeURIComponent(merchantOrderId)});
  if(!response?.redirectUrl) throw new Error("PhonePe did not return a checkout URL.");
  return NextResponse.json({ok:true,provider:"phonepe",merchantOrderId,redirectUrl:response.redirectUrl});
 }catch(error){console.error("student checkout error",error);return NextResponse.json({error:"Unable to start secure checkout right now."},{status:500});}
}
