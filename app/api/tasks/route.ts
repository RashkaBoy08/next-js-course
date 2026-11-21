import { NextResponse } from "next/server";
import { getTaskflowUser } from "@/lib/auth-user";
import { getPrisma } from "@/lib/prisma";
import { parseOptionalDueDate, TASK_STATUSES } from "@/lib/task-validation";

function configuredResponse() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
    return NextResponse.json({ error: "Connect your Clerk account to use the task board." }, { status: 503 });
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Connect your PostgreSQL database to save tasks." }, { status: 503 });
  }
  return null;
}

export async function GET() {
  const notReady = configuredResponse();
  if (notReady) return notReady;
  try {
    const user = await getTaskflowUser();
    if (!user) return NextResponse.json({ error: "Please sign in to view your tasks." }, { status: 401 });
    const tasks = await getPrisma().task.findMany({
      where: { userId: user.id },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ tasks });
  } catch {
    return NextResponse.json({ error: "Your tasks could not load. Check your database setup." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const notReady = configuredResponse();
  if (notReady) return notReady;
  try {
    const user = await getTaskflowUser();
    if (!user) return NextResponse.json({ error: "Please sign in before adding a task." }, { status: 401 });
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Send a valid JSON request." }, { status: 400 });
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Send a valid task in the request body." }, { status: 400 });
    }
    const taskInput = body as Record<string, unknown>;
    const title = typeof taskInput.title === "string" ? taskInput.title.trim() : "";
    const description = typeof taskInput.description === "string" ? taskInput.description.trim() : "";
    const status = typeof taskInput.status === "string" ? taskInput.status : "TODO";
    if (!title) return NextResponse.json({ error: "Give your task a name first." }, { status: 400 });
    if (title.length > 100) return NextResponse.json({ error: "Task names can be up to 100 characters." }, { status: 400 });
    if (description.length > 500) return NextResponse.json({ error: "Details can be up to 500 characters." }, { status: 400 });
    if (!TASK_STATUSES.has(status)) return NextResponse.json({ error: "Choose one of the available task statuses." }, { status: 400 });

    const dueDate = parseOptionalDueDate(taskInput.dueDate);
    if (dueDate === undefined) return NextResponse.json({ error: "Choose a valid due date." }, { status: 400 });

    const task = await getPrisma().task.create({
      data: { title, description, status, dueDate, userId: user.id },
    });
    return NextResponse.json({ task }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Your task could not be saved. Check your database setup." }, { status: 500 });
  }
}
