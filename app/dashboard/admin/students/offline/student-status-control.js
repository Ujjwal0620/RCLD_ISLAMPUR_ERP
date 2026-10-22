"use client";
import { useState } from "react";

const statuses=["ACTIVE","COMPLETED","TRANSFERRED","DROPPED_OUT","SUSPENDED","CANCELLED"];
export default function StudentStatusControl({studentId,value,canManage}){
 const [status,setStatus]=useState(value); const [reason,setReason]=useState(""); const [busy,setBusy]=useState(false); const [msg,setMsg]=useState("");
 if(!canManage)return <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black">{String(value).replaceAll("_"," ")}</span>;
 async function save(){
  setBusy(true);setMsg("");
  try{const r=await fetch("/api/admin/students/status",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({studentId,status,reason})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Unable to update");setMsg("Saved");setTimeout(()=>window.location.reload(),350)}catch(e){setMsg(e.message);setStatus(value)}finally{setBusy(false)}
 }
 return <div className="flex flex-wrap items-center gap-2"><select className="rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-black" value={status} onChange={e=>setStatus(e.target.value)} disabled={busy}>{statuses.map(s=><option key={s} value={s}>{s.replaceAll("_"," ")}</option>)}</select>{status!==value&&<><input className="erp-input w-44 py-1.5 text-[10px]" value={reason} onChange={e=>setReason(e.target.value)} placeholder="Reason"/><button type="button" disabled={busy} onClick={save} className="rounded-full bg-slate-950 px-3 py-1.5 text-[10px] font-black text-white">{busy?"Saving...":"Save"}</button></>}{msg&&<span className="text-[10px] font-bold text-emerald-600">{msg}</span>}</div>;
}
