import Link from "next/link";
import { ArrowUpRight, BookOpen, ShieldCheck } from "lucide-react";

export default function PublicFooter() {
 return <footer className="border-t border-slate-200/70 bg-white/60">
  <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
   <div><p className="text-xl font-black">RCLD <span className="text-blue-600">Islampur</span></p><p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">Practical computer education with a modern online learning experience for students.</p><div className="mt-5 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700"><ShieldCheck size={15}/> Secure learning platform</div></div>
   <div><p className="font-black">Explore</p><div className="mt-4 space-y-3 text-sm text-slate-600"><Link className="block hover:text-blue-600" href="/courses">All Courses</Link><Link className="block hover:text-blue-600" href="/learning">How Learning Works</Link><Link className="block hover:text-blue-600" href="/about">About RCLD</Link></div></div>
   <div><p className="font-black">Support</p><div className="mt-4 space-y-3 text-sm text-slate-600"><Link className="block hover:text-blue-600" href="/faq">Frequently Asked Questions</Link><Link className="block hover:text-blue-600" href="/contact">Contact</Link><Link className="block hover:text-blue-600" href="/student/login">Student Login</Link></div></div>
   <div className="glass rounded-2xl p-5"><p className="font-black">Existing RCLD users</p><p className="mt-2 text-sm leading-6 text-slate-500">Offline students, employees and Superadmins can use the ERP portal.</p><Link href="/login" className="mt-4 inline-flex items-center gap-2 text-sm font-black text-blue-600">Open ERP Login <ArrowUpRight size={16}/></Link></div>
  </div>
  <div className="border-t border-slate-200/70"><div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between"><span>© {new Date().getFullYear()} RCLD Islampur. All rights reserved.</span><span className="inline-flex items-center gap-1"><BookOpen size={13}/> Online education & skill development</span></div></div>
 </footer>;
}
