import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import AcademicStructureManager from "./structure-manager";

export default async function AcademicStructurePage(){
 const user=await getCurrentUser(); if(!user)redirect("/login"); if(!hasPermission(user,"courses.manage"))redirect("/dashboard");
 const [courses,skills]=await Promise.all([db.course.findMany({where:{active:true},orderBy:{displayOrder:"asc"},select:{id:true,code:true,name:true,subjects:{orderBy:{sortOrder:"asc"},select:{id:true,code:true,name:true,chapters:{orderBy:{sortOrder:"asc"},select:{id:true,title:true}},requiredSkills:{select:{skill:{select:{id:true,name:true}}}}}}}}),db.skill.findMany({where:{active:true},orderBy:{name:"asc"},select:{id:true,name:true}})]);
 return <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10"><div className="mx-auto max-w-[1400px]"><Link href="/dashboard/admin/courses" className="text-xs font-black text-blue-700">← Course Control</Link><section className="mt-4 rounded-[30px] border border-blue-100 bg-white p-7 shadow-sm"><p className="text-[10px] font-black uppercase tracking-[.2em] text-blue-700">Academic Structure</p><h1 className="mt-2 text-3xl font-black">Subjects & Chapters</h1><p className="mt-2 text-sm text-slate-500">The authoritative RCLD structure is Course → Subject → Chapter. These records come from PostgreSQL and drive timetable, progress, materials and exams.</p></section><AcademicStructureManager courses={courses} skills={skills}/></div></main>
}