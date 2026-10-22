import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const slides = await db.homeSlide.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      take: 3,
      select: { id:true, eyebrow:true, title:true, accent:true, description:true, imageUrl:true, primaryLabel:true, primaryHref:true, secondaryLabel:true, secondaryHref:true, statLabel:true },
    });
    return NextResponse.json({ slides });
  } catch {
    return NextResponse.json({ slides: [] });
  }
}
