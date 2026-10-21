import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { db } from "@/lib/db";

const schema=z.object({title:z.string().min(2).max(200),description:z.string().max(2000).optional(),sortOrder:z.coerce.number().int().min(0).default(0),published:z.boolean().default(true)});

export async function POST(request,{params}){
 const user=await getCurrentUser();
 if(!user||!hasPermission(user,"lms.manage")) return NextResponse.json({error:"Forbidden"},{status:403});
 const {code}=await params;
 const data=schema.safeParse(await request.json());
 if(!data.success)return NextResponse.json({error:"Invalid module data"},{status:400});
 const course=await db.course.findUnique({where:{code:code.toUpperCase()}});
 if(!course)return NextResponse.json({error:"Course not found"},{status:404});
 const module=await db.courseModule.create({data:{courseId:course.id,...data.data}});
 await db.auditLog.create({data:{actorUserId:user.id,action:"CREATE",entityType:"CourseModule",entityId:module.id,metadata:{course:course.code}}});
 return NextResponse.json({module});
}
