import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export const runtime = "nodejs";

const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_KINDS = new Set(["photo", "signature"]);

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user, "students.manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const kind = String(formData.get("kind") || "photo");

    if (!ALLOWED_KINDS.has(kind)) {
      return NextResponse.json({ error: "Invalid upload type." }, { status: 400 });
    }

    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json({ error: "No file was provided." }, { status: 400 });
    }

    if (!ALLOWED_TYPES[file.type]) {
      return NextResponse.json({ error: "Only JPG, PNG or WEBP images are allowed." }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Image must be 5 MB or smaller." }, { status: 400 });
    }

    const year = String(new Date().getFullYear());
    const fileName = `${kind}-${randomUUID()}.${ALLOWED_TYPES[file.type]}`;
    const relativeDir = path.join("uploads", "registrations", year);
    const absoluteDir = path.join(process.cwd(), "public", relativeDir);
    await mkdir(absoluteDir, { recursive: true });

    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(absoluteDir, fileName), bytes);

    return NextResponse.json({ url: `/${relativeDir.replaceAll("\\", "/")}/${fileName}` }, { status: 201 });
  } catch (error) {
    console.error("registration upload error", error);
    return NextResponse.json({ error: "Unable to store the uploaded image." }, { status: 500 });
  }
}
