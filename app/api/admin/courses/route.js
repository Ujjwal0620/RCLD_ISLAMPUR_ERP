import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

const schema=z.object({
 code:z.string().trim().min(2).max(30),
 name:z.string().trim().min(2).max(120),
 duration:z.string().trim().max(80).optional(),
 eligibility:z.string().trim().max(300).optional(),
 standardFee:z.coerce.number().nonnegative().optional(),
 onlineFee:z.coerce.number().nonnegative().optional()
});

export async function POST(req){
 const user=await getCurrentUser();
 if(!user||!hasPermission(user,"courses.manage")) return NextResponse.json({error:"Forbidden"},{status:403});
 try{
  const b=await schema.parseAsync(await req.json());
  const course=await db.course.create({data:{code:b.code.toUpperCase(),name:b.name,duration:b.duration||null,eligibility:b.eligibility||null,standardFee:b.standardFee??null,onlineFee:b.onlineFee??null}});
  await db.auditLog.create({data:{actorUserId:user.id,action:"COURSE_CREATED",entityType:"Course",entityId:course.id,metadata:{code:course.code}}});
  return NextResponse.json({id:course.id});
 }catch(e){return NextResponse.json({error:e?.code==="P2002"?"Course code already exists":"Invalid course data"},{status:400});}
}