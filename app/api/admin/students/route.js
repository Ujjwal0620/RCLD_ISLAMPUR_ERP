import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

const schema=z.object({
  name:z.string().trim().min(2).max(120),
  phone:z.string().trim().max(30).optional().or(z.literal("")),
  email:z.string().trim().email().max(160).optional().or(z.literal("")),
  studentType:z.enum(["OFFLINE","ONLINE"]).default("OFFLINE"),
  status:z.enum(["ACTIVE","COMPLETED","TRANSFERRED","DROPPED_OUT","SUSPENDED","CANCELLED"]).default("ACTIVE")
});

function clean(v){return v===""?null:v;}

export async function GET(request){
  const user=await getCurrentUser();
  if(!user||!hasPermission(user,"students.view")) return NextResponse.json({error:"Forbidden"},{status:403});
  const {searchParams}=new URL(request.url);
  const q=(searchParams.get("q")||"").trim();
  const type=searchParams.get("type");
  const status=searchParams.get("status");
  const where={
    ...(q?{OR:[{name:{contains:q,mode:"insensitive"}},{phone:{contains:q,mode:"insensitive"}},{email:{contains:q,mode:"insensitive"}},{registrationNo:{contains:q,mode:"insensitive"}}]}:{}),
    ...(type&&["OFFLINE","ONLINE"].includes(type)?{studentType:type}:{}),
    ...(status?{status}:{}),
  };
  const students=await db.student.findMany({
    where, orderBy:{createdAt:"desc"}, take:100,
    include:{_count:{select:{enrollments:true,onlineEnrollments:true}}}
  });
  return NextResponse.json({students});
}

export async function POST(request){
  const user=await getCurrentUser();
  if(!user||!hasPermission(user,"students.manage")) return NextResponse.json({error:"Forbidden"},{status:403});
  try{
    const data=schema.parse(await request.json());
    const registrationNo="RCLD-"+new Date().getFullYear()+"-"+String(Date.now()).slice(-6);
    const student=await db.student.create({data:{
      registrationNo,name:data.name,phone:clean(data.phone),email:clean(data.email),
      studentType:data.studentType,status:data.status
    }});
    await db.auditLog.create({data:{actorUserId:user.id,action:"STUDENT_CREATED",entityType:"Student",entityId:student.id,metadata:{registrationNo:student.registrationNo}}});
    return NextResponse.json({student},{status:201});
  }catch(error){
    if(error?.code==="P2002") return NextResponse.json({error:"Registration number or unique contact already exists."},{status:409});
    if(error?.name==="ZodError") return NextResponse.json({error:error.issues?.[0]?.message||"Invalid student data."},{status:400});
    return NextResponse.json({error:"Unable to create student."},{status:500});
  }
}