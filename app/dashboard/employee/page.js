import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ClipboardCheck, CalendarDays, Layers3, CheckCircle2 } from "lucide-react";
import EmployeeTaskList from "./employee-task-list";

export default async function EmployeeDashboardPage(){
 const user=await getCurrentUser(); if(!user)redirect("/login");
 const employee=await db.employee.findUnique({where:{userId:user.id},select:{id:true,employeeCode:true,designation:true,employmentStatus:true}});
 if(!employee)redirect("/dashboard");
 const [tasks,faculty,schedules]=await Promise.all([
  db.employeeTask.findMany({where:{assigneeId:user.id},orderBy:[{status:"asc"},{dueAt:"asc"}],take:100}),
  db.batchFaculty.findMany({where:{employeeId:employee.id},include:{batch:{include:{course:{select:{code:true,name:true}}}}}}),
  db.batchSchedule.findMany({where:{employeeId:employee.id,active:true},include:{batchSeries:{include:{batch:{include:{course:{select:{code:true}}}}}},subject:true},orderBy:[{dayOfWeek:"asc"},{startTime:"asc"}]})
 ]);
 const completed=tasks.filter(t=>t.status==="COMPLETED").length;
 return <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-10"><div className="mx-auto max-w-7xl">
  <Link href="/dashboard" className="text-xs font-black text-blue-700">← Main dashboard</Link>
  <section className="mt-4 rounded-[28px] bg-slate-950 p-7 text-white"><p className="text-xs font-black uppercase tracking-[.2em] text-blue-300">Employee workspace</p><h1 className="mt-3 text-3xl font-black">{user.name}</h1><p className="mt-2 text-sm text-slate-300">{employee.employeeCode} · {employee.designation||"Employee"}</p></section>
  <section className="mt-5 grid gap-3 sm:grid-cols-4"><Metric icon={ClipboardCheck} label="My tasks" value={tasks.length}/><Metric icon={CheckCircle2} label="Completed" value={completed}/><Metric icon={Layers3} label="Assigned batches" value={faculty.length}/><Metric icon={CalendarDays} label="Weekly classes" value={schedules.length}/></section>
  <section className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_.85fr]"><div className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-black">My assigned tasks</h2><p className="mt-1 text-xs text-slate-500">Start work, then submit it for review. Managers approve completion.</p><EmployeeTaskList tasks={tasks.map(t=>({id:t.id,title:t.title,description:t.description,priority:t.priority,status:t.status,dueAt:t.dueAt?.toISOString()||null}))} /></div>
  <div className="space-y-5"><div className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-black">My batches</h2><p className="mt-1 text-xs text-slate-500">Batches and subjects assigned to you.</p><div className="mt-3 space-y-2">{faculty.map(x=><div key={x.id} className="rounded-xl bg-slate-50 p-3 text-sm"><b>{x.batch.code}</b><p className="text-xs text-slate-500">{x.batch.course.code} · {x.batch.name}</p></div>)}{!faculty.length&&<p className="text-sm text-slate-500">No batch assignment.</p>}</div></div><div className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-black">My timetable</h2><p className="mt-1 text-xs text-slate-500">Your weekly teaching schedule.</p><div className="mt-3 space-y-2">{schedules.map(x=><div key={x.id} className="rounded-xl bg-slate-50 p-3 text-xs"><b>{x.batchSeries.batch.course.code} · {x.batchSeries.code}</b><p className="mt-1 text-slate-500">Day {x.dayOfWeek} · {x.startTime}–{x.endTime} · {x.room||"Room TBD"}{x.subject?" · "+x.subject.name:""}</p></div>)}{!schedules.length&&<p className="text-sm text-slate-500">No scheduled classes.</p>}</div></div></div></section>
 </div></main>;
}
function Metric({icon:Icon,label,value}){return <div className="rounded-2xl border bg-white p-5"><div className="flex justify-between text-xs font-black text-slate-500">{label}<Icon size={16}/></div><div className="mt-2 text-2xl font-black">{value}</div></div>}
