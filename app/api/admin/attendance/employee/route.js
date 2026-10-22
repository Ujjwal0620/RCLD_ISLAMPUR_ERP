import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { storageConfigured, uploadObject } from "@/lib/storage";

const metaSchema=z.object({
 employeeId:z.string().optional(),
 action:z.enum(["CHECK_IN","CHECK_OUT","SET_STATUS","ADD_BREAK"]),
 status:z.enum(["PRESENT","ABSENT","LATE","HALF_DAY","ON_LEAVE"]).optional(),
 locationEvidence:z.string().trim().max(300).optional().or(z.literal("")),
 breakMinutes:z.coerce.number().int().min(0).max(1440).optional(),
 note:z.string().trim().max(500).optional().or(z.literal(""))
});

function dayStart(value){ return new Date(value+"T00:00:00.000Z"); }
function today(){ return new Date().toISOString().slice(0,10); }

export async function GET(req){
 const user=await getCurrentUser();
 if(!user||!hasPermission(user,"employees.view")) return NextResponse.json({error:"Forbidden"},{status:403});
 const q=new URL(req.url).searchParams;
 const date=q.get("date")||today();
 const employeeId=q.get("employeeId");
 const self=await db.employee.findUnique({where:{userId:user.id},select:{id:true}});
 const target=hasPermission(user,"employees.manage")&&employeeId?employeeId:self?.id;
 if(!target) return NextResponse.json({error:"No employee profile is linked to this account."},{status:400});
 const rows=await db.employeeAttendance.findMany({where:{employeeId:target},orderBy:{attendanceDate:"desc"},take:31});
 const selected=rows.find(x=>x.attendanceDate.getTime()===dayStart(date).getTime())||null;
 return NextResponse.json({employeeId:target,selected,history:rows});
}

export async function POST(req){
 const user=await getCurrentUser();
 if(!user||!hasPermission(user,"employees.view")) return NextResponse.json({error:"Forbidden"},{status:403});
 try{
  const form=await req.formData();
  const meta=metaSchema.parse({
   employeeId:form.get("employeeId")||undefined,
   action:form.get("action"),
   status:form.get("status")||undefined,
   locationEvidence:form.get("locationEvidence")||"",
   breakMinutes:form.get("breakMinutes")||undefined,
   note:form.get("note")||""
  });
  const self=await db.employee.findUnique({where:{userId:user.id},select:{id:true,user:{select:{status:true}}}});
  const employeeId=hasPermission(user,"employees.manage")&&meta.employeeId?meta.employeeId:self?.id;
  if(!employeeId) throw new Error("No employee profile is linked to this account.");
  if(self?.user.status!=="ACTIVE"&&!hasPermission(user,"employees.manage")) throw new Error("Employee account is not active.");
  const date=form.get("date")?.toString()||today();
  const attendanceDate=dayStart(date);
  let imageEvidenceUrl;
  const file=form.get("image");
  if(file&&typeof file!=="string"&&file.size>0){
   if(!storageConfigured) throw new Error("Evidence storage is not configured. Configure Neon Object Storage before uploading attendance images.");
   if(file.size>5*1024*1024) throw new Error("Attendance image must be 5 MB or smaller.");
   if(!String(file.type).startsWith("image/")) throw new Error("Only image evidence is allowed.");
   const ext=String(file.type).split("/")[1]?.replace("jpeg","jpg")||"bin";
   const key="attendance/"+employeeId+"/"+date+"-"+randomUUID()+"."+ext;
   imageEvidenceUrl=await uploadObject({key,body:Buffer.from(await file.arrayBuffer()),contentType:file.type});
  }
  const existing=await db.employeeAttendance.findUnique({where:{employeeId_attendanceDate:{employeeId,attendanceDate}}});
  const data={};
  if(meta.locationEvidence) data.locationEvidence=meta.locationEvidence;
  if(meta.note!==undefined) data.note=meta.note||null;
  if(imageEvidenceUrl) data.imageEvidenceUrl=imageEvidenceUrl;
  if(meta.action==="CHECK_IN"){
   if(existing?.checkIn) throw new Error("Check-in is already recorded for this date.");
   data.checkIn=new Date();
   data.status=meta.status||"PRESENT";
  }else if(meta.action==="CHECK_OUT"){
   if(!existing?.checkIn) throw new Error("Check-in must be recorded before check-out.");
   if(existing.checkOut) throw new Error("Check-out is already recorded for this date.");
   data.checkOut=new Date();
  }else if(meta.action==="SET_STATUS"){
   data.status=meta.status;
  }else if(meta.action==="ADD_BREAK"){
   data.breakMinutes=(existing?.breakMinutes||0)+(meta.breakMinutes||0);
  }
  const record=existing
   ? await db.employeeAttendance.update({where:{id:existing.id},data})
   : await db.employeeAttendance.create({data:{employeeId,attendanceDate,status:meta.status||"PRESENT",...data}});
  await db.auditLog.create({data:{actorUserId:user.id,action:"EMPLOYEE_ATTENDANCE_"+meta.action,entityType:"EmployeeAttendance",entityId:record.id,metadata:{employeeId,date,locationEvidence:Boolean(meta.locationEvidence),imageEvidence:Boolean(imageEvidenceUrl)}}});
  return NextResponse.json({success:true,record});
 }catch(e){return NextResponse.json({error:e?.message||"Unable to save employee attendance."},{status:400});}
}
