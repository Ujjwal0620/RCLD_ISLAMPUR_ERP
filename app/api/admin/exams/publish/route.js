import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

const schema=z.object({examId:z.string(),field:z.enum(["published","resultsPublished"]),value:z.boolean()});
export async function POST(req){
 const user=await getCurrentUser();if(!user||!hasPermission(user,"exams.manage"))return NextResponse.json({error:"Forbidden"},{status:403});
 try{const d=schema.parse(await req.json());const exam=await db.exam.findUnique({where:{id:d.examId},select:{id:true,title:true}});if(!exam)throw new Error("Exam not found.");
 const updated=await db.exam.update({where:{id:d.examId},data:{[d.field]:d.value}});
 await db.auditLog.create({data:{actorUserId:user.id,action:d.field.toUpperCase()+"_"+(d.value?"ENABLED":"DISABLED"),entityType:"Exam",entityId:d.examId,metadata:{title:exam.title}}});
 return NextResponse.json({success:true,exam:updated});
 }catch(e){return NextResponse.json({error:e?.message||"Unable to update exam publication."},{status:400});}
}
