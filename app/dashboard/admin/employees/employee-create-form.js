"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {Eye,EyeOff,Loader2,Plus,ShieldCheck} from "lucide-react";

const input="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

export default function EmployeeCreateForm({roles,departments=[],skills=[]}){
 const router=useRouter(); const[open,setOpen]=useState(false); const[busy,setBusy]=useState(false); const[error,setError]=useState(""); const[show,setShow]=useState(false);
 const[form,setForm]=useState({name:"",email:"",phone:"",password:"",employeeCode:"",designation:"",joinedAt:"",departmentId:"",employmentType:"FULL_TIME",basicPay:"",address:"",skillIds:[],roleIds:[]});
 const set=(key,value)=>setForm(v=>({...v,[key]:value}));
 const toggleSkill=id=>set("skillIds",form.skillIds.includes(id)?form.skillIds.filter(x=>x!==id):[...form.skillIds,id]);
 const toggleRole=id=>set("roleIds",form.roleIds.includes(id)?form.roleIds.filter(x=>x!==id):[...form.roleIds,id]);
 async function submit(e){e.preventDefault();setBusy(true);setError("");try{const r=await fetch("/api/admin/employees",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||"Unable to create employee.");setForm({name:"",email:"",phone:"",password:"",employeeCode:"",designation:"",joinedAt:"",departmentId:"",employmentType:"FULL_TIME",basicPay:"",address:"",skillIds:[],roleIds:[]});setOpen(false);router.refresh();}catch(e){setError(e.message)}finally{setBusy(false)}}
 return <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
  <button onClick={()=>setOpen(v=>!v)} className="flex w-full items-center justify-between p-5 text-left"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-blue-600">Employee master</p><h2 className="mt-1 text-lg font-black">Create employee & login</h2><p className="mt-1 text-xs text-slate-500">Creates the employee, secure user account and role mappings in one transaction.</p></div><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white"><Plus size={18}/></span></button>
  {open&&<form onSubmit={submit} className="border-t border-slate-100 p-5"><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
   <Field label="Employee name"><input required className={input} value={form.name} onChange={e=>set("name",e.target.value)} /></Field>
   <Field label="Employee code"><input required className={input} value={form.employeeCode} onChange={e=>set("employeeCode",e.target.value)} placeholder="RCLD-EMP-001"/></Field>
   <Field label="Designation"><input className={input} value={form.designation} onChange={e=>set("designation",e.target.value)} placeholder="Faculty / Counsellor"/></Field>
   <Field label="Email / Login ID"><input required type="email" className={input} value={form.email} onChange={e=>set("email",e.target.value)} /></Field>
   <Field label="Phone"><input className={input} value={form.phone} onChange={e=>set("phone",e.target.value)} /></Field>
   <Field label="Joining date"><input type="date" className={input} value={form.joinedAt} onChange={e=>set("joinedAt",e.target.value)} /></Field>
   <Field label="Department"><select className={input} value={form.departmentId} onChange={e=>set("departmentId",e.target.value)}><option value="">Select department</option>{departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></Field>
   <Field label="Employment type"><select className={input} value={form.employmentType} onChange={e=>set("employmentType",e.target.value)}><option value="FULL_TIME">Full time</option><option value="PART_TIME">Part time</option><option value="CONTRACT">Contract</option><option value="INTERN">Intern</option></select></Field>
   <Field label="Basic pay"><input type="number" min="0" className={input} value={form.basicPay} onChange={e=>set("basicPay",e.target.value)}/></Field>
   <Field label="Address"><input className={input} value={form.address} onChange={e=>set("address",e.target.value)}/></Field>
   <Field label="Initial password"><div className="relative"><input required minLength={8} type={show?"text":"password"} className={input+" pr-11"} value={form.password} onChange={e=>set("password",e.target.value)}/><button type="button" onClick={()=>setShow(v=>!v)} className="absolute right-3 top-2.5 text-slate-400">{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></Field>
  </div>
  <div className="mt-5"><div className="text-xs font-black uppercase tracking-wider text-slate-500">Skills</div><div className="mt-3 flex max-h-40 flex-wrap gap-2 overflow-y-auto">{skills.map(s=><label key={s.id} className={"cursor-pointer rounded-xl border px-3 py-2 text-xs font-bold "+(form.skillIds.includes(s.id)?"border-emerald-300 bg-emerald-50 text-emerald-700":"border-slate-200 text-slate-600")}><input className="mr-2" type="checkbox" checked={form.skillIds.includes(s.id)} onChange={()=>toggleSkill(s.id)}/>{s.name}</label>)}</div></div>
  <div className="mt-5"><div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500"><ShieldCheck size={15}/> Roles & access</div><div className="mt-3 flex flex-wrap gap-2">{roles.map(r=><label key={r.id} className={"cursor-pointer rounded-xl border px-3 py-2 text-xs font-bold "+(form.roleIds.includes(r.id)?"border-blue-300 bg-blue-50 text-blue-700":"border-slate-200 text-slate-600")}><input className="mr-2" type="checkbox" checked={form.roleIds.includes(r.id)} onChange={()=>toggleRole(r.id)}/>{r.name}</label>)}</div></div>
  {error&&<p className="mt-4 rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-700">{error}</p>}
  <button disabled={busy||!form.roleIds.length} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white disabled:opacity-50">{busy?<Loader2 size={16} className="animate-spin"/>:<Plus size={16}/>} Create employee</button>
  </form>}
 </section>
}
function Field({label,children}){return <label><span className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</span>{children}</label>}