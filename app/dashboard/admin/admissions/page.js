import Link from "next/link";
import { redirect } from "next/navigation";
import { ContactRound, GraduationCap, ArrowRight, UserPlus, ClipboardList } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { db } from "@/lib/db";

export default async function AdmissionsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!hasPermission(user, "crm.view") && !hasPermission(user, "students.view")) redirect("/dashboard");

  const [offlineStudents, recentStudents, courses] = await Promise.all([
    db.student.count({ where: { studentType: "OFFLINE" } }),
    db.student.findMany({
      where: { studentType: "OFFLINE" },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, name: true, phone: true, registrationNo: true, status: true, createdAt: true },
    }),
    db.course.count({ where: { active: true } }),
  ]);

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link href="/dashboard" className="text-xs font-bold text-blue-700">← Dashboard</Link>
            <p className="mt-5 text-xs font-black uppercase tracking-[.2em] text-blue-600">Admission desk</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">Admissions & Enquiries</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Operate the admission pipeline from enquiry to student registration. CRM follow-ups and conversion stages are the next expansion of this workspace.</p>
          </div>
          <Link href="/dashboard/admin/students#add-student" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white"><UserPlus size={17}/> New admission</Link>
        </div>

        <section className="mt-7 grid gap-4 sm:grid-cols-3">
          <Stat icon={GraduationCap} label="Offline students" value={offlineStudents} />
          <Stat icon={ClipboardList} label="Active courses" value={courses} />
          <Stat icon={ContactRound} label="Recent records" value={recentStudents.length} />
        </section>

        <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6">
            <div><h2 className="font-black">Recent admissions</h2><p className="mt-1 text-xs text-slate-500">Latest offline student records.</p></div>
            <Link href="/dashboard/admin/students?type=OFFLINE" className="inline-flex items-center gap-1 text-xs font-black text-blue-600">Student master <ArrowRight size={14}/></Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentStudents.length ? recentStudents.map((student) => (
              <div key={student.id} className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="font-black">{student.name}</p><p className="mt-1 text-xs text-slate-500">{student.phone || "No phone"} · {student.registrationNo || "Registration pending"}</p></div>
                <div className="flex items-center gap-3"><span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black text-blue-700">{student.status}</span><span className="text-xs text-slate-400">{student.createdAt.toLocaleDateString("en-IN")}</span></div>
              </div>
            )) : <div className="p-10 text-center text-sm text-slate-500">No offline admission records yet. Create the first admission from Student Master.</div>}
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({ icon: Icon, label, value }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</span><Icon size={18} className="text-blue-600"/></div><p className="mt-3 text-3xl font-black">{value}</p></div>;
}
