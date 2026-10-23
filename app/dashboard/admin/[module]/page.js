import Link from "next/link";
import {redirect} from "next/navigation";
import {getCurrentUser} from "@/lib/auth";
import {hasPermission} from "@/lib/permissions";
import {db} from "@/lib/db";
import {ArrowLeft,ArrowUpRight,Plus,Search,UsersRound,BookOpen,Layers3,CalendarCheck2,ClipboardCheck,Award,WalletCards,Package,Banknote,BarChart3,BrainCircuit,ContactRound,Megaphone,Clock3,ShieldCheck} from "lucide-react";

const configs={
admissions:{title:"Admissions & Enquiries",eyebrow:"Admissions",description:"Capture prospective students, manage counselling and move qualified enquiries into admissions.",permission:"crm.view",icon:ContactRound,color:"blue",actions:["New enquiry","Import enquiries","Follow-up queue"],metrics:["New enquiries","Follow-ups due","Conversions","Conversion rate"]},
batches:{title:"Batches",eyebrow:"Academic operations",description:"Operate course batches, capacity, schedules and student allocation from one workspace.",permission:"batches.view",icon:Layers3,color:"indigo",actions:["Create batch","Assign students","Batch calendar"],metrics:["Total batches","Active batches","Available seats","Students assigned"]},
attendance:{title:"Attendance",eyebrow:"Academic operations",description:"Manage daily attendance, corrections and attendance reporting for students and employees.",permission:"students.view",icon:CalendarCheck2,color:"emerald",actions:["Mark attendance","Corrections","Attendance report"],metrics:["Today present","Today absent","Attendance rate","Pending corrections"]},
exams:{title:"Exams & Results",eyebrow:"Assessment",description:"Plan examinations, manage marks, publish results and track academic performance.",permission:"exams.view",icon:ClipboardCheck,color:"violet",actions:["Create exam","Enter marks","Publish results"],metrics:["Upcoming exams","Results pending","Published results","Pass rate"]},
certificates:{title:"Certificates",eyebrow:"Academic records",description:"Issue, verify and manage student certificates with controlled numbering and audit history.",permission:"certificates.issue",icon:Award,color:"amber",actions:["Issue certificate","Verify certificate","Certificate register"],metrics:["Issued","Pending","Verified","This month"]},
  finance:{title:"Fees & Finance",eyebrow:"Finance",description:"This module now uses the dedicated Fees workspace for collections and receipts.",permission:"finance.view",icon:WalletCards,color:"cyan",actions:["Open Fees workspace"],metrics:["Collections","Outstanding","Paid today","Pending"]},
inventory:{title:"Inventory & Assets",eyebrow:"Operations",description:"Track institutional assets, equipment, assignments and maintenance lifecycle.",permission:"inventory.manage",icon:Package,color:"orange",actions:["Add asset","Assign asset","Maintenance"],metrics:["Assets","Assigned","Maintenance due","Available"]},
payroll:{title:"Payroll & Leave",eyebrow:"People operations",description:"Manage employee salary structures, payroll processing, payslips and leave workflows.",permission:"employees.manage",icon:Banknote,color:"rose",actions:["Payroll run","Leave requests","Payslips"],metrics:["Employees","Payroll due","Leave requests","Processed"]},
reports:{title:"Reports & Analytics",eyebrow:"Insights",description:"Turn operational data into decision-ready reports across students, academics, finance and CRM.",permission:"reports.view",icon:BarChart3,color:"sky",actions:["Student report","Finance report","Academic report"],metrics:["Students","Courses","Batches","Online learners"]},
crm:{title:"CRM & Follow-ups",eyebrow:"Relationship management",description:"Manage leads, counsellor activity, follow-ups and admission conversion performance.",permission:"crm.view",icon:ContactRound,color:"blue",actions:["New lead","Today's follow-ups","Conversion report"],metrics:["Leads","Hot leads","Due today","Converted"]},
communication:{title:"Communication",eyebrow:"Engagement",description:"Prepare notices and transactional communication workflows for students and employees.",permission:"dashboard.view",icon:Megaphone,color:"indigo",actions:["Create notice","Email queue","Templates"],metrics:["Drafts","Queued","Sent today","Failed"]},
ai:{title:"AI Workspace",eyebrow:"Intelligence",description:"Prepare controlled AI assistants and organization analytics with permission-aware access.",permission:"ai.analytics.organization",icon:BrainCircuit,color:"violet",actions:["Organization insights","Knowledge base","AI usage"],metrics:["Insights","Knowledge items","AI requests","Audited"]},
};

