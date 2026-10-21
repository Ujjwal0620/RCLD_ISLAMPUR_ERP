"use client";
import {useState} from "react";
export default function CourseForm(){
 const [form,setForm]=useState({code:"",name:"",duration:"",eligibility:"",standardFee:"",onlineFee:""});
 const [message,setMessage]=useState("");
 async function submit(e){
  e.preventDefault(); setMessage("Saving...");
  const r=await fetch("/api/admin/courses",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
  const d=await r.json(); setMessage(r.ok?"Course saved. Refresh the page.":d.error||"Unable to save.");
  if(r.ok)setForm({code:"",name:"",duration:"",eligibility:"",standardFee:"",onlineFee:""});
 }
 return <form onSubmit={submit} className="glass rounded-2xl p-6 space-y-4"><h2 className="text-xl font-bold">Add Course</h2>
  {["code","name","duration","eligibility","standardFee","onlineFee"].map(k=><input key={k} required={k==="code"||k==="name"} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} placeholder={k} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300"/>)}
  <button className="w-full rounded-xl bg-cyan-300 px-4 py-3 font-bold text-slate-950">Save Course</button>{message&&<p className="text-sm text-cyan-200">{message}</p>}
 </form>;
}