import { redirect } from "next/navigation";
import { ImagePlus, MonitorSmartphone } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { db } from "@/lib/db";
import HomepageStudio from "./homepage-studio";

export default async function HomepageAdminPage(){
 const user=await getCurrentUser(); if(!user)redirect("/login"); if(!hasPermission(user,"cms.edit"))redirect("/dashboard");
 let slides=[]; try{slides=await db.homeSlide.findMany({orderBy:[{sortOrder:"asc"},{createdAt:"asc"}]})}catch{}
 return <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10"><div className="mx-auto max-w-[1500px]">
  <section className="erp-hero-dark"><div><span className="erp-kicker"><ImagePlus size={13}/> Website Content</span><h1 className="mt-4 text-3xl font-black sm:text-5xl">Homepage Control</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Control the public homepage banners, images, headings, buttons, ordering and visibility from the ERP.</p></div><MonitorSmartphone className="hidden text-cyan-300 sm:block" size={52}/></section>
  <div className="mt-6"><HomepageStudio initialSlides={JSON.parse(JSON.stringify(slides))}/></div>
 </div></main>
}