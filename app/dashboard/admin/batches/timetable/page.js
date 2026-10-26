import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import TimetableManager from "./timetable-manager";

export default async function TimetablePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!hasPermission(user, "batches.view")) redirect("/dashboard");

  const [batches, employees] = await Promise.all([
    db.batch.findMany({
      where: { status: { in: ["PLANNED", "ACTIVE"] } },
      orderBy: { code: "asc" },
      select: {
        id: true,
        code: true,
        name: true,
        capacity: true,
        status: true,
        startTime: true,
        endTime: true,
        room: true,
        _count: { select: { enrollments: true } },
        academicSession: { select: { name: true } },
        course: {
          select: {
            code: true,
            subjects: {
              where: { active: true },
              orderBy: { sortOrder: "asc" },
              select: {
                id: true,
                name: true,
                requiredSkills: { select: { skillId: true, skill: { select: { name: true } } } },
              },
            },
          },
        },
        series: {
          where: { active: true },
          orderBy: { code: "asc" },
          select: {
            id: true,
            code: true,
            name: true,
            schedules: {
              where: { active: true },
              orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
              select: {
                id: true,
                dayOfWeek: true,
                startTime: true,
                endTime: true,
                room: true,
                subject: { select: { name: true } },
                employee: { select: { employeeCode: true, user: { select: { name: true } } } },
              },
            },
          },
        },
      },
    }),
    db.employee.findMany({
      where: { user: { status: "ACTIVE" } },
      orderBy: { employeeCode: "asc" },
      select: {
        id: true,
        employeeCode: true,
        designation: true,
        user: { select: { name: true } },
        skills: { select: { skillId: true, skill: { select: { name: true } } } },
        _count: { select: { schedules: true } },
      },
    }),
  ]);

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1500px]">
        <Link href="/dashboard/admin/batches" className="text-xs font-black text-blue-700">← Batch Management</Link>
        <section className="mt-4 rounded-[30px] border border-blue-100 bg-white p-7 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[.2em] text-blue-700">Academic Operations</p>
          <h1 className="mt-2 text-3xl font-black">Batch Series & Timetable</h1>
          <p className="mt-2 text-sm text-slate-500">Dynamic scheduling with skill-aware faculty selection and faculty/room conflict protection.</p>
        </section>
        <TimetableManager batches={batches} employees={employees} canManage={hasPermission(user, "batches.manage")} />
      </div>
    </main>
  );
}
