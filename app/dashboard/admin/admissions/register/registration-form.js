"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  FileCheck2,
  GraduationCap,
  Loader2,
  MapPin,
  Plus,
  Printer,
  Save,
  Send,
  Trash2,
  UserRound,
} from "lucide-react";
import { formatInr, isGdcaCourse } from "@/lib/registration";
import RegistrationUpload from "./registration-upload";

const steps = [
  { id: 1, label: "Personal", icon: UserRound },
  { id: 2, label: "Address", icon: MapPin },
  { id: 3, label: "Education", icon: GraduationCap },
  { id: 4, label: "Payment", icon: CreditCard },
  { id: 5, label: "Declaration", icon: FileCheck2 },
];

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

function todayValue() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60000)
    .toISOString()
    .slice(0, 10);
}

function emptyQualification() {
  return {
    examCourse: "",
    boardUniversity: "",
    collegeInstitute: "",
    passingYear: "",
    percentageMarks: "",
  };
}

function initialForm() {
  return {
    applicantName: "",
    nationality: "Indian",
    dateOfBirth: "",
    sex: "",
    photoUrl: "",
    guardianName: "",
    address: "",
    stdCode: "",
    telephoneNumber: "",
    mobileNumber: "",
    pinCode: "",
    signatureUrl: "",
    courseId: "",
    kitIssueNo: "",
    aecCode: "",
    registrationNo: "",
    demandDraftNo: "",
    amount: "",
    demandDraftDate: "",
    bankName: "",
    semII: false,
    semIII: false,
    enclosureStampPhoto: false,
    enclosureQualifyingCertificates: false,
    enclosureDemandDraft: false,
    declarationAccepted: false,
    declarationDate: todayValue(),
    declarationPlace: "",
    applicantSignatureUrl: "",
    qualifications: [emptyQualification()],
  };
}

