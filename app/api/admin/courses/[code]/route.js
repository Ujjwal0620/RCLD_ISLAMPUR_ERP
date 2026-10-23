import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission, isSuperAdmin } from "@/lib/permissions";
import { courseUpdateSchema, hasDiscountFields, normalizeSyllabusPayload } from "@/lib/course-validation";
import {
  calculateCoursePricing,
  normalizeDiscountType,
  serializeCourse,
  validateCoursePricing,
} from "@/lib/course-pricing";

function discountSnapshot(type, value, active) {
  return {
    type: normalizeDiscountType(type),
    value: value === null || value === undefined ? null : Number(value.toString()),
    active: Boolean(active),
  };
}

export async function PATCH(request, { params }) {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user, "courses.manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { code } = await params;
  const currentCode = decodeURIComponent(code).toUpperCase();
  const raw = await request.json().catch(() => null);
  const superAdmin = isSuperAdmin(user);

  if (!superAdmin && hasDiscountFields(raw)) {
    return NextResponse.json(
      { error: "Only Super Admin can configure course discounts." },
      { status: 403 }
    );
  }

  try {
    const body = await courseUpdateSchema.parseAsync(raw);
    const existing = await db.course.findUnique({ where: { code: currentCode } });
    if (!existing) {
      return NextResponse.json({ error: "Course not found." }, { status: 404 });
    }

    if (body.code && body.code !== existing.code) {
      const duplicate = await db.course.findUnique({ where: { code: body.code }, select: { id: true } });
      if (duplicate) {
        return NextResponse.json({ error: "Course code already exists." }, { status: 409 });
      }
    }

    const pricingChanged =
      body.standardFee !== undefined ||
      body.discountType !== undefined ||
      body.discountValue !== undefined ||
      body.discountActive !== undefined;

    let nextDiscountType = normalizeDiscountType(existing.discountType);
    let nextDiscountValue = existing.discountValue === null ? null : Number(existing.discountValue.toString());
    let nextDiscountActive = existing.discountActive !== false;

    if (superAdmin) {
      if (body.discountType !== undefined) nextDiscountType = normalizeDiscountType(body.discountType);
      if (body.discountValue !== undefined) nextDiscountValue = body.discountValue;
      if (body.discountActive !== undefined) nextDiscountActive = body.discountActive;

      if (nextDiscountType === "NONE") {
        nextDiscountValue = null;
        nextDiscountActive = false;
      }
    }

    const nextStandardFee =
      body.standardFee !== undefined ? body.standardFee : existing.standardFee === null ? null : Number(existing.standardFee.toString());

    if (pricingChanged) {
      const pricingError = validateCoursePricing({
        standardFee: nextStandardFee,
        discountType: nextDiscountType,
        discountValue: nextDiscountValue,
        discountActive: nextDiscountActive,
      });
      if (pricingError) {
        return NextResponse.json({ error: pricingError }, { status: 400 });
      }
    }

    const { discountType: _discountType, discountValue: _discountValue, discountActive: _discountActive, ...normalData } = body;
    const updateData = { ...normalData };

    if (normalData.syllabus !== undefined) {
      updateData.syllabus = normalizeSyllabusPayload(normalData.syllabus) ?? [];
    }

    if (superAdmin && (body.discountType !== undefined || body.discountValue !== undefined || body.discountActive !== undefined)) {
      updateData.discountType = nextDiscountType;
      updateData.discountValue = nextDiscountValue;
      updateData.discountActive = nextDiscountActive;
    }

    const course = await db.course.update({
      where: { id: existing.id },
      data: updateData,
    });

    const previousPricing = calculateCoursePricing(existing);
    const nextPricing = calculateCoursePricing(course);
    const previousDiscount = discountSnapshot(existing.discountType, existing.discountValue, existing.discountActive);
    const nextDiscount = discountSnapshot(course.discountType, course.discountValue, course.discountActive);
    const discountChanged =
      previousDiscount.type !== nextDiscount.type ||
      previousDiscount.value !== nextDiscount.value ||
      previousDiscount.active !== nextDiscount.active;

    await db.auditLog.create({
      data: {
        actorUserId: user.id,
        action: "COURSE_UPDATED",
        entityType: "Course",
        entityId: course.id,
        metadata: {
          code: course.code,
          previousCode: existing.code,
          baseFee: nextPricing.baseFee,
          finalFee: nextPricing.finalFee,
        },
      },
    });

    if (discountChanged) {
      const action =
        !previousPricing.hasDiscount && nextPricing.hasDiscount
          ? "COURSE_DISCOUNT_APPLIED"
          : previousPricing.hasDiscount && !nextPricing.hasDiscount
            ? "COURSE_DISCOUNT_REMOVED"
            : "COURSE_DISCOUNT_UPDATED";

      await db.auditLog.create({
        data: {
          actorUserId: user.id,
          action,
          entityType: "Course",
          entityId: course.id,
          metadata: {
            code: course.code,
            previous: previousDiscount,
            next: nextDiscount,
            previousFinalFee: previousPricing.finalFee,
            finalFee: nextPricing.finalFee,
            discountAmount: nextPricing.discountAmount,
          },
        },
      });
    }

    return NextResponse.json({ course: serializeCourse(course) });
  } catch (error) {
    if (error?.name === "ZodError") {
      return NextResponse.json({ error: error.issues?.[0]?.message || "Invalid course data." }, { status: 400 });
    }
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Course code already exists." }, { status: 409 });
    }
    console.error("course update error", error);
    return NextResponse.json({ error: "Unable to update the course." }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user, "courses.manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { code } = await params;
  const currentCode = decodeURIComponent(code).toUpperCase();

  try {
    const course = await db.course.findUnique({
      where: { code: currentCode },
      include: {
        _count: {
          select: {
            batches: true,
            modules: true,
            registrations: true,
            onlineEnrollments: true,
            exams: true,
            certificates: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found." }, { status: 404 });
    }

    const blockers = [
      ["batches", course._count.batches],
      ["LMS modules", course._count.modules],
      ["registrations", course._count.registrations],
      ["online enrollments", course._count.onlineEnrollments],
      ["exams", course._count.exams],
      ["certificates", course._count.certificates],
    ].filter(([, count]) => count > 0);

    if (blockers.length) {
      return NextResponse.json(
        {
          error:
            "This course is linked to academic or financial records and cannot be deleted. Deactivate it instead. Linked: " +
            blockers.map(([label, count]) => count + " " + label).join(", ") +
            ".",
        },
        { status: 409 }
      );
    }

    await db.course.delete({ where: { id: course.id } });
    await db.auditLog.create({
      data: {
        actorUserId: user.id,
        action: "COURSE_DELETED",
        entityType: "Course",
        entityId: course.id,
        metadata: { code: course.code, name: course.name },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("course delete error", error);
    return NextResponse.json({ error: "Unable to delete the course." }, { status: 500 });
  }
}
