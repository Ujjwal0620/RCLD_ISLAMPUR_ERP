import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { db } from "@/lib/db";
import StudentAttendance from "./student-attendance";

export default async function AttendancePage(){
 const user=await getCurrentUser();
 if(!user) redirect("/login");
 if(!hasPermission(user,"students.view")) redirect("/dashboard");
 const batches=await db.batch.findMany({where:{status:{in:["PLANNED","ACTIVE"]}},orderBy:{startsAt:"asc"},select:{id:true,code:true,name:true,course:{select:{code:true,name:true}},_count:{select:{enrollments:true}}}});
 return <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10"><div className="mx-auto max-w-[1250px]">
  <Link href="/dashboard" className="text-xs font-black text-blue-700">← Command Center</Link>
  <section className="mt-4 rounded-[30px] bg-slate-950 p-7 text-white sm:p-9"><span className="text-[10px] font-black uppercase tracking-[.2em] text-blue-200">Academic Operations</span><h1 className="mt-4 text-3xl font-black tracking-[-.04em] sm:text-5xl">Student Attendance</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Mark attendance by batch and date, correct records and keep a clean daily academic history.</p></section>
  <div className="mt-5"><StudentAttendance batches={batches.map(b=>({id:b.id,code:b.code,name:b.name,course:b.course,count:b._count.enrollments}))} canManage={hasPermission(user,"students.manage")}/></div>
 </div></main>;
}