export default function RegistrationForm({ courses }) {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(null);

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === form.courseId),
    [courses, form.courseId]
  );

  const gdca = isGdcaCourse(selectedCourse);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));

    setErrors((current) => ({
      ...current,
      [key]: undefined,
      __form: undefined,
    }));
  }

  function updateQualification(index, key, value) {
    setForm((current) => ({
      ...current,
      qualifications: current.qualifications.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      ),
    }));

    setErrors((current) => ({
      ...current,
      ["qualifications." + index + "." + key]: undefined,
      __form: undefined,
    }));
  }

  function addQualification() {
    setForm((current) => ({
      ...current,
      qualifications: [
        ...current.qualifications,
        emptyQualification(),
      ],
    }));
  }

  function removeQualification(index) {
    setForm((current) => ({
      ...current,
      qualifications:
        current.qualifications.length === 1
          ? [emptyQualification()]
          : current.qualifications.filter(
              (_, itemIndex) => itemIndex !== index
            ),
    }));
  }

  function selectCourse(courseId) {
    const course = courses.find((item) => item.id === courseId);

    setForm((current) => ({
      ...current,
      courseId,
      amount:
        current.amount ||
        (course?.standardFee != null
          ? String(course.standardFee)
          : ""),
      semII: false,
      semIII: false,
    }));

    setErrors((current) => ({
      ...current,
      courseId: undefined,
      __form: undefined,
    }));
  }

  function stepErrors(stepNumber) {
    const found = {};
    const provided = (value) =>
      String(value || "").trim().length > 0;

    if (stepNumber === 1) {
      if (String(form.applicantName || "").trim().length < 2) {
        found.applicantName =
          "Enter the applicant's complete name.";
      }

      if (form.dateOfBirth) {
        const birthDate = new Date(
          form.dateOfBirth + "T00:00:00"
        );

        if (Number.isNaN(birthDate.getTime())) {
          found.dateOfBirth = "Enter a valid date of birth.";
        } else {
          if (birthDate > new Date()) {
            found.dateOfBirth =
              "Date of birth cannot be in the future.";
          }

          if (birthDate.getFullYear() < 1900) {
            found.dateOfBirth =
              "Enter a valid date of birth.";
          }
        }
      }
    }

    if (stepNumber === 2) {
      if (
        provided(form.mobileNumber) &&
        !/^[0-9+\-\s]{6,20}$/.test(form.mobileNumber)
      ) {
        found.mobileNumber = "Enter a valid mobile number.";
      }

      if (
        provided(form.telephoneNumber) &&
        !/^[0-9+\-\s]{6,20}$/.test(
          form.telephoneNumber
        )
      ) {
        found.telephoneNumber =
          "Enter a valid telephone number.";
      }

      if (
        provided(form.stdCode) &&
        !/^[0-9]{1,6}$/.test(form.stdCode)
      ) {
        found.stdCode =
          "STD code must contain up to 6 digits.";
      }

      if (
        provided(form.pinCode) &&
        !/^[0-9]{6}$/.test(form.pinCode)
      ) {
        found.pinCode =
          "PIN code must be exactly 6 digits.";
      }
    }

    if (stepNumber === 3) {
      if (!form.courseId) {
        found.courseId =
          "Select the course being applied for.";
      }

      form.qualifications.forEach((item, index) => {
        const rowHasData = Object.values(item).some(
          (value) => provided(value)
        );

        if (!rowHasData) return;

        if (!provided(item.examCourse)) {
          found[
            "qualifications." + index + ".examCourse"
          ] = "Examination or course is required.";
        }

        if (provided(item.passingYear)) {
          const year = Number(item.passingYear);

          if (
            !Number.isInteger(year) ||
            year < 1900 ||
            year > new Date().getFullYear() + 2
          ) {
            found[
              "qualifications." + index + ".passingYear"
            ] = "Enter a valid passing year.";
          }
        }

        if (provided(item.percentageMarks)) {
          const marks = Number(item.percentageMarks);

          if (
            !Number.isFinite(marks) ||
            marks < 0 ||
            marks > 100
          ) {
            found[
              "qualifications." +
                index +
                ".percentageMarks"
            ] = "Percentage must be between 0 and 100.";
          }
        }
      });
    }

    if (stepNumber === 4) {
      if (provided(form.amount)) {
        const amount = Number(form.amount);

        if (
          !Number.isFinite(amount) ||
          amount < 0
        ) {
          found.amount = "Enter a valid amount.";
        }
      }
    }

    if (stepNumber === 5) {
      if (!form.declarationAccepted) {
        found.declarationAccepted =
          "Accept the declaration before submitting.";
      }

      if (provided(form.declarationDate)) {
        const date = new Date(
          form.declarationDate + "T00:00:00"
        );

        if (Number.isNaN(date.getTime())) {
          found.declarationDate =
            "Enter a valid declaration date.";
        }
      }
    }

    return found;
  }

  function validateStep(stepNumber) {
    const found = stepErrors(stepNumber);
    setErrors(found);

    return Object.keys(found).length === 0;
  }

  function validateAll() {
    const found = {};

    for (let index = 1; index <= 5; index += 1) {
      Object.assign(found, stepErrors(index));
    }

    setErrors(found);

    if (Object.keys(found).length) {
      const first = Object.keys(found)[0];

      if (first.startsWith("qualifications.")) {
        setStep(3);
      } else if (
        [
          "mobileNumber",
          "pinCode",
          "stdCode",
          "telephoneNumber",
        ].includes(first)
      ) {
        setStep(2);
      } else if (first === "courseId") {
        setStep(3);
      } else if (first === "amount") {
        setStep(4);
      } else if (
        [
          "declarationAccepted",
          "declarationDate",
        ].includes(first)
      ) {
        setStep(5);
      } else {
        setStep(1);
      }

      return false;
    }

    return true;
  }

  function nextStep() {
    if (!validateStep(step)) return;

    setStep((current) => Math.min(5, current + 1));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function previousStep() {
    setStep((current) => Math.max(1, current - 1));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function save(submit) {
    if (busy) return;

    if (submit && !validateAll()) return;

    if (
      !submit &&
      String(form.applicantName || "").trim().length < 2
    ) {
      setErrors({
        applicantName:
          "Enter the applicant's complete name before saving.",
      });

      setStep(1);
      return;
    }

    setBusy(true);
    setErrors({});

    try {
      const qualifications = form.qualifications
        .filter((item) =>
          Object.values(item).some(
            (value) =>
              String(value || "").trim().length > 0
          )
        )
        .map((item, index) => ({
          serialNo: index + 1,
          examCourse: item.examCourse,
          boardUniversity: item.boardUniversity,
          collegeInstitute: item.collegeInstitute,
          passingYear: item.passingYear,
          percentageMarks: item.percentageMarks,
        }));

      const payload = {
        ...form,
        semII: gdca ? form.semII : false,
        semIII: gdca ? form.semIII : false,
        applicantSignatureUrl:
          form.applicantSignatureUrl ||
          form.signatureUrl,
        qualifications,
        submit,
      };

      const response = await fetch(
        "/api/admin/registrations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to save the registration."
        );
      }

      if (!data.registration) {
        throw new Error(
          "The server did not return the saved registration."
        );
      }

      setSuccess(data.registration);
      router.refresh();
    } catch (error) {
      setErrors({
        __form:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
      });
    } finally {
      setBusy(false);
    }
  }

  if (success) {
    return (
      <section className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm sm:p-10">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 size={32} />
        </div>

        <h2 className="mt-6 text-2xl font-black tracking-tight sm:text-3xl">
          {success.status === "SUBMITTED"
            ? "Registration submitted"
            : "Draft saved"}
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          The application has been stored securely. Office
          staff can now review the details, update the
          administrative fields and approve the registration.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Summary
            label="Form number"
            value={success.formNo}
          />
          <Summary
            label="Registration number"
            value={
              success.registrationNo || "To be assigned"
            }
          />
          <Summary
            label="Status"
            value={success.status.replaceAll("_", " ")}
          />
        </div>

        <div className="mt-7 flex flex-wrap gap-2">
          <Link
            href={
              "/dashboard/admin/admissions/registrations/" +
              success.id
            }
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white hover:bg-slate-800"
          >
            Open application <ArrowRight size={16} />
          </Link>

          <Link
            href={"/registration/" + success.id + "/print"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
          >
            <Printer size={16} /> Print form
          </Link>

          <button
            type="button"
            onClick={() => {
              setSuccess(null);
              setForm(initialForm());
              setStep(1);
              setErrors({});
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
          >
            <Plus size={16} /> Register another
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
      <section className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,.06)]">
        <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-4 sm:px-6">
          <div className="grid grid-cols-5 gap-1.5 sm:gap-3">
            {steps.map((item) => {
              const Icon = item.icon;
              const complete = step > item.id;
              const active = step === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.id < step || validateAll()) {
                      setStep(item.id);
                    }
                  }}
                  className={
                    "flex min-w-0 flex-col items-center gap-1.5 rounded-xl px-1 py-2 text-center transition sm:flex-row sm:justify-center sm:gap-2 sm:px-2 " +
                    (active
                      ? "bg-slate-950 text-white shadow-sm"
                      : complete
                        ? "text-emerald-700 hover:bg-emerald-50"
                        : "text-slate-400 hover:bg-white hover:text-slate-700")
                  }
                  aria-current={active ? "step" : undefined}
                >
                  <span
                    className={
                      "grid h-7 w-7 shrink-0 place-items-center rounded-lg " +
                      (active
                        ? "bg-white/10"
                        : complete
                          ? "bg-emerald-100"
                          : "bg-white")
                    }
                  >
                    {complete ? (
                      <Check size={14} />
                    ) : (
                      <Icon size={14} />
                    )}
                  </span>

                  <span className="truncate text-[9px] font-black uppercase tracking-wide sm:text-[10px]">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.2em] text-blue-600">
                Step {step} of 5
              </p>

              <h2 className="mt-1 text-xl font-black tracking-tight sm:text-2xl">
                {step === 1 && "Applicant and guardian details"}
                {step === 2 && "Address, contact and signature"}
                {step === 3 && "Education and course selection"}
                {step === 4 && "Payment and enclosures"}
                {step === 5 && "Declaration and review"}
              </h2>
            </div>

            <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-black text-slate-500 sm:block">
              RCLD Registration Form
            </span>
          </div>

          {step === 1 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Complete name of the applicant"
                error={errors.applicantName}
                required
                className="sm:col-span-2"
              >
                <input
                  value={form.applicantName}
                  onChange={(event) =>
                    update("applicantName", event.target.value)
                  }
                  className={inputClass}
                  placeholder="First name  Middle name  Last name"
                  autoComplete="name"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Use spaces between the first, middle and last
                  name as printed on official documents.
                </p>
              </Field>

              <Field label="Father's name / husband's name">
                <input
                  value={form.guardianName}
                  onChange={(event) =>
                    update("guardianName", event.target.value)
                  }
                  className={inputClass}
                  placeholder="Guardian's complete name"
                />
              </Field>

              <Field label="Nationality" error={errors.nationality}>
                <input
                  value={form.nationality}
                  onChange={(event) =>
                    update("nationality", event.target.value)
                  }
                  className={inputClass}
                  placeholder="Indian"
                />
              </Field>

              <Field label="Date of birth" error={errors.dateOfBirth}>
                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(event) =>
                    update("dateOfBirth", event.target.value)
                  }
                  className={inputClass}
                />
              </Field>

              <Field label="Sex" error={errors.sex}>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ["MALE", "Male"],
                    ["FEMALE", "Female"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => update("sex", value)}
                      className={
                        "rounded-xl border px-3 py-2.5 text-sm font-black transition " +
                        (form.sex === value
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300")
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </Field>

              <div className="sm:col-span-2">
                <RegistrationUpload
                  kind="photo"
                  label="Recent passport-size photograph"
                  hint="Upload a clear passport-size photograph. JPG, PNG or WEBP up to 5 MB."
                  value={form.photoUrl}
                  onChange={(value) => update("photoUrl", value)}
                  circular
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Complete address"
                error={errors.address}
                className="sm:col-span-2"
              >
                <textarea
                  value={form.address}
                  onChange={(event) =>
                    update("address", event.target.value)
                  }
                  rows={3}
                  className={inputClass}
                  placeholder="House / street, village or town, post office, district, state"
                />
              </Field>

              <Field label="PIN code" error={errors.pinCode}>
                <input
                  value={form.pinCode}
                  onChange={(event) =>
                    update("pinCode", event.target.value)
                  }
                  className={inputClass}
                  placeholder="733202"
                  inputMode="numeric"
                  maxLength={6}
                />
              </Field>

              <Field label="STD code" error={errors.stdCode}>
                <input
                  value={form.stdCode}
                  onChange={(event) =>
                    update("stdCode", event.target.value)
                  }
                  className={inputClass}
                  placeholder="03482"
                  inputMode="numeric"
                  maxLength={6}
                />
              </Field>

              <Field
                label="Telephone number"
                error={errors.telephoneNumber}
              >
                <input
                  value={form.telephoneNumber}
                  onChange={(event) =>
                    update("telephoneNumber", event.target.value)
                  }
                  className={inputClass}
                  placeholder="Landline number"
                  inputMode="tel"
                />
              </Field>

              <Field
                label="Mobile number"
                error={errors.mobileNumber}
              >
                <input
                  value={form.mobileNumber}
                  onChange={(event) =>
                    update("mobileNumber", event.target.value)
                  }
                  className={inputClass}
                  placeholder="Mobile number"
                  inputMode="tel"
                  autoComplete="tel"
                />
              </Field>

              <div className="sm:col-span-2">
                <RegistrationUpload
                  kind="signature"
                  label="Signature of applicant"
                  hint="Upload the applicant's signature. This signature is also reused in the declaration unless replaced."
                  value={form.signatureUrl}
                  onChange={(value) =>
                    update("signatureUrl", value)
                  }
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Course name"
                  error={errors.courseId}
                  required
                >
                  <select
                    value={form.courseId}
                    onChange={(event) =>
                      selectCourse(event.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Course code">
                  <input
                    value={selectedCourse?.code || ""}
                    readOnly
                    className={inputClass + " bg-slate-50 text-slate-500"}
                    placeholder="Auto-filled from the course catalogue"
                  />
                </Field>
              </div>

              {selectedCourse && (
                <div className="grid gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 sm:grid-cols-3">
                  <Summary
                    label="Duration"
                    value={selectedCourse.duration || "Not configured"}
                  />
                  <Summary
                    label="Offline fee"
                    value={
                      selectedCourse.standardFee == null
                        ? "Not configured"
                        : formatInr(selectedCourse.standardFee)
                    }
                  />
                  <Summary
                    label="Eligibility"
                    value={selectedCourse.eligibility || "Not configured"}
                  />
                </div>
              )}

              {gdca && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[.16em] text-amber-800">
                    G.D.C.A. course selection
                  </p>
                  <p className="mt-1 text-xs text-amber-700">
                    Select the semester(s) the candidate is applying for.
                  </p>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <CheckboxField
                      label="Semester II"
                      checked={form.semII}
                      onChange={(value) => update("semII", value)}
                    />
                    <CheckboxField
                      label="Semester III"
                      checked={form.semIII}
                      onChange={(value) => update("semIII", value)}
                    />
                  </div>
                </div>
              )}

              <div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-black">
                      Maximum educational qualification
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Add each qualification separately. Leave the
                      table blank when not applicable.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addQualification}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 hover:border-blue-200 hover:text-blue-700"
                  >
                    <Plus size={14} /> Add qualification
                  </button>
                </div>

                <div className="mt-3 space-y-3">
                  {form.qualifications.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3 sm:p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-[.16em] text-slate-500">
                          Qualification {index + 1}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeQualification(index)}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-black text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 size={13} /> Remove
                        </button>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field
                          label="Examination / course"
                          error={
                            errors[
                              "qualifications." +
                                index +
                                ".examCourse"
                            ]
                          }
                        >
                          <input
                            value={item.examCourse}
                            onChange={(event) =>
                              updateQualification(
                                index,
                                "examCourse",
                                event.target.value
                              )
                            }
                            className={inputClass}
                            placeholder="Madhyamik / HS / Diploma / Degree"
                          />
                        </Field>

                        <Field label="Board / university">
                          <input
                            value={item.boardUniversity}
                            onChange={(event) =>
                              updateQualification(
                                index,
                                "boardUniversity",
                                event.target.value
                              )
                            }
                            className={inputClass}
                            placeholder="Board or university name"
                          />
                        </Field>

                        <Field label="College / institute">
                          <input
                            value={item.collegeInstitute}
                            onChange={(event) =>
                              updateQualification(
                                index,
                                "collegeInstitute",
                                event.target.value
                              )
                            }
                            className={inputClass}
                            placeholder="School, college or institute"
                          />
                        </Field>

                        <div className="grid grid-cols-2 gap-3">
                          <Field
                            label="Year"
                            error={
                              errors[
                                "qualifications." +
                                  index +
                                  ".passingYear"
                              ]
                            }
                          >
                            <input
                              value={item.passingYear}
                              onChange={(event) =>
                                updateQualification(
                                  index,
                                  "passingYear",
                                  event.target.value
                                )
                              }
                              className={inputClass}
                              placeholder="2024"
                              inputMode="numeric"
                            />
                          </Field>

                          <Field
                            label="% of marks"
                            error={
                              errors[
                                "qualifications." +
                                  index +
                                  ".percentageMarks"
                              ]
                            }
                          >
                            <input
                              value={item.percentageMarks}
                              onChange={(event) =>
                                updateQualification(
                                  index,
                                  "percentageMarks",
                                  event.target.value
                                )
                              }
                              className={inputClass}
                              placeholder="75"
                              inputMode="decimal"
                            />
                          </Field>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-[10px] font-black uppercase tracking-[.16em] text-slate-500">
                  Office use
                </p>

                <div className="mt-3 grid gap-4 sm:grid-cols-3">
                  <Field label="Kit issue no. (AEC)">
                    <input
                      value={form.kitIssueNo}
                      onChange={(event) =>
                        update("kitIssueNo", event.target.value)
                      }
                      className={inputClass}
                      placeholder="Kit issue number"
                    />
                  </Field>

                  <Field label="AEC code">
                    <input
                      value={form.aecCode}
                      onChange={(event) =>
                        update("aecCode", event.target.value)
                      }
                      className={inputClass}
                      placeholder="AEC code"
                    />
                  </Field>

                  <Field label="Registration no.">
                    <input
                      value={form.registrationNo}
                      onChange={(event) =>
                        update("registrationNo", event.target.value)
                      }
                      className={inputClass}
                      placeholder="Auto-generated if left blank"
                    />
                  </Field>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Demand draft no.">
                  <input
                    value={form.demandDraftNo}
                    onChange={(event) =>
                      update("demandDraftNo", event.target.value)
                    }
                    className={inputClass}
                    placeholder="Demand draft number"
                  />
                </Field>

                <Field label="Amount" error={errors.amount}>
                  <input
                    value={form.amount}
                    onChange={(event) =>
                      update("amount", event.target.value)
                    }
                    className={inputClass}
                    placeholder="Amount in INR"
                    inputMode="decimal"
                  />
                </Field>

                <Field label="Demand draft date">
                  <input
                    type="date"
                    value={form.demandDraftDate}
                    onChange={(event) =>
                      update("demandDraftDate", event.target.value)
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Bank">
                  <input
                    value={form.bankName}
                    onChange={(event) =>
                      update("bankName", event.target.value)
                    }
                    className={inputClass}
                    placeholder="Bank name and branch"
                  />
                </Field>
              </div>

              <div>
                <h3 className="text-sm font-black">Enclosures</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Tick the documents and items enclosed with the application.
                </p>

                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  <CheckboxField
                    label="One stamp-size photo"
                    checked={form.enclosureStampPhoto}
                    onChange={(value) =>
                      update("enclosureStampPhoto", value)
                    }
                  />

                  <CheckboxField
                    label="Xerox of qualifying certificates"
                    checked={form.enclosureQualifyingCertificates}
                    onChange={(value) =>
                      update("enclosureQualifyingCertificates", value)
                    }
                  />

                  <CheckboxField
                    label="Demand draft"
                    checked={form.enclosureDemandDraft}
                    onChange={(value) =>
                      update("enclosureDemandDraft", value)
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                <h3 className="text-sm font-black">Declaration</h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  I do hereby declare that all the informations
                  stated in this application form are true to the
                  best of my knowledge. As I have followed the
                  prospectus carefully and understood all the rules
                  and regulations agree to abide by them.
                </p>

                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
                  <CheckboxField
                    label="I accept the declaration above"
                    checked={form.declarationAccepted}
                    onChange={(value) =>
                      update("declarationAccepted", value)
                    }
                  />

                  {errors.declarationAccepted && (
                    <p className="mt-1 text-[11px] font-bold text-rose-600">
                      {errors.declarationAccepted}
                    </p>
                  )}
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Place"
                    error={errors.declarationPlace}
                  >
                    <input
                      value={form.declarationPlace}
                      onChange={(event) =>
                        update("declarationPlace", event.target.value)
                      }
                      className={inputClass}
                      placeholder="Place of declaration"
                    />
                  </Field>

                  <Field
                    label="Date"
                    error={errors.declarationDate}
                  >
                    <input
                      type="date"
                      value={form.declarationDate}
                      onChange={(event) =>
                        update("declarationDate", event.target.value)
                      }
                      className={inputClass}
                    />
                  </Field>
                </div>

                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-[10px] font-black uppercase tracking-[.16em] text-slate-500">
                    Applicant signature
                  </p>

                  {form.signatureUrl ||
                  form.applicantSignatureUrl ? (
                    <div className="mt-2 flex items-center gap-3">
                      <img
                        src={
                          form.applicantSignatureUrl ||
                          form.signatureUrl
                        }
                        alt="Applicant signature"
                        className="h-16 w-40 rounded-lg border border-slate-200 bg-white object-contain p-1"
                      />

                      <span className="text-[11px] text-slate-500">
                        The uploaded signature will be used on this form.
                      </span>
                    </div>
                  ) : (
                    <p className="mt-2 text-[11px] text-slate-500">
                      No signature uploaded. You can still submit,
                      but the printed form will show a blank signature area.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4 sm:p-5">
                <h3 className="text-sm font-black">Review summary</h3>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Summary
                    label="Applicant"
                    value={form.applicantName || "Not provided"}
                  />

                  <Summary
                    label="Guardian"
                    value={form.guardianName || "Not provided"}
                  />

                  <Summary
                    label="Course"
                    value={
                      selectedCourse
                        ? selectedCourse.code +
                          " - " +
                          selectedCourse.name
                        : "Not selected"
                    }
                  />

                  <Summary
                    label="Mobile"
                    value={form.mobileNumber || "Not provided"}
                  />

                  <Summary
                    label="Demand draft"
                    value={form.demandDraftNo || "Not provided"}
                  />

                  <Summary
                    label="Amount"
                    value={
                      form.amount
                        ? formatInr(form.amount)
                        : "Not provided"
                    }
                  />

                  <Summary
                    label="Qualifications"
                    value={
                      form.qualifications.filter(
                        (item) => item.examCourse
                      ).length + " recorded"
                    }
                  />

                  <Summary
                    label="Registration no."
                    value={
                      form.registrationNo ||
                      "Auto-generated on save"
                    }
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-black text-blue-700 hover:text-blue-800"
                  >
                    Edit personal details
                  </button>

                  <span className="text-slate-300">/</span>

                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="text-xs font-black text-blue-700 hover:text-blue-800"
                  >
                    Edit course and education
                  </button>

                  <span className="text-slate-300">/</span>

                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="text-xs font-black text-blue-700 hover:text-blue-800"
                  >
                    Edit payment
                  </button>
                </div>
              </div>

              {errors.__form && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700">
                  <AlertCircle
                    size={15}
                    className="mt-0.5 shrink-0"
                  />
                  {errors.__form}
                </div>
              )}

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => save(true)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {busy ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  {busy ? "Submitting..." : "Submit registration"}
                </button>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => save(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  <Save size={16} /> Save as draft
                </button>
              </div>
            </div>
          )}

          {errors.__form && step !== 5 && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700">
              <AlertCircle
                size={15}
                className="mt-0.5 shrink-0"
              />
              {errors.__form}
            </div>
          )}

          {step < 5 && (
            <div className="mt-7 flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={previousStep}
                disabled={step === 1}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft size={15} /> Back
              </button>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => save(false)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  <Save size={15} /> Save draft
                </button>

                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white hover:bg-slate-800"
                >
                  Continue <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <aside className="space-y-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[.18em] text-slate-400">
            Application snapshot
          </p>

          <p className="mt-3 text-lg font-black leading-tight">
            {form.applicantName || "New applicant"}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {form.mobileNumber || "Contact pending"}
          </p>

          <div className="mt-4 space-y-2.5 border-t border-slate-100 pt-4">
            <Summary
              label="Course"
              value={selectedCourse ? selectedCourse.code : "Not selected"}
            />

            <Summary
              label="Amount"
              value={
                form.amount
                  ? formatInr(form.amount)
                  : "Not provided"
              }
            />

            <Summary
              label="Form number"
              value="Generated on save"
            />

            <Summary
              label="Status"
              value={
                form.declarationAccepted
                  ? "Ready to submit"
                  : "Draft in progress"
              }
            />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5 text-white shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[.18em] text-cyan-300">
            Office workflow
          </p>

          <p className="mt-3 text-sm font-black">
            Registration to admission
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-400">
            Submitted forms enter the registration queue for
            verification, approval and student record creation.
          </p>

          <Link
            href="/dashboard/admin/admissions/registrations"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-black text-cyan-300 hover:text-cyan-200"
          >
            Open registration queue <ExternalLink size={13} />
          </Link>
        </div>
      </aside>
    </div>
  );
}

function Field({
  label,
  error,
  required,
  children,
  className = "",
}) {
  return (
    <label className={"block " + className}>
      <span className="mb-1.5 block text-[11px] font-black uppercase tracking-wide text-slate-500">
        {label}{" "}
        {required && <span className="text-rose-500">*</span>}
      </span>

      {children}

      {error && (
        <p className="mt-1 text-[11px] font-bold text-rose-600">
          {error}
        </p>
      )}
    </label>
  );
}

/*
 * IMPORTANT:
 * This component is named CheckboxField instead of Check
 * to avoid conflicting with the Check icon from lucide-react.
 */
function CheckboxField({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200 bg-white p-3 text-xs font-bold text-slate-700 transition hover:border-blue-200">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
      />

      <span className="leading-5">{label}</span>
    </label>
  );
}

function Summary({ label, value }) {
  return (
    <div>
      <p className="text-[9px] font-black uppercase tracking-[.14em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-xs font-black text-slate-700">
        {value}
      </p>
    </div>
  );
}
