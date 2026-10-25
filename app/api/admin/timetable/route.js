import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
const baseSchema=z.object({batchSeriesId:z.string(),subjectId:z.string().optional().or(z.literal("")),employeeId:z.string().optional().or(z.literal("")),dayOfWeek:z.coerce.number().int().min(1).max(7),startTime:z.string().regex(/^([01]\\d|2[0-3]):[0-5]\\d$/),endTime:z.string().regex(/^([01]\\d|2[0-3]):[0-5]\\d$/),room:z.string().trim().max(80).optional().or(z.literal(""))});
const schema=baseSchema.refine(d=>d.startTime<d.endTime,{message:"End time must be after start time.",path:["endTime"]});
const overlaps=(s,e)=>({startTime:{lt:e},endTime:{gt:s}});
export async function POST(req){
 const user=await getCurrentUser(); if(!user||!hasPermission(user,"batches.manage")) return NextResponse.json({error:"Forbidden"},{status:403});
 try{
  const d=schema.parse(await req.json());
  const series=await db.batchSeries.findUnique({where:{id:d.batchSeriesId},include:{batch:{select:{id:true,courseId:true}}}});
  if(!series)return NextResponse.json({error:"Batch series not found."},{status:404});
  let requiredSkillIds=[];if(d.subjectId){const subject=await db.subject.findUnique({where:{id:d.subjectId},select:{courseId:true,requiredSkills:{select:{skillId:true}}}});if(!subject||subject.courseId!==series.batch.courseId)return NextResponse.json({error:"Subject must belong to the batch course."},{status:400});requiredSkillIds=subject.requiredSkills.map(x=>x.skillId);}
  if(d.employeeId){
   const employee=await db.employee.findUnique({where:{id:d.employeeId},select:{id:true,user:{select:{status:true}},skills:{select:{skillId:true}}}});
   if(!employee||employee.user.status!=="ACTIVE")return NextResponse.json({error:"Select an active employee."},{status:400});const employeeSkills=new Set(employee.skills.map(x=>x.skillId));if(requiredSkillIds.some(id=>!employeeSkills.has(id)))return NextResponse.json({error:"Selected faculty does not have all skills required for this subject."},{status:400});
   const facultyConflict=await db.batchSchedule.findFirst({where:{employeeId:d.employeeId,dayOfWeek:d.dayOfWeek,active:true,...overlaps(d.startTime,d.endTime)}});
   if(facultyConflict)return NextResponse.json({error:"Faculty schedule conflict detected for this time."},{status:409});
  }
  if(d.room){const roomConflict=await db.batchSchedule.findFirst({where:{room:{equals:d.room,mode:"insensitive"},dayOfWeek:d.dayOfWeek,active:true,...overlaps(d.startTime,d.endTime)}});if(roomConflict)return NextResponse.json({error:"Room/Lab is already occupied at this time."},{status:409});}
  const seriesConflict=await db.batchSchedule.findFirst({where:{batchSeriesId:d.batchSeriesId,dayOfWeek:d.dayOfWeek,active:true,...overlaps(d.startTime,d.endTime)}});
  if(seriesConflict)return NextResponse.json({error:"This batch series already has a class at this time."},{status:409});
  const schedule=await db.batchSchedule.create({data:{batchSeriesId:d.batchSeriesId,subjectId:d.subjectId||null,employeeId:d.employeeId||null,dayOfWeek:d.dayOfWeek,startTime:d.startTime,endTime:d.endTime,room:d.room||null}});
  await db.auditLog.create({data:{actorUserId:user.id,action:"TIMETABLE_CREATED",entityType:"BatchSchedule",entityId:schedule.id,metadata:{batchSeriesId:d.batchSeriesId,dayOfWeek:d.dayOfWeek,startTime:d.startTime,endTime:d.endTime,room:d.room||null}}});
  return NextResponse.json({schedule},{status:201});
 }catch(e){return NextResponse.json({error:e?.issues?.[0]?.message||"Unable to create timetable entry."},{status:400});}
}
const patchSchema=baseSchema.extend({scheduleId:z.string(),reason:z.string().trim().min(2).max(500)}).refine(d=>d.startTime<d.endTime,{message:"End time must be after start time.",path:["endTime"]});
export async function PATCH(req){
 const user=await getCurrentUser();if(!user||!hasPermission(user,"batches.manage"))return NextResponse.json({error:"Forbidden"},{status:403});
 try{const d=patchSchema.parse(await req.json());const old=await db.batchSchedule.findUnique({where:{id:d.scheduleId}});if(!old)return NextResponse.json({error:"Schedule not found."},{status:404});
 const conflict=await db.batchSchedule.findFirst({where:{id:{not:d.scheduleId},batchSeriesId:d.batchSeriesId,dayOfWeek:d.dayOfWeek,active:true,startTime:{lt:d.endTime},endTime:{gt:d.startTime}}});if(conflict)return NextResponse.json({error:"Batch series schedule conflict detected."},{status:409});
 if(d.employeeId){const fc=await db.batchSchedule.findFirst({where:{id:{not:d.scheduleId},employeeId:d.employeeId,dayOfWeek:d.dayOfWeek,active:true,startTime:{lt:d.endTime},endTime:{gt:d.startTime}}});if(fc)return NextResponse.json({error:"Faculty schedule conflict detected."},{status:409});}
 if(d.room){const rc=await db.batchSchedule.findFirst({where:{id:{not:d.scheduleId},room:{equals:d.room,mode:"insensitive"},dayOfWeek:d.dayOfWeek,active:true,startTime:{lt:d.endTime},endTime:{gt:d.startTime}}});if(rc)return NextResponse.json({error:"Room/Lab conflict detected."},{status:409});}
 const next={batchSeriesId:d.batchSeriesId,subjectId:d.subjectId||null,employeeId:d.employeeId||null,dayOfWeek:d.dayOfWeek,startTime:d.startTime,endTime:d.endTime,room:d.room||null};
 const updated=await db.$transaction(async tx=>{const row=await tx.batchSchedule.update({where:{id:d.scheduleId},data:next});await tx.batchScheduleHistory.create({data:{scheduleId:d.scheduleId,action:"RESCHEDULED",previousData:old,newData:next,reason:d.reason,changedByUserId:user.id}});return row;});
 await db.auditLog.create({data:{actorUserId:user.id,action:"TIMETABLE_RESCHEDULED",entityType:"BatchSchedule",entityId:d.scheduleId,metadata:{reason:d.reason}}});return NextResponse.json({schedule:updated});
 }catch(e){return NextResponse.json({error:e?.issues?.[0]?.message||"Unable to reschedule class."},{status:400});}
}