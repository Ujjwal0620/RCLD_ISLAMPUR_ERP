import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { db } from "@/lib/db";
import CourseForm from "./course-form";

export default async function CoursesPage(){
 const user=await getCurrentUser();
 if(!user) redirect("/login");
 if(!hasPermission(user,"courses.manage")) redirect("/dashboard");
 const courses=await db.course.findMany({orderBy:{code:"asc"}});
 return <main className="min-h-screen px-6 py-8 lg:px-10"><div className="mx-auto max-w-7xl">
  <Link href="/dashboard/admin" className="text-sm text-cyan-300">← Control Center</Link>
  <h1 className="mt-3 text-3xl font-black">Course Management</h1>
  <div className="mt-8 grid gap-6 lg:grid-cols-[380px_1fr]"><CourseForm/>
   <div className="glass rounded-2xl overflow-hidden"><div className="border-b border-white/10 p-5 font-bold">Configured Courses</div>
   <div className="divide-y divide-white/10">{courses.map(c=><div key={c.id} className="p-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
    <div><div className="font-bold">{c.code} — {c.name}</div><div className="text-muted text-sm">{c.duration||"Duration not set"} · {c.eligibility||"Eligibility not set"}</div></div>
    <div className="text-sm">{c.standardFee==null?"Fee not set":"₹"+c.standardFee.toString()} <span className={c.active?"text-emerald-300":"text-red-300"}>{c.active?"Active":"Inactive"}</span></div>
   </div>)}</div></div>
  </div>
 </div></main>;
}