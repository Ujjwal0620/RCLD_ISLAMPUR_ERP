"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {UserPlus,Loader2} from "lucide-react";

export default function StudentForm(){
 const router=useRouter();
 const [form,setForm]=useState({name:"",phone:"",email:"",studentType:"OFFLINE",status:"ACTIVE"});
 const [busy,setBusy]=useState(false); const [error,setError]=useState("");
 async function submit(e){
  e.preventDefault(); setBusy(true); setError("");
  try{
   const res=await fetch("/api/admin/students",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
   const data=await res.json(); if(!res.ok) throw new Error(data.error||"Unable to create student");
   setForm({name:"",phone:"",email:"",studentType:"OFFLINE",status:"ACTIVE"}); router.refresh();
  }catch(err){setError(err.message)}finally{setBusy(false)}
 }
 const field=(key,label,type="text",placeholder="")=><label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-600">{label}</span><input required={key==="name"} type={type} value={form[key]} placeholder={placeholder} onChange={e=>setForm({...form,[key]:e.target.value})} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"/></label>;
 return <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
  <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700"><UserPlus size={19}/></div><div><h2 className="font-black">Add student</h2><p className="text-xs text-slate-500">Create an offline or online student record.</p></div></div>
  <div className="mt-5 space-y-4">{field("name","Full name","text","Student name")}{field("phone","Phone","tel","Optional phone number")}{field("email","Email","email","Optional email address")}
   <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-600">Student type</span><select value={form.studentType} onChange={e=>setForm({...form,studentType:e.target.value})} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm"><option value="OFFLINE">Offline</option><option value="ONLINE">Online</option></select></label>
   {error&&<p className="rounded-xl bg-red-50 px-3 py-2.5 text-xs font-bold text-red-700">{error}</p>}
   <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white disabled:opacity-60">{busy&&<Loader2 size={16} className="animate-spin"/>}{busy?"Creating...":"Create student"}</button>
  </div>
 </form>
}