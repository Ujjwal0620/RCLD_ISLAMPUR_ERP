import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export async function DELETE(_request, { params }) {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user, "batches.manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const batch = await db.batch.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            enrollments: true,
            attendances: true,
            faculties: true,
            exams: true,
            certificates: true,
            transfersFrom: true,
            transfersTo: true,
          },
        },
      },
    });

    if (!batch) return NextResponse.json({ error: "Batch not found." }, { status: 404 });

    const blockers = [
      ["student enrollments", batch._count.enrollments],
      ["attendance records", batch._count.attendances],
      ["exams", batch._count.exams],
      ["certificates", batch._count.certificates],
      ["batch transfers", batch._count.transfersFrom + batch._count.transfersTo],
    ].filter(([, count]) => count > 0);

    if (blockers.length) {
      return NextResponse.json(
        {
          error:
            "This batch has academic or financial history and cannot be deleted. Cancel or complete the batch instead. Linked: " +
            blockers.map(([label, count]) => count + " " + label).join(", ") +
            ".",
        },
        { status: 409 }
      );
    }

    await db.batch.delete({ where: { id: batch.id } });
    await db.auditLog.create({
      data: {
        actorUserId: user.id,
        action: "BATCH_DELETED",
        entityType: "Batch",
        entityId: batch.id,
        metadata: { code: batch.code, name: batch.name, courseId: batch.courseId },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("batch delete error", error);
    return NextResponse.json({ error: "Unable to delete the batch." }, { status: 500 });
  }
}
