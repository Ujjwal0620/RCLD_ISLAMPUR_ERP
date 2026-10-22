import Link from "next/link";
import { redirect } from "next/navigation";
import { BarChart3 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { db } from "@/lib/db";
import AttendanceReport from "./attendance-report";

export default async function AttendanceReportsPage(){
 const user=await getCurrentUser(); if(!user)redirect("/login"); if(!hasPermission(user,"reports.view"))redirect("/dashboard");
 const batches=await db.batch.findMany({orderBy:{startsAt:"desc"},select:{id:true,code:true,name:true}});
 return <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10"><div className="mx-auto max-w-[1400px]"><Link href="/dashboard" className="text-xs font-black text-blue-700">← Command Center</Link><section className="mt-4 rounded-[30px] bg-slate-950 p-7 text-white sm:p-9"><span className="text-[10px] font-black uppercase tracking-[.2em] text-blue-200">Reports & Analytics</span><h1 className="mt-4 text-3xl font-black tracking-[-.04em] sm:text-5xl">Attendance Reports</h1><p className="mt-3 text-sm text-slate-300">Attendance percentage and daily coverage by academic batch.</p></section><div className="mt-5"><AttendanceReport batches={batches}/></div></div></main>;
}