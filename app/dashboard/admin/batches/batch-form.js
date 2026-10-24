"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";

export default function BatchForm({ courses }) {
  const router = useRouter();
  const [form,setForm] = useState({code:"",name:"",courseId:courses[0]?.id||"",capacity:"50",status:"PLANNED",startsAt:"",endsAt:"",startTime:"",endTime:"",room:""});
  const [busy,setBusy]=useState(false); const [error,setError]=useState("");

  async function submit(e){
    e.preventDefault(); setBusy(true); setError("");
    try{
      const res=await fetch("/api/admin/batches",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
      const data=await res.json(); if(!res.ok) throw new Error(data.error||"Unable to create batch");
      setForm({code:"",name:"",courseId:courses[0]?.id||"",capacity:"50",status:"PLANNED",startsAt:"",endsAt:"",startTime:"",endTime:"",room:""});
      router.refresh();
    }catch(err){setError(err.message)}finally{setBusy(false)}
  }
  const input="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";
  return <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,.045)]">
    <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700"><Plus size={19}/></div><div><h2 className="font-black">Create batch</h2><p className="text-xs text-slate-500">Set the academic group and capacity.</p></div></div>
    <div className="mt-5 space-y-3.5">
      <Field label="Batch code"><input required value={form.code} onChange={e=>setForm({...form,code:e.target.value})} placeholder="DCA-2026-01" className={input}/></Field>
      <Field label="Batch name"><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="DCA Morning Batch" className={input}/></Field>
      <Field label="Course"><select required value={form.courseId} onChange={e=>setForm({...form,courseId:e.target.value})} className={input}>{courses.map(c=><option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}</select></Field>
      <div className="grid grid-cols-2 gap-3"><Field label="Capacity"><input required type="number" min="1" max="50" value={form.capacity} onChange={e=>setForm({...form,capacity:e.target.value})} className={input}/></Field><Field label="Status"><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} className={input}><option>PLANNED</option><option>ACTIVE</option><option>COMPLETED</option><option>CANCELLED</option></select></Field></div>
      <div className="grid grid-cols-2 gap-3"><Field label="Start date"><input type="date" value={form.startsAt} onChange={e=>setForm({...form,startsAt:e.target.value})} className={input}/></Field><Field label="End date"><input type="date" value={form.endsAt} onChange={e=>setForm({...form,endsAt:e.target.value})} className={input}/></Field></div>
      <div className="grid grid-cols-2 gap-3"><Field label="Class starts"><input type="time" value={form.startTime} onChange={e=>setForm({...form,startTime:e.target.value})} className={input}/></Field><Field label="Class ends"><input type="time" value={form.endTime} onChange={e=>setForm({...form,endTime:e.target.value})} className={input}/></Field></div>
      <Field label="Room / Lab"><input value={form.room} onChange={e=>setForm({...form,room:e.target.value})} placeholder="Lab 1 / Classroom A" maxLength={80} className={input}/></Field>
      {error&&<p className="rounded-xl bg-red-50 px-3 py-2.5 text-xs font-bold text-red-700">{error}</p>}
      <button disabled={busy||!courses.length} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white disabled:opacity-50">{busy&&<Loader2 size={16} className="animate-spin"/>}{busy?"Creating...":"Create batch"}</button>
      {!courses.length&&<p className="text-center text-[11px] text-amber-700">Create an active course first.</p>}
    </div>
  </form>;
}
function Field({label,children}){return <label className="block"><span className="mb-1.5 block text-[11px] font-black uppercase tracking-wide text-slate-500">{label}</span>{children}</label>}
