import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createStudentSession } from "@/lib/student-auth";
const schema=z.object({name:z.string().min(2).max(100),phone:z.string().min(8).max(20),email:z.string().email(),password:z.string().min(8).max(100)});
export async function POST(request){try{const parsed=schema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"Please enter a valid name, phone, email and password (8+ characters)."}, {status:400});const email=parsed.data.email.toLowerCase();const exists=await db.user.findUnique({where:{email}});if(exists)return NextResponse.json({error:"An account with this email already exists. Please log in."},{status:409});const hash=await bcrypt.hash(parsed.data.password,12);const user=await db.user.create({data:{name:parsed.data.name,email,passwordHash:hash,phone:parsed.data.phone,status:"ACTIVE",student:{create:{name:parsed.data.name,email,phone:parsed.data.phone,studentType:"ONLINE",status:"ACTIVE"}}},include:{student:true}});await createStudentSession(user.student);return NextResponse.json({ok:true});}catch(error){console.error(error);return NextResponse.json({error:"Unable to create the account right now. Please try again."},{status:500});}}
