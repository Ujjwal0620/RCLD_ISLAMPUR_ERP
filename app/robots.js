export default function robots() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://rcldislampur.in";
  return {
    rules: [{ userAgent:"*", allow:"/", disallow:["/dashboard/","/api/"] }],
    sitemap: base + "/sitemap.xml",
    host: base,
  };
}
