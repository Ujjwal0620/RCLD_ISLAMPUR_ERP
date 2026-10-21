import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { db } from "@/lib/db";
export default async function UsersPage(){
 const user=await getCurrentUser(); if(!user)redirect("/login"); if(!hasPermission(user,"employees.manage"))redirect("/dashboard");
 const users=await db.user.findMany({include:{userRoles:{include:{role:true}},employee:true},orderBy:{createdAt:"desc"}});
 return <main className="min-h-screen px-6 py-8 lg:px-10"><div className="mx-auto max-w-7xl"><Link href="/dashboard/admin" className="text-sm text-cyan-300">← Control Center</Link><h1 className="mt-3 text-3xl font-black">Users</h1><p className="text-muted mt-2">Current accounts and assigned roles.</p><div className="glass mt-8 overflow-hidden rounded-2xl"><div className="divide-y divide-white/10">{users.map(u=><div key={u.id} className="p-5 flex flex-col gap-2 md:flex-row md:justify-between"><div><div className="font-bold">{u.name}</div><div className="text-muted text-sm">{u.email}{u.employee?" · "+u.employee.employeeCode:""}</div></div><div className="text-sm"><span className="mr-4">{u.userRoles.map(x=>x.role.name).join(", ")||"No role"}</span><span className="text-cyan-200">{u.status}</span></div></div>)}</div></div></div></main>;
}