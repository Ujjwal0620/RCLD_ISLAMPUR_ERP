"use client";

import { useState } from "react";
import { CheckCircle2, CreditCard, LoaderCircle, LockKeyhole } from "lucide-react";

export default function EnrollButton({ courseCode, onlineFee }) {
  const [state, setState] = useState("idle");
  const [message, setMessage] = useState("");

  async function enroll() {
    setState("loading");
    setMessage("");
    try {
      const response = await fetch("/api/student/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseCode }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        window.location.href = "/student/login?next=" + encodeURIComponent("/courses/" + courseCode.toLowerCase());
        return;
      }
      if (!response.ok) throw new Error(data.error || "Unable to start enrollment.");

      if (data.enrollment?.status === "ACTIVE" && data.enrollment?.paymentStatus === "PAID") {
        setState("active");
        setMessage("You are already enrolled and your payment is confirmed.");
        return;
      }

      if (!data.payment?.configured) {
        setState("pending");
        setMessage("Enrollment is saved as pending. Online payment will be enabled after the payment gateway is configured.");
        return;
      }

      const checkoutResponse = await fetch("/api/student/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentId: data.enrollment.id }),
      });
      const checkout = await checkoutResponse.json().catch(() => ({}));

      if (checkout.ok && checkout.alreadyPaid) {
        window.location.href = checkout.redirectUrl || "/student/dashboard";
        return;
      }
      if (checkout.ok && checkout.redirectUrl) {
        window.location.href = checkout.redirectUrl;
        return;
      }

      setState("pending");
      setMessage(checkout.error || "Your enrollment is pending. Secure payment checkout is not available yet.");
    } catch (error) {
      setState("error");
      setMessage(error.message || "Unable to start enrollment.");
    }
  }

  if (state === "active") {
    return <a href="/student/dashboard" className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-black text-white"><CheckCircle2 size={18} /> Go to My Learning</a>;
  }

  const label = onlineFee ? "Enroll • ₹" + onlineFee : "Enroll & Continue";
  return (
    <div>
      <button onClick={enroll} disabled={state === "loading"} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 font-black text-white disabled:opacity-60">
        {state === "loading" ? <LoaderCircle className="animate-spin" size={18} /> : <CreditCard size={18} />}
        {label}
      </button>
      {message && <p className={"mt-3 flex items-start gap-2 rounded-xl p-3 text-xs font-bold " + (state === "error" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700")}>{state === "pending" && <LockKeyhole size={15} className="mt-0.5 shrink-0" />}<span>{message}</span></p>}
    </div>
  );
}
