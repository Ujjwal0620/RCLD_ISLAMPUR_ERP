"use client";
import { useEffect,useMemo,useState } from "react";
import { CheckCircle2, Loader2, Users } from "lucide-react";

const states=["PRESENT","ABSENT","LATE","EXCUSED"];
export default function StudentAttendance({batches,canManage}){
 const [batchId,setBatchId]=useState(batches[0]?.id||"");
 const [date,setDate]=useState(new Date().toISOString().slice(0,10));
 const [students,setStudents]=useState([]);
 const [status,setStatus]=useState({});
 const [notes,setNotes]=useState({});
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");
 const batch=useMemo(()=>batches.find(b=>b.id===batchId),[batches,batchId]);

 useEffect(()=>{if(!batchId)return; (async()=>{setBusy(true);setMessage("");try{
  const rows=await fetch("/api/admin/attendance/students?batchId="+encodeURIComponent(batchId));
  if(!rows.ok) throw new Error("Unable to load learners.");
  const data=await rows.json();
  setStudents(data.students||[]);
  const ar=await fetch("/api/admin/attendance/students?batchId="+encodeURIComponent(batchId)+"&date="+date);
  const ad=await ar.json(); const next={}; const nextNotes={};
  (ad.records||[]).forEach(r=>{next[r.studentId]=r.status;nextNotes[r.studentId]=r.note||""});
  (data.students||[]).forEach(s=>{if(!next[s.id])next[s.id]="PRESENT";});
  setStatus(next);setNotes(nextNotes);
 }catch(e){setMessage(e.message)}finally{setBusy(false)}})()},[batchId,date]);

 async function save(){
  setBusy(true);setMessage("");
  try{const res=await fetch("/api/admin/attendance/students",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({batchId,attendanceDate:date,records:students.map(s=>({studentId:s.id,status:status[s.id]||"PRESENT",note:notes[s.id]||""}))})});const d=await res.json();if(!res.ok)throw new Error(d.error||"Unable to save attendance.");setMessage("Attendance saved successfully.");}catch(e){setMessage(e.message)}finally{setBusy(false)}
 }
 return <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
  <div className="border-b border-slate-100 p-5"><div className="grid gap-3 md:grid-cols-[1fr_180px_auto] md:items-end"><label><span className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-500">Batch</span><select className="erp-input w-full" value={batchId} onChange={e=>setBatchId(e.target.value)}>{batches.map(b=><option key={b.id} value={b.id}>{b.code} · {b.name}</option>)}</select></label><label><span className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-500">Date</span><input className="erp-input w-full" type="date" value={date} onChange={e=>setDate(e.target.value)}/></label><div className="rounded-xl bg-slate-50 px-4 py-3 text-xs font-black text-slate-600"><Users size={14} className="mr-1 inline"/> {batch?.count||0} learners</div></div></div>
  {!canManage?<div className="p-8 text-center text-sm text-slate-500">View-only access. Student attendance management permission is required to save.</div>:<><div className="divide-y divide-slate-100">{students.map(s=><div key={s.id} className="grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center"><div><div className="text-sm font-black">{s.name}</div><div className="mt-1 text-[11px] text-slate-400">{s.registrationNo||"No registration"} · {s.phone||"No phone"}</div><input className="erp-input mt-2 w-full md:max-w-md" value={notes[s.id]||""} onChange={e=>setNotes({...notes,[s.id]:e.target.value})} placeholder="Note (optional)"/></div><div className="grid grid-cols-2 gap-1 sm:grid-cols-4">{states.map(x=><button type="button" key={x} onClick={()=>setStatus({...status,[s.id]:x})} className={"rounded-lg px-2.5 py-2 text-[10px] font-black "+(status[s.id]===x?"bg-slate-950 text-white":"bg-slate-100 text-slate-500")}>{x}</button>)}</div></div>)}{!students.length&&!busy&&<div className="p-10 text-center text-sm text-slate-500">No active learners in this batch.</div>}</div><div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 p-5"><p className={"text-xs font-bold "+(message.includes("successfully")?"text-emerald-600":"text-rose-600")}>{message}</p><button type="button" disabled={busy||!students.length} onClick={save} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white disabled:opacity-40">{busy&&<Loader2 size={15} className="animate-spin"/>}{busy?"Saving...":"Save attendance"}</button></div></>}
 </section>;
}