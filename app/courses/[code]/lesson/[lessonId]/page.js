import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, PlayCircle } from "lucide-react";
import { db } from "@/lib/db";
import { getYouTubeEmbedUrl } from "@/lib/youtube";

export const dynamic="force-dynamic";

export default async function LessonPage({params}) {
  const {code,lessonId}=await params;
  let lesson;
  try {
    lesson=await db.lesson.findUnique({where:{id:lessonId},include:{module:{include:{course:true}}}});
  } catch { lesson=null; }
  if(!lesson || !lesson.published || lesson.module.course.code.toLowerCase()!==code.toLowerCase()) return notFound();
  const embed=lesson.videoProvider==="youtube" ? getYouTubeEmbedUrl(lesson.videoUrl) : null;
  return <main className="site-shell min-h-screen">
    <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4"><Link href={"/courses/"+code} className="flex items-center gap-2 text-sm font-bold text-slate-600"><ArrowLeft size={17}/> Course</Link><span className="text-sm font-black text-slate-900">{lesson.module.course.name}</span></div></header>
    <section className="mx-auto max-w-6xl px-6 py-10"><p className="text-sm font-bold text-blue-600">{lesson.module.title}</p><h1 className="mt-2 text-4xl font-black">{lesson.title}</h1><p className="mt-4 max-w-3xl text-slate-600">{lesson.description||"Watch the lesson and continue through your course."}</p>
      <div className="mt-8 overflow-hidden rounded-3xl bg-slate-950 shadow-xl">
        {embed ? <div className="aspect-video"><iframe className="h-full w-full" src={embed} title={lesson.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/></div> :
        <div className="grid aspect-video place-items-center p-8 text-center text-white"><div><PlayCircle className="mx-auto" size={56}/><p className="mt-4 font-bold">This lesson does not have a valid YouTube video URL yet.</p></div></div>}
      </div>
      <div className="mt-8 surface rounded-2xl p-6"><div className="flex items-start gap-4"><CheckCircle2 className="mt-1 text-blue-600"/><div><h2 className="font-black">Lesson progress</h2><p className="mt-1 text-sm text-slate-500">Progress tracking will be connected to the student learning account in the next LMS authentication stage.</p></div></div></div>
    </section>
  </main>;
}
