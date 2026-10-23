import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  email: z.string().trim().email().max(160).optional().or(z.literal("")),
  studentType: z.enum(["OFFLINE", "ONLINE"]),
  status: z.enum(["ACTIVE", "COMPLETED", "TRANSFERRED", "DROPPED_OUT", "SUSPENDED", "CANCELLED"]),
});

const clean = (v) => (v === "" ? null : v);

export async function PATCH(request, { params }) {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user, "students.manage")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const { id } = await params;
    const data = schema.parse(await request.json());
    const student = await db.student.update({
      where: { id },
      data: {
        name: data.name,
        phone: clean(data.phone),
        email: clean(data.email),
        studentType: data.studentType,
        status: data.status,
      },
    });
    await db.auditLog.create({
      data: {
        actorUserId: user.id,
        action: "STUDENT_UPDATED",
        entityType: "Student",
        entityId: student.id,
        metadata: { status: student.status, studentType: student.studentType },
      },
    });
    return NextResponse.json({ student });
  } catch (error) {
    if (error?.code === "P2025") return NextResponse.json({ error: "Student not found." }, { status: 404 });
    if (error?.name === "ZodError") return NextResponse.json({ error: error.issues?.[0]?.message || "Invalid student data." }, { status: 400 });
    return NextResponse.json({ error: "Unable to update student." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user, "students.manage")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const { id } = await params;
    const student = await db.student.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            enrollments: true,
            onlineEnrollments: true,
            feeLedgers: true,
            attendances: true,
            examAttempts: true,
            certificates: true,
          },
        },
      },
    });
    if (!student) return NextResponse.json({ error: "Student not found." }, { status: 404 });

    const blockers = [
      ["batches", student._count.enrollments],
      ["online enrollments", student._count.onlineEnrollments],
      ["fee ledgers", student._count.feeLedgers],
      ["attendance", student._count.attendances],
      ["exam attempts", student._count.examAttempts],
      ["certificates", student._count.certificates],
    ].filter(([, count]) => count > 0);

    if (blockers.length) {
      return NextResponse.json(
        {
          error:
            "This student has linked academic, attendance, exam or financial records and cannot be deleted. Update their status to Dropped out/Suspended/Completed instead. Linked: " +
            blockers.map(([label, count]) => count + " " + label).join(", ") +
            ".",
        },
        { status: 409 }
      );
    }

    await db.student.delete({ where: { id: student.id } });
    await db.auditLog.create({
      data: {
        actorUserId: user.id,
        action: "STUDENT_DELETED",
        entityType: "Student",
        entityId: student.id,
        metadata: { registrationNo: student.registrationNo, name: student.name },
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("student delete error", error);
    return NextResponse.json({ error: "Unable to delete the student." }, { status: 500 });
  }
}
