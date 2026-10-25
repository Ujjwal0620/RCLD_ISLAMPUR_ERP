import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
const schema=z.object({batchId:z.string().min(1),code:z.string().trim().min(1).max(30),name:z.string().trim().max(100).optional().or(z.literal(""))});
export async function POST(req){
 const user=await getCurrentUser(); if(!user||!hasPermission(user,"batches.manage")) return NextResponse.json({error:"Forbidden"},{status:403});
 try{const d=schema.parse(await req.json());const series=await db.batchSeries.create({data:{batchId:d.batchId,code:d.code.toUpperCase(),name:d.name||null}});await db.auditLog.create({data:{actorUserId:user.id,action:"BATCH_SERIES_CREATED",entityType:"BatchSeries",entityId:series.id,metadata:{batchId:d.batchId,code:series.code}}});return NextResponse.json({series},{status:201});}
 catch(e){if(e?.code==="P2002")return NextResponse.json({error:"Series code already exists in this batch."},{status:409});return NextResponse.json({error:e?.issues?.[0]?.message||"Unable to create batch series."},{status:400});}
}