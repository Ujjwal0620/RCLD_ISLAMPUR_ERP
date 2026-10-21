import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { BookOpen, CheckCircle2, PlayCircle, LockKeyhole } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentStudent } from "@/lib/student-auth";

export const dynamic = "force-dynamic";

export default async function StudentCoursePage({ params }) {
  const { code } = await params;
  const student = await getCurrentStudent();

  if (!student) redirect("/student/login");

  const course = await db.course.findUnique({
    where: { code: code.toUpperCase() },
    include: {
      modules: {
        where: { published: true },
        orderBy: { sortOrder: "asc" },
        include: {
          lessons: {
            where: { published: true },
            orderBy: { sortOrder: "asc" },
          },
        },
      },
    },
  });

  if (!course) return notFound();

  const enrollment = student.onlineEnrollments.find((item) => item.courseId === course.id);

  if (!enrollment) {
    return (
      <main className="site-shell min-h-screen px-6 py-20">
        <div className="glass-strong mx-auto max-w-xl rounded-3xl p-8 text-center">
          <LockKeyhole className="mx-auto text-blue-600" size={48} />
          <h1 className="mt-5 text-3xl font-black">Enrollment required</h1>
          <p className="mt-3 text-slate-500">
            Complete enrollment for this course before opening the learning workspace.
          </p>
          <Link
            href={"/courses/" + code}
            className="mt-6 inline-block rounded-xl bg-slate-950 px-5 py-3 font-black text-white"
          >
            Course details
          </Link>
        </div>
      </main>
    );
  }

  const lessonIds = course.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id));
  const progress = lessonIds.length
    ? await db.lessonProgress.findMany({
        where: { studentId: student.id, lessonId: { in: lessonIds } },
      })
    : [];

  const done = new Set(progress.filter((item) => item.completed).map((item) => item.lessonId));
  const total = lessonIds.length;
  const percent = total ? Math.round((done.size / total) * 100) : 0;

  return (
    <main className="site-shell min-h-screen">
      <header className="glass-nav sticky top-3 z-40 mx-4 rounded-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
          <Link href="/student/dashboard" className="text-sm font-black text-slate-600">
            ← My Learning
          </Link>
          <span className="font-black">
            RCLD <span className="text-blue-600">Online</span>
          </span>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="glass-strong rounded-[2rem] p-8">
          <p className="text-xs font-black uppercase tracking-[.2em] text-blue-600">{course.code}</p>
          <h1 className="mt-2 text-4xl font-black">{course.name}</h1>

          <div className="mt-7 flex flex-wrap items-center gap-5">
            <div className="min-w-64">
              <div className="flex justify-between text-xs font-black">
                <span>Course progress</span>
                <span>{percent}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-blue-600" style={{ width: percent + "%" }} />
              </div>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-2 text-xs font-black text-blue-700">
              {done.size}/{total} lessons complete
            </span>
          </div>
        </div>

        <div className="mt-8 space-y-5">
          {course.modules.map((module, index) => (
            <section key={module.id} className="glass rounded-3xl p-6">
              <div className="flex items-start gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 font-black text-blue-700">
                  {index + 1}
                </span>

                <div className="w-full">
                  <h2 className="text-xl font-black">{module.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {module.description || "Course module"}
                  </p>

                  <div className="mt-5 space-y-2">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <Link
                        key={lesson.id}
                        href={"/courses/" + course.code.toLowerCase() + "/lesson/" + lesson.id}
                        className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/45 p-4 transition hover:bg-white/80"
                      >
                        <span className="flex items-center gap-3">
                          <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-xs font-black">
                            {lessonIndex + 1}
                          </span>
                          <span>
                            <span className="block font-bold">{lesson.title}</span>
                            <span className="text-xs text-slate-500">
                              {lesson.durationMinutes ? lesson.durationMinutes + " min" : "Lesson"}
                            </span>
                          </span>
                        </span>
                        {done.has(lesson.id) ? (
                          <CheckCircle2 className="text-emerald-600" size={20} />
                        ) : (
                          <PlayCircle className="text-blue-600" size={20} />
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>

        {!course.modules.length && (
          <div className="glass mt-8 rounded-3xl p-8 text-center">
            <BookOpen className="mx-auto text-blue-600" size={42} />
            <h2 className="mt-4 text-xl font-black">Course content is being prepared</h2>
            <p className="mt-2 text-slate-500">
              Your enrollment is active. New lessons will appear here when published.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
