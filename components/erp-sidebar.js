"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {LayoutDashboard,Users,BookOpen,GraduationCap,ShieldCheck,Settings,FileSearch,LogOut,X,Menu} from "lucide-react";
import {useState} from "react";
const items=[
{href:"/dashboard",label:"Overview",icon:LayoutDashboard},
{href:"/dashboard/admin/users",label:"Users & Employees",icon:Users,permission:"employees.manage"},{href:"/dashboard/admin/students",label:"Student Master",icon:GraduationCap,permission:"students.view"},
{href:"/dashboard/admin/courses",label:"Courses",icon:BookOpen,permission:"courses.manage"},
{href:"/dashboard/admin/courses/content",label:"LMS Content",icon:GraduationCap,permission:"lms.manage"},
{href:"/dashboard/admin/roles",label:"Roles & Permissions",icon:ShieldCheck,permission:"roles.manage"},
{href:"/dashboard/admin/audit",label:"Audit Logs",icon:FileSearch,permission:"audit.view"},
{href:"/dashboard/admin/settings",label:"System Settings",icon:Settings,permission:"roles.manage"}];
function allowed(item,user){if(!item.permission)return true;return user?.userRoles?.some(a=>a.role?.name==="SUPERADMIN"||a.role?.permissions?.some(p=>p.permission?.key===item.permission));}
export default function ErpSidebar({user}){
const pathname=usePathname();const[open,setOpen]=useState(false);const visible=items.filter(i=>allowed(i,user));
return <><button onClick={()=>setOpen(true)} aria-label="Open navigation" className="fixed left-4 top-4 z-50 rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-lg lg:hidden"><Menu size={20}/></button>
{open&&<button aria-label="Close navigation overlay" onClick={()=>setOpen(false)} className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"/>}
<aside className={(open?"translate-x-0":"-translate-x-full")+" fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-slate-200 bg-white/95 shadow-2xl backdrop-blur-xl transition-transform duration-200 lg:translate-x-0"}>
<div className="flex h-20 items-center justify-between border-b border-slate-100 px-5"><Link href="/dashboard" onClick={()=>setOpen(false)} className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-sm font-black text-white">R</div><div><p className="text-sm font-black text-slate-950">RCLD Islampur</p><p className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">ERP Command</p></div></Link><button onClick={()=>setOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden"><X size={18}/></button></div>
<div className="px-4 pt-5"><p className="px-2 text-[10px] font-black uppercase tracking-[.18em] text-slate-400">Workspace</p></div>
<nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">{visible.map(item=>{const active=pathname===item.href||(item.href!=="/dashboard"&&pathname.startsWith(item.href));const Icon=item.icon;return <Link key={item.href} href={item.href} onClick={()=>setOpen(false)} className={"flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition "+(active?"bg-blue-50 text-blue-700 shadow-sm":"text-slate-600 hover:bg-slate-50 hover:text-slate-950")}><Icon size={18} className={active?"text-blue-600":"text-slate-400"}/><span>{item.label}</span></Link>})}</nav>
<div className="border-t border-slate-100 p-4"><div className="rounded-2xl bg-slate-50 p-3"><div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-full bg-slate-900 text-xs font-black text-white">{user?.name?.slice(0,1)?.toUpperCase()||"A"}</div><div className="min-w-0"><p className="truncate text-sm font-black text-slate-900">{user?.name}</p><p className="truncate text-[11px] text-slate-500">{user?.email}</p></div></div><form action="/api/auth/logout" method="post"><button className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600 hover:bg-slate-100"><LogOut size={14}/> Sign out</button></form></div></div>
</aside></>;
}