import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ClipboardList, CreditCard, FileCheck2, GraduationCap, MapPin, Printer, UserRound } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { db } from "@/lib/db";
import { formatDate, formatInr, REGISTRATION_STATUS_LABELS, REGISTRATION_STATUS_TONES } from "@/lib/registration";
import RegistrationReview from "./registration-review";

export default async function RegistrationDetailPage({ params }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!hasPermission(user, "students.view")) redirect("/dashboard");

  const { id } = await params;
  const [registration, courses] = await Promise.all([
    db.registration.findUnique({
      where: { id },
      include: {
        qualifications: { orderBy: { serialNo: "asc" } },
        course: { select: { code: true, name: true, duration: true, eligibility: true } },
        student: { select: { id: true, name: true, registrationNo: true } },
        createdBy: { select: { name: true, email: true } },
        reviewedBy: { select: { name: true, email: true } },
      },
    }),
    db.course.findMany({ where: { active: true }, orderBy: [{ displayOrder: "asc" }, { code: "asc" }], select: { id: true, code: true, name: true } }),
  ]);

  if (!registration) notFound();

  const statusTone = REGISTRATION_STATUS_TONES[registration.status] || "border-slate-200 bg-slate-100 text-slate-600";

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1500px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/dashboard/admin/admissions/registrations" className="inline-flex items-center gap-1.5 text-xs font-black text-blue-700 hover:text-blue-800">
            <ArrowLeft size={14} /> Registration queue
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link href={"/registration/" + registration.id + "/print"} target="_blank" className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 shadow-sm hover:bg-slate-50">
              <Printer size={14} /> Print form
            </Link>
            <Link href="/dashboard/admin/admissions/register" className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-3 py-2 text-xs font-black text-white shadow-sm hover:bg-slate-800">
              <ClipboardList size={14} /> New registration
            </Link>
          </div>
        </div>

        <section className="mt-4 overflow-hidden rounded-[30px] border border-slate-800 bg-slate-950 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,.16)] sm:p-9">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={"rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[.14em] " + statusTone}>
                  {REGISTRATION_STATUS_LABELS[registration.status] || registration.status}
                </span>
                <span className="font-mono text-[10px] font-bold text-slate-400">{registration.formNo}</span>
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-[-.04em] sm:text-5xl">{registration.applicantName}</h1>
              <p className="mt-2 text-sm text-slate-300">
                {registration.courseCode ? registration.courseCode + " - " + registration.courseName : "Course not selected"} {registration.registrationNo ? " / " + registration.registrationNo : ""}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <HeroMetric label="Submitted" value={formatDate(registration.submittedAt || registration.createdAt)} />
              <HeroMetric label="Qualifications" value={registration.qualifications.length} />
              <HeroMetric label="Amount" value={registration.amount == null ? "Not set" : formatInr(registration.amount)} />
            </div>
          </div>
        </section>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="space-y-5">
            <Panel title="Applicant details" icon={UserRound}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Row label="Complete name" value={registration.applicantName} />
                <Row label="Father / husband" value={registration.guardianName} />
                <Row label="Nationality" value={registration.nationality} />
                <Row label="Date of birth" value={formatDate(registration.dateOfBirth)} />
                <Row label="Sex" value={registration.sex ? registration.sex.charAt(0) + registration.sex.slice(1).toLowerCase() : null} />
                <Row label="Registration number" value={registration.registrationNo} />
                {registration.photoUrl && (
                  <div className="sm:col-span-2">
                    <p className="text-[9px] font-black uppercase tracking-[.14em] text-slate-400">Photograph</p>
                    <img src={registration.photoUrl} alt="Applicant" className="mt-2 h-32 w-24 rounded-xl border border-slate-200 object-cover" />
                  </div>
                )}
              </div>
            </Panel>

            <Panel title="Address and contact" icon={MapPin}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <p className="text-[9px] font-black uppercase tracking-[.14em] text-slate-400">Complete address</p>
                  <p className="mt-1 whitespace-pre-line text-sm font-bold leading-6 text-slate-700">{registration.address || "Not provided"}</p>
                </div>
                <Row label="PIN code" value={registration.pinCode} />
                <Row label="STD code" value={registration.stdCode} />
                <Row label="Telephone" value={registration.telephoneNumber} />
                <Row label="Mobile" value={registration.mobileNumber} />
                {registration.signatureUrl && (
                  <div className="sm:col-span-2">
                    <p className="text-[9px] font-black uppercase tracking-[.14em] text-slate-400">Applicant signature</p>
                    <img src={registration.signatureUrl} alt="Applicant signature" className="mt-2 h-16 w-44 rounded-lg border border-slate-200 bg-white object-contain p-1" />
                  </div>
                )}
              </div>
            </Panel>

            <Panel title="Education and course" icon={GraduationCap}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Row label="Course" value={registration.course ? registration.course.code + " - " + registration.course.name : registration.courseName} />
                <Row label="Course code" value={registration.courseCode} />
                <Row label="Duration" value={registration.course?.duration} />
                <Row label="Eligibility" value={registration.course?.eligibility} />
                {registration.semII || registration.semIII ? <Row label="G.D.C.A. semesters" value={[registration.semII ? "Semester II" : null, registration.semIII ? "Semester III" : null].filter(Boolean).join(", ")} /> : null}
              </div>
              <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-xs">
                    <thead className="bg-slate-50 text-[9px] font-black uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-3 py-3">Sl.</th>
                        <th>Examination / course</th>
                        <th>Board / university</th>
                        <th>College / institute</th>
                        <th>Year</th>
                        <th>% marks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {registration.qualifications.map((item) => (
                        <tr key={item.id}>
                          <td className="px-3 py-3 font-bold text-slate-400">{item.serialNo}</td>
                          <td className="py-3 font-bold text-slate-800">{item.examCourse}</td>
                          <td className="py-3 text-slate-600">{item.boardUniversity || "-"}</td>
                          <td className="py-3 text-slate-600">{item.collegeInstitute || "-"}</td>
                          <td className="py-3 text-slate-600">{item.passingYear || "-"}</td>
                          <td className="py-3 text-slate-600">{item.percentageMarks == null ? "-" : Number(item.percentageMarks) + "%"}</td>
                        </tr>
                      ))}
                      {!registration.qualifications.length && (
                        <tr><td colSpan={6} className="px-3 py-8 text-center text-slate-400">No educational qualification recorded.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </Panel>

            <Panel title="Payment and enclosures" icon={CreditCard}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Row label="Demand draft number" value={registration.demandDraftNo} />
                <Row label="Amount" value={registration.amount == null ? null : formatInr(registration.amount)} />
                <Row label="Demand draft date" value={formatDate(registration.demandDraftDate)} />
                <Row label="Bank" value={registration.bankName} />
                <Row label="Kit issue number" value={registration.kitIssueNo} />
                <Row label="AEC code" value={registration.aecCode} />
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <Enclosure label="One stamp-size photo" checked={registration.enclosureStampPhoto} />
                <Enclosure label="Qualifying certificates" checked={registration.enclosureQualifyingCertificates} />
                <Enclosure label="Demand draft" checked={registration.enclosureDemandDraft} />
              </div>
            </Panel>

            <Panel title="Declaration" icon={FileCheck2}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Row label="Declaration accepted" value={registration.declarationAccepted ? "Yes" : "No"} />
                <Row label="Declaration date" value={formatDate(registration.declarationDate)} />
                <Row label="Place" value={registration.declarationPlace} />
                <Row label="Applicant signature" value={registration.applicantSignatureUrl ? "Uploaded" : null} />
              </div>
              <p className="mt-4 rounded-xl bg-slate-50 p-4 text-xs leading-6 text-slate-600">
                I do hereby declare that all the informations stated in this application form are true to the best of my knowledge. As I have followed the prospectus carefully and understood all the rules and regulations agree to abide by them.
              </p>
            </Panel>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-xs text-slate-500 shadow-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <Row label="Created by" value={registration.createdBy ? registration.createdBy.name + " (" + registration.createdBy.email + ")" : "System"} />
                <Row label="Created at" value={formatDate(registration.createdAt)} />
                <Row label="Reviewed by" value={registration.reviewedBy ? registration.reviewedBy.name : null} />
                <Row label="Reviewed at" value={formatDate(registration.reviewedAt)} />
                <Row label="Review note" value={registration.reviewNote} />
                <Row label="Linked student" value={registration.student ? registration.student.name + " / " + registration.student.registrationNo : null} />
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <RegistrationReview
              registration={{
                id: registration.id,
                status: registration.status,
                reviewNote: registration.reviewNote || "",
                kitIssueNo: registration.kitIssueNo || "",
                aecCode: registration.aecCode || "",
                registrationNo: registration.registrationNo || "",
                demandDraftNo: registration.demandDraftNo || "",
                bankName: registration.bankName || "",
                courseId: registration.courseId || "",
                declarationAccepted: registration.declarationAccepted,
                studentId: registration.studentId,
              }}
              courses={courses}
              canManage={hasPermission(user, "students.manage")}
            />

            {registration.student && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <p className="text-[10px] font-black uppercase tracking-[.16em] text-emerald-700">Student record created</p>
                <p className="mt-2 text-sm font-black text-emerald-900">{registration.student.name}</p>
                <p className="mt-1 text-xs text-emerald-700">{registration.student.registrationNo}</p>
                <Link href="/dashboard/admin/students/offline" className="mt-3 inline-flex text-xs font-black text-emerald-800 hover:text-emerald-900">Open offline students</Link>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[.16em] text-slate-400">Next step</p>
              <p className="mt-3 text-sm font-black">Batch admission</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">After approval, use the admission desk to allocate a batch and generate the fee ledger.</p>
              <Link href="/dashboard/admin/admissions" className="mt-3 inline-flex text-xs font-black text-blue-700 hover:text-blue-800">Go to admission desk</Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function HeroMetric({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[.06] px-3 py-3">
      <p className="text-[9px] font-black uppercase tracking-[.14em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}

function Panel({ title, icon: Icon, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-4">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-600"><Icon size={16} /></span>
        <h2 className="text-sm font-black">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Row({ label, value }) {
  return (
    <div>
      <p className="text-[9px] font-black uppercase tracking-[.14em] text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm font-bold text-slate-700">{value || "Not provided"}</p>
    </div>
  );
}

function Enclosure({ label, checked }) {
  return (
    <div className={"rounded-xl border p-3 text-xs font-bold " + (checked ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-slate-50 text-slate-500")}>
      {checked ? "Enclosed" : "Not enclosed"}: {label}
    </div>
  );
}