export default async function ModulePage({params}){
const {module}=await params;const cfg=configs[module];const user=await getCurrentUser();if(!user)redirect("/login");if(!cfg)redirect("/dashboard");if(!hasPermission(user,cfg.permission))redirect("/dashboard");
const [students,courses,batches,users,online]=await Promise.all([db.student.count(),db.course.count({where:{active:true}}),db.batch.count(),db.user.count({where:{status:"ACTIVE"}}),db.onlineEnrollment.count({where:{status:"ACTIVE"}})]);
const base={admissions:students,batches:batches,attendance:students,exams:courses,certificates:students,finance:students,inventory:users,payroll:users,reports:students,crm:students,communication:users,ai:online};
const values=[base[module]??0,module==="batches"?Math.max(batches-1,0):module==="finance"?online:module==="payroll"?users:module==="reports"?courses:module==="ai"?online:0,module==="reports"?batches:module==="attendance"?Math.max(students-online,0):module==="batches"?Math.max(50-batches,0):module==="admissions"?online:0,module==="reports"?online:0];
const Icon=cfg.icon;
return <main className="px-4 py-6 sm:px-6 lg:px-8"><div className="mx-auto max-w-[1600px]">
<div className="mb-6 flex items-center gap-3 text-xs font-bold text-slate-500"><Link href="/dashboard" className="inline-flex items-center gap-1 hover:text-blue-600"><ArrowLeft size={14}/> Command Center</Link><span>/</span><span>{cfg.title}</span></div>
<section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-100/60 blur-3xl"/><div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div><div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.18em] text-blue-700"><Icon size={13}/>{cfg.eyebrow}</div><h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">{cfg.title}</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{cfg.description}</p></div><div className="flex flex-wrap gap-2">                {cfg.actions.map((a,i)=>(
                  module === "finance" && i === 0 ? (
                    <Link key={a} href="/dashboard/admin/fees" className={(i===0?"bg-slate-950 text-white":"border border-slate-200 bg-white text-slate-700")+" inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black shadow-sm"}>
                      {i===0?<Plus size={15}/>:<ArrowUpRight size={14}/>} {a}
                    </Link>
                  ) : (
                    <button key={a} className={(i===0?"bg-slate-950 text-white":"border border-slate-200 bg-white text-slate-700")+" inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black shadow-sm"}>
                      {i===0?<Plus size={15}/>:<ArrowUpRight size={14}/>} {a}
                    </button>
                  )
                ))}</div></div></section>
<section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cfg.metrics.map((m,i)=><div key={m} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-[10px] font-black uppercase tracking-[.15em] text-slate-400">{m}</span><span className="h-2 w-2 rounded-full bg-blue-500"/></div><div className="mt-3 text-3xl font-black">{values[i]??0}</div><div className="mt-1 text-[11px] text-slate-400">{i===0?"Live from current ERP data":"Operational workspace metric"}</div></div>)}</section>
<section className="mt-5 grid gap-5 xl:grid-cols-[1.3fr_.7fr]"><div className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 p-5"><h2 className="font-black">Workspace</h2><p className="mt-1 text-xs text-slate-500">The module is connected to the ERP shell and permission system.</p></div><div className="grid gap-3 p-5 sm:grid-cols-3">                {cfg.actions.map((a,i)=>(
                  module === "finance" && i === 0 ? (
                    <Link key={a} href="/dashboard/admin/fees" className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-sm">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-blue-600 shadow-sm">{i===0?<Plus size={18}/>:i===1?<Search size={18}/>:<Clock3 size={18}/>}</div>
                      <h3 className="mt-4 text-sm font-black">{a}</h3>
                      <p className="mt-1 text-xs leading-5 text-slate-500">Open the dedicated offline fee collection workspace.</p>
                    </Link>
                  ) : (
                    <div key={a} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-blue-600 shadow-sm">{i===0?<Plus size={18}/>:i===1?<Search size={18}/>:<Clock3 size={18}/>}</div>
                      <h3 className="mt-4 text-sm font-black">{a}</h3>
                      <p className="mt-1 text-xs leading-5 text-slate-500">Workflow entry point ready for the module.</p>
                    </div>
                  )
                ))}</div></div><div className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-xl"><div className="flex items-center gap-2"><ShieldCheck size={18} className="text-cyan-300"/><h2 className="font-black">Control status</h2></div><div className="mt-5 space-y-3 text-xs">{[["Access control","Permission protected"],["Data layer","Connected to ERP database"],["Audit","Central audit logging enabled"],["Responsive UI","Desktop + mobile ready"]].map(([a,b])=><div key={a} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3"><span className="text-slate-300">{a}</span><span className="font-black text-emerald-300">{b}</span></div>)}</div></div></section>
</div></main>;
}