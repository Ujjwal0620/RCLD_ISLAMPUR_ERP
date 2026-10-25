import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

const schema=z.object({
 name:z.string().trim().min(2).max(120),
 email:z.string().trim().email().transform(v=>v.toLowerCase()),
 phone:z.string().trim().max(20).optional().or(z.literal("")),
 password:z.string().min(8).max(100),
 employeeCode:z.string().trim().min(2).max(40).transform(v=>v.toUpperCase()),
 designation:z.string().trim().max(120).optional().or(z.literal("")),
 joinedAt:z.string().optional().or(z.literal("")),
 departmentId:z.string().optional().or(z.literal("")),
 employmentType:z.string().trim().max(40).optional().or(z.literal("")),
 basicPay:z.coerce.number().min(0).optional(),
 address:z.string().trim().max(500).optional().or(z.literal("")),
 skillIds:z.array(z.string()).default([]),
 roleIds:z.array(z.string().min(1)).min(1,"Assign at least one role.")
});

export async function POST(request){
 const actor=await getCurrentUser();
 if(!actor||!hasPermission(actor,"employees.manage")) return NextResponse.json({error:"Forbidden"},{status:403});
 try{
  const data=schema.parse(await request.json());
  const [existingUser,existingEmployee,roles]=await Promise.all([
   db.user.findUnique({where:{email:data.email},select:{id:true}}),
   db.employee.findUnique({where:{employeeCode:data.employeeCode},select:{id:true}}),
   db.role.findMany({where:{id:{in:data.roleIds}},select:{id:true,name:true}})
  ]);
  if(existingUser) return NextResponse.json({error:"An account with this email already exists."},{status:409});
  if(existingEmployee) return NextResponse.json({error:"Employee code already exists."},{status:409});
  if(roles.length!==new Set(data.roleIds).size) return NextResponse.json({error:"One or more selected roles are invalid."},{status:400});
  const passwordHash=await bcrypt.hash(data.password,12);
  const employee=await db.$transaction(async tx=>{
   const user=await tx.user.create({data:{
    name:data.name,email:data.email,phone:data.phone||null,passwordHash,status:"ACTIVE",
    userRoles:{create:data.roleIds.map(roleId=>({roleId}))}
   }});
   const created=await tx.employee.create({data:{
    userId:user.id,employeeCode:data.employeeCode,designation:data.designation||null,
    joinedAt:data.joinedAt?new Date(data.joinedAt+"T00:00:00"):null,
    departmentId:data.departmentId||null,employmentType:data.employmentType||null,basicPay:data.basicPay??null,address:data.address||null,
    skills:{create:[...new Set(data.skillIds)].map(skillId=>({skillId}))}
   },include:{user:{include:{userRoles:{include:{role:true}}}}}});
   await tx.auditLog.create({data:{actorUserId:actor.id,action:"EMPLOYEE_CREATED",entityType:"Employee",entityId:created.id,metadata:{employeeCode:created.employeeCode,roles:roles.map(r=>r.name),departmentId:data.departmentId||null,skillCount:new Set(data.skillIds).size}}});
   return created;
  });
  return NextResponse.json({employee},{status:201});
 }catch(error){
  if(error?.name==="ZodError") return NextResponse.json({error:error.issues?.[0]?.message||"Invalid employee data."},{status:400});
  if(error?.code==="P2002") return NextResponse.json({error:"Email or employee code already exists."},{status:409});
  console.error("employee create error",error);
  return NextResponse.json({error:"Unable to create employee."},{status:500});
 }
}