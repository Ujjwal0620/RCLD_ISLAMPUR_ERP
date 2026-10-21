import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentStudent } from "@/lib/student-auth";
export const dynamic="force-dynamic";
export default async function PaymentReturn(){
 const student=await getCurrentStudent(); if(!student) redirect("/student/login");
 return <main className="site-shell min-h-screen"><section className="mx-auto max-w-2xl px-6 py-20"><div className="glass-strong rounded-[2rem] p-8 text-center"><p className="text-sm font-black uppercase tracking-[.2em] text-blue-600">Payment processing</p><h1 className="mt-3 text-3xl font-black">We are verifying your payment</h1><p className="mt-4 text-slate-600">Course access is activated only after RCLD receives and verifies payment confirmation from PhonePe. If the status is pending, check again shortly.</p><div className="mt-7"><Link href="/student/enrollments" className="rounded-xl bg-slate-950 px-5 py-3 font-black text-white">Check payment status</Link></div></div></section></main>;
}
