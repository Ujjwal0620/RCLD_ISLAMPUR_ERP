"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";

export default function DeleteAction({
  endpoint,
  label = "Delete",
  confirmMessage = "Delete this record? This cannot be undone.",
  compact = false,
  className = "",
  onDeleted,
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!window.confirm(confirmMessage)) return;
    setBusy(true);
    try {
      const response = await fetch(endpoint, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to delete this record.");
      if (onDeleted) onDeleted();
      router.refresh();
    } catch (error) {
      window.alert(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={remove}
      disabled={busy}
      title={label}
      aria-label={label}
      className={
        (compact
          ? "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rose-200 bg-white text-rose-600 transition hover:bg-rose-50 disabled:opacity-50 "
          : "inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-black text-rose-600 transition hover:bg-rose-50 disabled:opacity-50 ") +
        className
      }
    >
      {busy ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
      {!compact && <span>{busy ? "Deleting..." : label}</span>}
    </button>
  );
}
