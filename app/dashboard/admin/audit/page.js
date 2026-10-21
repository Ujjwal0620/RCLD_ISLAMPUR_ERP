import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { db } from "@/lib/db";
export default async function AuditPage(){
 const user=await getCurrentUser(); if(!user)redirect("/login"); if(!hasPermission(user,"audit.view"))redirect("/dashboard");
 const logs=await db.auditLog.findMany({include:{actor:true},orderBy:{createdAt:"desc"},take:100});
 return <main className="min-h-screen px-6 py-8 lg:px-10"><div className="mx-auto max-w-7xl"><Link href="/dashboard/admin" className="text-sm text-cyan-300">← Control Center</Link><h1 className="mt-3 text-3xl font-black">Audit Logs</h1><div className="glass mt-8 overflow-hidden rounded-2xl"><div className="divide-y divide-white/10">{logs.map(l=><div key={l.id} className="p-4 text-sm"><div className="font-semibold">{l.action} · {l.entityType||"System"}</div><div className="text-muted mt-1">{l.actor?.email||"System"} · {new Date(l.createdAt).toLocaleString()}</div></div>)}</div></div></div></main>;
}