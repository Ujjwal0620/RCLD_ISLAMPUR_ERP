import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { Users, ShieldCheck, BookOpen, Settings, FileSearch, PlayCircle } from "lucide-react";

const modules = [
  ["/dashboard/admin/users","Users","Manage ERP users and employee accounts.",Users,"employees.manage"],
  ["/dashboard/admin/roles","Roles & Permissions","Create and control custom access roles.",ShieldCheck,"roles.manage"],
  ["/dashboard/admin/courses","Courses","Manage course codes, fees, duration and status.",BookOpen,"courses.manage"],
  ["/dashboard/admin/courses/content","LMS Content","Create modules, lessons and YouTube learning content.",PlayCircle,"lms.manage"],
  ["/dashboard/admin/settings","System Settings","Manage institution and operational defaults.",Settings,"roles.manage"],
  ["/dashboard/admin/audit","Audit Logs","Review important administrative actions.",FileSearch,"audit.view"]
];

export default async function AdminPage() {
  const user=await getCurrentUser();
  if(!user) redirect("/login");
  if(!hasPermission(user,"roles.manage")) redirect("/dashboard");
  return <main className="min-h-screen px-6 py-8 lg:px-10"><div className="mx-auto max-w-7xl">
    <Link href="/dashboard" className="text-sm text-cyan-300">← Dashboard</Link>
    <h1 className="mt-3 text-3xl font-black">Superadmin Control Center</h1>
    <p className="text-muted mt-2">Central administration for the RCLD ERP.</p>
    <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {modules.filter(([,,,,p])=>hasPermission(user,p)).map(([href,title,desc,Icon])=>
        <Link href={href} key={href} className="glass glass-hover rounded-2xl p-6">
          <Icon size={28} className="text-cyan-300"/><h2 className="mt-5 text-xl font-bold">{title}</h2>
          <p className="text-muted mt-2 text-sm leading-6">{desc}</p>
        </Link>)}
    </section>
  </div></main>;
}