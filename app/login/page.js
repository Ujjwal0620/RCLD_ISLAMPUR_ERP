"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error || "Unable to sign in.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center px-6">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl glass md:grid-cols-2">
        <div className="hidden p-10 md:block">
          <p className="text-sm font-semibold uppercase tracking-[.25em] text-cyan-300">RCLD Islampur</p>
          <h1 className="mt-5 text-4xl font-black">Secure ERP access.</h1>
          <p className="text-muted mt-4 leading-7">Use your authorized account to access the dashboard and modules available to your roles.</p>
        </div>
        <form onSubmit={submit} className="p-8 sm:p-10">
          <Link href="/" className="text-sm text-cyan-300">← Back to home</Link>
          <h2 className="mt-8 text-2xl font-bold">Sign in</h2>
          <p className="text-muted mt-2 text-sm">RCLD Islampur ERP</p>
          <label className="mt-7 block text-sm font-medium">Email</label>
          <input required type="email" value={form.email} onChange={(e) => setForm({...form, email:e.target.value})} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300/50" />
          <label className="mt-5 block text-sm font-medium">Password</label>
          <input required type="password" value={form.password} onChange={(e) => setForm({...form, password:e.target.value})} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300/50" />
          {error && <p className="mt-4 rounded-xl bg-red-400/10 p-3 text-sm text-red-300">{error}</p>}
          <button disabled={loading} className="mt-6 w-full rounded-xl bg-cyan-300 px-4 py-3 font-bold text-slate-950 disabled:opacity-50">
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
