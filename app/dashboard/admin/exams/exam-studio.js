"use client";

import { useState } from "react";

export default function ExamStudio({ batches, courses, initialExams, canManage }) {
  const [exams, setExams] = useState(initialExams);
  const [mode, setMode] = useState("BATCH");
  const [batchId, setBatchId] = useState(batches[0]?.id || "");
  const [courseId, setCourseId] = useState(courses[0]?.id || "");
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("30");
  const [pass, setPass] = useState("40");
  const [maxAttempts, setMaxAttempts] = useState("1");
  const [negative, setNegative] = useState(false);
  const [negativeMarks, setNegativeMarks] = useState("0");
  const [selected, setSelected] = useState(null);
  const [q, setQ] = useState("");
  const [qType, setQType] = useState("MCQ");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState("");
  const [marks, setMarks] = useState("1");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function createExam() {
    setBusy(true);
    setMsg("");
    try {
      const response = await fetch("/api/admin/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchId: mode === "BATCH" ? batchId : "",
          courseId: mode === "COURSE" ? courseId : "",
          title,
          durationMinutes: Number(duration),
          passMarks: Number(pass),
          maxAttempts: Number(maxAttempts),
          negativeMarking: negative,
          negativeMarks: Number(negativeMarks),
          published: false,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to create exam.");

      setExams([
        {
          ...data.exam,
          batch: mode === "BATCH" ? batches.find((item) => item.id === batchId) : null,
          course: mode === "COURSE" ? courses.find((item) => item.id === courseId) : null,
          questions: [],
          negativeMarks: Number(data.exam.negativeMarks),
          passMarks: Number(data.exam.passMarks),
          attempts: 0,
        },
        ...exams,
      ]);
      setTitle("");
      setMsg("Exam created.");
    } catch (error) {
      setMsg(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function publish(examId, field, value) {
    setBusy(true);
    setMsg("");
    try {
      const response = await fetch("/api/admin/exams/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId, field, value }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to update publication.");
      setExams(exams.map((exam) => (exam.id === examId ? { ...exam, [field]: value } : exam)));
      setMsg("Publication updated.");
    } catch (error) {
      setMsg(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function addQuestion() {
    setBusy(true);
    setMsg("");
    try {
      const response = await fetch("/api/admin/exams/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: selected,
          questionText: q,
          type: qType,
          options: qType === "MCQ" ? options.filter(Boolean) : undefined,
          correctAnswer: qType === "MCQ" ? correct : "",
          marks: Number(marks),
          sortOrder: exams.find((exam) => exam.id === selected)?.questions.length || 0,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to add question.");

      setExams(
        exams.map((exam) =>
          exam.id === selected
            ? {
                ...exam,
                questions: [
                  ...exam.questions,
                  {
                    id: data.question.id,
                    text: data.question.questionText,
                    type: data.question.type,
                    marks: Number(data.question.marks),
                    options: data.question.options || [],
                    correctAnswer: data.question.correctAnswer,
                  },
                ],
              }
            : exam,
        ),
      );
      setQ("");
      setOptions(["", "", "", ""]);
      setCorrect("");
      setMsg("Question added.");
    } catch (error) {
      setMsg(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
      {canManage && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-black">Create assessment</div>
          <div className="mt-4 grid gap-3">
            <select className="erp-input" value={mode} onChange={(event) => setMode(event.target.value)}>
              <option value="BATCH">Offline batch exam</option>
              <option value="COURSE">Online course exam</option>
            </select>

            {mode === "BATCH" ? (
              <select className="erp-input" value={batchId} onChange={(event) => setBatchId(event.target.value)}>
                {batches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.code} · {batch.name}
                  </option>
                ))}
              </select>
            ) : (
              <select className="erp-input" value={courseId} onChange={(event) => setCourseId(event.target.value)}>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} · {course.name}
                  </option>
                ))}
              </select>
            )}

            <input className="erp-input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Exam title" />

            <div className="grid grid-cols-2 gap-2">
              <input className="erp-input" type="number" min="1" value={duration} onChange={(event) => setDuration(event.target.value)} placeholder="Minutes" />
              <input className="erp-input" type="number" min="0" value={pass} onChange={(event) => setPass(event.target.value)} placeholder="Pass marks" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input className="erp-input" type="number" min="1" value={maxAttempts} onChange={(event) => setMaxAttempts(event.target.value)} placeholder="Attempts" />
              <input className="erp-input" type="number" min="0" step="0.01" value={negativeMarks} onChange={(event) => setNegativeMarks(event.target.value)} placeholder="Negative marks" />
            </div>

            <label className="flex items-center gap-2 text-xs font-bold">
              <input type="checkbox" checked={negative} onChange={(event) => setNegative(event.target.checked)} />
              Enable negative marking
            </label>

            <button
              disabled={busy || !title || (mode === "BATCH" ? !batchId : !courseId)}
              onClick={createExam}
              className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white disabled:opacity-40"
            >
              {busy ? "Saving..." : "Create exam"}
            </button>

            {msg && <p className="text-xs font-bold text-blue-600">{msg}</p>}
          </div>
        </section>
      )}

      <section className="space-y-3">
        {exams.map((exam) => (
          <article key={exam.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">
                  {exam.batch?.code || exam.course?.code}
                </span>
                <h2 className="mt-1 text-lg font-black">{exam.title}</h2>
                <p className="mt-1 text-xs text-slate-500">
                  {exam.durationMinutes} min · pass {exam.passMarks} · {exam.maxAttempts} attempt(s) · {exam.questions.length} questions
                </p>
              </div>

              {canManage && (
                <div className="flex flex-wrap gap-2">
                  <button
                    disabled={busy}
                    onClick={() => publish(exam.id, "published", !exam.published)}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black"
                  >
                    {exam.published ? "Unpublish" : "Publish exam"}
                  </button>
                  <button
                    disabled={busy || !exam.published}
                    onClick={() => publish(exam.id, "resultsPublished", !exam.resultsPublished)}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black"
                  >
                    {exam.resultsPublished ? "Hide results" : "Publish results"}
                  </button>
                  <button
                    onClick={() => setSelected(selected === exam.id ? null : exam.id)}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black"
                  >
                    {selected === exam.id ? "Close" : "Manage questions"}
                  </button>
                </div>
              )}
            </div>

            {selected === exam.id && (
              <div className="mt-5 border-t border-slate-100 pt-5">
                <div className="grid gap-2">
                  <textarea className="erp-input min-h-20" value={q} onChange={(event) => setQ(event.target.value)} placeholder="Question text" />
                  <select className="erp-input" value={qType} onChange={(event) => setQType(event.target.value)}>
                    <option value="MCQ">MCQ</option>
                    <option value="DESCRIPTIVE">Descriptive</option>
                  </select>

                  {qType === "MCQ" && (
                    <div className="grid gap-2">
                      {options.map((option, index) => (
                        <input
                          key={index}
                          className="erp-input"
                          value={option}
                          onChange={(event) =>
                            setOptions(options.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)))
                          }
                          placeholder={"Option " + (index + 1)}
                        />
                      ))}
                      <input className="erp-input" value={correct} onChange={(event) => setCorrect(event.target.value)} placeholder="Exact correct option" />
                    </div>
                  )}

                  <input className="erp-input" type="number" min="0.01" step="0.01" value={marks} onChange={(event) => setMarks(event.target.value)} placeholder="Marks" />

                  <button
                    disabled={busy || !q}
                    onClick={addQuestion}
                    className="rounded-xl bg-blue-600 px-4 py-3 text-xs font-black text-white disabled:opacity-40"
                  >
                    Add question
                  </button>
                </div>
              </div>
            )}

            {exam.questions.length > 0 && (
              <div className="mt-4 space-y-2">
                {exam.questions.map((question, index) => (
                  <div key={question.id} className="rounded-xl bg-slate-50 p-3 text-xs">
                    <b>Q{index + 1}.</b> {question.text}
                    <span className="ml-2 text-slate-400">
                      ({question.type} · {question.marks})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </article>
        ))}

        {!exams.length && (
          <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
            No exams created yet.
          </div>
        )}
      </section>
    </div>
  );
}
