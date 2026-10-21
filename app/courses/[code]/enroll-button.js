"use client";
import {useState} from "react";
import {CheckCircle2, CreditCard, LoaderCircle} from "lucide-react";
export default function EnrollButton({courseCode,onlineFee}){
 const [state,setState]=useState("idle"); const [message,setMessage]=useState("");
 async function enroll(){
  setState("loading");setMessage("");
  try{const r=await fetch("/api/student/enroll",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({courseCode})});const d=await r.json();if(r.status===401){window.location.href="/student/login?next="+encodeURIComponent("/courses/"+courseCode.toLowerCase());return;}if(!r.ok)throw new Error(d.error||"Unable to start enrollment.");if(d.enrollment?.status==="ACTIVE"){setState("active");setMessage("You are already enrolled.");}else{setState("pending");setMessage("Enrollment created. Payment is ready to connect to PhonePe.");}}catch(e){setState("error");setMessage(e.message)}}
 if(state==="active")return <a href="/student/dashboard" className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-black text-white"><CheckCircle2 size={18}/> Go to My Learning</a>;
 const label=onlineFee ? "Enroll • ₹"+onlineFee : "Enroll & Continue";
 return <div><button onClick={enroll} disabled={state==="loading"} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 font-black text-white disabled:opacity-60">{state==="loading"?<LoaderCircle className="animate-spin" size={18}/>:<CreditCard size={18}/>} {label}</button>{message&&<p className={"mt-3 rounded-xl p-3 text-xs font-bold "+(state==="error"?"bg-red-50 text-red-700":"bg-blue-50 text-blue-700")}>{message}</p>}</div>;
}