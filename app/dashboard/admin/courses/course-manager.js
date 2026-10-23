"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgePercent,
  BookOpen,
  Globe2,
  GraduationCap,
  IndianRupee,
  Layers3,
  Loader2,
  Pencil,
  Plus,
  Save,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import DeleteAction from "@/components/delete-action";
import {
  COURSE_DISCOUNT_LABELS,
  COURSE_DISCOUNT_TYPES,
  calculateCoursePricing,
  formatCourseMoneyCompact,
  normalizeSyllabus,
} from "@/lib/course-pricing";

const EMPTY_FORM = {
  code: "",
  name: "",
  shortDescription: "",
  description: "",
  duration: "",
  eligibility: "",
  standardFee: "",
  onlineFee: "",
  admissionFee: "",
  discountType: "NONE",
  discountValue: "",
  discountActive: false,
  deliveryMode: "OFFLINE",
  featured: false,
  active: true,
  onlinePublished: true,
  displayOrder: "0",
  imageUrl: "",
  bannerUrl: "",
  featuresText: "",
  syllabus: [],
};

function toForm(course) {
  return {
    code: course.code || "",
    name: course.name || "",
    shortDescription: course.shortDescription || "",
    description: course.description || "",
    duration: course.duration || "",
    eligibility: course.eligibility || "",
    standardFee: course.standardFee ?? "",
    onlineFee: course.onlineFee ?? "",
    admissionFee: course.admissionFee ?? "",
    discountType: course.discountType || "NONE",
    discountValue: course.discountValue ?? "",
    discountActive: Boolean(course.discountActive) && course.discountType !== "NONE",
    deliveryMode: course.deliveryMode || "OFFLINE",
    featured: Boolean(course.featured),
    active: course.active !== false,
    onlinePublished: course.onlinePublished !== false,
    displayOrder: course.displayOrder ?? "0",
    imageUrl: course.imageUrl || "",
    bannerUrl: course.bannerUrl || "",
    featuresText: Array.isArray(course.features) ? course.features.join("\n") : "",
    syllabus: normalizeSyllabus(course.syllabus).map((section) => ({
      title: section.title,
      topicsText: section.topics.join("\n"),
    })),
  };
}

function toPayload(form, superAdmin) {
  const payload = {
    code: form.code,
    name: form.name,
    shortDescription: form.shortDescription || null,
    description: form.description || null,
    duration: form.duration || null,
    eligibility: form.eligibility || null,
    standardFee: form.standardFee === "" ? null : form.standardFee,
    onlineFee: form.onlineFee === "" ? null : form.onlineFee,
    admissionFee: form.admissionFee === "" ? null : form.admissionFee,
    deliveryMode: form.deliveryMode || null,
    featured: form.featured,
    active: form.active,
    onlinePublished: form.onlinePublished,
    displayOrder: form.displayOrder === "" ? 0 : form.displayOrder,
    imageUrl: form.imageUrl || null,
    bannerUrl: form.bannerUrl || null,
    features: form.featuresText
      .split(/\r?\n/)
      .map((value) => value.trim())
      .filter(Boolean),
    syllabus: form.syllabus
      .map((section) => ({
        title: section.title.trim(),
        topics: section.topicsText
          .split(/\r?\n/)
          .map((value) => value.trim())
          .filter(Boolean),
      }))
      .filter((section) => section.title),
  };

  if (superAdmin) {
    payload.discountType = form.discountType;
    payload.discountValue =
      form.discountType === "NONE" || form.discountValue === "" ? null : form.discountValue;
    payload.discountActive = form.discountType !== "NONE" && form.discountActive;
  }

  return payload;
}

