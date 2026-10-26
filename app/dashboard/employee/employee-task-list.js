"use client";
import {useState} from "react";
import {CheckCircle2,Clock3,LoaderCircle,Send} from "lucide-react";
export default function EmployeeTaskList({tasks}){
 const [rows,setRows]=useState(tasks),[busy,setBusy]=useState("");
 async function update(id,status){
  setBusy(id); try{const r=await fetch("/api/admin/tasks/"+id,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Unable to update");setRows(v=>v.map(x=>x.id===id?{...x,status}:x));}catch(e){alert(e.message)}finally{setBusy("")}
 }
 return <div className="mt-4 space-y-3">{rows.map(t=><div key={t.id} className="rounded-xl border border-slate-200 p-4">
  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-black text-slate-900">{t.title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{t.description||"No additional instructions."}</p></div><span className="h-fit rounded-full bg-blue-50 px-2 py-1 text-[10px] font-black text-blue-700">{t.priority}</span></div>
  <div className="mt-4 flex flex-wrap items-center gap-2"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black">{t.status.replaceAll("_"," ")}</span>{t.dueAt&&<span className="text-[10px] font-bold text-slate-500">Due {new Date(t.dueAt).toLocaleString("en-IN")}</span>}
   {t.status==="TODO"&&<button disabled={busy===t.id} onClick={()=>update(t.id,"IN_PROGRESS")} className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-2 text-[10px] font-black text-white"><Clock3 size={12}/> Start</button>}
   {t.status==="IN_PROGRESS"&&<button disabled={busy===t.id} onClick={()=>update(t.id,"REVIEW")} className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-[10px] font-black text-white"><Send size={12}/> Submit for review</button>}
   {t.status==="REVIEW"&&<span className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-[10px] font-black text-amber-700"><CheckCircle2 size={12}/> Waiting for manager</span>}
  </div>
 </div>)}{!rows.length&&<p className="text-sm text-slate-500">No tasks assigned.</p>}</div>
}