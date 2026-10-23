"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Edit3, Plus, Search, X, Save, Loader2 } from "lucide-react";
import DeleteAction from "@/components/delete-action";

const EMPTY = {
  employeeCode:"", name:"", email:"", phone:"", password:"", designation:"",
  department:"", employmentType:"FULL_TIME", status:"ACTIVE", joinedAt:"",
  dateOfBirth:"", gender:"", alternatePhone:"", presentAddress:"",
  permanentAddress:"", city:"", district:"", state:"", pinCode:"",
  qualification:"", skills:"", experience:"", specialization:"",
  profileImageUrl:"", emergencyContactName:"", emergencyContactPhone:"",
  emergencyContactRelation:"", notes:"", roleIds:[], userStatus:"ACTIVE"
};

export default function EmployeeManager({ employees, roles, superAdmin }) {
  const router = useRouter();
  const [query,setQuery]=useState("");
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState(EMPTY);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");

  const filtered=useMemo(()=>{
    const q=query.trim().toLowerCase();
    if(!q) return employees;
    return employees.filter(e=>[e.user.name,e.user.email,e.user.phone,e.employeeCode,e.designation,e.department,e.status].filter(Boolean).join(" ").toLowerCase().includes(q));
  },[employees,query]);

  function set(key,value){setForm(v=>({...v,[key]:value}));}
  function create(){setError("");setForm(EMPTY);setEditing("new");}
  function edit(e){
    setError("");
    setForm({
      ...EMPTY,
      employeeCode:e.employeeCode||"", name:e.user.name||"", email:e.user.email||"", phone:e.user.phone||"",
      designation:e.designation||"", department:e.department||"", employmentType:e.employmentType||"FULL_TIME",
      status:e.status||"ACTIVE", joinedAt:e.joinedAt?e.joinedAt.slice(0,10):"", dateOfBirth:e.dateOfBirth?e.dateOfBirth.slice(0,10):"",
      gender:e.gender||"", alternatePhone:e.alternatePhone||"", presentAddress:e.presentAddress||"",
      permanentAddress:e.permanentAddress||"", city:e.city||"", district:e.district||"", state:e.state||"", pinCode:e.pinCode||"",
      qualification:e.qualification||"", skills:e.skills||"", experience:e.experience||"", specialization:e.specialization||"",
      profileImageUrl:e.profileImageUrl||"", emergencyContactName:e.emergencyContactName||"",
      emergencyContactPhone:e.emergencyContactPhone||"", emergencyContactRelation:e.emergencyContactRelation||"",
      notes:e.notes||"", roleIds:e.user.roles.map(r=>r.id), userStatus:e.user.status||"ACTIVE"
    });
    setEditing(e.id);
  }
  async function save(event){
    event.preventDefault();setBusy(true);setError("");
    try{
      const endpoint=editing==="new"?"/api/admin/employees":"/api/admin/employees/"+editing;
      const response=await fetch(endpoint,{method:editing==="new"?"POST":"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
      const data=await response.json().catch(()=>({}));
      if(!response.ok) throw new Error(data.error||"Unable to save employee.");
      setEditing(null);router.refresh();
    }catch(e){setError(e.message)}finally{setBusy(false)}
  }

  return <>
    <section className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
      <div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search name, employee ID, phone, email, department..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500"/></div>
      <button onClick={create} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white hover:bg-blue-700"><Plus size={15}/> Add Employee</button>
    </section>

    <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[1100px] text-left text-sm"><thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-4">Employee</th><th>Code</th><th>Department</th><th>Designation</th><th>Roles</th><th>Status</th><th className="pr-5 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">
        {filtered.map(e=><tr key={e.id} className="hover:bg-slate-50"><td className="px-5 py-4"><b>{e.user.name}</b><div className="text-xs text-slate-400">{e.user.email}</div></td><td className="font-mono text-xs">{e.employeeCode}</td><td>{e.department||"—"}</td><td>{e.designation||"—"}</td><td>{e.user.roles.map(r=><span key={r.id} className="mr-1 inline-flex rounded-full bg-violet-50 px-2 py-1 text-[10px] font-black text-violet-700">{r.name}</span>)}</td><td><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black">{e.status}</span></td><td className="pr-5 text-right"><button onClick={()=>edit(e)} className="mr-2 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50" title="Edit employee"><Edit3 size={15}/></button>{superAdmin&&<DeleteAction compact endpoint={"/api/admin/employees/"+e.id} label={"Delete "+e.user.name} confirmMessage={"Delete "+e.user.name+" ("+e.employeeCode+")? Historical attendance or batch assignments will block deletion."}/>}</td></tr>)}
      </tbody></table></div>
      <div className="divide-y divide-slate-100 md:hidden">{filtered.map(e=><div key={e.id} className="p-4"><div className="flex items-start justify-between gap-3"><div><b>{e.user.name}</b><p className="mt-1 text-xs text-slate-500">{e.employeeCode} · {e.designation||"No designation"}</p></div><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black">{e.status}</span></div><p className="mt-2 text-xs text-slate-500">{e.department||"No department"} · {e.user.email}</p><div className="mt-3 flex gap-2"><button onClick={()=>edit(e)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-black"><Edit3 size={13}/> Edit</button>{superAdmin&&<DeleteAction endpoint={"/api/admin/employees/"+e.id} label="Delete employee" confirmMessage={"Delete "+e.user.name+" ("+e.employeeCode+")? Historical records will block deletion."}/>}</div></div>)}{!filtered.length&&<div className="p-8 text-center text-sm text-slate-500">No employees match your search.</div>}</div>
    </section>

    {editing&&<div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6"><div className="mx-auto my-4 max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl sm:my-8">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="text-lg font-black">{editing==="new"?"Add Employee":"Edit Employee"}</h2><p className="text-xs text-slate-500">Employee profile and account information</p></div><button onClick={()=>setEditing(null)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"><X size={18}/></button></div>
      <form onSubmit={save} className="max-h-[78vh] overflow-y-auto p-5 sm:p-7">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Employee ID / Code" required><input required value={form.employeeCode} onChange={e=>set("employeeCode",e.target.value)} className={input}/></Field>
          <Field label="Full Name" required><input required value={form.name} onChange={e=>set("name",e.target.value)} className={input}/></Field>
          <Field label="Email" required><input required type="email" value={form.email} onChange={e=>set("email",e.target.value)} className={input}/></Field>
          <Field label="Phone"><input value={form.phone} onChange={e=>set("phone",e.target.value)} className={input}/></Field>
          <Field label="Alternate Phone"><input value={form.alternatePhone} onChange={e=>set("alternatePhone",e.target.value)} className={input}/></Field>
          <Field label="Designation"><input value={form.designation} onChange={e=>set("designation",e.target.value)} className={input}/></Field>
          <Field label="Department"><input value={form.department} onChange={e=>set("department",e.target.value)} className={input}/></Field>
          <Field label="Employment Type"><select value={form.employmentType} onChange={e=>set("employmentType",e.target.value)} className={input}>{["FULL_TIME","PART_TIME","CONTRACT","TEMPORARY","INTERN"].map(v=><option key={v}>{v}</option>)}</select></Field>
          <Field label="Employee Status"><select value={form.status} onChange={e=>set("status",e.target.value)} className={input}>{["ACTIVE","INACTIVE","ON_LEAVE","RESIGNED","TERMINATED"].map(v=><option key={v}>{v}</option>)}</select></Field>
          <Field label="Joining Date"><input type="date" value={form.joinedAt} onChange={e=>set("joinedAt",e.target.value)} className={input}/></Field>
          <Field label="Date of Birth"><input type="date" value={form.dateOfBirth} onChange={e=>set("dateOfBirth",e.target.value)} className={input}/></Field>
          <Field label="Gender"><input value={form.gender} onChange={e=>set("gender",e.target.value)} className={input}/></Field>
          <Field label="Qualification"><input value={form.qualification} onChange={e=>set("qualification",e.target.value)} className={input}/></Field>
          <Field label="Experience"><input value={form.experience} onChange={e=>set("experience",e.target.value)} className={input}/></Field>
          <Field label="Specialization"><input value={form.specialization} onChange={e=>set("specialization",e.target.value)} className={input}/></Field>
          <Field label="Skills"><input value={form.skills} onChange={e=>set("skills",e.target.value)} className={input}/></Field>
          <Field label="Profile Image URL"><input value={form.profileImageUrl} onChange={e=>set("profileImageUrl",e.target.value)} className={input}/></Field>
          <Field label="User Account Status"><select value={form.userStatus} onChange={e=>set("userStatus",e.target.value)} className={input}>{["ACTIVE","INVITED","SUSPENDED","DISABLED"].map(v=><option key={v}>{v}</option>)}</select></Field>
          {superAdmin&&<Field label="Roles"><select multiple value={form.roleIds} onChange={e=>set("roleIds",Array.from(e.target.selectedOptions,o=>o.value))} className={input+" min-h-28"}>{roles.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select></Field>}
        </div>
        {editing==="new"&&<div className="mt-4"><Field label="Initial Password" required><input required minLength={8} type="password" value={form.password} onChange={e=>set("password",e.target.value)} className={input}/></Field></div>}
        <div className="mt-4 grid gap-4 lg:grid-cols-2"><Field label="Present Address"><textarea rows={3} value={form.presentAddress} onChange={e=>set("presentAddress",e.target.value)} className={input}/></Field><Field label="Permanent Address"><textarea rows={3} value={form.permanentAddress} onChange={e=>set("permanentAddress",e.target.value)} className={input}/></Field></div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Field label="City"><input value={form.city} onChange={e=>set("city",e.target.value)} className={input}/></Field><Field label="District"><input value={form.district} onChange={e=>set("district",e.target.value)} className={input}/></Field><Field label="State"><input value={form.state} onChange={e=>set("state",e.target.value)} className={input}/></Field><Field label="PIN Code"><input value={form.pinCode} onChange={e=>set("pinCode",e.target.value)} className={input}/></Field></div>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"><h3 className="mb-3 text-sm font-black">Emergency Contact</h3><div className="grid gap-4 sm:grid-cols-3"><Field label="Name"><input value={form.emergencyContactName} onChange={e=>set("emergencyContactName",e.target.value)} className={input}/></Field><Field label="Phone"><input value={form.emergencyContactPhone} onChange={e=>set("emergencyContactPhone",e.target.value)} className={input}/></Field><Field label="Relationship"><input value={form.emergencyContactRelation} onChange={e=>set("emergencyContactRelation",e.target.value)} className={input}/></Field></div></div>
        <div className="mt-4"><Field label="Notes"><textarea rows={4} value={form.notes} onChange={e=>set("notes",e.target.value)} className={input}/></Field></div>
        {error&&<div className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700">{error}</div>}
        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5"><button type="button" onClick={()=>setEditing(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-black">Cancel</button><button disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-black text-white hover:bg-blue-700 disabled:opacity-60">{busy?<Loader2 size={15} className="animate-spin"/>:<Save size={15}/>} {busy?"Saving...":"Save Employee"}</button></div>
      </form>
    </div></div>}
  </>;
}

function Field({label,children,required}){return <label className="block"><span className="mb-1.5 block text-[10px] font-black uppercase tracking-wide text-slate-500">{label}{required?" *":""}</span>{children}</label>}
const input="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";