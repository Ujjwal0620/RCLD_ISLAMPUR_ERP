import Link from "next/link";
import { ArrowRight, Clock3, Sparkles } from "lucide-react";
import {
  calculateCoursePricing,
  discountBadgeLabel,
  formatCourseMoneyCompact,
} from "@/lib/course-pricing";

export default function PublicCourseCard({ course }) {
  const pricing = course.pricing || calculateCoursePricing(course);
  const badge = discountBadgeLabel(pricing);
  const mode = course.deliveryMode === "ONLINE" ? "Online" : course.deliveryMode === "HYBRID" ? "Hybrid" : "Classroom";

  return (
    <Link href={"/courses/" + course.code.toLowerCase()} className="public-card group flex flex-col">
      {course.imageUrl ? (
        <div
          className="mb-5 h-40 rounded-2xl bg-cover bg-center"
          style={{ backgroundImage: `linear-gradient(0deg,rgba(2,6,23,.42),rgba(2,6,23,.05)),url("${course.imageUrl}")` }}
        />
      ) : (
        <div className="mb-5 grid h-24 place-items-center rounded-2xl border border-white/[.06] bg-white/[.025]">
          <span className="font-mono text-2xl font-black tracking-[.2em] text-white/15">{course.code}</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <span className="public-code">{course.code}</span>
        <div className="flex items-center gap-2">
          {badge && <span className="rounded-full bg-rose-400/15 px-2 py-1 text-[9px] font-black tracking-wide text-rose-300">{badge}</span>}
          {course.featured && <Sparkles size={14} className="text-amber-300" />}
        </div>
      </div>

      <h3 className="mt-5 text-xl font-black leading-7 text-white">{course.name}</h3>
      <p className="mt-3 min-h-12 flex-1 text-sm leading-6 text-slate-400">
        {course.shortDescription || "Practical, structured computer skill development."}
      </p>

      <div className="mt-5 flex items-end justify-between gap-3 border-t border-white/10 pt-4">
        <div>
          <div className="text-[9px] font-black uppercase tracking-[.14em] text-slate-500">Course fee</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-lg font-black text-white">{formatCourseMoneyCompact(pricing.finalFee)}</span>
            {pricing.hasDiscount && <span className="text-xs font-bold text-slate-500 line-through">{formatCourseMoneyCompact(pricing.baseFee)}</span>}
          </div>
        </div>
        <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-slate-400 transition group-hover:border-cyan-300/30 group-hover:text-cyan-300">
          <ArrowRight size={16} />
        </span>
      </div>

      <div className="mt-3 flex items-center gap-3 text-[10px] font-black uppercase tracking-[.12em] text-slate-500">
        <span className="inline-flex items-center gap-1"><Clock3 size={11} /> {course.duration || "Flexible"}</span>
        <span>•</span>
        <span>{mode}</span>
      </div>
    </Link>
  );
}
