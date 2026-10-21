import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentStudent } from "@/lib/student-auth";
import { getCheckoutAvailability, getPaymentProvider } from "@/lib/payments";

export async function POST(request) {
  try {
    const student = await getCurrentStudent();
    if (!student) return NextResponse.json({ error: "Please log in as an online student first." }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    if (!body.enrollmentId) return NextResponse.json({ error: "Enrollment ID is required." }, { status: 400 });

    const enrollment = await db.onlineEnrollment.findFirst({
      where: { id: body.enrollmentId, studentId: student.id },
      include: { course: { select: { code: true, name: true, onlineFee: true } } },
    });

    if (!enrollment) return NextResponse.json({ error: "Enrollment not found." }, { status: 404 });
    if (enrollment.status === "ACTIVE" && enrollment.paymentStatus === "PAID") {
      return NextResponse.json({ ok: true, alreadyPaid: true, redirectUrl: "/student/dashboard" });
    }

    const availability = getCheckoutAvailability();
    if (!availability.available) {
      return NextResponse.json({
        error: availability.reason,
        provider: getPaymentProvider(),
        enrollment: { id: enrollment.id, status: enrollment.status, paymentStatus: enrollment.paymentStatus },
      }, { status: 503 });
    }

    return NextResponse.json({ error: "Checkout provider is not enabled." }, { status: 503 });
  } catch (error) {
    console.error("student checkout error", error);
    return NextResponse.json({ error: "Unable to start secure checkout right now." }, { status: 500 });
  }
}
