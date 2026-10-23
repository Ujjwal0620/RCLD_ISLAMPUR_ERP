import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, ClipboardList, Search, SlidersHorizontal, UserPlus } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { db } from "@/lib/db";
import { formatDate, REGISTRATION_STATUSES, REGISTRATION_STATUS_LABELS, REGISTRATION_STATUS_TONES } from "@/lib/registration";

export const metadata = {
  title: "Registration Queue",
};

const PAGE_SIZE = 20;

function queryString(values) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const text = params.toString();
  return text ? "?" + text : "";
}

export default async function RegistrationsPage({ searchParams }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!hasPermission(user, "students.view")) redirect("/dashboard");

  const params = await searchParams;
  const q = String(params?.q || "").trim();
  const status = REGISTRATION_STATUSES.includes(String(params?.status || "")) ? String(params.status) : "";
  const page = Math.max(1, Number(params?.page || 1));

  const where = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { applicantName: { contains: q, mode: "insensitive" } },
            { formNo: { contains: q, mode: "insensitive" } },
            { registrationNo: { contains: q, mode: "insensitive" } },
            { mobileNumber: { contains: q, mode: "insensitive" } },
            { courseCode: { contains: q, mode: "insensitive" } },
            { courseName: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [total, registrations, statusCounts] = await Promise.all([
    db.registration.count({ where }),
    db.registration.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        formNo: true,
        registrationNo: true,
        applicantName: true,
        mobileNumber: true,
        courseCode: true,
        courseName: true,
        status: true,
        createdAt: true,
        submittedAt: true,
        studentId: true,
        _count: { select: { qualifications: true } },
      },
    }),
    db.registration.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const counts = Object.fromEntries(statusCounts.map((item) => [item.status, item._count._all]));
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const canCreate = hasPermission(user, "students.manage");

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1550px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/dashboard/admin/admissions" className="inline-flex items-center gap-1.5 text-xs font-black text-blue-700 hover:text-blue-800">
            <ArrowLeft size={14} /> Admission desk
          </Link>
          {canCreate && (
            <Link href="/dashboard/admin/admissions/register" className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white shadow-sm hover:bg-slate-800">
              <UserPlus size={15} /> New registration
            </Link>
          )}
        </div>

        <section className="mt-4 overflow-hidden rounded-[30px] border border-slate-800 bg-slate-950 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,.16)] sm:p-9">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.06] px-3 py-1.5 text-[10px] font-black uppercase tracking-[.18em] text-blue-200">
            <ClipboardList size={12} /> Registration operations
          </span>
          <h1 className="mt-5 text-3xl font-black tracking-[-.04em] sm:text-5xl">Registration Queue</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
            Review submitted application forms, verify office details, record decisions and convert approved applicants into student records.
          </p>
        </section>

        <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {REGISTRATION_STATUSES.map((item) => (
            <Link
              key={item}
              href={"/dashboard/admin/admissions/registrations" + queryString({ q, status: item })}
              className={"rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md " + (status === item ? "border-blue-400 ring-4 ring-blue-500/10" : "border-slate-200")}
            >
              <p className="text-[9px] font-black uppercase tracking-[.16em] text-slate-400">{REGISTRATION_STATUS_LABELS[item]}</p>
              <p className="mt-2 text-2xl font-black">{counts[item] || 0}</p>
            </Link>
          ))}
        </section>

        <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <form className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center" method="get">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
              <Search size={16} className="shrink-0 text-slate-400" />
              <input name="q" defaultValue={q} placeholder="Search name, form no, registration no, mobile or course" className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                <SlidersHorizontal size={15} className="text-slate-400" />
                <select name="status" defaultValue={status} className="bg-transparent text-sm font-bold text-slate-700 outline-none">
                  <option value="">All statuses</option>
                  {REGISTRATION_STATUSES.map((item) => (
                    <option key={item} value={item}>{REGISTRATION_STATUS_LABELS[item]}</option>
                  ))}
                </select>
              </div>
              <button className="rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white hover:bg-slate-800">Filter</button>
              {(q || status) && <Link href="/dashboard/admin/admissions/registrations" className="rounded-xl px-3 py-2.5 text-xs font-black text-slate-500 hover:bg-slate-50">Clear</Link>}
            </div>
          </form>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-4">Form / applicant</th>
                  <th>Course</th>
                  <th>Contact</th>
                  <th>Qualifications</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {registrations.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="font-black text-slate-900">{item.applicantName}</div>
                      <div className="mt-0.5 font-mono text-[10px] font-bold text-slate-400">{item.formNo}{item.registrationNo ? " / " + item.registrationNo : ""}</div>
                    </td>
                    <td>
                      <div className="font-bold text-slate-700">{item.courseCode || "Not selected"}</div>
                      <div className="text-xs text-slate-400">{item.courseName || "Course pending"}</div>
                    </td>
                    <td className="text-xs text-slate-600">{item.mobileNumber || "No mobile"}</td>
                    <td className="text-xs text-slate-600">{item._count.qualifications} record(s)</td>
                    <td>
                      <span className={"inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black " + (REGISTRATION_STATUS_TONES[item.status] || "border-slate-200 bg-slate-100 text-slate-600")}>
                        {REGISTRATION_STATUS_LABELS[item.status] || item.status}
                      </span>
                    </td>
                    <td className="text-xs text-slate-500">{formatDate(item.submittedAt || item.createdAt)}</td>
                    <td className="pr-5 text-right">
                      <Link href={"/dashboard/admin/admissions/registrations/" + item.id} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-black text-slate-700 hover:border-blue-200 hover:text-blue-700">
                        Review <ArrowRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
                {!registrations.length && (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center">
                      <ClipboardList size={28} className="mx-auto text-slate-300" />
                      <p className="mt-3 text-sm font-black">No registrations found</p>
                      <p className="mt-1 text-xs text-slate-500">{q || status ? "Try a different search or status filter." : "Create the first offline student registration."}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-slate-100 md:hidden">
            {registrations.map((item) => (
              <Link key={item.id} href={"/dashboard/admin/admissions/registrations/" + item.id} className="block p-4 hover:bg-slate-50">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black">{item.applicantName}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-slate-400">{item.formNo}</p>
                  </div>
                  <span className={"shrink-0 rounded-full border px-2 py-1 text-[9px] font-black " + (REGISTRATION_STATUS_TONES[item.status] || "border-slate-200 bg-slate-100 text-slate-600")}>
                    {REGISTRATION_STATUS_LABELS[item.status] || item.status}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                  <span>Course <b className="text-slate-700">{item.courseCode || "Pending"}</b></span>
                  <span>Mobile <b className="text-slate-700">{item.mobileNumber || "N/A"}</b></span>
                  <span>Quals <b className="text-slate-700">{item._count.qualifications}</b></span>
                  <span>Date <b className="text-slate-700">{formatDate(item.createdAt)}</b></span>
                </div>
              </Link>
            ))}
            {!registrations.length && <div className="p-10 text-center text-sm text-slate-500">No registrations found.</div>}
          </div>

          <div className="flex flex-col gap-2 border-t border-slate-100 p-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>{total} registration{total === 1 ? "" : "s"} matched. Page {page} of {pages}.</span>
            <div className="flex items-center gap-2">
              {page > 1 && <Link href={"/dashboard/admin/admissions/registrations" + queryString({ q, status, page: page - 1 })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-black text-slate-700 hover:bg-slate-50">Previous</Link>}
              {page < pages && <Link href={"/dashboard/admin/admissions/registrations" + queryString({ q, status, page: page + 1 })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-black text-slate-700 hover:bg-slate-50">Next</Link>}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
