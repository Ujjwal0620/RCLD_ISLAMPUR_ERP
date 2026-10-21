import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createStudentSession } from "@/lib/student-auth";
const schema=z.object({email:z.string().email(),password:z.string().min(8)});
export async function POST(request){try{const parsed=schema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"Enter a valid email and password."},{status:400});const user=await db.user.findUnique({where:{email:parsed.data.email.toLowerCase()},include:{student:true}});if(!user?.student||user.student.studentType!=="ONLINE"||user.status!=="ACTIVE")return NextResponse.json({error:"Online student account not found."},{status:401});const valid=await bcrypt.compare(parsed.data.password,user.passwordHash);if(!valid)return NextResponse.json({error:"Invalid email or password."},{status:401});await createStudentSession(user.student);return NextResponse.json({ok:true});}catch(error){console.error(error);return NextResponse.json({error:"Unable to sign in right now."},{status:500});}}
