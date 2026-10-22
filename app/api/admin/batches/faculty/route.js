import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

const schema=z.object({batchId:z.string(),employeeId:z.string(),action:z.enum(["ASSIGN","REMOVE"])}); 

export async function POST(req){
  const user=await getCurrentUser();
  if(!user||!hasPermission(user,"batches.manage")) return NextResponse.json({error:"Forbidden"},{status:403});
  try{
    const d=schema.parse(await req.json());
    const result=await db.$transaction(async tx=>{
      const batch=await tx.batch.findUnique({where:{id:d.batchId},select:{id:true,name:true}});
      const employee=await tx.employee.findUnique({where:{id:d.employeeId},select:{id:true,user:{select:{name:true,status:true}}}});
      if(!batch) throw new Error("Batch not found.");
      if(!employee) throw new Error("Employee not found.");
      if(employee.user.status!=="ACTIVE") throw new Error("Only active employees can be assigned.");
      if(d.action==="ASSIGN"){
        return tx.batchFaculty.upsert({where:{batchId_employeeId:{batchId:d.batchId,employeeId:d.employeeId}},update:{},create:{batchId:d.batchId,employeeId:d.employeeId}});
      }
      await tx.batchFaculty.deleteMany({where:{batchId:d.batchId,employeeId:d.employeeId}});
      return {removed:true};
    });
    await db.auditLog.create({data:{actorUserId:user.id,action:d.action==="ASSIGN"?"BATCH_FACULTY_ASSIGNED":"BATCH_FACULTY_REMOVED",entityType:"Batch",entityId:d.batchId,metadata:{employeeId:d.employeeId}}});
    return NextResponse.json({result});
  }catch(e){return NextResponse.json({error:e?.message||"Unable to update faculty assignment."},{status:400});}
}
