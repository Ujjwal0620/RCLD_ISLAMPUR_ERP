import Link from "next/link";
import { redirect } from "next/navigation";
import { Users, UserCog, ShieldCheck, UserPlus } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission, isSuperAdmin } from "@/lib/permissions";
import { db } from "@/lib/db";
import EmployeeManager from "./employee-manager";

export default async function EmployeesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!hasPermission(user, "employees.manage")) redirect("/dashboard");

  const [employees, roles] = await Promise.all([
    db.employee.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { include: { userRoles: { include: { role: true } } } }, _count: { select: { attendances: true, batchFaculties: true } } },
    }),
    db.role.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, description: true } }),
  ]);

  const active = employees.filter((e) => e.status === "ACTIVE" && e.user.status === "ACTIVE").length;
  const data = employees.map((e) => ({
    ...e,
    joinedAt: e.joinedAt ? e.joinedAt.toISOString() : null,
    dateOfBirth: e.dateOfBirth ? e.dateOfBirth.toISOString() : null,
    user: {
      id: e.user.id,
      name: e.user.name,
      email: e.user.email,
      phone: e.user.phone,
      status: e.user.status,
      roles: e.user.userRoles.map((r) => ({ id: r.roleId, name: r.role.name })),
    },
    counts: e._count,
  }));

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1500px]">
        <Link href="/dashboard" className="text-xs font-black text-blue-700">← Command Center</Link>
        <section className="mt-4 rounded-[30px] bg-slate-950 p-7 text-white sm:p-9">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[.22em] text-violet-300">People Operations</span>
              <h1 className="mt-3 text-3xl font-black tracking-[-.04em] sm:text-5xl">Employee Management</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">Manage employee profiles, account status, roles, contact information and operational details from one workspace.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black text-slate-200"><UserPlus size={16}/>{isSuperAdmin(user)?"Super Admin controls enabled":"Employee management"}</div>
          </div>
        </section>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Metric icon={Users} label="Employees" value={employees.length}/>
          <Metric icon={UserCog} label="Active staff" value={active}/>
          <Metric icon={ShieldCheck} label="Role assignments" value={employees.reduce((n,e)=>n+e.user.userRoles.length,0)}/>
        </div>

        <EmployeeManager employees={data} roles={roles} superAdmin={isSuperAdmin(user)} />
      </div>
    </main>
  );
}

function Metric({icon:Icon,label,value}) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-500">{label}<Icon size={17} className="text-blue-600"/></div><div className="mt-3 text-2xl font-black">{value}</div></div>;
}