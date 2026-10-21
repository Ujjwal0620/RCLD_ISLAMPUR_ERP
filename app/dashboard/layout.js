import {redirect} from "next/navigation";
import {getCurrentUser} from "@/lib/auth";
import ErpSidebar from "@/components/erp-sidebar";
import ErpTopbar from "@/components/erp-topbar";
export const dynamic="force-dynamic";
export default async function DashboardLayout({children}){const user=await getCurrentUser();if(!user||user.status!=="ACTIVE")redirect("/login");return <div className="min-h-screen bg-[#f7f9fc] text-slate-950"><ErpSidebar user={user}/><div className="min-h-screen lg:pl-[292px]"><ErpTopbar user={user}/>{children}</div></div>;}