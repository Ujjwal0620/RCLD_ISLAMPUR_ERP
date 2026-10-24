"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardPlus, Loader2 } from "lucide-react";

export default function TaskAssignmentForm({ employees }) {
  const router=useRouter();
  const [form,setForm]=useState({title:"",description:"",employeeId:employees[0]?.id||"",priority:"NORMAL",dueAt:""});
  const [busy,setBusy]=useState(false); const [error,setError]=useState("");
  async function submit(e){
    e.preventDefault(); setBusy(true); setError("");
    try{
      const res=await fetch("/api/admin/tasks",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
      const data=await res.json().catch(()=>({})); if(!res.ok) throw new Error(data.error||"Unable to assign task.");
      setForm({title:"",description:"",employeeId:form.employeeId,priority:"NORMAL",dueAt:""}); router.refresh();
    }catch(err){setError(err.message)}finally{setBusy(false)}
  }
  const input="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";
  return <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700"><ClipboardPlus size={18}/></div><div><h2 className="font-black">Assign employee task</h2><p className="text-xs text-slate-500">Create accountable work with priority and deadline.</p></div></div>
    <div className="mt-4 grid gap-3 lg:grid-cols-2">
      <Field label="Employee"><select required value={form.employeeId} onChange={e=>setForm({...form,employeeId:e.target.value})} className={input}>{employees.map(e=><option key={e.id} value={e.id}>{e.employeeCode} — {e.user.name}{e.designation?" · "+e.designation:""}</option>)}</select></Field>
      <Field label="Priority"><select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})} className={input}><option value="LOW">Low</option><option value="NORMAL">Normal</option><option value="HIGH">High</option><option value="URGENT">Urgent</option></select></Field>
      <Field label="Task title"><input required minLength={3} maxLength={160} value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Prepare DCA lab assessment" className={input}/></Field>
      <Field label="Due date & time"><input type="datetime-local" value={form.dueAt} onChange={e=>setForm({...form,dueAt:e.target.value})} className={input}/></Field>
      <div className="lg:col-span-2"><Field label="Instructions"><textarea rows={3} maxLength={4000} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Describe the expected outcome..." className={input}/></Field></div>
    </div>
    {error&&<p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700">{error}</p>}
    <button disabled={busy||!employees.length} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-xs font-black text-white disabled:opacity-50">{busy?<Loader2 size={14} className="animate-spin"/>:<ClipboardPlus size={14}/>} {busy?"Assigning...":"Assign task"}</button>
  </form>
}
function Field({label,children}){return <label className="block"><span className="mb-1.5 block text-[10px] font-black uppercase tracking-wide text-slate-500">{label}</span>{children}</label>}
