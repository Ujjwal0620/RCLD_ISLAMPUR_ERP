import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { registrationPayloadSchema } from "@/lib/registration-validation";
import { generateFormNo, generateRegistrationNo, REGISTRATION_STATUSES } from "@/lib/registration";

function validationError(error) {
  return NextResponse.json(
    { error: error.issues?.[0]?.message || "Please check the entered information." },
    { status: 400 }
  );
}

function qualificationData(qualifications = []) {
  return qualifications.map((item, index) => ({
    serialNo: item.serialNo || index + 1,
    examCourse: item.examCourse,
    boardUniversity: item.boardUniversity || null,
    collegeInstitute: item.collegeInstitute || null,
    passingYear: item.passingYear ?? null,
    percentageMarks: item.percentageMarks ?? null,
  }));
}

export async function GET(request) {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user, "students.view")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  const status = searchParams.get("status") || "";
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const take = Math.min(50, Math.max(1, Number(searchParams.get("take") || 20)));

  const where = {
    ...(status && REGISTRATION_STATUSES.includes(status) ? { status } : {}),
    ...(q
      ? {
          OR: [
            { applicantName: { contains: q, mode: "insensitive" } },
            { formNo: { contains: q, mode: "insensitive" } },
            { registrationNo: { contains: q, mode: "insensitive" } },
            { mobileNumber: { contains: q, mode: "insensitive" } },
            { courseCode: { contains: q, mode: "insensitive" } },
            { courseName: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  try {
    const [total, registrations] = await Promise.all([
      db.registration.count({ where }),
      db.registration.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * take,
        take,
        select: {
          id: true,
          formNo: true,
          registrationNo: true,
          applicantName: true,
          mobileNumber: true,
          courseCode: true,
          courseName: true,
          status: true,
          createdAt: true,
          submittedAt: true,
          studentId: true,
          _count: { select: { qualifications: true } },
        },
      }),
    ]);

    return NextResponse.json({
      registrations,
      total,
      page,
      pages: Math.max(1, Math.ceil(total / take)),
    });
  } catch (error) {
    console.error("registration list error", error);
    return NextResponse.json({ error: "Unable to load registrations." }, { status: 500 });
  }
}

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user, "students.manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const data = await registrationPayloadSchema.parseAsync(await request.json());
    const submit = Boolean(data.submit);

    if (submit && !data.declarationAccepted) {
      return NextResponse.json({ error: "The declaration must be accepted before submission." }, { status: 400 });
    }

    if (submit && !data.courseId) {
      return NextResponse.json({ error: "Select a course before submitting the registration." }, { status: 400 });
    }

    if (data.dateOfBirth && data.dateOfBirth > new Date()) {
      return NextResponse.json({ error: "Date of birth cannot be in the future." }, { status: 400 });
    }

    let course = null;
    if (data.courseId) {
      course = await db.course.findUnique({
        where: { id: data.courseId },
        select: { id: true, code: true, name: true },
      });
      if (!course) {
        return NextResponse.json({ error: "Selected course was not found." }, { status: 404 });
      }
    }

    const { submit: _submit, qualifications, ...payload } = data;
    const year = new Date().getFullYear();
    const formNo = generateFormNo(year);
    const registrationNo = payload.registrationNo || generateRegistrationNo(year);

    const registration = await db.$transaction(async (tx) => {
      const created = await tx.registration.create({
        data: {
          ...payload,
          formNo,
          registrationNo,
          courseId: course?.id || null,
          courseCode: course?.code || null,
          courseName: course?.name || null,
          status: submit ? "SUBMITTED" : "DRAFT",
          submittedAt: submit ? new Date() : null,
          createdById: user.id,
          qualifications: {
            create: qualificationData(qualifications),
          },
        },
        include: {
          qualifications: { orderBy: { serialNo: "asc" } },
          course: { select: { code: true, name: true } },
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: user.id,
          action: submit ? "REGISTRATION_SUBMITTED" : "REGISTRATION_DRAFT_SAVED",
          entityType: "Registration",
          entityId: created.id,
          metadata: { formNo: created.formNo, registrationNo: created.registrationNo, courseCode: created.courseCode },
        },
      });

      return created;
    });

    return NextResponse.json({ registration }, { status: 201 });
  } catch (error) {
    if (error?.name === "ZodError") return validationError(error);
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "That form or registration number already exists." }, { status: 409 });
    }
    console.error("registration create error", error);
    return NextResponse.json({ error: "Unable to save the registration." }, { status: 500 });
  }
}
