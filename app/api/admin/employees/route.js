import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission, isSuperAdmin } from "@/lib/permissions";
import { employeeCreateSchema, toDateOrNull } from "@/lib/employee-validation";

function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

function serialize(employee) {
  return {
    ...employee,
    joinedAt: employee.joinedAt ? employee.joinedAt.toISOString() : null,
    dateOfBirth: employee.dateOfBirth ? employee.dateOfBirth.toISOString() : null,
    user: employee.user ? {
      id: employee.user.id,
      name: employee.user.name,
      email: employee.user.email,
      phone: employee.user.phone,
      status: employee.user.status,
      roles: employee.user.userRoles.map((r) => ({ id: r.roleId, name: r.role.name })),
    } : null,
  };
}

export async function GET() {
  const actor = await getCurrentUser();
  if (!actor || !hasPermission(actor, "employees.view")) return forbidden();
  const employees = await db.employee.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { include: { userRoles: { include: { role: true } } } } },
  });
  return NextResponse.json({ employees: employees.map(serialize) });
}

export async function POST(request) {
  const actor = await getCurrentUser();
  if (!actor || !hasPermission(actor, "employees.manage")) return forbidden();

  try {
    const body = employeeCreateSchema.parse(await request.json());
    const email = body.email.toLowerCase();
    const code = body.employeeCode.toUpperCase();

    if (await db.user.findUnique({ where: { email }, select: { id: true } })) {
      return NextResponse.json({ error: "A user with this email already exists." }, { status: 409 });
    }
    if (await db.employee.findUnique({ where: { employeeCode: code }, select: { id: true } })) {
      return NextResponse.json({ error: "Employee code already exists." }, { status: 409 });
    }

    const roleIds = isSuperAdmin(actor) ? body.roleIds : [];
    const roles = roleIds.length
      ? await db.role.findMany({ where: { id: { in: roleIds } }, select: { id: true } })
      : [];
    if (roles.length !== roleIds.length) {
      return NextResponse.json({ error: "One or more selected roles are invalid." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await db.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name: body.name,
          email,
          passwordHash,
          phone: body.phone || null,
          status: body.userStatus || "ACTIVE",
          userRoles: { create: roles.map((role) => ({ roleId: role.id })) },
        },
      });

      const employee = await tx.employee.create({
        data: {
          userId: createdUser.id,
          employeeCode: code,
          designation: body.designation || null,
          department: body.department || null,
          employmentType: body.employmentType || "FULL_TIME",
          status: body.status || "ACTIVE",
          joinedAt: toDateOrNull(body.joinedAt),
          dateOfBirth: toDateOrNull(body.dateOfBirth),
          gender: body.gender || null,
          alternatePhone: body.alternatePhone || null,
          presentAddress: body.presentAddress || null,
          permanentAddress: body.permanentAddress || null,
          city: body.city || null,
          district: body.district || null,
          state: body.state || null,
          pinCode: body.pinCode || null,
          qualification: body.qualification || null,
          skills: body.skills || null,
          experience: body.experience || null,
          specialization: body.specialization || null,
          profileImageUrl: body.profileImageUrl || null,
          emergencyContactName: body.emergencyContactName || null,
          emergencyContactPhone: body.emergencyContactPhone || null,
          emergencyContactRelation: body.emergencyContactRelation || null,
          notes: body.notes || null,
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: actor.id,
          action: "EMPLOYEE_CREATED",
          entityType: "Employee",
          entityId: employee.id,
          metadata: { employeeCode: employee.employeeCode, email: createdUser.email },
        },
      });
      return createdUser;
    });

    const employee = await db.employee.findUnique({
      where: { userId: user.id },
      include: { user: { include: { userRoles: { include: { role: true } } } } },
    });

    return NextResponse.json({ employee: serialize(employee) }, { status: 201 });
  } catch (error) {
    if (error && error.name === "ZodError") return NextResponse.json({ error: error.issues[0]?.message || "Invalid employee data." }, { status: 400 });
    if (error && error.code === "P2002") return NextResponse.json({ error: "Employee code or user email already exists." }, { status: 409 });
    console.error("employee create error", error);
    return NextResponse.json({ error: "Unable to create employee." }, { status: 500 });
  }
}