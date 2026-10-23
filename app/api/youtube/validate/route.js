import { NextResponse } from "next/server";
import { z } from "zod";
import { getYouTubeVideoId, getYouTubeEmbedUrl } from "@/lib/youtube";

const schema = z.object({ url: z.string().min(1) });

export async function POST(request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { valid: false, error: "YouTube URL is required." },
      { status: 400 },
    );
  const id = getYouTubeVideoId(parsed.data.url);
  if (!id)
    return NextResponse.json(
      {
        valid: false,
        error: "Enter a valid YouTube video URL or 11-character video ID.",
      },
      { status: 400 },
    );
  return NextResponse.json({
    valid: true,
    videoId: id,
    embedUrl: getYouTubeEmbedUrl(parsed.data.url),
  });
}
