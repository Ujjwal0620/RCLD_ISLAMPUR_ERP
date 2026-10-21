import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { BarChart3, BookOpen, BriefcaseBusiness, ClipboardCheck, CreditCard, Users } from "lucide-react";

const cards = [
  ["Students", "Manage admissions, profiles and academic records.", Users],
  ["Courses & Batches", "Configure courses, faculty and student allocations.", BookOpen],
  ["Fees & Finance", "Track collections, installments and financial activity.", CreditCard],
  ["Employee Hub", "Attendance, tasks, leave and performance.", BriefcaseBusiness],
  ["Examinations", "Create exams, evaluate results and certificates.", ClipboardCheck],
  ["Analytics", "Permission-aware operational insights.", BarChart3]
];

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <main className="min-h-screen px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="glass flex flex-col gap-4 rounded-2xl p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-cyan-300">RCLD Islampur ERP</p>
            <h1 className="mt-1 text-3xl font-black">Welcome, {user.name}</h1>
            <p className="text-muted mt-1 text-sm">{user.email}</p>
          </div>
          <form action="/api/auth/logout" method="post">
            <button className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold">Sign out</button>
          </form>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(([title, description, Icon]) => (
            <div key={title} className="glass glass-hover rounded-2xl p-6">
              <Icon size={26} className="text-cyan-300" />
              <h2 className="mt-5 text-xl font-bold">{title}</h2>
              <p className="text-muted mt-2 text-sm leading-6">{description}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
