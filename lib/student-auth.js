import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { db } from "@/lib/db";
const COOKIE_NAME="rcld_student_session";
const secret=new TextEncoder().encode(process.env.AUTH_SECRET||"development-only-secret");
export async function createStudentSession(student){const token=await new SignJWT({sub:student.id,type:"online_student",email:student.email||""}).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("8h").sign(secret);(await cookies()).set(COOKIE_NAME,token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:60*60*8});}
export async function clearStudentSession(){(await cookies()).delete(COOKIE_NAME);}
export async function getCurrentStudent(){try{const token=(await cookies()).get(COOKIE_NAME)?.value;if(!token)return null;const {payload}=await jwtVerify(token,secret);if(payload.type!=="online_student"||!payload.sub)return null;return db.student.findUnique({where:{id:payload.sub},include:{onlineEnrollments:{where:{status:"ACTIVE"},include:{course:true},orderBy:{enrolledAt:"desc"}}}})}catch{return null;}}
