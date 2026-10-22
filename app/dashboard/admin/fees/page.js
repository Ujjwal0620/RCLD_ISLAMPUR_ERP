import Link from "next/link";
import { redirect } from "next/navigation";
import { ReceiptText, WalletCards, Search } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { db } from "@/lib/db";
import FeeCollection from "./fee-collection";

export default async function FeesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!hasPermission(user, "fees.view")) redirect("/dashboard");

  const ledgers = await db.feeLedger.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      student: { select: { name: true, registrationNo: true, phone: true } },
      batchEnrollment: { include: { batch: { select: { code: true, name: true } } } },
      installments: { orderBy: { installmentNo: "asc" } },
      payments: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  const total = ledgers.reduce((n, l) => n + Number(l.finalAmount), 0);
  const paid = ledgers.reduce((n, l) => n + Number(l.paidAmount), 0);
  const balance = ledgers.reduce((n, l) => n + Number(l.balanceAmount), 0);

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1550px]">
        <div className="flex items-center justify-between gap-4">
          <Link href="/dashboard" className="text-xs font-black text-blue-700">← Command Center</Link>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500">Finance workspace</span>
        </div>
        <section className="mt-4 overflow-hidden rounded-[30px] bg-slate-950 p-7 text-white shadow-[0_24px_70px_rgba(15,23,42,.16)] sm:p-9">
          <div className="flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[.2em] text-blue-200">Finance Operations</span>
              <h1 className="mt-4 text-3xl font-black tracking-[-.04em] sm:text-5xl">Fee Collection</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Collect offline fees, track installment balances and generate printable receipts from one workspace.</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Metric label="Billed" value={money(total)} />
              <Metric label="Collected" value={money(paid)} />
              <Metric label="Outstanding" value={money(balance)} />
            </div>
          </div>
        </section>
        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600"><Search size={17}/></div><div><h2 className="text-sm font-black">Collection register</h2><p className="text-xs text-slate-500">{ledgers.length} fee ledgers loaded</p></div></div>
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500"><WalletCards size={14}/> Manual collections are recorded as confirmed payments</div>
          </div>
        </section>
        <div className="mt-3 space-y-3">
          {ledgers.map((ledger) => <FeeCollection key={ledger.id} ledger={{
            id: ledger.id, student: ledger.student, batch: ledger.batchEnrollment.batch,
            finalAmount: Number(ledger.finalAmount), paidAmount: Number(ledger.paidAmount), balanceAmount: Number(ledger.balanceAmount), status: ledger.status,
            installments: ledger.installments.map((i) => ({id:i.id, installmentNo:i.installmentNo, amount:Number(i.amount), paidAmount:Number(i.paidAmount), balance:Math.max(0,Number(i.amount)-Number(i.paidAmount)), status:i.status, dueDate:i.dueDate?.toISOString() || null})),
            payments: ledger.payments.map((p) => ({id:p.id, amount:Number(p.amount), method:p.method, reference:p.reference, paidAt:p.paidAt?.toISOString() || null}))
          }} canManage={hasPermission(user, "fees.manage")} />)}
          {!ledgers.length && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><ReceiptText className="mx-auto text-slate-300"/><p className="mt-3 text-sm font-black">No fee ledgers yet</p><p className="mt-1 text-xs text-slate-500">Create an admission to generate the first fee ledger.</p></div>}
        </div>
      </div>
    </main>
  );
}
function Metric({label,value}) { return <div className="rounded-xl border border-white/10 bg-white/[.06] px-3 py-3 text-center"><div className="text-sm font-black">{value}</div><div className="mt-0.5 text-[9px] font-black uppercase tracking-wider text-slate-400">{label}</div></div>; }
function money(v) { return "₹" + v.toLocaleString("en-IN", { maximumFractionDigits: 2 }); }
