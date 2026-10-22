import Link from "next/link";
import { redirect } from "next/navigation";
import { IndianRupee, ReceiptText } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { db } from "@/lib/db";

export default async function FeesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!hasPermission(user, "fees.view")) redirect("/dashboard");
  const ledgers = await db.feeLedger.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      student: { select: { name: true, registrationNo: true } },
      batchEnrollment: { include: { batch: { select: { code: true, name: true } } } },
      installments: { orderBy: { installmentNo: "asc" } },
    },
  });
  const total = ledgers.reduce((n, l) => n + Number(l.finalAmount), 0);
  const paid = ledgers.reduce((n, l) => n + Number(l.paidAmount), 0);
  const balance = ledgers.reduce((n, l) => n + Number(l.balanceAmount), 0);
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1500px]">
        <Link href="/dashboard" className="text-xs font-black text-blue-700">Back to Command Center</Link>
        <section className="mt-4 rounded-[30px] bg-slate-950 p-7 text-white sm:p-9">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div><span className="text-[10px] font-black uppercase tracking-[.2em] text-blue-200">Finance Operations</span><h1 className="mt-4 text-3xl font-black tracking-[-.04em] sm:text-5xl">Fee Ledger</h1><p className="mt-2 text-sm text-slate-300">Track course fees, discounts, installments and outstanding balances.</p></div>
            <div className="grid grid-cols-3 gap-2"><Metric label="Billed" value={money(total)} /><Metric label="Collected" value={money(paid)} /><Metric label="Due" value={money(balance)} /></div>
          </div>
        </section>
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-4">Student</th><th>Batch</th><th>Billed</th><th>Paid</th><th>Due</th><th>Status</th><th>Installments</th></tr></thead>
              <tbody className="divide-y divide-slate-100">{ledgers.map(l => <tr key={l.id}><td className="px-5 py-4"><b>{l.student.name}</b><div className="text-xs text-slate-400">{l.student.registrationNo}</div></td><td>{l.batchEnrollment.batch.code}</td><td>{money(Number(l.finalAmount))}</td><td className="font-bold text-emerald-700">{money(Number(l.paidAmount))}</td><td className="font-bold text-rose-600">{money(Number(l.balanceAmount))}</td><td><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black">{l.status}</span></td><td>{l.installments.length}</td></tr>)}</tbody>
            </table>
          </div>
          <div className="divide-y divide-slate-100 md:hidden">{ledgers.map(l => <div key={l.id} className="p-4"><div className="flex justify-between"><b>{l.student.name}</b><span className="text-[10px] font-black">{l.status}</span></div><p className="mt-1 text-xs text-slate-500">{l.batchEnrollment.batch.code} · {l.student.registrationNo}</p><div className="mt-3 grid grid-cols-3 gap-2 text-xs"><div>Billed<br /><b>{money(Number(l.finalAmount))}</b></div><div>Paid<br /><b className="text-emerald-700">{money(Number(l.paidAmount))}</b></div><div>Due<br /><b className="text-rose-600">{money(Number(l.balanceAmount))}</b></div></div></div>)}</div>
        </div>
      </div>
    </main>
  );
}
function Metric({ label, value }) { return <div className="rounded-xl border border-white/10 bg-white/[.06] px-3 py-3 text-center"><div className="text-sm font-black">{value}</div><div className="mt-0.5 text-[9px] font-black uppercase tracking-wider text-slate-400">{label}</div></div>; }
function money(v) { return "INR " + v.toLocaleString("en-IN", { maximumFractionDigits: 2 }); }
