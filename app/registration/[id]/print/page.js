import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { db } from "@/lib/db";
import { formatDate, formatInr, REGISTRATION_STATUS_LABELS } from "@/lib/registration";
import PrintButton from "./print-button";

export const metadata = {
  title: "RCLD Registration Form",
};

export default async function RegistrationPrintPage({ params }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!hasPermission(user, "students.view")) redirect("/dashboard");

  const { id } = await params;
  const registration = await db.registration.findUnique({
    where: { id },
    include: {
      qualifications: { orderBy: { serialNo: "asc" } },
      course: { select: { code: true, name: true } },
    },
  });

  if (!registration) notFound();

  return (
    <main className="min-h-screen bg-slate-100 py-6 print:bg-white print:py-0">
      <div className="mx-auto mb-4 flex max-w-[210mm] flex-wrap items-center justify-between gap-3 px-4 print:hidden">
        <Link href={"/dashboard/admin/admissions/registrations/" + registration.id} className="inline-flex items-center gap-1.5 text-xs font-black text-blue-700 hover:text-blue-800">
          <ArrowLeft size={14} /> Back to registration
        </Link>
        <PrintButton />
      </div>

      <article className="mx-auto max-w-[210mm] bg-white p-8 text-[10px] leading-4 text-slate-900 shadow-xl print:max-w-none print:p-6 print:shadow-none">
        <header className="border-b-2 border-slate-900 pb-4 text-center">
          <p className="text-[9px] font-black uppercase tracking-[.2em] text-slate-500">Rashtriya Computer Literacy Drive</p>
          <h1 className="mt-2 text-xl font-black uppercase tracking-wide">Student Registration Form</h1>
          <p className="mt-1 text-[9px] font-bold uppercase tracking-[.14em] text-slate-500">Office use / applicant copy</p>
        </header>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-1 border-b border-slate-300 pb-2">
          <span className="font-mono text-[9px] font-bold">Form No: <b className="text-xs">{registration.formNo}</b></span>
          <span className="text-[9px] font-bold">Status: {REGISTRATION_STATUS_LABELS[registration.status] || registration.status}</span>
          <span className="text-[9px] font-bold">Printed: {formatDate(new Date())}</span>
        </div>

        <div className="mt-3 grid gap-1.5 sm:grid-cols-4">
          <PrintField label="Kit issue no." value={registration.kitIssueNo} />
          <PrintField label="AEC code" value={registration.aecCode} />
          <PrintField label="Registration no." value={registration.registrationNo} />
          <PrintField label="Course code" value={registration.courseCode || registration.course?.code} />
        </div>

        <div className="mt-4 flex gap-4">
          <div className="min-w-0 flex-1">
            <SectionTitle>1. Applicant details</SectionTitle>
            <div className="mt-2 grid gap-x-4 gap-y-2 sm:grid-cols-2">
              <PrintField label="Full name" value={registration.applicantName} wide />
              <PrintField label="Father / husband name" value={registration.guardianName} />
              <PrintField label="Nationality" value={registration.nationality} />
              <PrintField label="Date of birth" value={formatDate(registration.dateOfBirth)} />
              <PrintField label="Sex" value={registration.sex ? registration.sex.charAt(0) + registration.sex.slice(1).toLowerCase() : null} />
              <PrintField label="Course applied for" value={registration.course ? registration.course.code + " - " + registration.course.name : registration.courseName} wide />
            </div>

            <SectionTitle className="mt-4">2. Address and contact</SectionTitle>
            <div className="mt-2">
              <PrintField label="Complete address" value={registration.address} wide />
            </div>
            <div className="mt-2 grid gap-x-4 gap-y-2 sm:grid-cols-4">
              <PrintField label="PIN code" value={registration.pinCode} />
              <PrintField label="STD code" value={registration.stdCode} />
              <PrintField label="Telephone" value={registration.telephoneNumber} />
              <PrintField label="Mobile" value={registration.mobileNumber} />
            </div>
          </div>

          <div className="w-28 shrink-0">
            <div className="flex h-32 w-24 items-center justify-center overflow-hidden border border-slate-400 bg-slate-50 text-center text-[8px] font-bold text-slate-400">
              {registration.photoUrl ? <img src={registration.photoUrl} alt="Applicant" className="h-full w-full object-cover" /> : "Paste stamp-size photograph"}
            </div>
            {registration.signatureUrl && (
              <div className="mt-2 w-24">
                <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">Signature</p>
                <img src={registration.signatureUrl} alt="Signature" className="mt-0.5 h-10 w-24 object-contain" />
              </div>
            )}
          </div>
        </div>

        <SectionTitle className="mt-4">3. Educational qualifications</SectionTitle>
        <table className="mt-2 w-full table-fixed border-collapse text-left text-[8px]">
          <thead>
            <tr className="bg-slate-100">
              <th className="w-8 border border-slate-400 px-1.5 py-1">Sl.</th>
              <th className="border border-slate-400 px-1.5 py-1">Examination / course</th>
              <th className="border border-slate-400 px-1.5 py-1">Board / university</th>
              <th className="border border-slate-400 px-1.5 py-1">College / institute</th>
              <th className="w-14 border border-slate-400 px-1.5 py-1">Year</th>
              <th className="w-14 border border-slate-400 px-1.5 py-1">% marks</th>
            </tr>
          </thead>
          <tbody>
            {registration.qualifications.map((item) => (
              <tr key={item.id}>
                <td className="border border-slate-400 px-1.5 py-1 font-bold">{item.serialNo}</td>
                <td className="border border-slate-400 px-1.5 py-1">{item.examCourse}</td>
                <td className="border border-slate-400 px-1.5 py-1">{item.boardUniversity || ""}</td>
                <td className="border border-slate-400 px-1.5 py-1">{item.collegeInstitute || ""}</td>
                <td className="border border-slate-400 px-1.5 py-1">{item.passingYear || ""}</td>
                <td className="border border-slate-400 px-1.5 py-1">{item.percentageMarks == null ? "" : Number(item.percentageMarks)}</td>
              </tr>
            ))}
            {!registration.qualifications.length && (
              <tr><td colSpan={6} className="border border-slate-400 px-1.5 py-4 text-center text-slate-400">No qualification recorded.</td></tr>
            )}
          </tbody>
        </table>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <SectionTitle>4. G.D.C.A. examination</SectionTitle>
            <div className="mt-2 grid gap-2">
              <PrintField label="Semester II" value={registration.semII ? "Selected" : "Not selected"} />
              <PrintField label="Semester III" value={registration.semIII ? "Selected" : "Not selected"} />
            </div>
          </div>
          <div>
            <SectionTitle>5. Payment details</SectionTitle>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <PrintField label="Demand draft no." value={registration.demandDraftNo} />
              <PrintField label="Amount" value={registration.amount == null ? null : formatInr(registration.amount)} />
              <PrintField label="D.D. date" value={formatDate(registration.demandDraftDate)} />
              <PrintField label="Bank" value={registration.bankName} />
            </div>
          </div>
        </div>

        <SectionTitle className="mt-4">6. Enclosures</SectionTitle>
        <div className="mt-2 grid gap-1.5 sm:grid-cols-3">
          <PrintCheck label="One stamp-size photograph" checked={registration.enclosureStampPhoto} />
          <PrintCheck label="Qualifying examination certificates" checked={registration.enclosureQualifyingCertificates} />
          <PrintCheck label="Demand draft" checked={registration.enclosureDemandDraft} />
        </div>

        <SectionTitle className="mt-4">7. Declaration</SectionTitle>
        <p className="mt-2 text-[8px] leading-4">
          I do hereby declare that all the informations stated in this application form are true to the best of my knowledge. As I have followed the prospectus carefully and understood all the rules and regulations agree to abide by them.
        </p>
        <div className="mt-3 grid gap-x-4 gap-y-2 sm:grid-cols-3">
          <PrintField label="Declaration accepted" value={registration.declarationAccepted ? "Yes" : "No"} />
          <PrintField label="Date" value={formatDate(registration.declarationDate)} />
          <PrintField label="Place" value={registration.declarationPlace} />
        </div>

        <div className="mt-10 grid grid-cols-2 gap-10 text-center text-[8px] font-bold">
          <div className="border-t border-slate-500 pt-1">Signature of applicant</div>
          <div className="border-t border-slate-500 pt-1">Signature of office authority</div>
        </div>

        <footer className="mt-5 flex items-center justify-between border-t border-slate-300 pt-2 text-[7px] font-bold text-slate-400">
          <span>RCLD student registration</span>
          <span>{registration.formNo}</span>
        </footer>
      </article>
    </main>
  );
}

function SectionTitle({ children, className = "" }) {
  return <h2 className={"bg-slate-900 px-2 py-1 text-[8px] font-black uppercase tracking-[.12em] text-white " + className}>{children}</h2>;
}

function PrintField({ label, value, wide }) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <p className="text-[7px] font-black uppercase tracking-wide text-slate-400">{label}</p>
      <p className="min-h-4 border-b border-dotted border-slate-400 pb-0.5 text-[9px] font-bold">{value || ""}</p>
    </div>
  );
}

function PrintCheck({ label, checked }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="grid h-3 w-3 place-items-center border border-slate-500 text-[7px] font-black">{checked ? "X" : ""}</span>
      <span className="text-[8px] font-bold">{label}</span>
    </div>
  );
}
