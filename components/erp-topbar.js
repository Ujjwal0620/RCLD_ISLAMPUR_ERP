"use client";

import Link from "next/link";
import { Bell, CalendarDays, Command, HelpCircle, Search } from "lucide-react";
import { useEffect, useState } from "react";

export default function ErpTopbar({ user }) {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}));
    update(); const timer=setInterval(update,30000); return ()=>clearInterval(timer);
  },[]);
  const role=user?.userRoles?.map(x=>x.role?.name).filter(Boolean).join(", ")||"ERP User";
  return <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
    <div className="flex h-[68px] items-center gap-3 px-4 sm:px-6 lg:px-8">
      <div className="hidden min-w-0 flex-1 md:block">
        <div className="flex max-w-xl items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-400">
          <Search size={17}/><span>Search students, batches, employees...</span><span className="ml-auto rounded-md border bg-white px-2 py-1 text-[10px] font-black"><Command size={11} className="inline"/> K</span>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Link href="/dashboard/admin/batches/timetable" title="Timetable" className="hidden rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 hover:bg-slate-50 sm:block"><CalendarDays size={17}/></Link>
        <Link href="/dashboard" title="Help starts from the guided dashboard" className="hidden rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 hover:bg-slate-50 sm:block"><HelpCircle size={17}/></Link>
        <span className="hidden rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500 sm:block">{time}</span>
        <button type="button" aria-label="Notifications" className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500"><Bell size={17}/><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-blue-600"/></button>
        <div className="hidden items-center gap-2 border-l border-slate-200 pl-3 sm:flex">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-700 text-xs font-black text-white">{(user?.name||"A")[0].toUpperCase()}</div>
          <div className="max-w-[150px]"><p className="truncate text-xs font-black text-slate-900">{user?.name}</p><p className="truncate text-[10px] text-slate-400">{role}</p></div>
        </div>
      </div>
    </div>
  </header>;
}
