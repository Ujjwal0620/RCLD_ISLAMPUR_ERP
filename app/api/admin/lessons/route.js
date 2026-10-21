import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { db } from "@/lib/db";
import { getYouTubeVideoId } from "@/lib/youtube";

const schema=z.object({
 moduleId:z.string().min(1),
 title:z.string().min(2).max(200),
 description:z.string().max(3000).optional(),
 videoUrl:z.string().max(1000).optional(),
 videoProvider:z.enum(["youtube"]).default("youtube"),
 resourceUrl:z.string().max(1000).optional(),
 durationMinutes:z.coerce.number().int().min(0).max(10000).optional(),
 sortOrder:z.coerce.number().int().min(0).default(0),
 published:z.boolean().default(true)
});

export async function POST(request){
 const user=await getCurrentUser();
 if(!user||!hasPermission(user,"lms.manage")) return NextResponse.json({error:"Forbidden"},{status:403});
 const parsed=schema.safeParse(await request.json());
 if(!parsed.success)return NextResponse.json({error:"Invalid lesson data"},{status:400});
 const data=parsed.data;
 if(data.videoUrl && !getYouTubeVideoId(data.videoUrl)) return NextResponse.json({error:"Enter a valid YouTube video URL or video ID."},{status:400});
 const module=await db.courseModule.findUnique({where:{id:data.moduleId},include:{course:true}});
 if(!module)return NextResponse.json({error:"Module not found"},{status:404});
 const lesson=await db.lesson.create({data});
 await db.auditLog.create({data:{actorUserId:user.id,action:"CREATE",entityType:"Lesson",entityId:lesson.id,metadata:{course:module.course.code,module:module.title}}});
 return NextResponse.json({lesson});
}
