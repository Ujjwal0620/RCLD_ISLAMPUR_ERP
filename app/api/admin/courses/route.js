import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission, isSuperAdmin } from "@/lib/permissions";
import { coursePayloadSchema, hasDiscountFields, normalizeSyllabusPayload } from "@/lib/course-validation";
import { calculateCoursePricing, normalizeDiscountType, serializeCourse, validateCoursePricing } from "@/lib/course-pricing";

const DEFAULT_FEATURES = ["Practical learning", "Structured lessons", "Student resources"];

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user, "courses.manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const raw = await request.json().catch(() => null);
  const superAdmin = isSuperAdmin(user);

  if (!superAdmin && hasDiscountFields(raw)) {
    return NextResponse.json(
      { error: "Only Super Admin can configure course discounts." },
      { status: 403 }
    );
  }

  try {
    const body = await coursePayloadSchema.parseAsync(raw);
    const discountType = superAdmin ? normalizeDiscountType(body.discountType) : "NONE";
    const discountValue = discountType === "NONE" ? null : body.discountValue ?? null;
    const discountActive = superAdmin ? Boolean(body.discountActive ?? discountType !== "NONE") : false;

    const pricingError = validateCoursePricing({
      standardFee: body.standardFee,
      discountType,
      discountValue,
      discountActive,
    });
    if (pricingError) {
      return NextResponse.json({ error: pricingError }, { status: 400 });
    }

    const pricing = calculateCoursePricing({
      standardFee: body.standardFee,
      discountType,
      discountValue,
      discountActive,
    });

    const course = await db.course.create({
      data: {
        code: body.code,
        name: body.name,
        shortDescription: body.shortDescription,
        description: body.description,
        duration: body.duration,
        eligibility: body.eligibility,
        standardFee: body.standardFee ?? null,
        onlineFee: body.onlineFee ?? null,
        admissionFee: body.admissionFee ?? null,
        discountType,
        discountValue,
        discountActive,
        deliveryMode: body.deliveryMode,
        featured: body.featured ?? false,
        active: body.active ?? true,
        onlinePublished: body.onlinePublished ?? true,
        displayOrder: body.displayOrder ?? 0,
        imageUrl: body.imageUrl,
        bannerUrl: body.bannerUrl,
        features: body.features?.length ? body.features : DEFAULT_FEATURES,
        syllabus: normalizeSyllabusPayload(body.syllabus) ?? undefined,
      },
    });

    await db.auditLog.create({
      data: {
        actorUserId: user.id,
        action: "COURSE_CREATED",
        entityType: "Course",
        entityId: course.id,
        metadata: { code: course.code, name: course.name, finalFee: pricing.finalFee },
      },
    });

    if (pricing.hasDiscount) {
      await db.auditLog.create({
        data: {
          actorUserId: user.id,
          action: "COURSE_DISCOUNT_APPLIED",
          entityType: "Course",
          entityId: course.id,
          metadata: {
            code: course.code,
            discountType,
            discountValue: pricing.discountValue,
            discountAmount: pricing.discountAmount,
            baseFee: pricing.baseFee,
            finalFee: pricing.finalFee,
          },
        },
      });
    }

    return NextResponse.json({ course: serializeCourse(course) }, { status: 201 });
  } catch (error) {
    if (error?.name === "ZodError") {
      return NextResponse.json({ error: error.issues?.[0]?.message || "Invalid course data." }, { status: 400 });
    }
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Course code already exists." }, { status: 409 });
    }
    console.error("course create error", error);
    return NextResponse.json({ error: "Unable to create the course." }, { status: 500 });
  }
}
