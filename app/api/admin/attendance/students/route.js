import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

const schema=z.object({
 batchId:z.string(),
 attendanceDate:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
 records:z.array(z.object({studentId:z.string(),status:z.enum(["PRESENT","ABSENT","LATE","EXCUSED"]),note:z.string().trim().max(200).optional().or(z.literal(""))})).min(1)
});

export async function GET(req){
 const user=await getCurrentUser();
 if(!user||!hasPermission(user,"students.view")) return NextResponse.json({error:"Forbidden"},{status:403});
 const {searchParams}=new URL(req.url); const batchId=searchParams.get("batchId"); const date=searchParams.get("date");
 if(!batchId||!date) return NextResponse.json({error:"batchId and date are required."},{status:400});
 const rows=await db.studentAttendance.findMany({where:{batchId,attendanceDate:new Date(date+"T00:00:00.000Z")},select:{studentId:true,status:true,note:true}});
 return NextResponse.json({records:rows});
}

export async function POST(req){
 const user=await getCurrentUser();
 if(!user||!hasPermission(user,"students.manage")) return NextResponse.json({error:"Forbidden"},{status:403});
 try{
  const d=schema.parse(await req.json()); const date=new Date(d.attendanceDate+"T00:00:00.000Z");
  const enrollmentIds=await db.batchEnrollment.findMany({where:{batchId:d.batchId,active:true},select:{studentId:true}});
  const allowed=new Set(enrollmentIds.map(x=>x.studentId));
  if(d.records.some(x=>!allowed.has(x.studentId))) throw new Error("Attendance contains a learner not enrolled in this batch.");
  await db.$transaction(async tx=>{
   for(const record of d.records){
    await tx.studentAttendance.upsert({
     where:{batchId_studentId_attendanceDate:{batchId:d.batchId,studentId:record.studentId,attendanceDate:date}},
     update:{status:record.status,note:record.note||null,recordedById:user.id},
     create:{batchId:d.batchId,studentId:record.studentId,attendanceDate:date,status:record.status,note:record.note||null,recordedById:user.id}
    });
   }
   await tx.auditLog.create({data:{actorUserId:user.id,action:"STUDENT_ATTENDANCE_SAVED",entityType:"Batch",entityId:d.batchId,metadata:{date:d.attendanceDate,count:d.records.length}}});
  });
  return NextResponse.json({success:true,count:d.records.length});
 }catch(e){return NextResponse.json({error:e?.message||"Unable to save attendance."},{status:400});}
}
