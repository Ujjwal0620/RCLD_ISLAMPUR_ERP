import { db } from "@/lib/db";

export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://rcldislampur.in";
  const staticRoutes = [
    ["", 1],
    ["/courses", .95],
    ["/about", .75],
    ["/learning", .8],
    ["/faq", .7],
    ["/contact", .7],
    ["/student/login", .5],
  ];
  let courses = [];
  try {
    courses = await db.course.findMany({ where:{ active:true, onlinePublished:true }, select:{ code:true, updatedAt:true } });
  } catch {}
  return [
    ...staticRoutes.map(([path, priority]) => ({ url: base + path, lastModified:new Date(), changeFrequency:"weekly", priority })),
    ...courses.map(c => ({ url: base + "/courses/" + c.code.toLowerCase(), lastModified:c.updatedAt, changeFrequency:"weekly", priority:.85 })),
  ];
}
