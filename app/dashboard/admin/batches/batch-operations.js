"use client";
import { useState } from "react";
export default function BatchOperations({batch,employees}){
 const [facultyId,setFacultyId]=useState("");
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");
 async function assign(action,id){
  setBusy(true); setMessage("");
  try{
   const res=await fetch("/api/admin/batches/faculty",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({batchId:batch.id,employeeId:id,action})});
   const data=await res.json(); if(!res.ok) throw new Error(data.error||"Unable to update faculty");
   setMessage("Saved successfully."); setTimeout(()=>window.location.reload(),400);
  }catch(e){setMessage(e.message)}finally{setBusy(false)}
 }
 return <div className="mt-4 border-t border-slate-100 pt-4">
  <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">Faculty assignment</div>
  <div className="mt-2 flex flex-wrap gap-1.5">{batch.faculty.map(f=><span key={f.id} className="rounded-full bg-violet-50 px-2 py-1 text-[10px] font-black text-violet-700">{f.name} <button type="button" disabled={busy} onClick={()=>assign("REMOVE",f.id)}>×</button></span>)}</div>
  <div className="mt-2 flex gap-2"><select className="erp-input min-w-0 flex-1" value={facultyId} onChange={e=>setFacultyId(e.target.value)}><option value="">Assign employee...</option>{employees.map(e=><option key={e.id} value={e.id}>{e.user.name} · {e.employeeCode}</option>)}</select><button type="button" disabled={!facultyId||busy} onClick={()=>assign("ASSIGN",facultyId)} className="rounded-xl bg-slate-950 px-3 text-xs font-black text-white disabled:opacity-40">Assign</button></div>
  {message&&<p className="mt-2 text-[11px] font-bold text-emerald-600">{message}</p>}
 </div>
}