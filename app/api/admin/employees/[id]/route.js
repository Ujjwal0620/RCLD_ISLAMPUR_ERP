import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export async function DELETE(_request, { params }) {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user, "employees.manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const employee = await db.employee.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { attendances: true, batchFaculties: true } },
      },
    });

    if (!employee) return NextResponse.json({ error: "Employee not found." }, { status: 404 });
    if (employee.userId === user.id) {
      return NextResponse.json({ error: "You cannot delete your own employee record." }, { status: 400 });
    }

    const blockers = [
      ["attendance records", employee._count.attendances],
      ["batch assignments", employee._count.batchFaculties],
    ].filter(([, count]) => count > 0);

    if (blockers.length) {
      return NextResponse.json(
        {
          error:
            "This employee has attendance or batch assignment history and cannot be deleted. Remove batch assignments first or disable the linked user account. Linked: " +
            blockers.map(([label, count]) => count + " " + label).join(", ") +
            ".",
        },
        { status: 409 }
      );
    }

    await db.employee.delete({ where: { id: employee.id } });
    await db.auditLog.create({
      data: {
        actorUserId: user.id,
        action: "EMPLOYEE_DELETED",
        entityType: "Employee",
        entityId: employee.id,
        metadata: { employeeCode: employee.employeeCode, name: employee.user?.name, email: employee.user?.email },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("employee delete error", error);
    return NextResponse.json({ error: "Unable to delete the employee." }, { status: 500 });
  }
}
