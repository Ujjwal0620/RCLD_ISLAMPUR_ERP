import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { db } from "@/lib/db";
import EmployeeAttendance from "./employee-attendance";

export default async function EmployeeAttendancePage(){
 const user=await getCurrentUser();
 if(!user) redirect("/login");
 if(!hasPermission(user,"employees.view")) redirect("/dashboard");
 const employees=hasPermission(user,"employees.manage")
  ? await db.employee.findMany({where:{user:{status:"ACTIVE"}},orderBy:{employeeCode:"asc"},select:{id:true,employeeCode:true,designation:true,user:{select:{name:true}}}})
  : [];
 const self=await db.employee.findUnique({where:{userId:user.id},select:{id:true,employeeCode:true,designation:true,user:{select:{name:true}}}});
 return <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10"><div className="mx-auto max-w-[1250px]">
  <Link href="/dashboard" className="text-xs font-black text-blue-700">← Command Center</Link>
  <section className="mt-4 rounded-[30px] bg-slate-950 p-7 text-white sm:p-9"><span className="text-[10px] font-black uppercase tracking-[.2em] text-violet-300">People Operations</span><h1 className="mt-4 text-3xl font-black tracking-[-.04em] sm:text-5xl">Employee Attendance</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Controlled check-in/out with one-time location evidence, optional image evidence and break tracking. No live GPS tracking.</p></section>
  <div className="mt-5"><EmployeeAttendance employees={employees} self={self} canManage={hasPermission(user,"employees.manage")}/></div>
 </div></main>;
}