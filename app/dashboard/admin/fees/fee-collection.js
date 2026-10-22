"use client";
import { useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, CreditCard, Printer, ReceiptText } from "lucide-react";

export default function FeeCollection({ ledger, canManage }) {
  const [open,setOpen]=useState(false),[installmentId,setInstallmentId]=useState(""),[amount,setAmount]=useState(""),[method,setMethod]=useState("CASH"),[reference,setReference]=useState(""),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
  const selected=useMemo(()=>ledger.installments.find(i=>i.id===installmentId),[ledger.installments,installmentId]);
  const maxAmount=selected?.balance ?? ledger.balanceAmount;

  async function submit(e){
    e.preventDefault();
    const value=Number(amount);
    if(!value||value<=0||value>maxAmount){setMessage("Enter an amount within the selected outstanding balance.");return;}
    setBusy(true);setMessage("");
    try{
      const response=await fetch("/api/admin/fees/payment",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({feeLedgerId:ledger.id,amount:value,method,reference,installmentId})});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||"Unable to record payment.");
      setMessage("Payment recorded successfully.");
      setTimeout(()=>window.location.reload(),500);
    }catch(error){setMessage(error.message)}finally{setBusy(false)}
  }

  return <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <button type="button" onClick={()=>setOpen(v=>!v)} className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-slate-50 sm:p-5">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600"><ReceiptText size={18}/></div>
      <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate text-sm font-black">{ledger.student.name}</h3><span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-black">{ledger.status}</span></div><p className="mt-1 text-xs text-slate-500">{ledger.student.registrationNo || "No registration"} · {ledger.batch.code} · {ledger.batch.name}</p></div>
      <div className="hidden text-right sm:block"><div className="text-[10px] font-bold text-slate-400">OUTSTANDING</div><div className="text-lg font-black text-rose-600">₹{ledger.balanceAmount.toLocaleString("en-IN")}</div></div>
      <ChevronDown size={18} className={"shrink-0 text-slate-400 transition "+(open?"rotate-180":"")}/>
    </button>
    {open&&<div className="border-t border-slate-100 p-4 sm:p-5">
      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-xl bg-slate-50 p-4"><div className="grid grid-cols-3 gap-3"><Stat label="Billed" value={ledger.finalAmount}/><Stat label="Paid" value={ledger.paidAmount}/><Stat label="Due" value={ledger.balanceAmount}/></div><div className="mt-4 space-y-2">{ledger.installments.map(i=><div key={i.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs"><span className="font-bold">Installment {i.installmentNo}{i.dueDate?" · "+new Date(i.dueDate).toLocaleDateString("en-IN"):""}</span><span className={i.balance?"font-black text-rose-600":"font-black text-emerald-600"}>₹{i.balance.toLocaleString("en-IN")} due</span></div>)}</div></div>
        <div className="rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-2"><CreditCard size={16} className="text-blue-600"/><h4 className="text-sm font-black">Record collection</h4></div>
          {!canManage?<p className="mt-4 text-xs text-slate-500">You have view-only access to fee records.</p>:ledger.balanceAmount<=0?<div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700"><CheckCircle2 className="mb-2" size={18}/>Fee fully paid.</div>:<form onSubmit={submit} className="mt-4 space-y-3">
            <select value={installmentId} onChange={e=>{setInstallmentId(e.target.value);setAmount("")}} className="erp-input w-full"><option value="">Overall balance</option>{ledger.installments.filter(i=>i.balance>0).map(i=><option key={i.id} value={i.id}>Installment {i.installmentNo} — ₹{i.balance.toLocaleString("en-IN")} due</option>)}</select>
            <input className="erp-input w-full" type="number" min="1" max={maxAmount} step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} placeholder={"Amount (max ₹"+maxAmount.toLocaleString("en-IN")+")"}/>
            <div className="grid grid-cols-2 gap-3"><select value={method} onChange={e=>setMethod(e.target.value)} className="erp-input"><option value="CASH">Cash</option><option value="UPI">UPI</option><option value="BANK_TRANSFER">Bank transfer</option><option value="CARD">Card</option><option value="OTHER">Other</option></select><input className="erp-input" value={reference} onChange={e=>setReference(e.target.value)} placeholder="Reference / receipt note"/></div>
            <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white disabled:opacity-50">{busy?"Saving...":"Record payment"}</button>
            {message&&<p className={"text-xs font-bold "+(message.includes("successfully")?"text-emerald-600":"text-rose-600")}>{message}</p>}
          </form>}
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-slate-200 p-4"><div className="flex items-center justify-between gap-3"><div><h4 className="text-sm font-black">Recent payments</h4><p className="text-xs text-slate-500">Confirmed collections for this ledger.</p></div>{ledger.payments.length>0&&<button type="button" onClick={()=>window.open("/api/admin/fees/receipt/"+ledger.id,"_blank","noopener,noreferrer")} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-black hover:bg-slate-50"><Printer size={14}/> Print receipt</button>}</div><div className="mt-3 divide-y divide-slate-100">{ledger.payments.length?ledger.payments.map(p=><div key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-xs"><span className="font-bold">{p.method}{p.reference?" · "+p.reference:""}</span><span className="font-black">₹{p.amount.toLocaleString("en-IN")} · {p.paidAt?new Date(p.paidAt).toLocaleString("en-IN"):"—"}</span></div>):<p className="text-xs text-slate-400">No payments recorded yet.</p>}</div></div>
    </div>}
  </article>;
}
function Stat({label,value}){return <div><div className="text-[9px] font-black uppercase tracking-wider text-slate-400">{label}</div><div className="mt-1 text-sm font-black">₹{value.toLocaleString("en-IN")}</div></div>}
