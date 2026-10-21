import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, PlayCircle, LockKeyhole, FileText } from "lucide-react";
import { db } from "@/lib/db";
import { getYouTubeEmbedUrl } from "@/lib/youtube";
import { getCurrentStudent } from "@/lib/student-auth";
import LessonProgressButton from "./lesson-progress-button";

export const dynamic="force-dynamic";

export default async function LessonPage({params}) {
  const {code,lessonId}=await params;
  const student=await getCurrentStudent();
  if(!student) redirect("/student/login?next="+encodeURIComponent("/courses/"+code+"/lesson/"+lessonId));
  let lesson;
  try { lesson=await db.lesson.findUnique({where:{id:lessonId},include:{module:{include:{course:true}},progress:{where:{studentId:student.id}}}}); } catch { lesson=null; }
  if(!lesson || !lesson.published || lesson.module.course.code.toLowerCase()!==code.toLowerCase()) return notFound();
  const enrolled=student.onlineEnrollments.some(e=>e.courseId===lesson.module.course.id);
  if(!enrolled) return <main className="site-shell min-h-screen"><section className="mx-auto max-w-2xl px-6 py-24"><div className="glass-strong rounded-3xl p-8 text-center"><LockKeyhole className="mx-auto text-blue-600" size={52}/><h1 className="mt-5 text-3xl font-black">Course access required</h1><p className="mt-3 text-slate-500">This lesson is available to students enrolled in {lesson.module.course.name}.</p><Link href={"/courses/"+code} className="mt-7 inline-flex rounded-xl bg-slate-950 px-5 py-3 font-black text-white">View Course</Link></div></section></main>;
  const embed=lesson.videoProvider==="youtube" ? getYouTubeEmbedUrl(lesson.videoUrl) : null;
  const progress=lesson.progress[0];
  return <main className="site-shell min-h-screen"><header className="glass-nav sticky top-0 z-30"><div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4"><Link href="/student/dashboard" className="flex items-center gap-2 text-sm font-bold text-slate-600"><ArrowLeft size={17}/> My Learning</Link><span className="text-sm font-black text-slate-900">{lesson.module.course.name}</span></div></header><section className="mx-auto max-w-6xl px-6 py-10"><p className="text-sm font-bold text-blue-600">{lesson.module.title}</p><h1 className="mt-2 text-4xl font-black">{lesson.title}</h1><p className="mt-4 max-w-3xl text-slate-600">{lesson.description||"Watch the lesson and continue through your course."}</p><div className="mt-8 overflow-hidden rounded-3xl bg-slate-950 shadow-xl">{embed?<div className="aspect-video"><iframe className="h-full w-full" src={embed} title={lesson.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/></div>:<div className="grid aspect-video place-items-center p-8 text-center text-white"><div><PlayCircle className="mx-auto" size={56}/><p className="mt-4 font-bold">This lesson does not have a valid YouTube video URL yet.</p></div></div>}</div><div className="mt-6 grid gap-4 sm:grid-cols-2"><LessonProgressButton lessonId={lesson.id} initialCompleted={progress?.completed||false}/>{lesson.resourceUrl&&<a href={lesson.resourceUrl} target="_blank" rel="noreferrer" className="surface flex items-center justify-center gap-2 rounded-2xl p-5 font-black"><FileText size={19} className="text-blue-600"/> Open lesson resource</a>}</div></section></main>;
}