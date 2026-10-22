"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {useState} from "react";
import {LayoutDashboard,GraduationCap,BookOpen,Layers3,CalendarCheck2,WalletCards,ClipboardCheck,Award,UserCog,ContactRound,Megaphone,BarChart3,Package,Banknote,BrainCircuit,ShieldCheck,Settings,FileSearch,ChevronDown,Menu,X,LogOut,Search,Sparkles,MonitorPlay} from "lucide-react";

const groups=[
{label:"Command",items:[{href:"/dashboard",label:"Overview",icon:LayoutDashboard}]},
{label:"Academic",items:[
{href:"/dashboard/admin/students/offline",label:"Offline Students",icon:GraduationCap,permission:"students.view"},{href:"/dashboard/admin/students/online",label:"Online Students",icon:MonitorPlay,permission:"students.view"},
{href:"/dashboard/admin/admissions",label:"Admissions & Enquiries",icon:ContactRound,permission:"crm.view"},
{href:"/dashboard/admin/courses",label:"Courses",icon:BookOpen,permission:"courses.manage"},
{href:"/dashboard/admin/batches",label:"Batches",icon:Layers3,permission:"batches.view"},
{href:"/dashboard/admin/attendance",label:"Attendance",icon:CalendarCheck2,permission:"students.view"},{href:"/dashboard/admin/attendance/reports",label:"Attendance Reports",icon:BarChart3,permission:"reports.view"},
{href:"/dashboard/admin/exams",label:"Exams & Results",icon:ClipboardCheck,permission:"exams.view"},
{href:"/dashboard/admin/certificates",label:"Certificates",icon:Award,permission:"certificates.issue"}]},
{label:"People & CRM",items:[
{href:"/dashboard/admin/employees",label:"Employees",icon:UserCog,permission:"employees.manage"},{href:"/dashboard/admin/attendance/employee",label:"Employee Attendance",icon:CalendarCheck2,permission:"employees.view"},{href:"/dashboard/admin/users",label:"Users & Access",icon:ShieldCheck,permission:"employees.manage"},
{href:"/dashboard/admin/crm",label:"CRM & Follow-ups",icon:ContactRound,permission:"crm.view"},
{href:"/dashboard/admin/communication",label:"Communication",icon:Megaphone,permission:"dashboard.view"}]},
{label:"Finance & Operations",items:[
{href:"/dashboard/admin/finance",label:"Fees & Finance",icon:WalletCards,permission:"finance.view"},
{href:"/dashboard/admin/inventory",label:"Inventory & Assets",icon:Package,permission:"inventory.manage"},
{href:"/dashboard/admin/payroll",label:"Payroll & Leave",icon:Banknote,permission:"employees.manage"},
{href:"/dashboard/admin/reports",label:"Reports & Analytics",icon:BarChart3,permission:"reports.view"}]},
{label:"Learning & Intelligence",items:[
{href:"/dashboard/admin/courses/content",label:"LMS Content",icon:BookOpen,permission:"lms.manage"},
{href:"/dashboard/admin/ai",label:"AI Workspace",icon:BrainCircuit,permission:"ai.analytics.organization"}]},
{label:"Administration",items:[
{href:"/dashboard/admin/roles",label:"Roles & Permissions",icon:ShieldCheck,permission:"roles.manage"},
{href:"/dashboard/admin/audit",label:"Audit Logs",icon:FileSearch,permission:"audit.view"},
{href:"/dashboard/admin/settings",label:"System Settings",icon:Settings,permission:"roles.manage"}]}];

function allowed(item,user){if(!item.permission)return true;return user?.userRoles?.some(a=>a.role?.name==="SUPERADMIN"||a.role?.permissions?.some(p=>p.permission?.key===item.permission));}

export default function ErpSidebar({user}){
const pathname=usePathname();const[open,setOpen]=useState(false);const[expanded,setExpanded]=useState({});
const initials=(user?.name||"A").split(" ").map(x=>x[0]).join("").slice(0,2).toUpperCase();
return <><button onClick={()=>setOpen(true)} aria-label="Open navigation" className="fixed left-4 top-4 z-[70] rounded-2xl border border-slate-200/80 bg-white/90 p-3 text-slate-700 shadow-xl backdrop-blur-xl lg:hidden"><Menu size={20}/></button>
{open&&<button aria-label="Close navigation" onClick={()=>setOpen(false)} className="fixed inset-0 z-[60] bg-slate-950/35 backdrop-blur-sm lg:hidden"/>}
<aside className={(open?"translate-x-0":"-translate-x-full")+" fixed inset-y-0 left-0 z-[65] flex w-[292px] flex-col border-r border-slate-200/70 bg-white/90 shadow-[20px_0_70px_rgba(15,23,42,.08)] backdrop-blur-2xl transition-transform duration-200 lg:translate-x-0"}>
<div className="flex h-[78px] shrink-0 items-center justify-between border-b border-slate-100 px-5"><Link href="/dashboard" onClick={()=>setOpen(false)} className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 text-sm font-black text-white shadow-lg shadow-blue-500/25">R</div><div><p className="text-[15px] font-black tracking-tight text-slate-950">RCLD Islampur</p><p className="mt-0.5 text-[9px] font-black uppercase tracking-[.22em] text-slate-400">ERP Command Center</p></div></Link><button onClick={()=>setOpen(false)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 lg:hidden"><X size={18}/></button></div>
<div className="border-b border-slate-100 px-4 py-3"><div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs text-slate-400"><Search size={15}/><span>Search workspace</span><kbd className="ml-auto rounded bg-white px-1.5 py-0.5 text-[9px] font-bold shadow-sm">⌘K</kbd></div></div>
<nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">{groups.map(group=>{const visible=group.items.filter(i=>allowed(i,user));if(!visible.length)return null;const isOpen=expanded[group.label]!==false;return <section key={group.label} className="mb-4"><button onClick={()=>setExpanded(s=>({...s,[group.label]:!isOpen}))} className="mb-1 flex w-full items-center px-3 text-[9px] font-black uppercase tracking-[.2em] text-slate-400"><span>{group.label}</span><ChevronDown size={13} className={(isOpen?"":"-rotate-90")+" ml-auto transition-transform"}/></button>{isOpen&&<div className="space-y-0.5">{visible.map(item=>{const active=pathname===item.href||(item.href!=="/dashboard"&&pathname.startsWith(item.href));const Icon=item.icon;return <Link key={item.href} href={item.href} onClick={()=>setOpen(false)} className={"group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-bold transition-all "+(active?"bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm":"text-slate-600 hover:bg-slate-50 hover:text-slate-950")}><span className={"grid h-8 w-8 place-items-center rounded-lg "+(active?"bg-white text-blue-600 shadow-sm":"text-slate-400 group-hover:text-slate-700")}><Icon size={16}/></span><span>{item.label}</span>{active&&<span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600 shadow-[0_0_0_4px_rgba(37,99,235,.10)]"/>}</Link>})}</div>}</section>})}</nav>
<div className="shrink-0 border-t border-slate-100 p-3"><div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-3 text-white shadow-lg"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-xs font-black ring-1 ring-white/10">{initials}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-black">{user?.name}</p><p className="truncate text-[10px] text-slate-400">{user?.email}</p></div><Sparkles size={15} className="text-cyan-300"/></div><form action="/api/auth/logout" method="post"><button className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-[11px] font-black text-slate-200 hover:bg-white/15"><LogOut size={13}/> Sign out</button></form></div></div>
</aside></>;
}