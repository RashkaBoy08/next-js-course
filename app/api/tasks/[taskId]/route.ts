import { NextResponse } from "next/server";
import { getTaskflowUser } from "@/lib/auth-user";
import { getPrisma } from "@/lib/prisma";
import { parseOptionalDueDate, TASK_STATUSES } from "@/lib/task-validation";
type RouteContext = { params: Promise<{ taskId: string }> };

function configuredResponse() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
    return NextResponse.json({ error: "Connect your Clerk account to use the task board." }, { status: 503 });
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Connect your PostgreSQL database to save tasks." }, { status: 503 });
  }
  return null;
}

export async function PATCH(request: Request, context: RouteContext) {
  const notReady = configuredResponse();
  if (notReady) return notReady;
  try {
    const user = await getTaskflowUser();
    if (!user) return NextResponse.json({ error: "Please sign in before changing a task." }, { status: 401 });
    const { taskId } = await context.params;
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Send a valid JSON request." }, { status: 400 });
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Send a valid task update." }, { status: 400 });
    }
    const taskInput = body as Record<string, unknown>;
    const data: { title?: string; description?: string; status?: string; dueDate?: Date | null } = {};

    if ("title" in taskInput) {
      const title = typeof taskInput.title === "string" ? taskInput.title.trim() : "";
      if (!title) return NextResponse.json({ error: "Give your task a name first." }, { status: 400 });
      if (title.length > 100) return NextResponse.json({ error: "Task names can be up to 100 characters." }, { status: 400 });
      data.title = title;
    }
    if ("description" in taskInput) {
      const description = typeof taskInput.description === "string" ? taskInput.description.trim() : "";
      if (description.length > 500) return NextResponse.json({ error: "Details can be up to 500 characters." }, { status: 400 });
      data.description = description;
    }
    if ("status" in taskInput) {
      if (typeof taskInput.status !== "string" || !TASK_STATUSES.has(taskInput.status)) return NextResponse.json({ error: "Choose one of the available task statuses." }, { status: 400 });
      data.status = taskInput.status;
    }
    if ("dueDate" in taskInput) {
      const dueDate = parseOptionalDueDate(taskInput.dueDate);
      if (dueDate === undefined) return NextResponse.json({ error: "Choose a valid due date." }, { status: 400 });
      data.dueDate = dueDate;
    }
    if (Object.keys(data).length === 0) return NextResponse.json({ error: "Choose something to update." }, { status: 400 });

    const result = await getPrisma().task.updateMany({ where: { id: taskId, userId: user.id }, data });
    if (!result.count) return NextResponse.json({ error: "That task could not be found." }, { status: 404 });
    const task = await getPrisma().task.findFirst({ where: { id: taskId, userId: user.id } });
    return NextResponse.json({ task });
  } catch {
    return NextResponse.json({ error: "Your task could not be updated. Check your database setup." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const notReady = configuredResponse();
  if (notReady) return notReady;
  try {
    const user = await getTaskflowUser();
    if (!user) return NextResponse.json({ error: "Please sign in before deleting a task." }, { status: 401 });
    const { taskId } = await context.params;
    const result = await getPrisma().task.deleteMany({ where: { id: taskId, userId: user.id } });
    if (!result.count) return NextResponse.json({ error: "That task could not be found." }, { status: 404 });
    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json({ error: "Your task could not be deleted. Check your database setup." }, { status: 500 });
  }
}
