import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { Users, ShieldCheck, BookOpen, Settings, FileSearch, PlayCircle, ArrowUpRight, LockKeyhole } from "lucide-react";

const modules = [
  ["/dashboard/admin/users","Users & Employees","Manage accounts, employee records and access.",Users,"employees.manage"],
  ["/dashboard/admin/roles","Roles & Permissions","Design precise access for every operational role.",ShieldCheck,"roles.manage"],
  ["/dashboard/admin/courses","Course Control","Configure catalogue, fees, duration and publishing.",BookOpen,"courses.manage"],
  ["/dashboard/admin/courses/content","LMS Studio","Build modules, lessons and online learning content.",PlayCircle,"lms.manage"],
  ["/dashboard/admin/settings","System Settings","Control institution-wide operational defaults.",Settings,"roles.manage"],
  ["/dashboard/admin/audit","Audit Center","Trace sensitive administrative activity.",FileSearch,"audit.view"]
];

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!hasPermission(user,"roles.manage")) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_90%_0%,rgba(37,99,235,.08),transparent_26rem)] px-4 py-7 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-black text-blue-600">← Command Center</Link>
        <section className="mt-5 overflow-hidden rounded-[30px] border border-slate-800 bg-slate-950 p-7 text-white shadow-[0_24px_80px_rgba(15,23,42,.16)] sm:p-9">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.06] px-3 py-1.5 text-[10px] font-black uppercase tracking-[.18em] text-blue-200"><LockKeyhole size={12}/> Administration</span>
            <h1 className="mt-5 text-3xl font-black tracking-[-.04em] sm:text-5xl">Control Center</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">A single control plane for identity, permissions, courses, content, settings and audit visibility.</p>
          </div>
        </section>
        <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {modules.filter(([,,,,p])=>hasPermission(user,p)).map(([href,title,desc,Icon]) => (
            <Link href={href} key={href} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,.045)] transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_18px_50px_rgba(37,99,235,.10)]">
              <div className="flex items-start justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-600 group-hover:bg-blue-600 group-hover:text-white"><Icon size={19}/></span><ArrowUpRight size={17} className="text-slate-300 group-hover:text-blue-600"/></div>
              <h2 className="mt-5 text-base font-black">{title}</h2>
              <p className="mt-2 text-xs leading-5 text-slate-500">{desc}</p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
