"use client";
import {useState} from "react";
import {CheckCircle2} from "lucide-react";

export default function LessonProgressButton({lessonId,initialCompleted}){
 const [completed,setCompleted]=useState(initialCompleted);
 const [loading,setLoading]=useState(false);
 async function toggle(){
  setLoading(true);
  const next=!completed;
  const response=await fetch("/api/student/progress",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({lessonId,completed:next})});
  if(response.ok)setCompleted(next);
  setLoading(false);
 }
 return <button onClick={toggle} disabled={loading} className={"surface flex items-center justify-center gap-2 rounded-2xl p-5 font-black "+(completed?"text-emerald-700":"text-slate-800")}><CheckCircle2 size={19}/>{loading?"Saving...":completed?"Lesson completed":"Mark lesson complete"}</button>;
}