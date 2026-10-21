export function getYouTubeVideoId(value) {
  if (!value) return null;
  const input=String(value).trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;
  try {
    const url=new URL(input);
    if (url.hostname==="youtu.be") return url.pathname.slice(1).split("/")[0] || null;
    if (url.hostname.endsWith("youtube.com")) {
      if (url.pathname==="/watch") return url.searchParams.get("v");
      if (url.pathname.startsWith("/embed/")) return url.pathname.split("/")[2] || null;
      if (url.pathname.startsWith("/shorts/")) return url.pathname.split("/")[2] || null;
      if (url.pathname.startsWith("/live/")) return url.pathname.split("/")[2] || null;
    }
  } catch {}
  return null;
}

export function getYouTubeEmbedUrl(value) {
  const id=getYouTubeVideoId(value);
  if (!id) return null;
  const origin=process.env.NEXT_PUBLIC_APP_URL || "https://rcldislampur.in";
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1&origin=${encodeURIComponent(origin)}`;
}
