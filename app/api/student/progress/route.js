import { NextResponse } from "next/server";
import { getCurrentStudent } from "@/lib/student-auth";
import { db } from "@/lib/db";

export async function POST(request){
 const student=await getCurrentStudent();
 if(!student)return NextResponse.json({error:"Login required"},{status:401});
 const body=await request.json();
 if(!body.lessonId)return NextResponse.json({error:"lessonId is required"},{status:400});
 const lesson=await db.lesson.findUnique({where:{id:body.lessonId}});
 if(!lesson)return NextResponse.json({error:"Lesson not found"},{status:404});
 const module=await db.courseModule.findUnique({where:{id:lesson.moduleId}});
 if(!module)return NextResponse.json({error:"Module not found"},{status:404});
 if(!student.onlineEnrollments.some(e=>e.courseId===module.courseId))return NextResponse.json({error:"Course enrollment required"},{status:403});
 const completed=Boolean(body.completed);
 const progress=await db.lessonProgress.upsert({where:{studentId_lessonId:{studentId:student.id,lessonId:lesson.id}},update:{completed,completedAt:completed?new Date():null},create:{studentId:student.id,lessonId:lesson.id,completed,completedAt:completed?new Date():null}});
 return NextResponse.json({progress});
}