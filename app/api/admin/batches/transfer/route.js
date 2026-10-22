import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

const schema=z.object({batchEnrollmentId:z.string(),toBatchId:z.string(),reason:z.string().trim().max(300).optional().or(z.literal(""))});

export async function POST(req){
  const user=await getCurrentUser();
  if(!user||!hasPermission(user,"batches.manage")) return NextResponse.json({error:"Forbidden"},{status:403});
  try{
    const d=schema.parse(await req.json());
    const result=await db.$transaction(async tx=>{
      const enrollment=await tx.batchEnrollment.findUnique({where:{id:d.batchEnrollmentId},include:{batch:true,student:true}});
      if(!enrollment) throw new Error("Batch enrollment not found.");
      if(!enrollment.active) throw new Error("This enrollment is no longer active.");
      if(enrollment.batchId===d.toBatchId) throw new Error("Choose a different batch.");
      const target=await tx.batch.findUnique({where:{id:d.toBatchId},include:{_count:{select:{enrollments:true}}}});
      if(!target) throw new Error("Target batch not found.");
      if(target.status==="COMPLETED"||target.status==="CANCELLED") throw new Error("Target batch is not available.");
      if(target._count.enrollments>=target.capacity) throw new Error("Target batch is full.");
      const updated=await tx.batchEnrollment.update({where:{id:enrollment.id},data:{batchId:target.id}});
      const transfer=await tx.batchTransfer.create({data:{batchEnrollmentId:enrollment.id,fromBatchId:enrollment.batchId,toBatchId:target.id,reason:d.reason||null,actorUserId:user.id}});
      return {updated,transfer,student:enrollment.student.name,fromBatch:enrollment.batch.name,toBatch:target.name};
    });
    await db.auditLog.create({data:{actorUserId:user.id,action:"BATCH_TRANSFERRED",entityType:"BatchEnrollment",entityId:d.batchEnrollmentId,metadata:{toBatchId:d.toBatchId,reason:d.reason||null}}});
    return NextResponse.json({result});
  }catch(e){return NextResponse.json({error:e?.message||"Unable to transfer student."},{status:400});}
}
