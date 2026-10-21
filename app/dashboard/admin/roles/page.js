import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { db } from "@/lib/db";
export default async function RolesPage(){
 const user=await getCurrentUser(); if(!user)redirect("/login"); if(!hasPermission(user,"roles.manage"))redirect("/dashboard");
 const roles=await db.role.findMany({include:{_count:{select:{users:true,permissions:true}}},orderBy:{name:"asc"}});
 return <main className="min-h-screen px-6 py-8 lg:px-10"><div className="mx-auto max-w-7xl"><Link href="/dashboard/admin" className="text-sm text-cyan-300">← Control Center</Link><h1 className="mt-3 text-3xl font-black">Roles & Permissions</h1><div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{roles.map(r=><div key={r.id} className="glass rounded-2xl p-6"><h2 className="font-bold">{r.name}</h2><p className="text-muted mt-2 text-sm">{r.description||"Custom ERP role"}</p><div className="mt-5 text-sm">{r._count.users} users · {r._count.permissions} permissions</div></div>)}</div></div></main>;
}