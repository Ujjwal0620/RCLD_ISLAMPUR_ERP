import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

const schema=z.object({installmentId:z.string(),lateFee:z.coerce.number().nonnegative(),gracePeriodDays:z.coerce.number().int().min(0).max(365).default(0),waiveAmount:z.coerce.number().nonnegative().default(0),waiverReason:z.string().trim().max(300).optional().or(z.literal(""))});

export async function POST(req){
 const user=await getCurrentUser();
 if(!user||!hasPermission(user,"fees.manage"))return NextResponse.json({error:"Forbidden"},{status:403});
 try{
  const d=schema.parse(await req.json());
  if(d.waiveAmount>0&&!d.waiverReason)throw new Error("Waiver reason is required.");
  if(d.waiveAmount>d.lateFee)throw new Error("Waiver cannot exceed the late fee.");
  const installment=await db.feeInstallment.update({where:{id:d.installmentId},data:{lateFee:d.lateFee,gracePeriodDays:d.gracePeriodDays,lateFeeWaived:d.waiveAmount,lateFeeWaiverReason:d.waiveAmount?d.waiverReason:null,lateFeeWaivedById:d.waiveAmount?user.id:null,lateFeeWaivedAt:d.waiveAmount?new Date():null}});
  await db.auditLog.create({data:{actorUserId:user.id,action:d.waiveAmount?"INSTALLMENT_LATE_FEE_WAIVED":"INSTALLMENT_LATE_FEE_CONFIGURED",entityType:"FeeInstallment",entityId:installment.id,metadata:{lateFee:d.lateFee,gracePeriodDays:d.gracePeriodDays,waiveAmount:d.waiveAmount,waiverReason:d.waiverReason||null}}});
  return NextResponse.json({success:true,installment});
 }catch(e){return NextResponse.json({error:e?.message||"Unable to update late fee."},{status:400});}
}
