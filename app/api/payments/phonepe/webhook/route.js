import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validatePhonePeCallback } from "@/lib/payments";

export async function POST(request){
 try{
  const raw=await request.text();
  const callback=validatePhonePeCallback(request.headers.get("authorization"),raw);
  const type=String(callback?.type||"");
  const payload=callback?.payload||{};
  const merchantOrderId=payload.originalMerchantOrderId;
  if(!merchantOrderId||!merchantOrderId.startsWith("RCLD-")) return NextResponse.json({ok:true});
  const enrollmentId=merchantOrderId.slice(5).split("-").slice(0,-1).join("-");
  const enrollment=await db.onlineEnrollment.findUnique({where:{id:enrollmentId}});
  if(!enrollment) return NextResponse.json({ok:true});
  if(type==="CHECKOUT_ORDER_COMPLETED"||String(payload.state).toUpperCase()==="COMPLETED"){
   await db.onlineEnrollment.update({where:{id:enrollment.id},data:{status:"ACTIVE",paymentStatus:"PAID"}});
  }else if(type==="CHECKOUT_ORDER_FAILED"||String(payload.state).toUpperCase()==="FAILED"){
   await db.onlineEnrollment.update({where:{id:enrollment.id},data:{status:"PENDING",paymentStatus:"FAILED"}});
  }
  return NextResponse.json({ok:true});
 }catch(error){console.error("PhonePe webhook verification failed",error);return NextResponse.json({error:"Invalid callback."},{status:401});}
}
