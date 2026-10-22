import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

const schema=z.object({feeLedgerId:z.string(),amount:z.coerce.number().positive(),method:z.enum(["CASH","UPI","BANK_TRANSFER","CARD","PHONEPE","RAZORPAY","OTHER"]),reference:z.string().trim().max(120).optional().or(z.literal("")),installmentId:z.string().optional().or(z.literal(""))});

export async function POST(req){
 const user=await getCurrentUser();
 if(!user||!hasPermission(user,"fees.manage")) return NextResponse.json({error:"Forbidden"},{status:403});
 try{
  const d=schema.parse(await req.json());
  const result=await db.$transaction(async tx=>{
   const ledger=await tx.feeLedger.findUnique({where:{id:d.feeLedgerId},include:{installments:true}});
   if(!ledger) throw new Error("Fee ledger not found.");
   const balance=Number(ledger.balanceAmount);
   if(d.amount>balance) throw new Error("Payment exceeds the outstanding balance.");
   const payment=await tx.feePayment.create({data:{feeLedgerId:ledger.id,installmentId:d.installmentId||null,amount:d.amount,method:d.method,reference:d.reference||null,status:"PAID",paidAt:new Date()}});
   const paid=Number(ledger.paidAmount)+d.amount;
   const remaining=Math.max(0,Number(ledger.finalAmount)-paid);
   const status=remaining===0?"PAID":"PARTIAL";
   await tx.feeLedger.update({where:{id:ledger.id},data:{paidAmount:paid,balanceAmount:remaining,status}});
   if(d.installmentId){
    const inst=ledger.installments.find(x=>x.id===d.installmentId);
    if(!inst) throw new Error("Installment not found.");
    const instPaid=Number(inst.paidAmount)+d.amount;
    await tx.feeInstallment.update({where:{id:inst.id},data:{paidAmount:instPaid,status:instPaid>=Number(inst.amount)?"PAID":"PARTIAL"}});
   }
   await tx.auditLog.create({data:{actorUserId:user.id,action:"FEE_PAYMENT_RECORDED",entityType:"FeeLedger",entityId:ledger.id,metadata:{amount:d.amount,method:d.method,reference:d.reference||null}}});
   return payment;
  });
  return NextResponse.json({payment},{status:201});
 }catch(e){return NextResponse.json({error:e?.message||"Unable to record payment."},{status:400});}
}