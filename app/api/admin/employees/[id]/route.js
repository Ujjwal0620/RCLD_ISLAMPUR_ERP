import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission, isSuperAdmin } from "@/lib/permissions";
import { employeeUpdateSchema, toDateOrNull } from "@/lib/employee-validation";

function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function PATCH(request, { params }) {
  const actor = await getCurrentUser();
  if (!actor || !hasPermission(actor, "employees.manage")) return forbidden();

  try {
    const { id } = await params;
    const body = employeeUpdateSchema.parse(await request.json());
    const employee = await db.employee.findUnique({ where: { id }, include: { user: true } });
    if (!employee) return NextResponse.json({ error: "Employee not found." }, { status: 404 });

    const data = {};
    const fields = [
      "employeeCode","designation","department","employmentType","status","gender",
      "alternatePhone","presentAddress","permanentAddress","city","district","state",
      "pinCode","qualification","skills","experience","specialization","profileImageUrl",
      "emergencyContactName","emergencyContactPhone","emergencyContactRelation","notes"
    ];

    for (const field of fields) {
      if (body[field] !== undefined) data[field] = body[field] || null;
    }

    if (body.employeeCode !== undefined) {
      const code = body.employeeCode.toUpperCase();
      const duplicate = await db.employee.findUnique({ where: { employeeCode: code }, select: { id: true } });
      if (duplicate && duplicate.id !== employee.id) return NextResponse.json({ error: "Employee code is already in use." }, { status: 409 });
      data.employeeCode = code;
    }

    if (body.joinedAt !== undefined) data.joinedAt = toDateOrNull(body.joinedAt);
    if (body.dateOfBirth !== undefined) data.dateOfBirth = toDateOrNull(body.dateOfBirth);

    const userData = {};
    if (body.name !== undefined) userData.name = body.name;
    if (body.email !== undefined) {
      const email = body.email.toLowerCase();
      const duplicate = await db.user.findUnique({ where: { email }, select: { id: true } });
      if (duplicate && duplicate.id !== employee.userId) return NextResponse.json({ error: "Email is already in use." }, { status: 409 });
      userData.email = email;
    }
    if (body.phone !== undefined) userData.phone = body.phone || null;
    if (body.userStatus !== undefined) userData.status = body.userStatus;
    if (body.password) userData.passwordHash = await bcrypt.hash(body.password, 12);

    await db.$transaction(async (tx) => {
      await tx.employee.update({ where: { id }, data });

      if (Object.keys(userData).length) {
        await tx.user.update({ where: { id: employee.userId }, data: userData });
      }

      if (isSuperAdmin(actor) && body.roleIds !== undefined) {
        const roles = await tx.role.findMany({
          where: { id: { in: body.roleIds } },
          select: { id: true },
        });
        if (roles.length !== body.roleIds.length) throw new Error("INVALID_ROLE_SELECTION");

        await tx.userRole.deleteMany({ where: { userId: employee.userId } });
        if (roles.length) {
          await tx.userRole.createMany({
            data: roles.map((role) => ({ userId: employee.userId, roleId: role.id })),
            skipDuplicates: true,
          });
        }
      }

      await tx.auditLog.create({
        data: {
          actorUserId: actor.id,
          action: "EMPLOYEE_UPDATED",
          entityType: "Employee",
          entityId: id,
          metadata: { employeeCode: data.employeeCode || employee.employeeCode },
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error && error.message === "INVALID_ROLE_SELECTION") return NextResponse.json({ error: "One or more selected roles are invalid." }, { status: 400 });
    if (error && error.name === "ZodError") return NextResponse.json({ error: error.issues[0]?.message || "Invalid employee data." }, { status: 400 });
    if (error && error.code === "P2002") return NextResponse.json({ error: "Employee code or user email already exists." }, { status: 409 });
    console.error("employee update error", error);
    return NextResponse.json({ error: "Unable to update employee." }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  const actor = await getCurrentUser();
  if (!actor || !isSuperAdmin(actor)) return forbidden();

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
    if (employee.userId === actor.id) return NextResponse.json({ error: "You cannot delete your own employee record." }, { status: 400 });

    const blockers = [
      ["attendance records", employee._count.attendances],
      ["batch assignments", employee._count.batchFaculties],
    ].filter(([, count]) => count > 0);

    if (blockers.length) {
      return NextResponse.json({
        error: "This employee has historical records and cannot be hard-deleted. Disable or mark the employee inactive instead. " +
          blockers.map(([label, count]) => count + " " + label).join(", ") + ".",
      }, { status: 409 });
    }

    await db.$transaction(async (tx) => {
      await tx.employee.delete({ where: { id } });
      await tx.user.delete({ where: { id: employee.userId } });
      await tx.auditLog.create({
        data: {
          actorUserId: actor.id,
          action: "EMPLOYEE_DELETED",
          entityType: "Employee",
          entityId: id,
          metadata: { employeeCode: employee.employeeCode, name: employee.user?.name, email: employee.user?.email },
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("employee delete error", error);
    return NextResponse.json({ error: "Unable to delete the employee." }, { status: 500 });
  }
}