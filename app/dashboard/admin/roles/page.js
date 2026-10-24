import Link from "next/link";
import {redirect} from "next/navigation";
import {ShieldCheck,UsersRound,KeyRound} from "lucide-react";
import {getCurrentUser} from "@/lib/auth";
import {hasPermission,isSuperAdmin} from "@/lib/permissions";
import {db} from "@/lib/db";
import RoleManager from "./role-manager";
export default async function RolesPage(){
 const user=await getCurrentUser();if(!user)redirect("/login");if(!hasPermission(user,"roles.manage"))redirect("/dashboard");
 const [roles,permissions]=await Promise.all([
  db.role.findMany({include:{_count:{select:{users:true,permissions:true}},permissions:{include:{permission:true}}},orderBy:{name:"asc"}}),
  db.permission.findMany({orderBy:{key:"asc"}})
 ]);
 return <main className="min-h-screen bg-slate-50/50 px-4 py-6 sm:px-6 lg:px-10"><div className="mx-auto max-w-[1500px]">
  <Link href="/dashboard" className="text-xs font-black text-blue-700">← Command Center</Link>
  <section className="mt-4 rounded-[30px] border border-slate-200 bg-white p-7 shadow-sm sm:p-9"><span className="text-[10px] font-black uppercase tracking-[.2em] text-blue-600">Identity & access</span><h1 className="mt-3 text-3xl font-black tracking-[-.04em] text-slate-950 sm:text-5xl">Roles & Permissions</h1><p className="mt-3 max-w-2xl text-sm text-slate-500">Least-privilege access for faculty, office staff, finance, exam operations and administrators.</p></section>
  <div className="mt-5 grid gap-3 sm:grid-cols-3"><Metric icon={ShieldCheck} label="Roles" value={roles.length}/><Metric icon={KeyRound} label="Permissions" value={permissions.length}/><Metric icon={UsersRound} label="Assignments" value={roles.reduce((n,r)=>n+r._count.users,0)}/></div>
  {isSuperAdmin(user)&&<div className="mt-5"><RoleManager permissions={permissions.map(p=>({id:p.id,key:p.key,description:p.description}))}/></div>}
  <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{roles.map(r=><article key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h2 className="font-black text-slate-950">{r.name}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{r.description||"Custom ERP role"}</p></div><span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black text-blue-700">{r._count.users} users</span></div><div className="mt-4 flex flex-wrap gap-1.5">{r.permissions.slice(0,8).map(x=><span key={x.permissionId} className="rounded-lg bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-600">{x.permission.key}</span>)}{r.permissions.length>8&&<span className="rounded-lg bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-500">+{r.permissions.length-8} more</span>}</div><p className="mt-4 border-t border-slate-100 pt-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">{r._count.permissions} permissions mapped</p></article>)}</div>
 </div></main>
}
function Metric({icon:Icon,label,value}){return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-500">{label}<Icon size={17} className="text-blue-600"/></div><div className="mt-3 text-2xl font-black">{value}</div></div>}