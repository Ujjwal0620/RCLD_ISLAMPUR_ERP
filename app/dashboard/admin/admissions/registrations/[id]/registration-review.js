"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Save, ShieldCheck } from "lucide-react";
import { REGISTRATION_STATUSES, REGISTRATION_STATUS_LABELS } from "@/lib/registration";

export default function RegistrationReview({ registration, courses = [], canManage }) {
  const router = useRouter();
  const [status, setStatus] = useState(registration.status);
  const [reviewNote, setReviewNote] = useState(registration.reviewNote || "");
  const [office, setOffice] = useState({
    kitIssueNo: registration.kitIssueNo || "",
    aecCode: registration.aecCode || "",
    registrationNo: registration.registrationNo || "",
    demandDraftNo: registration.demandDraftNo || "",
    bankName: registration.bankName || "",
    courseId: registration.courseId || "",
    declarationAccepted: Boolean(registration.declarationAccepted),
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function save() {
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch("/api/admin/registrations/" + registration.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...office, status, reviewNote }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to update this registration.");
      setMessage(status === "APPROVED" ? "Registration approved and student record prepared." : "Registration updated.");
      router.refresh();
    } catch (updateError) {
      setError(updateError.message);
    } finally {
      setBusy(false);
    }
  }

  const field = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-blue-600" />
          <h2 className="font-black">Review and office updates</h2>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          {canManage ? "Update the administrative fields and record the admission decision." : "You have view-only access to this registration."}
        </p>
      </div>

      <div className="space-y-4 p-5">
        <label className="block">
          <span className="mb-1.5 block text-[10px] font-black uppercase tracking-wide text-slate-500">Application status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)} disabled={!canManage} className={field}>
            {REGISTRATION_STATUSES.map((item) => (
              <option key={item} value={item}>{REGISTRATION_STATUS_LABELS[item]}</option>
            ))}
          </select>
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[10px] font-black uppercase tracking-wide text-slate-500">Kit issue no.</span>
            <input value={office.kitIssueNo} onChange={(event) => setOffice({ ...office, kitIssueNo: event.target.value })} disabled={!canManage} className={field} placeholder="Kit issue number" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[10px] font-black uppercase tracking-wide text-slate-500">AEC code</span>
            <input value={office.aecCode} onChange={(event) => setOffice({ ...office, aecCode: event.target.value })} disabled={!canManage} className={field} placeholder="AEC code" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[10px] font-black uppercase tracking-wide text-slate-500">Registration no.</span>
            <input value={office.registrationNo} onChange={(event) => setOffice({ ...office, registrationNo: event.target.value })} disabled={!canManage} className={field} placeholder="RCLD registration number" />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-[10px] font-black uppercase tracking-wide text-slate-500">Course</span>
            <select value={office.courseId} onChange={(event) => setOffice({ ...office, courseId: event.target.value })} disabled={!canManage} className={field}>
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>{course.code} - {course.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[10px] font-black uppercase tracking-wide text-slate-500">Demand draft no.</span>
            <input value={office.demandDraftNo} onChange={(event) => setOffice({ ...office, demandDraftNo: event.target.value })} disabled={!canManage} className={field} placeholder="Demand draft number" />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-[10px] font-black uppercase tracking-wide text-slate-500">Bank</span>
            <input value={office.bankName} onChange={(event) => setOffice({ ...office, bankName: event.target.value })} disabled={!canManage} className={field} placeholder="Bank name and branch" />
          </label>
        </div>

        <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs font-bold text-slate-600">
          <input
            type="checkbox"
            checked={office.declarationAccepted}
            onChange={(event) => setOffice({ ...office, declarationAccepted: event.target.checked })}
            disabled={!canManage}
            className="mt-0.5 h-4 w-4 accent-blue-600"
          />
          <span>The applicant has signed the declaration on the paper form.</span>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[10px] font-black uppercase tracking-wide text-slate-500">Review note</span>
          <textarea value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} disabled={!canManage} rows={3} className={field} placeholder="Verification notes, rejection reason or admission remarks" />
        </label>

        {status === "APPROVED" && !registration.studentId && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold leading-5 text-emerald-800">
            Approving this application will create an active offline student record using the registration number and applicant details.
          </div>
        )}
        {status === "APPROVED" && registration.studentId && (
          <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold leading-5 text-emerald-800">
            <CheckCircle2 size={15} className="mt-0.5 shrink-0" /> A student record is already linked to this registration.
          </div>
        )}

        {error && <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700">{error}</p>}
        {message && <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-700">{message}</p>}

        {canManage && (
          <button type="button" disabled={busy} onClick={save} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white hover:bg-slate-800 disabled:opacity-50">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {busy ? "Saving..." : "Save review"}
          </button>
        )}
      </div>
    </section>
  );
}
