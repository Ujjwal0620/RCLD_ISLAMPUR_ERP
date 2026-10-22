"use client";
import { useEffect,useState } from "react";
import { Camera, Clock3, Loader2, MapPin } from "lucide-react";

export default function EmployeeAttendance({employees,self,canManage}){
 const [employeeId,setEmployeeId]=useState(self?.id||employees[0]?.id||"");
 const [date,setDate]=useState(new Date().toISOString().slice(0,10));
 const [record,setRecord]=useState(null);
 const [location,setLocation]=useState("");
 const [note,setNote]=useState("");
 const [breakMinutes,setBreakMinutes]=useState("");
 const [image,setImage]=useState(null);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");
 async function load(){if(!employeeId)return;setBusy(true);try{const r=await fetch("/api/admin/attendance/employee?employeeId="+encodeURIComponent(employeeId)+"&date="+date);const d=await r.json();if(!r.ok)throw new Error(d.error||"Unable to load attendance.");setRecord(d.selected)}catch(e){setMessage(e.message)}finally{setBusy(false)}}
 useEffect(()=>{load()},[employeeId,date]);
 async function submit(action){
  setBusy(true);setMessage("");
  try{const fd=new FormData();fd.set("employeeId",employeeId);fd.set("date",date);fd.set("action",action);fd.set("locationEvidence",location);fd.set("note",note);if(breakMinutes)fd.set("breakMinutes",breakMinutes);if(image)fd.set("image",image);
   const r=await fetch("/api/admin/attendance/employee",{method:"POST",body:fd});const d=await r.json();if(!r.ok)throw new Error(d.error||"Unable to save attendance.");setRecord(d.record);setMessage("Attendance updated successfully.");setImage(null);await load();
  }catch(e){setMessage(e.message)}finally{setBusy(false)}
 }
 const selected=employees.find(e=>e.id===employeeId)||self;
 return <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
  <div className="border-b border-slate-100 p-5"><div className="grid gap-3 md:grid-cols-[1fr_180px]">{canManage&&<label><span className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-500">Employee</span><select className="erp-input w-full" value={employeeId} onChange={e=>setEmployeeId(e.target.value)}>{employees.map(e=><option key={e.id} value={e.id}>{e.employeeCode} · {e.user.name}</option>)}</select></label>}<label><span className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-500">Attendance date</span><input className="erp-input w-full" type="date" value={date} onChange={e=>setDate(e.target.value)}/></label></div></div>
  <div className="p-5"><div className="grid gap-4 lg:grid-cols-[1fr_320px]">
   <div><div className="rounded-2xl bg-slate-50 p-5"><div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Selected employee</div><div className="mt-2 text-xl font-black">{selected?.user?.name||"No employee profile"}</div><div className="mt-1 text-xs text-slate-500">{selected?.employeeCode||"—"} · {selected?.designation||"—"}</div><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4"><Stat label="Status" value={record?.status||"Not set"}/><Stat label="Check in" value={record?.checkIn?new Date(record.checkIn).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}):"—"}/><Stat label="Check out" value={record?.checkOut?new Date(record.checkOut).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}):"—"}/><Stat label="Break" value={(record?.breakMinutes||0)+" min"}/></div></div>
   <div className="mt-4 grid gap-3 sm:grid-cols-2"><label><span className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-500">Location evidence</span><input className="erp-input w-full" value={location} onChange={e=>setLocation(e.target.value)} placeholder="e.g. RCLD Islampur Center"/></label><label><span className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-500">Break minutes</span><input className="erp-input w-full" type="number" min="0" max="1440" value={breakMinutes} onChange={e=>setBreakMinutes(e.target.value)} placeholder="0"/></label><label className="sm:col-span-2"><span className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-500">Evidence image</span><input className="erp-input w-full" type="file" accept="image/*" onChange={e=>setImage(e.target.files?.[0]||null)}/><span className="mt-1 block text-[10px] text-slate-400">Optional image evidence. Maximum 5 MB.</span></label><label className="sm:col-span-2"><span className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-500">Note</span><textarea className="erp-input min-h-20 w-full" value={note} onChange={e=>setNote(e.target.value)} placeholder="Attendance note"/></label></div></div>
   <aside className="rounded-2xl border border-slate-200 p-5"><div className="text-sm font-black">Attendance actions</div><p className="mt-1 text-xs leading-5 text-slate-500">Check-in records the current time. Check-out requires a prior check-in.</p><div className="mt-5 grid gap-2"><button disabled={busy||!!record?.checkIn} onClick={()=>submit("CHECK_IN")} className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white disabled:opacity-40">{busy&&<Loader2 className="mr-2 inline animate-spin" size={14}/>}Check in</button><button disabled={busy||!record?.checkIn||!!record?.checkOut} onClick={()=>submit("CHECK_OUT")} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-black disabled:opacity-40">Check out</button><button disabled={busy||!record?.id||!breakMinutes} onClick={()=>submit("ADD_BREAK")} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-black disabled:opacity-40">Add break</button></div>{message&&<p className="mt-4 text-xs font-bold text-emerald-600">{message}</p>}</aside>
  </div></div>
 </section>;
}
function Stat({label,value}){return <div className="rounded-xl bg-white p-3 shadow-sm"><div className="text-[9px] font-black uppercase tracking-wider text-slate-400">{label}</div><div className="mt-1 text-sm font-black">{value}</div></div>}
