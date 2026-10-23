"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, RefreshCw, X } from "lucide-react";

export default function RegistrationUpload({ kind, label, hint, value, onChange, circular = false }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function upload(file) {
    if (!file) return;
    setError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a JPG, PNG or WEBP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be 5 MB or smaller.");
      return;
    }
    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("kind", kind);
      const response = await fetch("/api/admin/registrations/upload", { method: "POST", body });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to upload the image.");
      onChange(data.url);
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <span className="mb-1.5 block text-[11px] font-black uppercase tracking-wide text-slate-500">{label}</span>
      <div className={`flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-3 ${circular ? "sm:flex-col sm:items-start" : ""}`}>
        <div className={`grid shrink-0 place-items-center overflow-hidden border border-slate-200 bg-white ${circular ? "h-24 w-20 rounded-xl" : "h-14 w-14 rounded-xl"}`}>
          {value ? (
            <img src={value} alt={label} className="h-full w-full object-cover" />
          ) : (
            <ImagePlus size={20} className="text-slate-300" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 shadow-sm hover:border-blue-200 hover:text-blue-700 disabled:opacity-50"
            >
              {busy ? <Loader2 size={14} className="animate-spin" /> : value ? <RefreshCw size={14} /> : <ImagePlus size={14} />}
              {busy ? "Uploading..." : value ? "Replace" : "Upload"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-xs font-black text-rose-600 hover:bg-rose-50"
              >
                <X size={14} /> Remove
              </button>
            )}
          </div>
          <p className="mt-1.5 text-[11px] leading-4 text-slate-500">{hint || "JPG, PNG or WEBP. Maximum 5 MB."}</p>
          {error && <p className="mt-1 text-[11px] font-bold text-rose-600">{error}</p>}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => upload(event.target.files?.[0])}
      />
    </div>
  );
}
