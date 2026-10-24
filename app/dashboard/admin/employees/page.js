import Link from "next/link";
import { redirect } from "next/navigation";
import { Users, UserCog, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { db } from "@/lib/db";
import DeleteAction from "@/components/delete-action";
import EmployeeCreateForm from "./employee-create-form";

export default async function EmployeesPage() {
  const user=await getCurrentUser();
  if(!user) redirect("/login");
  if(!hasPermission(user,"employees.manage")) redirect("/dashboard");
  const [employees,roles]=await Promise.all([db.employee.findMany({
    orderBy:{createdAt:"desc"},
    include:{user:{include:{userRoles:{include:{role:true}}}}},
  }),db.role.findMany({orderBy:{name:"asc"},select:{id:true,name:true,description:true}})]);
  const active=employees.filter(e=>e.user.status==="ACTIVE").length;
  return <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10"><div className="mx-auto max-w-[1500px]">
    <Link href="/dashboard" className="text-xs font-black text-blue-700">← Command Center</Link>
    <section className="mt-4 rounded-[30px] bg-slate-950 p-7 text-white sm:p-9"><span className="text-[10px] font-black uppercase tracking-[.22em] text-violet-300">People Operations</span><h1 className="mt-3 text-3xl font-black tracking-[-.04em] sm:text-5xl">Employees</h1><p className="mt-2 text-sm text-slate-300">Separate employee workspace for staff accounts, designations and assigned roles.</p></section>
    <div className="mt-5"><EmployeeCreateForm roles={roles}/></div>
    <div className="mt-5 grid gap-4 sm:grid-cols-3"><Metric icon={Users} label="Employees" value={employees.length}/><Metric icon={UserCog} label="Active staff" value={active}/><Metric icon={ShieldCheck} label="Role assignments" value={employees.reduce((n,e)=>n+e.user.userRoles.length,0)}/></div>
    <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-4">Employee</th><th>Code</th><th>Designation</th><th>Roles</th><th>Status</th><th>Joined</th><th className="pr-5 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{employees.map(e=><tr key={e.id} className="hover:bg-slate-50"><td className="px-5 py-4"><b>{e.user.name}</b><div className="text-xs text-slate-400">{e.user.email}</div></td><td className="font-mono text-xs">{e.employeeCode}</td><td>{e.designation||"—"}</td><td>{e.user.userRoles.map(r=><span key={r.roleId} className="mr-1 inline-flex rounded-full bg-violet-50 px-2 py-1 text-[10px] font-black text-violet-700">{r.role.name}</span>)}</td><td><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black">{e.user.status}</span></td><td className="text-xs text-slate-500">{e.joinedAt?e.joinedAt.toLocaleDateString("en-IN"):"—"}</td><td className="pr-5 text-right"><DeleteAction compact endpoint={"/api/admin/employees/"+e.id} label={"Delete "+e.user.name} confirmMessage={"Delete employee "+e.user.name+" ("+e.employeeCode+")? Attendance or batch assignment history will block deletion. The linked login account is not deleted automatically."}/></td></tr>)}</tbody></table></div><div className="divide-y divide-slate-100 md:hidden">{employees.map(e=><div key={e.id} className="p-4"><div className="flex justify-between"><b>{e.user.name}</b><span className="text-[10px] font-black">{e.user.status}</span></div><p className="mt-1 text-xs text-slate-500">{e.employeeCode} · {e.designation||"No designation"}</p><div className="mt-3">{e.user.userRoles.map(r=><span key={r.roleId} className="mr-1 inline-flex rounded-full bg-violet-50 px-2 py-1 text-[10px] font-black text-violet-700">{r.role.name}</span>)}</div><div className="mt-3"><DeleteAction endpoint={"/api/admin/employees/"+e.id} label="Delete employee" confirmMessage={"Delete employee "+e.user.name+" ("+e.employeeCode+")? Attendance or batch assignment history will block deletion. The linked login account is not deleted automatically."}/></div></div>)}</div></section>
  </div></main>;
}
function Metric({icon:Icon,label,value}){return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-500">{label}<Icon size={17} className="text-blue-600"/></div><div className="mt-3 text-2xl font-black">{value}</div></div>}
