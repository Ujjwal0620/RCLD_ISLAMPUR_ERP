import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

const schema=z.object({
  name:z.string().trim().min(2).max(120),
  phone:z.string().trim().max(30).optional().or(z.literal("")),
  email:z.string().trim().email().max(160).optional().or(z.literal("")),
  studentType:z.enum(["OFFLINE","ONLINE"]),
  status:z.enum(["ACTIVE","COMPLETED","TRANSFERRED","DROPPED_OUT","SUSPENDED","CANCELLED"])
});
const clean=v=>v===""?null:v;

export async function PATCH(request,{params}){
  const user=await getCurrentUser();
  if(!user||!hasPermission(user,"students.manage")) return NextResponse.json({error:"Forbidden"},{status:403});
  try{
    const data=schema.parse(await request.json());
    const student=await db.student.update({where:{id:params.id},data:{name:data.name,phone:clean(data.phone),email:clean(data.email),studentType:data.studentType,status:data.status}});
    await db.auditLog.create({data:{actorUserId:user.id,action:"STUDENT_UPDATED",entityType:"Student",entityId:student.id,metadata:{status:student.status,studentType:student.studentType}}});
    return NextResponse.json({student});
  }catch(error){
    if(error?.code==="P2025") return NextResponse.json({error:"Student not found."},{status:404});
    if(error?.name==="ZodError") return NextResponse.json({error:error.issues?.[0]?.message||"Invalid student data."},{status:400});
    return NextResponse.json({error:"Unable to update student."},{status:500});
  }
}