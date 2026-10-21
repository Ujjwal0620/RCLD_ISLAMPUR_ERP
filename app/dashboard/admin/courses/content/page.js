import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { db } from "@/lib/db";
import ContentManager from "./content-manager";

export default async function CourseContentPage(){
 const user=await getCurrentUser();
 if(!user)redirect("/login");
 if(!hasPermission(user,"lms.manage"))redirect("/dashboard");
 const courses=await db.course.findMany({orderBy:{code:"asc"},include:{modules:{orderBy:{sortOrder:"asc"},include:{lessons:{orderBy:{sortOrder:"asc"}}}}});
 return <main className="min-h-screen bg-slate-950 px-6 py-8 text-white lg:px-10"><div className="mx-auto max-w-7xl">
  <Link href="/dashboard/admin" className="text-sm text-cyan-300">← Control Center</Link>
  <div className="mt-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><h1 className="text-3xl font-black">LMS Content Manager</h1><p className="mt-2 text-slate-400">Create modules and lessons, validate YouTube links and publish course content.</p></div><Link href="/dashboard/admin/courses" className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold">Course Settings</Link></div>
  <div className="mt-8"><ContentManager courses={courses.map(c=>({id:c.id,code:c.code,name:c.name,modules:c.modules.map(m=>({id:m.id,title:m.title,description:m.description,sortOrder:m.sortOrder,published:m.published,lessons:m.lessons}))}))}/></div>
 </div></main>;
}
