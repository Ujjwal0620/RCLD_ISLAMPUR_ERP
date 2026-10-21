import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
const schema=z.object({email:z.string().email(),password:z.string().min(8)});
export async function POST(request){
 try{
  const body=await request.json().catch(()=>({})); const parsed=schema.safeParse(body);
  if(!parsed.success) return NextResponse.json({error:"Invalid login details."},{status:400});
  const user=await db.user.findUnique({where:{email:parsed.data.email.toLowerCase()}});
  if(!user||user.status!=="ACTIVE") return NextResponse.json({error:"Invalid email or password."},{status:401});
  if(!(await bcrypt.compare(parsed.data.password,user.passwordHash))) return NextResponse.json({error:"Invalid email or password."},{status:401});
  await createSession(user);
  await db.auditLog.create({data:{action:"AUTH_LOGIN",entityType:"User",entityId:user.id,actorUserId:user.id}}).catch((error)=>console.error("login audit error",error));
  return NextResponse.json({ok:true});
 }catch(error){
  console.error("ERP login error",error);
  const databaseMissing=String(error?.message||"").includes("DATABASE_URL");
  return NextResponse.json({error:databaseMissing?"Database connection is not configured on this deployment.":"ERP login service is temporarily unavailable."},{status:503});
 }
}
