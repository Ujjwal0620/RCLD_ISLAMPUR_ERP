"use client";

import { useState } from "react";
import { Check, Eye, EyeOff, Layers3, Pencil, PlayCircle, Plus, Save, Trash2 } from "lucide-react";

const emptyLesson = {
  moduleId: "",
  title: "",
  description: "",
  videoUrl: "",
  resourceUrl: "",
  durationMinutes: "",
  sortOrder: 0,
  published: true,
};

export default function ContentManager({ courses }) {
  const [courseId, setCourseId] = useState(courses[0]?.id || "");
  const [moduleForm, setModuleForm] = useState({ title: "", description: "", sortOrder: 0, published: true });
  const [lessonForm, setLessonForm] = useState(emptyLesson);
  const [editingModuleId, setEditingModuleId] = useState("");
  const [editingLessonId, setEditingLessonId] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const course = courses.find((item) => item.id === courseId);

  function selectCourse(id) {
    setCourseId(id);
    setEditingModuleId("");
    setEditingLessonId("");
    setLessonForm({ ...emptyLesson, moduleId: "" });
    setMessage("");
  }

  function editModule(module) {
    setEditingModuleId(module.id);
    setModuleForm({
      title: module.title,
      description: module.description || "",
      sortOrder: module.sortOrder,
      published: module.published,
    });
    setMessage("");
  }

  function editLesson(lesson, moduleId) {
    setEditingLessonId(lesson.id);
    setLessonForm({
      moduleId,
      title: lesson.title,
      description: lesson.description || "",
      videoUrl: lesson.videoUrl || "",
      resourceUrl: lesson.resourceUrl || "",
      durationMinutes: lesson.durationMinutes ?? "",
      sortOrder: lesson.sortOrder,
      published: lesson.published,
    });
    setMessage("");
  }

  function resetModule() {
    setEditingModuleId("");
    setModuleForm({ title: "", description: "", sortOrder: 0, published: true });
  }

  function resetLesson() {
    setEditingLessonId("");
    setLessonForm(emptyLesson);
  }

  async function requestJson(url, options) {
    setBusy(true);
    try {
      const response = await fetch(url, options);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Request failed.");
      return data;
    } finally {
      setBusy(false);
    }
  }

  async function saveModule(event) {
    event.preventDefault();
    if (!course) return;
    setMessage(editingModuleId ? "Saving module..." : "Creating module...");

    try {
      await requestJson("/api/admin/courses/" + course.code + "/modules", {
        method: editingModuleId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...moduleForm, ...(editingModuleId ? { moduleId: editingModuleId } : {}) }),
      });
      setMessage(editingModuleId ? "Module updated." : "Module created.");
      window.location.reload();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function saveLesson(event) {
    event.preventDefault();
    if (!lessonForm.moduleId) return;
    setMessage(editingLessonId ? "Saving lesson..." : "Creating lesson...");

    try {
      await requestJson("/api/admin/lessons", {
        method: editingLessonId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...lessonForm,
          ...(editingLessonId ? { lessonId: editingLessonId } : {}),
          durationMinutes: lessonForm.durationMinutes === "" ? undefined : lessonForm.durationMinutes,
        }),
      });
      setMessage(editingLessonId ? "Lesson updated." : "Lesson created.");
      window.location.reload();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function removeModule(module) {
    if (!course || !window.confirm("Delete this module and all its lessons?")) return;
    setMessage("Deleting module...");
    try {
      await requestJson("/api/admin/courses/" + course.code + "/modules", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId: module.id }),
      });
      setMessage("Module deleted.");
      window.location.reload();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function removeLesson(lesson) {
    if (!window.confirm("Delete this lesson? Student progress for it will also be removed.")) return;
    setMessage("Deleting lesson...");
    try {
      await requestJson("/api/admin/lessons", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: lesson.id }),
      });
      setMessage("Lesson deleted.");
      window.location.reload();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      <aside className="h-fit rounded-2xl border border-white/10 bg-white/5 p-4 lg:sticky lg:top-6">
        <p className="text-xs font-black uppercase tracking-wider text-slate-400">Courses</p>
        <div className="mt-3 space-y-2">
          {courses.map((item) => (
            <button
              key={item.id}
              onClick={() => selectCourse(item.id)}
              className={"w-full rounded-xl p-3 text-left " + (item.id === courseId ? "bg-cyan-300 text-slate-950" : "bg-white/5 hover:bg-white/10")}
            >
              <span className="text-xs font-black">{item.code}</span>
              <span className="mt-1 block font-bold">{item.name}</span>
            </button>
          ))}
        </div>
      </aside>

      <section>
        <div className="grid gap-6 xl:grid-cols-2">
          <form onSubmit={saveModule} className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Layers3 size={19} className="text-cyan-300" />
                <h2 className="text-lg font-black">{editingModuleId ? "Edit Module" : "Add Module"}</h2>
              </div>
              {editingModuleId && <button type="button" onClick={resetModule} className="text-xs font-bold text-slate-400">Cancel</button>}
            </div>
            <input required value={moduleForm.title} onChange={(event) => setModuleForm({ ...moduleForm, title: event.target.value })} placeholder="Module title" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3" />
            <textarea value={moduleForm.description} onChange={(event) => setModuleForm({ ...moduleForm, description: event.target.value })} placeholder="Module description" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3" />
            <div className="grid grid-cols-2 gap-3">
              <input type="number" min="0" value={moduleForm.sortOrder} onChange={(event) => setModuleForm({ ...moduleForm, sortOrder: event.target.value })} placeholder="Order" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3" />
              <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-bold">
                <input type="checkbox" checked={moduleForm.published} onChange={(event) => setModuleForm({ ...moduleForm, published: event.target.checked })} />
                Published
              </label>
            </div>
            <button disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 font-black text-slate-950 disabled:opacity-50">
              {editingModuleId ? <Save size={17} /> : <Plus size={17} />}
              {busy ? "Working..." : editingModuleId ? "Save Module" : "Create Module"}
            </button>
          </form>

          <form onSubmit={saveLesson} className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <PlayCircle size={19} className="text-cyan-300" />
                <h2 className="text-lg font-black">{editingLessonId ? "Edit Lesson" : "Add YouTube Lesson"}</h2>
              </div>
              {editingLessonId && <button type="button" onClick={resetLesson} className="text-xs font-bold text-slate-400">Cancel</button>}
            </div>
            <select required value={lessonForm.moduleId} onChange={(event) => setLessonForm({ ...lessonForm, moduleId: event.target.value })} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3">
              <option value="">Select module</option>
              {course?.modules.map((module) => <option key={module.id} value={module.id}>{module.title}</option>)}
            </select>
            <input required value={lessonForm.title} onChange={(event) => setLessonForm({ ...lessonForm, title: event.target.value })} placeholder="Lesson title" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3" />
            <input value={lessonForm.videoUrl} onChange={(event) => setLessonForm({ ...lessonForm, videoUrl: event.target.value })} placeholder="YouTube URL or video ID" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3" />
            <input value={lessonForm.resourceUrl} onChange={(event) => setLessonForm({ ...lessonForm, resourceUrl: event.target.value })} placeholder="Resource/PDF URL (optional)" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3" />
            <textarea value={lessonForm.description} onChange={(event) => setLessonForm({ ...lessonForm, description: event.target.value })} placeholder="Lesson description" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3" />
            <div className="grid grid-cols-2 gap-3">
              <input type="number" min="0" value={lessonForm.durationMinutes} onChange={(event) => setLessonForm({ ...lessonForm, durationMinutes: event.target.value })} placeholder="Minutes" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3" />
              <input type="number" min="0" value={lessonForm.sortOrder} onChange={(event) => setLessonForm({ ...lessonForm, sortOrder: event.target.value })} placeholder="Order" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3" />
            </div>
            <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-bold">
              <input type="checkbox" checked={lessonForm.published} onChange={(event) => setLessonForm({ ...lessonForm, published: event.target.checked })} />
              Published
            </label>
            <button disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 font-black text-slate-950 disabled:opacity-50">
              {editingLessonId ? <Save size={17} /> : <Plus size={17} />}
              {busy ? "Working..." : editingLessonId ? "Save Lesson" : "Create Lesson"}
            </button>
          </form>
        </div>

        {message && <div className="mt-5 rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm text-cyan-100">{message}</div>}

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">{course?.code} curriculum</h2>
              <p className="mt-1 text-sm text-slate-400">Manage lessons, publishing and ordering from one place.</p>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-2 text-xs font-bold">{course?.modules.length || 0} modules</span>
          </div>

          <div className="mt-5 space-y-4">
            {course?.modules.map((module) => (
              <div key={module.id} className="rounded-xl border border-white/10 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold">{module.sortOrder + 1}. {module.title}</span>
                      {module.published ? <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[11px] font-black text-emerald-300">Published</span> : <span className="rounded-full bg-amber-400/10 px-2 py-1 text-[11px] font-black text-amber-300">Draft</span>}
                    </div>
                    {module.description && <p className="mt-1 text-sm text-slate-400">{module.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => editModule(module)} className="rounded-lg border border-white/10 p-2 hover:bg-white/10" title="Edit module"><Pencil size={16} /></button>
                    <button onClick={() => removeModule(module)} className="rounded-lg border border-red-400/20 p-2 text-red-300 hover:bg-red-400/10" title="Delete module"><Trash2 size={16} /></button>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  {module.lessons.map((lesson, index) => (
                    <div key={lesson.id} className="rounded-lg bg-black/20 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold">{index + 1}. {lesson.title}</span>
                            {lesson.published ? <Check className="text-emerald-400" size={15} /> : <EyeOff className="text-amber-300" size={15} />}
                          </div>
                          <div className="mt-1 text-xs text-slate-400">
                            {lesson.videoUrl ? "YouTube" : "No video"}{lesson.durationMinutes ? " · " + lesson.durationMinutes + " min" : ""}{lesson.resourceUrl ? " · Resource" : ""}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {lesson.videoUrl && <a href={lesson.videoUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-white/10 p-2 hover:bg-white/10" title="Open video"><Eye size={16} /></a>}
                          <button onClick={() => editLesson(lesson, module.id)} className="rounded-lg border border-white/10 p-2 hover:bg-white/10" title="Edit lesson"><Pencil size={16} /></button>
                          <button onClick={() => removeLesson(lesson)} className="rounded-lg border border-red-400/20 p-2 text-red-300 hover:bg-red-400/10" title="Delete lesson"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {!module.lessons.length && <p className="text-sm text-slate-500">No lessons yet.</p>}
                </div>
              </div>
            ))}
            {!course?.modules.length && <p className="text-sm text-slate-500">No modules yet. Create the first module above.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
