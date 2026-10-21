import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { db } from "@/lib/db";
export default async function SettingsPage(){
 const user=await getCurrentUser(); if(!user)redirect("/login"); if(!hasPermission(user,"roles.manage"))redirect("/dashboard");
 const settings=await db.systemSetting.findMany({orderBy:{key:"asc"}});
 return <main className="min-h-screen px-6 py-8 lg:px-10"><div className="mx-auto max-w-5xl"><Link href="/dashboard/admin" className="text-sm text-cyan-300">← Control Center</Link><h1 className="mt-3 text-3xl font-black">System Settings</h1><div className="glass mt-8 rounded-2xl p-6"><p className="text-muted text-sm leading-6">The configuration store is ready. Protected forms for institution profile, registration rules, payments, notifications and online learning will be added as the control plane expands.</p><div className="mt-6 space-y-3">{settings.length?settings.map(s=><div key={s.key} className="rounded-xl border border-white/10 p-4"><b>{s.key}</b><pre className="text-muted mt-2 text-xs">{JSON.stringify(s.value,null,2)}</pre></div>):<p className="text-muted text-sm">No settings configured yet.</p>}</div></div></div></main>;
}