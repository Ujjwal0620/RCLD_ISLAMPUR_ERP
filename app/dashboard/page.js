import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { db } from "@/lib/db";
import { UsersRound, BookOpen, GraduationCap, IndianRupee, ArrowUpRight, Activity, Plus, ContactRound, CalendarCheck2, ClipboardCheck, Layers3, Sparkles, TrendingUp, ChevronRight, BarChart3 } from "lucide-react";

const modules = [
  ["Admissions & Enquiries","Capture leads and convert enquiries into admissions.","/dashboard/admin/admissions",ContactRound,"crm.view"],
  ["Student Master","Central student records, status and enrolments.","/dashboard/admin/students",GraduationCap,"students.view"],
  ["Batches","Create and operate course batches and capacity.","/dashboard/admin/batches",Layers3,"batches.view"],
  ["Attendance","Daily attendance, corrections and reports.","/dashboard/admin/attendance",CalendarCheck2,"students.view"],
  ["Exams & Results","Exam setup, marks, publishing and result workflows.","/dashboard/admin/exams",ClipboardCheck,"exams.view"],
  ["Fees & Finance","Fees, receipts, payments and reconciliation.","/dashboard/admin/fees",IndianRupee,"finance.view"]
];

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [students,courses,enrollments,users,online,pending,audit,batches,offline,employees,feeLedgers,attendance] = await Promise.all([
    db.student.count(),
    db.course.count({where:{active:true}}),
    db.onlineEnrollment.count({where:{status:"ACTIVE"}}),
    db.user.count({where:{status:"ACTIVE"}}),
    db.student.count({where:{studentType:"ONLINE"}}),
    db.onlineEnrollment.count({where:{status:"PENDING"}}),
    db.auditLog.findMany({orderBy:{createdAt:"desc"},take:6,select:{id:true,action:true,entityType:true,createdAt:true}}),
    db.batch.count(),
    db.student.count({where:{studentType:"OFFLINE"}}),
    db.employee.count(),
    db.feeLedger.findMany({select:{finalAmount:true,paidAmount:true,balanceAmount:true,status:true}}),
    db.studentAttendance.groupBy({by:["status"],_count:{_all:true}})
  ]);

  const money=feeLedgers.reduce((a,x)=>({billed:a.billed+Number(x.finalAmount||0),paid:a.paid+Number(x.paidAmount||0),due:a.due+Number(x.balanceAmount||0)}),{billed:0,paid:0,due:0});
  const attendanceTotal=attendance.reduce((n,x)=>n+x._count._all,0); const attendancePresent=attendance.find(x=>x.status==="PRESENT")?._count._all||0; const attendanceRate=attendanceTotal?Math.round(attendancePresent*100/attendanceTotal):0;
  const maxLearners=Math.max(1,online,offline); const maxMoney=Math.max(1,money.billed,money.paid,money.due);

  const stats = [
    ["Students",students,UsersRound,"/dashboard/admin/students","Registered learners"],
    ["Courses",courses,BookOpen,"/dashboard/admin/courses","Active catalogue"],
    ["Active online",enrollments,GraduationCap,"/student/dashboard","Learning access"],
    ["Batches",batches,Layers3,"/dashboard/admin/batches","Academic groups"]
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_85%_0%,rgba(37,99,235,.07),transparent_28rem)]">
      <div className="px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
        <div className="mx-auto max-w-[1680px]">
          <section className="relative overflow-hidden rounded-[32px] border border-slate-800 bg-slate-950 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,.18)] sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl"/>
            <div className="pointer-events-none absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-indigo-500/15 blur-3xl"/>
            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.06] px-3 py-1.5 text-[10px] font-black uppercase tracking-[.2em] text-blue-200"><Sparkles size={12}/> RCLD Command</div>
                <h1 className="mt-5 text-3xl font-black tracking-[-.04em] sm:text-5xl">Good day, {user.name.split(" ")[0]}.</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">A focused command center for admissions, academics, people, finance and online learning.</p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <Link href="/dashboard/admin/students" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-100"><Plus size={16}/> Add student</Link>
                <Link href="/dashboard/admin/admissions" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[.06] px-4 py-3 text-sm font-black text-white transition hover:bg-white/10"><ContactRound size={16}/> Admission desk</Link>
              </div>
            </div>
          </section>

          <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(([label,value,Icon,href,desc]) => (
              <Link href={href} key={label} className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,.045)] transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_16px_45px_rgba(37,99,235,.10)]">
                <div className="flex items-center justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-blue-600 group-hover:text-white"><Icon size={18}/></span><ArrowUpRight size={16} className="text-slate-300 group-hover:text-blue-600"/></div>
                <div className="mt-5 text-3xl font-black tracking-[-.03em]">{value}</div>
                <div className="mt-1 text-sm font-black">{label}</div>
                <div className="mt-1 text-xs text-slate-500">{desc}</div>
              </Link>
            ))}
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-2">
            <AnalyticsCard title="Learner mix" subtitle="Online and centre-based students" icon={BarChart3}>
              <Bar label="Offline students" value={offline} max={maxLearners}/><Bar label="Online students" value={online} max={maxLearners}/><Bar label="Employees" value={employees} max={Math.max(1,employees,offline,online)}/>
            </AnalyticsCard>
            <AnalyticsCard title="Finance pulse" subtitle="Current offline fee ledgers" icon={IndianRupee}>
              <Bar label="Billed" value={money.billed} max={maxMoney} money/><Bar label="Collected" value={money.paid} max={maxMoney} money/><Bar label="Outstanding" value={money.due} max={maxMoney} money/>
              <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"><span className="text-xs font-bold text-slate-500">Recorded attendance rate</span><span className="text-lg font-black text-blue-700">{attendanceRate}%</span></div>
            </AnalyticsCard>
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,.045)]">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
                <div><h2 className="text-base font-black tracking-tight">Operational modules</h2><p className="mt-1 text-xs text-slate-500">Your most important workspaces, filtered by access.</p></div>
                <span className="hidden rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black text-emerald-700 sm:block">Live</span>
              </div>
              <div className="grid gap-2.5 p-4 sm:grid-cols-2 sm:p-5">
                {modules.filter(([,,,,p])=>hasPermission(user,p)).map(([title,desc,href,Icon]) => (
                  <Link href={href} key={href} className="group flex min-h-[92px] items-center gap-3.5 rounded-xl border border-slate-100 p-3.5 transition hover:border-blue-200 hover:bg-slate-50">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600"><Icon size={18}/></span>
                    <span className="min-w-0"><span className="block text-sm font-black">{title}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{desc}</span></span>
                    <ChevronRight size={16} className="ml-auto shrink-0 text-slate-300 group-hover:text-blue-500"/>
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,.045)] sm:p-6">
                <div className="flex items-center gap-2"><TrendingUp size={17} className="text-blue-600"/><h2 className="font-black">Live pulse</h2></div>
                <div className="mt-5 space-y-4">
                  <Pulse label="Online learners" value={online} note="registered"/>
                  <Pulse label="Pending enrollments" value={pending} note="awaiting payment"/>
                  <Pulse label="Active accounts" value={users} note="authorized"/>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 text-white shadow-[0_18px_50px_rgba(15,23,42,.16)] sm:p-6">
                <div className="flex items-center gap-2"><Activity size={17} className="text-blue-300"/><h2 className="font-black">Recent activity</h2></div>
                <div className="mt-4 space-y-2.5">
                  {audit.length ? audit.map(a => <div key={a.id} className="rounded-xl border border-white/10 bg-white/[.04] p-3"><p className="text-xs font-black">{a.action}</p><p className="mt-1 text-[10px] text-slate-400">{a.entityType||"System"} · {new Date(a.createdAt).toLocaleString("en-IN")}</p></div>) : <p className="text-xs text-slate-400">No activity yet.</p>}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Pulse({label,value,note}) {
  return <div><div className="flex items-end justify-between gap-3"><div><p className="text-xs font-bold text-slate-500">{label}</p><p className="mt-1 text-2xl font-black">{value}</p></div><span className="text-[10px] font-bold text-slate-400">{note}</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-2/3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"/></div></div>;
}

function AnalyticsCard({title,subtitle,icon:Icon,children}){return <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,.045)] sm:p-6"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700"><Icon size={18}/></span><div><h2 className="font-black">{title}</h2><p className="text-xs text-slate-500">{subtitle}</p></div></div><div className="mt-5 space-y-4">{children}</div></div>}
function Bar({label,value,max,money=false}){const width=Math.max(value>0?4:0,Math.min(100,Number(value||0)*100/Math.max(1,max)));const shown=money?"₹"+Number(value||0).toLocaleString("en-IN",{maximumFractionDigits:0}):Number(value||0).toLocaleString("en-IN");return <div><div className="mb-2 flex items-center justify-between gap-3"><span className="text-xs font-bold text-slate-600">{label}</span><span className="text-xs font-black text-slate-900">{shown}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{width:width+"%"}}/></div></div>}
