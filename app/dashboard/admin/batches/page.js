import Link from "next/link";
import { redirect } from "next/navigation";
import { Layers3, UsersRound, CalendarDays, Plus, ArrowUpRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { db } from "@/lib/db";
import BatchForm from "./batch-form";
import BatchOperations from "./batch-operations";
import DeleteAction from "@/components/delete-action";

const statusMap = {
  PLANNED: ["Planned","bg-amber-50 text-amber-700"],
  ACTIVE: ["Active","bg-emerald-50 text-emerald-700"],
  COMPLETED: ["Completed","bg-blue-50 text-blue-700"],
  CANCELLED: ["Cancelled","bg-slate-100 text-slate-500"],
};

export default async function BatchesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!hasPermission(user, "batches.view")) redirect("/dashboard");

  const [batches, courses, totalStudents, employees] = await Promise.all([
    db.batch.findMany({
      orderBy: [{ status: "asc" }, { startsAt: "desc" }],
      include: { course: { select: { code: true, name: true } }, _count: { select: { enrollments: true } }, faculties: { include: { employee: { include: { user: { select: { name: true } } } } } }, enrollments: { where: { active: true }, select: { id: true, student: { select: { name: true, registrationNo: true } } }, take: 100 } },
      take: 100,
    }),
    db.course.findMany({ where: { active: true }, orderBy: { code: "asc" }, select: { id: true, code: true, name: true } }),
    db.batchEnrollment.count({ where: { active: true } }),
    db.employee.findMany({ where: { user: { status: "ACTIVE" } }, orderBy: { employeeCode: "asc" }, select: { id: true, employeeCode: true, designation: true, user: { select: { name: true } } } }),
  ]);

  const active = batches.filter((b) => b.status === "ACTIVE").length;
  const planned = batches.filter((b) => b.status === "PLANNED").length;

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1500px]">
        <Link href="/dashboard" className="inline-flex text-xs font-black text-blue-700">← Command Center</Link>
        <section className="mt-4 overflow-hidden rounded-[30px] border border-slate-800 bg-slate-950 p-7 text-white shadow-[0_24px_80px_rgba(15,23,42,.16)] sm:p-9">
          <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.06] px-3 py-1.5 text-[10px] font-black uppercase tracking-[.18em] text-blue-200"><Layers3 size={12}/> Academic Operations</span>
              <h1 className="mt-5 text-3xl font-black tracking-[-.04em] sm:text-5xl">Batch Management</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Create structured batches, control capacity and keep academic groups ready for student allocation.</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Metric label="Total" value={batches.length}/>
              <Metric label="Active" value={active}/>
              <Metric label="Learners" value={totalStudents}/>
            </div>
          </div>
        </section>

        <div className="mt-5 grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
          {hasPermission(user,"batches.manage") ? <BatchForm courses={courses}/> : (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">You have view-only access. Batch creation requires the batch management permission.</div>
          )}

          <section className="min-w-0">
            <div className="mb-3 flex items-center justify-between">
              <div><h2 className="text-base font-black">Academic groups</h2><p className="mt-1 text-xs text-slate-500">{planned} planned · {active} active</p></div>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black text-slate-500">Capacity max 50</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {batches.map((batch) => {
                const [status, tone] = statusMap[batch.status] || [batch.status,"bg-slate-100 text-slate-600"];
                const count = batch._count.enrollments;
                const percent = Math.min(100, Math.round((count / Math.max(1,batch.capacity))*100));
                return (
                  <article key={batch.id} className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,.045)] transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_18px_50px_rgba(37,99,235,.09)]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0"><div className="font-mono text-[10px] font-black tracking-[.15em] text-blue-600">{batch.code}</div><h3 className="mt-1 truncate text-base font-black">{batch.name}</h3><p className="mt-1 truncate text-xs text-slate-500">{batch.course.code} · {batch.course.name}</p></div>
                      <span className={"shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black "+tone}>{status}</span>
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
                      <div className="rounded-xl bg-slate-50 p-3"><div className="flex items-center gap-1.5 text-slate-400"><UsersRound size={13}/> Students</div><div className="mt-1 font-black text-slate-900">{count} / {batch.capacity}</div></div>
                      <div className="rounded-xl bg-slate-50 p-3"><div className="flex items-center gap-1.5 text-slate-400"><CalendarDays size={13}/> Starts</div><div className="mt-1 font-black text-slate-900">{batch.startsAt ? new Date(batch.startsAt).toLocaleDateString("en-IN") : "Not set"}</div></div>
                    </div>
                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" style={{width: percent+"%"}}/></div>
                    <div className="mt-3 flex items-center justify-between text-[10px] font-bold text-slate-400">
                      <span>{percent}% capacity</span>
                      <span className="inline-flex items-center gap-1 group-hover:text-blue-600">Manage <ArrowUpRight size={12}/></span>
                    </div>
                    {hasPermission(user, "batches.manage") && (
                      <div className="mt-3 flex items-center justify-end gap-2">
                        <DeleteAction compact endpoint={"/api/admin/batches/"+batch.id} label={"Delete "+batch.code} confirmMessage={"Delete batch "+batch.code+" — "+batch.name+"? Student, attendance, exam or transfer history will block deletion."} />
                      </div>
                    )}
                    {hasPermission(user,"batches.manage") && <BatchOperations batch={{id:batch.id,name:batch.name,faculty:batch.faculties.map(f=>({id:f.employee.id,name:f.employee.user.name,employeeCode:f.employee.employeeCode})),enrollments:batch.enrollments.map(e=>({id:e.id,name:e.student.name,registrationNo:e.student.registrationNo}))}} employees={employees} targetBatches={batches.map(b=>({id:b.id,code:b.code,name:b.name}))}/>}
                  </article>
                );
              })}
              {!batches.length && <div className="sm:col-span-2 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><Layers3 className="mx-auto text-slate-300" size={28}/><p className="mt-3 text-sm font-black">No batches yet</p><p className="mt-1 text-xs text-slate-500">Create the first academic batch from the panel.</p></div>}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
function Metric({label,value}){return <div className="rounded-xl border border-white/10 bg-white/[.06] px-3 py-3 text-center"><div className="text-lg font-black">{value}</div><div className="mt-0.5 text-[9px] font-black uppercase tracking-[.14em] text-slate-400">{label}</div></div>}
