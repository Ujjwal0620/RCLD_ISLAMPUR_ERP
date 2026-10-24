import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission, isSuperAdmin } from "@/lib/permissions";

const schema = z.object({ status: z.enum(["TODO","IN_PROGRESS","BLOCKED","REVIEW","COMPLETED","CANCELLED"]) });

export async function PATCH(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { id } = await params;
  try {
    const body = schema.parse(await request.json());
    const task = await db.employeeTask.findUnique({ where: { id }, select: { id:true, assigneeId:true, createdById:true, reviewerId:true, status:true } });
    if (!task) return NextResponse.json({ error: "Task not found." }, { status: 404 });
    const manager = isSuperAdmin(user) || hasPermission(user, "employees.manage");
    if (!manager && task.assigneeId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (!manager && ["COMPLETED","CANCELLED"].includes(body.status)) return NextResponse.json({ error: "Submit the task for review; a manager completes or cancels it." }, { status: 403 });
    const updated = await db.employeeTask.update({
      where: { id },
      data: {
        status: body.status,
        startedAt: body.status === "IN_PROGRESS" && !["IN_PROGRESS","REVIEW","COMPLETED"].includes(task.status) ? new Date() : undefined,
        completedAt: body.status === "COMPLETED" ? new Date() : body.status === "CANCELLED" ? null : undefined,
      },
    });
    await db.auditLog.create({ data: { actorUserId:user.id, action:"EMPLOYEE_TASK_STATUS_CHANGED", entityType:"EmployeeTask", entityId:id, metadata:{from:task.status,to:body.status} } });
    return NextResponse.json({ task: updated });
  } catch (error) {
    if (error?.name === "ZodError") return NextResponse.json({ error: "Invalid task status." }, { status: 400 });
    return NextResponse.json({ error: "Unable to update task." }, { status: 500 });
  }
}
