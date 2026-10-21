import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Clock3, CreditCard, XCircle } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentStudent } from "@/lib/student-auth";
export const dynamic = "force-dynamic";

const paymentStyle={PAID:"bg-emerald-50 text-emerald-700",PENDING:"bg-amber-50 text-amber-700",FAILED:"bg-red-50 text-red-700",REFUNDED:"bg-slate-100 text-slate-700"};
const statusIcon={PAID:CheckCircle2,PENDING:Clock3,FAILED:XCircle,REFUNDED:CreditCard};

export default async function StudentEnrollmentsPage(){
  const student=await getCurrentStudent(); if(!student) redirect("/student/login?next=/student/enrollments");
  const enrollments=await db.onlineEnrollment.findMany({where:{studentId:student.id},include:{course:true},orderBy:{enrolledAt:"desc"}});
  return <main className="site-shell min-h-screen"><section className="mx-auto max-w-5xl px-6 py-12">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-black uppercase tracking-[.2em] text-blue-600">Enrollment center</p><h1 className="mt-2 text-4xl font-black">Courses & payments</h1><p className="mt-2 text-slate-600">Track pending, paid, failed and refunded online enrollments.</p></div><Link href="/student/dashboard" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-black">Back to dashboard</Link></div>
    <div className="mt-8 grid gap-4">{enrollments.length?enrollments.map(e=>{const Icon=statusIcon[e.paymentStatus]||CreditCard;return <article key={e.id} className="glass rounded-3xl p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black text-blue-600">{e.course.code}</p><h2 className="mt-1 text-xl font-black">{e.course.name}</h2><p className="mt-2 text-sm text-slate-500">Enrollment status: <b>{e.status}</b></p></div><span className={"flex items-center gap-2 rounded-full px-3 py-2 text-xs font-black "+(paymentStyle[e.paymentStatus]||paymentStyle.PENDING)}><Icon size={15}/>{e.paymentStatus}</span></div><div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5"><p className="text-sm font-bold text-slate-600">Amount: {e.paidAmount?("₹"+e.paidAmount.toString()):"Not set"}</p>{e.status==="ACTIVE"&&e.paymentStatus==="PAID"?<Link href={"/student/courses/"+e.course.code.toLowerCase()} className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white">Open course</Link>:<Link href={"/courses/"+e.course.code.toLowerCase()} className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-black text-white">{e.paymentStatus==="FAILED"?"Retry from course page":"View enrollment"}</Link>}</div></article>}):<div className="glass rounded-3xl p-8"><h2 className="text-xl font-black">No enrollments yet</h2><p className="mt-2 text-slate-500">Choose an online course to create your first enrollment.</p><Link href="/courses" className="mt-5 inline-block rounded-xl bg-slate-950 px-5 py-3 font-black text-white">Explore courses</Link></div>}</div>
  </section></main>;
}
