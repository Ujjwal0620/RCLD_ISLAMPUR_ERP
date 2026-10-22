import {redirect} from "next/navigation";
import {Award,CheckCircle2,ShieldCheck,Users} from "lucide-react";
import {getCurrentUser} from "@/lib/auth";
import {hasPermission} from "@/lib/permissions";
import {db} from "@/lib/db";
import CertificateStudio from "./certificate-studio";

export default async function CertificatesPage(){
 const user=await getCurrentUser();if(!user)redirect("/login");if(!hasPermission(user,"certificates.issue"))redirect("/dashboard");
 const [attempts,certificates]=await Promise.all([
  db.examAttempt.findMany({where:{passed:true},orderBy:{gradedAt:"desc"},include:{student:{include:{feeLedgers:{include:{batchEnrollment:{include:{batch:true}}}},certificates:true}},exam:{include:{course:true,batch:{include:{course:true}}}}}}),
  db.certificate.findMany({orderBy:{issuedAt:"desc"},take:100,include:{student:true,course:true,batch:true}})
 ]);
 const map=new Map();
 for(const a of attempts){const course=a.exam.course||a.exam.batch?.course;if(!course)continue;const key=a.studentId+"-"+course.id;if(map.has(key)||a.student.certificates.some(x=>x.courseId===course.id))continue;const ledgers=a.student.feeLedgers.filter(l=>l.batchEnrollment.batch.courseId===course.id);if(ledgers.some(l=>Number(l.balanceAmount)>0))continue;map.set(key,{studentId:a.studentId,studentName:a.student.name,registrationNo:a.student.registrationNo,courseId:course.id,courseCode:course.code,batchId:a.exam.batchId||null,batchCode:a.exam.batch?.code||null});}
 const candidates=[...map.values()];
 const issued=certificates.map(c=>({id:c.id,studentName:c.student.name,courseCode:c.course.code,certificateNo:c.certificateNo,verificationCode:c.verificationCode,revokedAt:c.revokedAt?.toISOString()||null}));
 return <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10"><div className="mx-auto max-w-[1450px]"><section className="erp-hero-dark"><div><span className="erp-kicker">Credential Operations</span><h1 className="mt-3 text-3xl font-black sm:text-5xl">Certificates & Verification</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Issue trusted completion credentials only after academic and fee eligibility checks, then verify them publicly.</p></div><Award className="hidden text-cyan-300/80 sm:block" size={64}/></section><div className="mt-5 grid gap-3 sm:grid-cols-3">{[[candidates.length,"Eligible now",CheckCircle2],[issued.length,"Issued",Award],[issued.filter(x=>!x.revokedAt).length,"Active credentials",ShieldCheck]].map(([v,l,I])=><div key={l} className="erp-stat"><I size={18}/><div><p className="text-2xl font-black">{v}</p><p className="text-xs font-bold text-slate-500">{l}</p></div></div>)}</div><div className="mt-5"><CertificateStudio candidates={candidates} certificates={issued} canIssue={hasPermission(user,"certificates.issue")}/></div></div></main>;
}
