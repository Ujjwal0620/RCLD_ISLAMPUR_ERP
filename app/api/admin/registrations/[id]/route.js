import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { registrationUpdateSchema } from "@/lib/registration-validation";
import { generateRegistrationNo } from "@/lib/registration";

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

export async function GET(_request, { params }) {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user, "students.view")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const registration = await db.registration.findUnique({
    where: { id },
    include: {
      qualifications: { orderBy: { serialNo: "asc" } },
      course: { select: { id: true, code: true, name: true, standardFee: true } },
      student: { select: { id: true, registrationNo: true, name: true } },
      createdBy: { select: { name: true, email: true } },
      reviewedBy: { select: { name: true, email: true } },
    },
  });

  if (!registration) {
    return NextResponse.json({ error: "Registration not found." }, { status: 404 });
  }

  return NextResponse.json({ registration });
}

export async function PATCH(request, { params }) {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user, "students.manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const data = await registrationUpdateSchema.parseAsync(await request.json());
    const { qualifications, status, reviewNote, ...payload } = data;

    const existing = await db.registration.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        applicantName: true,
        mobileNumber: true,
        courseId: true,
        declarationAccepted: true,
        registrationNo: true,
        studentId: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Registration not found." }, { status: 404 });
    }

    let courseFields = {};
    if (payload.courseId) {
      const course = await db.course.findUnique({
        where: { id: payload.courseId },
        select: { id: true, code: true, name: true },
      });
      if (!course) {
        return NextResponse.json({ error: "The selected course could not be found." }, { status: 400 });
      }
      courseFields = { courseId: course.id, courseCode: course.code, courseName: course.name };
    }

    const declarationAccepted = payload.declarationAccepted ?? existing.declarationAccepted;

    if (status === "APPROVED") {
      if (!declarationAccepted) {
        return NextResponse.json({ error: "The applicant declaration must be accepted before approval." }, { status: 400 });
      }
      if (!existing.courseId && !payload.courseId) {
        return NextResponse.json({ error: "A course must be selected before approval." }, { status: 400 });
      }
    }

    const normalizedPayload = { ...payload, ...courseFields };

    const result = await db.$transaction(async (tx) => {
      let linkedStudentId = existing.studentId;

      if (status === "APPROVED" && !linkedStudentId) {
        const preferredRegistrationNo = payload.registrationNo || existing.registrationNo || generateRegistrationNo();
        const duplicate = await tx.student.findUnique({
          where: { registrationNo: preferredRegistrationNo },
          select: { id: true },
        });
        const registrationNo = duplicate ? generateRegistrationNo() : preferredRegistrationNo;

        const student = await tx.student.create({
          data: {
            registrationNo,
            name: payload.applicantName || existing.applicantName,
            phone: payload.mobileNumber || existing.mobileNumber || null,
            studentType: "OFFLINE",
            status: "ACTIVE",
          },
        });
        linkedStudentId = student.id;
        await tx.registration.update({
          where: { id },
          data: { registrationNo },
        });
      } else if (status === "APPROVED" && linkedStudentId) {
        await tx.student.update({
          where: { id: linkedStudentId },
          data: {
            name: payload.applicantName || existing.applicantName,
            phone: payload.mobileNumber || existing.mobileNumber || null,
          },
        });
      }

      if (qualifications) {
        await tx.registrationQualification.deleteMany({ where: { registrationId: id } });
      }

      const updateData = {
        ...normalizedPayload,
        ...(linkedStudentId ? { studentId: linkedStudentId } : {}),
        ...(qualifications
          ? { qualifications: { create: qualificationData(qualifications) } }
          : {}),
        ...(status
          ? {
              status,
              reviewedById: user.id,
              reviewedAt: new Date(),
              reviewNote: reviewNote || null,
              ...(status === "SUBMITTED" ? { submittedAt: new Date() } : {}),
            }
          : {}),
      };

      const registration = await tx.registration.update({
        where: { id },
        data: updateData,
        include: {
          qualifications: { orderBy: { serialNo: "asc" } },
          student: { select: { id: true, registrationNo: true, name: true } },
          course: { select: { id: true, code: true, name: true } },
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: user.id,
          action: status ? `REGISTRATION_${status}` : "REGISTRATION_UPDATED",
          entityType: "Registration",
          entityId: id,
          metadata: {
            formNo: registration.formNo,
            fromStatus: existing.status,
            toStatus: registration.status,
            reviewNote: reviewNote || null,
          },
        },
      });

      return registration;
    });

    return NextResponse.json({ registration: result });
  } catch (error) {
    if (error?.name === "ZodError") {
      return NextResponse.json({ error: error.issues?.[0]?.message || "Invalid registration data." }, { status: 400 });
    }
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "That registration number already exists." }, { status: 409 });
    }
    console.error("registration update error", error);
    return NextResponse.json({ error: "Unable to update the registration." }, { status: 500 });
  }
}
