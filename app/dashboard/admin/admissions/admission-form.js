"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BadgePercent, IndianRupee, Loader2, UserPlus } from "lucide-react";
import { formatCourseMoneyCompact } from "@/lib/course-pricing";

function initialFee(course) {
  return String(course?.pricing?.finalFee ?? course?.standardFee ?? 0);
}

export default function AdmissionForm({ students, courses, batches, canDiscount = false }) {
  const router = useRouter();
  const [existing, setExisting] = useState("");
  const [courseId, setCourseId] = useState(courses[0]?.id || "");
  const [batchId, setBatchId] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    courseFee: initialFee(courses[0]),
    discountAmount: "0",
    installmentCount: "1",
    firstDueDate: "",
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const selectedCourse = courses.find((course) => course.id === courseId);
  const filtered = useMemo(() => batches.filter((batch) => batch.courseId === courseId), [batches, courseId]);
  const finalPreview = Math.max(0, Number(form.courseFee || 0) - Number(form.discountAmount || 0));

  function courseChange(id) {
    const course = courses.find((item) => item.id === id);
    setCourseId(id);
    setBatchId("");
    setForm((current) => ({ ...current, courseFee: initialFee(course), discountAmount: "0" }));
  }

  function existingChange(id) {
    setExisting(id);
    const student = students.find((item) => item.id === id);
    if (student) setForm((current) => ({ ...current, name: student.name, phone: student.phone || "", email: "" }));
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMsg("");
    try {
      const payload = { ...form, studentId: existing || undefined, courseId, batchId };
      if (!canDiscount) {
        payload.discountAmount = 0;
      }
      const response = await fetch("/api/admin/admissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Admission failed");
      setMsg("Admission completed. Fee ledger created with the final course pricing.");
      setExisting("");
      setBatchId("");
      setForm({
        name: "",
        phone: "",
        email: "",
        courseFee: initialFee(selectedCourse),
        discountAmount: "0",
        installmentCount: "1",
        firstDueDate: "",
      });
      router.refresh();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setBusy(false);
    }
  }

  const input = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

  return (
    <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700"><UserPlus size={19} /></div>
        <div><h2 className="font-black">New admission</h2><p className="text-xs text-slate-500">Student → course → batch → server-verified fees.</p></div>
      </div>
      <div className="mt-6 space-y-4">
        <Field label="Existing student">
          <select value={existing} onChange={(event) => existingChange(event.target.value)} className={input}>
            <option value="">Create new student</option>
            {students.map((student) => <option key={student.id} value={student.id}>{student.name} — {student.registrationNo}</option>)}
          </select>
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Student name"><input required={!existing} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={input} /></Field>
          <Field label="Phone"><input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className={input} /></Field>
        </div>
        <Field label="Email"><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className={input} /></Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Course">
            <select required value={courseId} onChange={(event) => courseChange(event.target.value)} className={input}>
              {courses.map((course) => <option key={course.id} value={course.id}>{course.code} — {course.name}</option>)}
            </select>
          </Field>
          <Field label="Batch">
            <select required value={batchId} onChange={(event) => setBatchId(event.target.value)} className={input}>
              <option value="">Select batch</option>
              {filtered.map((batch) => <option key={batch.id} value={batch.id}>{batch.code} — {batch.name} ({batch.capacity - batch.used} seats)</option>)}
            </select>
          </Field>
        </div>

        {selectedCourse && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-[10px] font-black uppercase tracking-[.12em] text-slate-500">Course pricing</div>
              {selectedCourse.pricing?.hasDiscount && (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-1 text-[9px] font-black text-rose-700">
                  <BadgePercent size={11} /> Course discount applied
                </span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-baseline gap-2">
              <span className="text-lg font-black text-slate-900">{formatCourseMoneyCompact(selectedCourse.pricing?.finalFee ?? selectedCourse.standardFee)}</span>
              {selectedCourse.pricing?.hasDiscount && <span className="text-xs font-bold text-slate-400 line-through">{formatCourseMoneyCompact(selectedCourse.pricing.baseFee)}</span>}
              {selectedCourse.admissionFee != null && <span className="text-[10px] font-bold text-slate-500">· admission fee {formatCourseMoneyCompact(selectedCourse.admissionFee)} recorded separately</span>}
            </div>
            <p className="mt-1 text-[10px] leading-5 text-slate-500">
              Final payable is calculated on the server from the course record. Historical pricing is preserved on the fee ledger.
            </p>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          <Field label={canDiscount ? "Course fee (INR)" : "Course fee (locked)"}>
            <input
              required
              type="number"
              min="0"
              readOnly={!canDiscount}
              value={form.courseFee}
              onChange={(event) => setForm({ ...form, courseFee: event.target.value })}
              className={input + (canDiscount ? "" : " bg-slate-100 text-slate-500")}
            />
          </Field>
          <Field label="Additional discount">
            <input
              type="number"
              min="0"
              disabled={!canDiscount}
              value={canDiscount ? form.discountAmount : "0"}
              onChange={(event) => setForm({ ...form, discountAmount: event.target.value })}
              className={input + (canDiscount ? "" : " bg-slate-100 text-slate-400")}
            />
          </Field>
          <Field label="Installments">
            <input type="number" min="1" max="12" value={form.installmentCount} onChange={(event) => setForm({ ...form, installmentCount: event.target.value })} className={input} />
          </Field>
        </div>
        <p className="text-[10px] leading-5 text-slate-500">
          {canDiscount
            ? "Super Admin may override the payable amount or add an admission discount. Overrides are audited."
            : "Course discounts are managed by Super Admin. This admission uses the current course pricing automatically."}
        </p>
        <Field label="First due date"><input type="date" value={form.firstDueDate} onChange={(event) => setForm({ ...form, firstDueDate: event.target.value })} className={input} /></Field>
        <div className="rounded-xl bg-slate-50 p-4 text-sm">
          <div className="flex items-center gap-2 font-black"><IndianRupee size={15} /> Final fee: {formatCourseMoneyCompact(finalPreview)}</div>
          <p className="mt-1 text-xs text-slate-500">The ledger is created only when the admission transaction succeeds.</p>
        </div>
        {error && <p className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">{error}</p>}
        {msg && <p className="rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-700">{msg}</p>}
        <button disabled={busy || !courseId || !batchId} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white disabled:opacity-50">
          {busy && <Loader2 size={16} className="animate-spin" />}{busy ? "Processing admission..." : "Complete admission"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }) {
  return <label className="block"><span className="mb-1.5 block text-[11px] font-black uppercase tracking-wide text-slate-500">{label}</span>{children}</label>;
}
