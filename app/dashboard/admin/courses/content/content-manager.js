"use client";
import {useState} from "react";
import {Plus, PlayCircle, Layers3} from "lucide-react";

export default function ContentManager({courses}){
 const [courseId,setCourseId]=useState(courses[0]?.id||"");
 const course=courses.find(c=>c.id===courseId);
 const [moduleForm,setModuleForm]=useState({title:"",description:"",sortOrder:0});
 const [lessonForm,setLessonForm]=useState({moduleId:"",title:"",description:"",videoUrl:"",resourceUrl:"",durationMinutes:"",sortOrder:0});
 const [message,setMessage]=useState("");

 async function createModule(e){
  e.preventDefault();setMessage("Creating module...");
  const c=courses.find(x=>x.id===courseId);
  const r=await fetch("/api/admin/courses/"+c.code+"/modules",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(moduleForm)});
  const d=await r.json();setMessage(r.ok?"Module created. Refresh to continue adding lessons.":d.error||"Unable to create module.");
  if(r.ok)setModuleForm({title:"",description:"",sortOrder:0});
 }
 async function createLesson(e){
  e.preventDefault();setMessage("Creating lesson...");
  const r=await fetch("/api/admin/lessons",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...lessonForm,durationMinutes:lessonForm.durationMinutes||undefined})});
  const d=await r.json();setMessage(r.ok?"Lesson created. Refresh to see the updated curriculum.":d.error||"Unable to create lesson.");
  if(r.ok)setLessonForm({...lessonForm,title:"",description:"",videoUrl:"",resourceUrl:"",durationMinutes:"",sortOrder:0});
 }

 return <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
  <aside className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs font-black uppercase tracking-wider text-slate-400">Courses</p><div className="mt-3 space-y-2">{courses.map(c=><button key={c.id} onClick={()=>{setCourseId(c.id);setLessonForm(x=>({...x,moduleId:""}))}} className={"w-full rounded-xl p-3 text-left "+(c.id===courseId?"bg-cyan-300 text-slate-950":"bg-white/5 hover:bg-white/10")}><span className="text-xs font-black">{c.code}</span><span className="mt-1 block font-bold">{c.name}</span></button>)}</div></aside>
  <section>
   <div className="grid gap-6 xl:grid-cols-2">
    <form onSubmit={createModule} className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-3"><div className="flex items-center gap-2"><Layers3 size={19} className="text-cyan-300"/><h2 className="text-lg font-black">Add Module</h2></div><input required value={moduleForm.title} onChange={e=>setModuleForm({...moduleForm,title:e.target.value})} placeholder="Module title" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3"/><textarea value={moduleForm.description} onChange={e=>setModuleForm({...moduleForm,description:e.target.value})} placeholder="Module description" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3"/><input type="number" value={moduleForm.sortOrder} onChange={e=>setModuleForm({...moduleForm,sortOrder:e.target.value})} placeholder="Order" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3"/><button className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 font-black text-slate-950"><Plus size={17}/> Create Module</button></form>
    <form onSubmit={createLesson} className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-3"><div className="flex items-center gap-2"><PlayCircle size={19} className="text-cyan-300"/><h2 className="text-lg font-black">Add YouTube Lesson</h2></div><select required value={lessonForm.moduleId} onChange={e=>setLessonForm({...lessonForm,moduleId:e.target.value})} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3"><option value="">Select module</option>{course?.modules.map(m=><option key={m.id} value={m.id}>{m.title}</option>)}</select><input required value={lessonForm.title} onChange={e=>setLessonForm({...lessonForm,title:e.target.value})} placeholder="Lesson title" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3"/><input value={lessonForm.videoUrl} onChange={e=>setLessonForm({...lessonForm,videoUrl:e.target.value})} placeholder="YouTube URL or video ID" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3"/><input value={lessonForm.resourceUrl} onChange={e=>setLessonForm({...lessonForm,resourceUrl:e.target.value})} placeholder="Resource/PDF URL (optional)" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3"/><textarea value={lessonForm.description} onChange={e=>setLessonForm({...lessonForm,description:e.target.value})} placeholder="Lesson description" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3"/><div className="grid grid-cols-2 gap-3"><input type="number" value={lessonForm.durationMinutes} onChange={e=>setLessonForm({...lessonForm,durationMinutes:e.target.value})} placeholder="Minutes" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3"/><input type="number" value={lessonForm.sortOrder} onChange={e=>setLessonForm({...lessonForm,sortOrder:e.target.value})} placeholder="Order" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3"/></div><button className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 font-black text-slate-950"><Plus size={17}/> Create Lesson</button></form>
   </div>
   {message&&<div className="mt-5 rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm text-cyan-100">{message}</div>}
   <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6"><h2 className="text-xl font-black">{course?.code} curriculum</h2><div className="mt-5 space-y-4">{course?.modules.map(m=><div key={m.id} className="rounded-xl border border-white/10 p-4"><div className="font-bold">{m.sortOrder+1}. {m.title}</div>{m.lessons.length?<div className="mt-3 space-y-2">{m.lessons.map((l,i)=><div key={l.id} className="rounded-lg bg-black/20 p-3 text-sm"><span className="font-bold">{i+1}. {l.title}</span><span className="ml-2 text-slate-400">{l.videoUrl?"YouTube":"No video"}</span></div>)}</div>:<p className="mt-2 text-sm text-slate-500">No lessons yet.</p>}</div>)}</div></div>
  </section>
 </div>;
}
