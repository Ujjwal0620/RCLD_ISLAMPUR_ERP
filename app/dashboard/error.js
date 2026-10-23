"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function DashboardError({ error, reset }) {
  useEffect(() => {
    console.error("ERP dashboard error", error);
  }, [error]);

  const digest = error?.digest || "";

  return (
    <main className="grid min-h-[70vh] place-items-center px-5">
      <section className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-xl">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-600 text-2xl font-black">!</div>
        <h1 className="mt-5 text-2xl font-black">This workspace could not be loaded</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          The ERP encountered a server-side error while loading this workspace. Your records are not modified by this error.
        </p>
        {digest && (
          <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2 font-mono text-[10px] text-slate-500">
            Error reference: {digest}
          </p>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => reset()} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-blue-700">
            Try again
          </button>
          <Link href="/dashboard" className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50">
            Command Center
          </Link>
          <Link href="/login" className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50">
            Sign in again
          </Link>
        </div>
      </section>
    </main>
  );
}
