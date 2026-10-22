"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {Plus,Loader2} from "lucide-react";
export default function CourseForm(){
 const router=useRouter(); const [form,setForm]=useState({code:"",name:"",duration:"",eligibility:"",standardFee:"",onlineFee:""});
 const [busy,setBusy]=useState(false); const [message,setMessage]=useState(""); const [error,setError]=useState("");
 async function submit(e){e.preventDefault();setBusy(true);setMessage("");setError("");try{const r=await fetch("/api/admin/courses",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});const d=await r.json();if(!r.ok)throw new Error(d.error||"Unable to save course");setForm({code:"",name:"",duration:"",eligibility:"",standardFee:"",onlineFee:""});setMessage("Course created successfully.");router.refresh()}catch(e){setError(e.message)}finally{setBusy(false)}}
 const input="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";
 return <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,.045)]">
  <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700"><Plus size={19}/></div><div><h2 className="font-black">Add programme</h2><p className="text-xs text-slate-500">Create a course for the institutional catalogue.</p></div></div>
  <div className="mt-5 space-y-3.5">
   <Field label="Course code"><input required value={form.code} onChange={e=>setForm({...form,code:e.target.value})} placeholder="ADCA" className={input}/></Field>
   <Field label="Course name"><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Advanced Diploma in Computer Applications" className={input}/></Field>
   <Field label="Duration"><input value={form.duration} onChange={e=>setForm({...form,duration:e.target.value})} placeholder="12 months" className={input}/></Field>
   <Field label="Eligibility"><input value={form.eligibility} onChange={e=>setForm({...form,eligibility:e.target.value})} placeholder="10th pass" className={input}/></Field>
   <div className="grid grid-cols-2 gap-3"><Field label="Offline fee"><input type="number" min="0" value={form.standardFee} onChange={e=>setForm({...form,standardFee:e.target.value})} placeholder="₹" className={input}/></Field><Field label="Online fee"><input type="number" min="0" value={form.onlineFee} onChange={e=>setForm({...form,onlineFee:e.target.value})} placeholder="₹" className={input}/></Field></div>
   {error&&<p className="rounded-xl bg-red-50 px-3 py-2.5 text-xs font-bold text-red-700">{error}</p>}{message&&<p className="rounded-xl bg-emerald-50 px-3 py-2.5 text-xs font-bold text-emerald-700">{message}</p>}
   <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white disabled:opacity-60">{busy&&<Loader2 size={16} className="animate-spin"/>}{busy?"Saving...":"Create course"}</button>
  </div>
 </form>;
}
function Field({label,children}){return <label className="block"><span className="mb-1.5 block text-[11px] font-black uppercase tracking-wide text-slate-500">{label}</span>{children}</label>}
