"use client";
import { useEffect, useState } from "react";
import { ImagePlus, Pencil, Save, Trash2, X } from "lucide-react";

const blank={eyebrow:"",title:"",accent:"",description:"",imageUrl:"",primaryLabel:"Explore courses",primaryHref:"/courses",secondaryLabel:"Student login",secondaryHref:"/student/login",statLabel:"Career-ready learning",sortOrder:0,active:true};

export default function HomepageStudio({initialSlides}) {
 const [slides,setSlides]=useState(initialSlides); const [form,setForm]=useState(blank); const [busy,setBusy]=useState(false); const [message,setMessage]=useState("");
 const edit=s=>{setForm({...blank,...s});window.scrollTo({top:0,behavior:"smooth"})};
 const reset=()=>setForm(blank);
 async function save(e){e.preventDefault();setBusy(true);setMessage("");const res=await fetch("/api/admin/homepage/slides",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});const data=await res.json();if(res.ok){setSlides(prev=>{const rest=prev.filter(x=>x.id!==data.slide.id);return [...rest,data.slide].sort((a,b)=>a.sortOrder-b.sortOrder)});reset();setMessage("Homepage slide saved.");}else setMessage(data.error||"Unable to save.");setBusy(false)}
 async function remove(id){if(!confirm("Delete this homepage slide?"))return;const res=await fetch("/api/admin/homepage/slides",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});if(res.ok)setSlides(prev=>prev.filter(x=>x.id!==id))}
 return <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
  <form onSubmit={save} className="erp-panel h-fit p-5">
   <div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-[.18em] text-blue-600">Homepage CMS</p><h2 className="mt-1 text-xl font-black">{form.id?"Edit slide":"Add slide"}</h2></div>{form.id&&<button type="button" onClick={reset} className="rounded-xl border p-2"><X size={16}/></button>}</div>
   <p className="mt-2 text-xs leading-5 text-slate-500">Use exactly 3 active slides for the public homepage. Paste a high-resolution image URL; object storage upload can plug into this field later.</p>
   <div className="mt-5 space-y-3">
    <Input label="Eyebrow" value={form.eyebrow} onChange={v=>setForm({...form,eyebrow:v})}/>
    <Input label="Main heading" required value={form.title} onChange={v=>setForm({...form,title:v})}/>
    <Input label="Highlighted heading" value={form.accent} onChange={v=>setForm({...form,accent:v})}/>
    <label className="block text-xs font-black text-slate-600">Description<textarea className="erp-input mt-1 min-h-24" value={form.description||""} onChange={e=>setForm({...form,description:e.target.value})}/></label>
    <Input label="Banner image URL" required value={form.imageUrl} onChange={v=>setForm({...form,imageUrl:v})}/>
    <div className="grid grid-cols-2 gap-2"><Input label="Primary button" value={form.primaryLabel} onChange={v=>setForm({...form,primaryLabel:v})}/><Input label="Primary link" value={form.primaryHref} onChange={v=>setForm({...form,primaryHref:v})}/></div>
    <div className="grid grid-cols-2 gap-2"><Input label="Secondary button" value={form.secondaryLabel} onChange={v=>setForm({...form,secondaryLabel:v})}/><Input label="Secondary link" value={form.secondaryHref} onChange={v=>setForm({...form,secondaryHref:v})}/></div>
    <Input label="Feature label" value={form.statLabel} onChange={v=>setForm({...form,statLabel:v})}/>
    <div className="grid grid-cols-2 gap-3"><label className="text-xs font-black text-slate-600">Order<input type="number" className="erp-input mt-1" value={form.sortOrder} onChange={e=>setForm({...form,sortOrder:Number(e.target.value)})}/></label><label className="flex items-end gap-2 pb-3 text-xs font-black text-slate-600"><input type="checkbox" checked={form.active} onChange={e=>setForm({...form,active:e.target.checked})}/> Active</label></div>
   </div>
   {message&&<p className="mt-3 text-xs font-bold text-blue-700">{message}</p>}
   <button disabled={busy} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white"><Save size={16}/>{busy?"Saving...":"Save homepage slide"}</button>
  </form>
  <section><div className="mb-4"><h2 className="text-xl font-black">Homepage banner slides</h2><p className="text-sm text-slate-500">{slides.filter(s=>s.active).length} active · public homepage displays the first 3 active slides by order.</p></div><div className="grid gap-4 lg:grid-cols-2">{slides.map(s=><article key={s.id} className="erp-panel overflow-hidden"><div className="h-48 bg-slate-900 bg-cover bg-center" style={{backgroundImage:`linear-gradient(0deg,rgba(2,6,23,.7),rgba(2,6,23,.1)),url("${s.imageUrl}")`}}/><div className="p-5"><div className="flex items-center justify-between"><span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Order {s.sortOrder} · {s.active?"Active":"Hidden"}</span><div className="flex gap-2"><button onClick={()=>edit(s)} className="rounded-lg border p-2"><Pencil size={14}/></button><button onClick={()=>remove(s.id)} className="rounded-lg border p-2 text-red-600"><Trash2 size={14}/></button></div></div><h3 className="mt-3 text-lg font-black">{s.title} <span className="text-blue-600">{s.accent}</span></h3><p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{s.description}</p></div></article>)}</div></section>
 </div>
}
function Input({label,value,onChange,required}){return <label className="block text-xs font-black text-slate-600">{label}<input required={required} className="erp-input mt-1" value={value||""} onChange={e=>onChange(e.target.value)}/></label>}
