import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentStudent } from "@/lib/student-auth";
import { getPaymentProvider, isPaymentConfigured, getPaymentStatusMessage } from "@/lib/payments";

const schema = z.object({ courseCode: z.string().min(2).max(20) });

export async function POST(request) {
  try {
    const student = await getCurrentStudent();
    if (!student) return NextResponse.json({ error: "Please log in as an online student first." }, { status: 401 });

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "A valid course code is required." }, { status: 400 });

    const code = parsed.data.courseCode.toUpperCase();
    const course = await db.course.findUnique({ where: { code } });
    if (!course || !course.active || !course.onlinePublished) {
      return NextResponse.json({ error: "This online course is not available for enrollment." }, { status: 404 });
    }

    const existing = await db.onlineEnrollment.findUnique({
      where: { studentId_courseId: { studentId: student.id, courseId: course.id } },
    });

    if (existing) {
      return NextResponse.json({
        ok: true,
        enrollment: {
          id: existing.id,
          status: existing.status,
          paymentStatus: existing.paymentStatus,
          paidAmount: existing.paidAmount?.toString() || null,
        },
        payment: {
          provider: getPaymentProvider(),
          configured: isPaymentConfigured(),
          message: getPaymentStatusMessage(),
        },
      });
    }

    const enrollment = await db.onlineEnrollment.create({
      data: {
        studentId: student.id,
        courseId: course.id,
        status: "PENDING",
        paymentStatus: "PENDING",
        paidAmount: course.onlineFee,
      },
    });

    return NextResponse.json({
      ok: true,
      enrollment: {
        id: enrollment.id,
        status: enrollment.status,
        paymentStatus: enrollment.paymentStatus,
        paidAmount: enrollment.paidAmount?.toString() || null,
      },
      payment: {
        provider: getPaymentProvider(),
        configured: isPaymentConfigured(),
        message: getPaymentStatusMessage(),
      },
    });
  } catch (error) {
    console.error("student enrollment error", error);
    return NextResponse.json({ error: "Unable to create the enrollment right now." }, { status: 500 });
  }
}