export default function CourseManager({ courses, superAdmin }) {
  const router = useRouter();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const isEditing = Boolean(modal?.code);
  const preview = useMemo(
    () =>
      calculateCoursePricing({
        standardFee: form.standardFee,
        discountType: form.discountType,
        discountValue: form.discountValue,
        discountActive: form.discountActive,
      }),
    [form.standardFee, form.discountType, form.discountValue, form.discountActive]
  );

  function openCreate() {
    setForm(EMPTY_FORM);
    setError("");
    setMessage("");
    setModal({ mode: "create" });
  }

  function openEdit(course) {
    setForm(toForm(course));
    setError("");
    setMessage("");
    setModal({ mode: "edit", code: course.code });
  }

  function closeModal() {
    if (busy) return;
    setModal(null);
    setError("");
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const endpoint = isEditing
        ? "/api/admin/courses/" + encodeURIComponent(modal.code)
        : "/api/admin/courses";
      const response = await fetch(endpoint, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload(form, superAdmin)),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to save the course.");

      setMessage(isEditing ? "Course updated." : "Course created.");
      if (!isEditing) setForm(EMPTY_FORM);
      setModal(null);
      router.refresh();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black tracking-tight">Configured catalogue</h2>
          <p className="mt-1 text-xs text-slate-500">
            {courses.length} programmes · fees, syllabus, online publishing and discount control
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/admin/courses/content"
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-black text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
          >
            Open LMS Studio
          </Link>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white transition hover:bg-blue-700"
          >
            <Plus size={15} /> Add programme
          </button>
        </div>
      </div>

      {message && <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700">{message}</p>}

      <div className="mt-4 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {courses.map((course) => {
          const pricing = course.pricing || calculateCoursePricing(course);
          return (
            <article
              key={course.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,.045)] transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_18px_50px_rgba(37,99,235,.09)]"
            >
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] font-black tracking-[.16em] text-blue-600">{course.code}</span>
                    <span className={"rounded-full px-2 py-0.5 text-[9px] font-black " + (course.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500")}>
                      {course.active ? "Active" : "Inactive"}
                    </span>
                    {course.featured && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-black text-amber-700">
                        <Sparkles size={9} /> Featured
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 line-clamp-2 text-base font-black leading-6">{course.name}</h3>
                </div>
                {pricing.hasDiscount && (
                  <span className="shrink-0 rounded-full bg-rose-50 px-2.5 py-1 text-[9px] font-black text-rose-700">
                    {pricing.discountType === "PERCENTAGE" ? pricing.discountValue + "% OFF" : formatCourseMoneyCompact(pricing.discountAmount) + " OFF"}
                  </span>
                )}
              </div>

              <div className="flex-1 p-5">
                <p className="line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">
                  {course.shortDescription || "Programme description not configured yet."}
                </p>

                <div className="mt-4 rounded-xl bg-slate-50 p-3">
                  <div className="flex items-end justify-between gap-2">
                    <div>
                      <div className="text-[9px] font-black uppercase tracking-[.14em] text-slate-400">Course fee</div>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-xl font-black text-slate-900">{formatCourseMoneyCompact(pricing.finalFee)}</span>
                        {pricing.hasDiscount && <span className="text-xs font-bold text-slate-400 line-through">{formatCourseMoneyCompact(pricing.baseFee)}</span>}
                      </div>
                    </div>
                    {pricing.hasDiscount && (
                      <span className="rounded-lg bg-rose-100 px-2 py-1 text-[10px] font-black text-rose-700">
                        Save {formatCourseMoneyCompact(pricing.discountAmount)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Info icon={Globe2} label="Online fee" value={course.onlineFee == null ? "Not set" : formatCourseMoneyCompact(course.onlineFee)} />
                  <Info icon={GraduationCap} label="Admission fee" value={course.admissionFee == null ? "Not set" : formatCourseMoneyCompact(course.admissionFee)} />
                  <Info icon={Layers3} label="Batches" value={course._count?.batches ?? 0} />
                  <Info icon={BookOpen} label="Modules" value={course._count?.modules ?? 0} />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold text-slate-400">
                  <span>{course.duration || "Duration not set"}</span>
                  <span>·</span>
                  <span>{course.deliveryMode || "Mode not set"}</span>
                  <span>·</span>
                  <span>{course.onlinePublished ? "Online published" : "Draft online"}</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-3">
                <Link
                  href={"/dashboard/admin/courses/content?course=" + encodeURIComponent(course.code)}
                  className="text-[10px] font-black uppercase tracking-wide text-blue-700"
                >
                  Manage content
                </Link>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(course)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[10px] font-black text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
                  >
                    <Pencil size={13} /> Edit
                  </button>
                  <DeleteAction
                    compact
                    endpoint={"/api/admin/courses/" + encodeURIComponent(course.code)}
                    label={"Delete " + course.code}
                    confirmMessage={"Delete " + course.code + " — " + course.name + "? Linked batches, LMS modules, learners or financial records will block deletion."}
                  />
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {!courses.length && (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <BookOpen className="mx-auto text-slate-300" size={32} />
          <p className="mt-3 text-sm font-black text-slate-700">No courses configured</p>
          <p className="mt-1 text-xs text-slate-500">Add the first programme to start building the catalogue.</p>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-6">
          <div className="max-h-[94vh] w-full max-w-4xl overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-7">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.18em] text-blue-600">{isEditing ? "Edit programme" : "New programme"}</p>
                <h2 className="mt-1 text-xl font-black tracking-tight">{isEditing ? form.name || form.code : "Add a course"}</h2>
              </div>
              <button type="button" onClick={closeModal} disabled={busy} className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50">
                <X size={17} />
              </button>
            </div>

            <form onSubmit={submit} className="max-h-[calc(94vh-78px)] overflow-y-auto">
              <div className="space-y-6 p-5 sm:p-7">
                <Section title="Identity" description="Course code, name and academic outline.">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Course code">
                      <input required value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} placeholder="ADCA" className={inputClass} />
                    </Field>
                    <Field label="Duration">
                      <input value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value })} placeholder="12 months" className={inputClass} />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Course name">
                        <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Advanced Diploma in Computer Applications" className={inputClass} />
                      </Field>
                    </div>
                    <Field label="Delivery mode">
                      <select value={form.deliveryMode} onChange={(event) => setForm({ ...form, deliveryMode: event.target.value })} className={inputClass}>
                        <option value="OFFLINE">Offline / classroom</option>
                        <option value="HYBRID">Hybrid</option>
                        <option value="ONLINE">Online</option>
                      </select>
                    </Field>
                    <Field label="Display order">
                      <input type="number" min="0" value={form.displayOrder} onChange={(event) => setForm({ ...form, displayOrder: event.target.value })} className={inputClass} />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Short description">
                        <textarea rows={2} value={form.shortDescription} onChange={(event) => setForm({ ...form, shortDescription: event.target.value })} placeholder="One or two lines shown on course cards." className={inputClass} />
                      </Field>
                    </div>
                    <div className="sm:col-span-2">
                      <Field label="Full description">
                        <textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Detailed programme overview." className={inputClass} />
                      </Field>
                    </div>
                    <div className="sm:col-span-2">
                      <Field label="Eligibility">
                        <input value={form.eligibility} onChange={(event) => setForm({ ...form, eligibility: event.target.value })} placeholder="10th pass / 12th pass / open to all" className={inputClass} />
                      </Field>
                    </div>
                  </div>
                </Section>

                <Section title="Fees" description="Base offline fee is the authoritative course fee. Online fee is charged separately for online enrolment.">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Field label="Base offline fee (INR)">
                      <input type="number" min="0" step="0.01" value={form.standardFee} onChange={(event) => setForm({ ...form, standardFee: event.target.value })} placeholder="6000" className={inputClass} />
                    </Field>
                    <Field label="Online fee (INR)">
                      <input type="number" min="0" step="0.01" value={form.onlineFee} onChange={(event) => setForm({ ...form, onlineFee: event.target.value })} placeholder="4500" className={inputClass} />
                    </Field>
                    <Field label="Admission fee (INR)">
                      <input type="number" min="0" step="0.01" value={form.admissionFee} onChange={(event) => setForm({ ...form, admissionFee: event.target.value })} placeholder="500" className={inputClass} />
                    </Field>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                      <IndianRupee size={15} /> Payable offline fee after discount
                    </div>
                    <div className="flex items-baseline gap-2">
                      {preview.hasDiscount && <span className="text-xs font-bold text-blue-400 line-through">{formatCourseMoneyCompact(preview.baseFee)}</span>}
                      <span className="text-lg font-black text-blue-900">{formatCourseMoneyCompact(preview.finalFee)}</span>
                    </div>
                  </div>
                </Section>

                {superAdmin ? (
                  <Section title="Discount control" description="Super Admin only. Applies to offline admissions and public pricing; online fees remain separate.">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Field label="Discount type">
                        <select
                          value={form.discountType}
                          onChange={(event) => {
                            const type = event.target.value;
                            setForm({
                              ...form,
                              discountType: type,
                              discountValue: type === "NONE" ? "" : form.discountValue,
                              discountActive: type === "NONE" ? false : true,
                            });
                          }}
                          className={inputClass}
                        >
                          {COURSE_DISCOUNT_TYPES.map((type) => (
                            <option key={type} value={type}>{COURSE_DISCOUNT_LABELS[type]}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label={form.discountType === "PERCENTAGE" ? "Discount (%)" : "Discount amount (INR)"}>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          disabled={form.discountType === "NONE"}
                          value={form.discountValue}
                          onChange={(event) => setForm({ ...form, discountValue: event.target.value })}
                          placeholder={form.discountType === "PERCENTAGE" ? "50" : "2000"}
                          className={inputClass + " disabled:bg-slate-100 disabled:text-slate-400"}
                        />
                      </Field>
                      <label className="flex items-end gap-2 pb-3 text-xs font-bold text-slate-600">
                        <input
                          type="checkbox"
                          checked={form.discountActive}
                          disabled={form.discountType === "NONE"}
                          onChange={(event) => setForm({ ...form, discountActive: event.target.checked })}
                          className="h-4 w-4 rounded border-slate-300"
                        />
                        Discount active
                      </label>
                    </div>
                    {preview.hasDiscount && (
                      <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-xs font-bold text-rose-800">
                        <BadgePercent size={15} />
                        {preview.discountType === "PERCENTAGE" ? preview.discountValue + "%" : formatCourseMoneyCompact(preview.discountValue)} off
                        <span className="text-rose-400">·</span>
                        students pay {formatCourseMoneyCompact(preview.finalFee)}
                        <span className="text-rose-400">·</span>
                        they save {formatCourseMoneyCompact(preview.discountAmount)}
                      </div>
                    )}
                  </Section>
                ) : (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-800">
                    Course discounts are controlled by Super Admin. Existing discounts remain protected when you edit other fields.
                  </div>
                )}

                <Section title="Publishing" description="Control public visibility and featured placement.">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Cover image URL">
                      <input value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} placeholder="/uploads/course-cover.jpg" className={inputClass} />
                    </Field>
                    <Field label="Banner image URL">
                      <input value={form.bannerUrl} onChange={(event) => setForm({ ...form, bannerUrl: event.target.value })} placeholder="/uploads/course-banner.jpg" className={inputClass} />
                    </Field>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    <Toggle label="Active" checked={form.active} onChange={(checked) => setForm({ ...form, active: checked })} />
                    <Toggle label="Published online" checked={form.onlinePublished} onChange={(checked) => setForm({ ...form, onlinePublished: checked })} />
                    <Toggle label="Featured" checked={form.featured} onChange={(checked) => setForm({ ...form, featured: checked })} />
                  </div>
                </Section>

                <Section title="Highlights" description="Short bullet points shown on the public course page.">
                  <textarea rows={4} value={form.featuresText} onChange={(event) => setForm({ ...form, featuresText: event.target.value })} placeholder={"Practical learning\nStructured lessons\nStudent resources"} className={inputClass} />
                </Section>

                <Section title="Syllabus" description="Add sections and one topic per line. Leave empty to let the public page use the course description.">
                  <div className="space-y-3">
                    {form.syllabus.map((section, index) => (
                      <div key={index} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                        <div className="flex items-center gap-2">
                          <input
                            value={section.title}
                            onChange={(event) => updateSyllabusSection(setForm, form, index, { title: event.target.value })}
                            placeholder={"Semester / module title"}
                            className={inputClass + " bg-white"}
                          />
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, syllabus: form.syllabus.filter((_, itemIndex) => itemIndex !== index) })}
                            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-rose-200 bg-white text-rose-600"
                            title="Remove section"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <textarea
                          rows={3}
                          value={section.topicsText}
                          onChange={(event) => updateSyllabusSection(setForm, form, index, { topicsText: event.target.value })}
                          placeholder={"Topic one\nTopic two\nTopic three"}
                          className={inputClass + " mt-2 bg-white"}
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, syllabus: [...form.syllabus, { title: "", topicsText: "" }] })}
                      className="inline-flex items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-600 hover:border-blue-300 hover:text-blue-700"
                    >
                      <Plus size={14} /> Add syllabus section
                    </button>
                  </div>
                </Section>

                {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-xs font-bold text-red-700">{error}</p>}
              </div>

              <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-slate-100 bg-white/95 px-5 py-4 backdrop-blur sm:px-7">
                <button type="button" onClick={closeModal} disabled={busy} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-black text-slate-600">
                  Cancel
                </button>
                <button disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-black text-white transition hover:bg-blue-700 disabled:opacity-60">
                  {busy ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  {busy ? "Saving..." : isEditing ? "Save changes" : "Create course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

function updateSyllabusSection(setForm, form, index, patch) {
  setForm({
    ...form,
    syllabus: form.syllabus.map((section, itemIndex) => (itemIndex === index ? { ...section, ...patch } : section)),
  });
}

function Section({ title, description, children }) {
  return (
    <section>
      <h3 className="text-sm font-black tracking-tight text-slate-900">{title}</h3>
      {description && <p className="mt-1 text-[11px] leading-5 text-slate-500">{description}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-black uppercase tracking-wide text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5">
      <span className="text-[11px] font-black text-slate-700">{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 rounded border-slate-300" />
    </label>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-2">
      <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
        <Icon size={11} /> {label}
      </div>
      <div className="mt-0.5 text-[11px] font-black text-slate-800">{value}</div>
    </div>
  );
}
