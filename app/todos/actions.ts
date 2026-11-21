"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Filter, MongoClient, ObjectId } from "mongodb";

export type Priority = "low" | "medium" | "high";

export type Todo = {
  id: string;
  title: string;
  priority: Priority;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TodoActionState = {
  error: string;
  success: string;
};

const memoryTodos = new Map<string, Todo>();

declare global {
  var mongoClient: MongoClient | undefined;
}

async function getCollection() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;

  if (!global.mongoClient) {
    global.mongoClient = new MongoClient(uri);
  }
  await global.mongoClient.connect();

  return global.mongoClient
    .db(process.env.MONGODB_DB ?? "next_js_course")
    .collection<{
      title: string;
      priority: Priority;
      completed: boolean;
      createdAt: Date;
      updatedAt: Date;
    }>("todos");
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function getTodos(
  search = "",
  status: "all" | "active" | "completed" = "all",
): Promise<Todo[]> {
  const collection = await getCollection();
  let todos: Todo[];

  if (collection) {
    const filter: Filter<{
      title: string;
      priority: Priority;
      completed: boolean;
      createdAt: Date;
      updatedAt: Date;
    }> = {};

    if (search.trim()) {
      filter.title = { $regex: escapeRegex(search.trim()), $options: "i" };
    }
    if (status === "active") filter.completed = false;
    if (status === "completed") filter.completed = true;

    const documents = await collection.find(filter).toArray();
    todos = documents.map((todo) => ({
      id: todo._id.toHexString(),
      title: todo.title,
      priority: todo.priority,
      completed: todo.completed,
      createdAt: todo.createdAt.toISOString(),
      updatedAt: todo.updatedAt.toISOString(),
    }));
  } else {
    todos = Array.from(memoryTodos.values()).filter((todo) => {
      const matchesSearch =
        !search.trim() ||
        todo.title.toLowerCase().includes(search.trim().toLowerCase());
      const matchesStatus =
        status === "all" ||
        (status === "completed" ? todo.completed : !todo.completed);
      return matchesSearch && matchesStatus;
    });
  }

  const priorityRank: Record<Priority, number> = {
    high: 0,
    medium: 1,
    low: 2,
  };

  return todos.sort(
    (a, b) =>
      priorityRank[a.priority] - priorityRank[b.priority] ||
      b.createdAt.localeCompare(a.createdAt),
  );
}

export async function createTodoAction(
  _previousState: TodoActionState,
  formData: FormData,
): Promise<TodoActionState> {
  const title = formData.get("title");
  const priority = formData.get("priority");

  if (
    typeof title !== "string" ||
    !title.trim() ||
    (priority !== "low" && priority !== "medium" && priority !== "high")
  ) {
    return { error: "Enter a title and choose a valid priority.", success: "" };
  }

  const now = new Date();
  const collection = await getCollection();

  if (collection) {
    await collection.insertOne({
      title: title.trim(),
      priority,
      completed: false,
      createdAt: now,
      updatedAt: now,
    });
  } else {
    const todo: Todo = {
      id: crypto.randomUUID(),
      title: title.trim(),
      priority,
      completed: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    memoryTodos.set(todo.id, todo);
  }

  revalidatePath("/todos");
  return { error: "", success: "Todo created." };
}

export async function toggleTodoAction(id: string) {
  const now = new Date();
  const collection = await getCollection();

  if (collection) {
    if (!ObjectId.isValid(id)) return;
    const todo = await collection.findOne({ _id: new ObjectId(id) });
    if (!todo) return;
    await collection.updateOne(
      { _id: todo._id },
      { $set: { completed: !todo.completed, updatedAt: now } },
    );
  } else {
    const todo = memoryTodos.get(id);
    if (todo) {
      todo.completed = !todo.completed;
      todo.updatedAt = now.toISOString();
    }
  }

  revalidatePath("/todos");
}

export async function deleteTodoAction(id: string) {
  const collection = await getCollection();

  if (collection) {
    if (ObjectId.isValid(id)) {
      await collection.deleteOne({ _id: new ObjectId(id) });
    }
  } else {
    memoryTodos.delete(id);
  }

  revalidatePath("/todos");
}

export async function bulkUpdateAction(ids: string[], completed: boolean) {
  if (ids.length === 0) return;
  const now = new Date();
  const collection = await getCollection();

  if (collection) {
    const validIds = ids.filter(ObjectId.isValid).map((id) => new ObjectId(id));
    await collection.updateMany(
      { _id: { $in: validIds } },
      { $set: { completed, updatedAt: now } },
    );
  } else {
    ids.forEach((id) => {
      const todo = memoryTodos.get(id);
      if (todo) {
        todo.completed = completed;
        todo.updatedAt = now.toISOString();
      }
    });
  }

  revalidatePath("/todos");
}

export async function bulkDeleteAction(ids: string[]) {
  if (ids.length === 0) return;
  const collection = await getCollection();

  if (collection) {
    const validIds = ids.filter(ObjectId.isValid).map((id) => new ObjectId(id));
    await collection.deleteMany({ _id: { $in: validIds } });
  } else {
    ids.forEach((id) => memoryTodos.delete(id));
  }

  revalidatePath("/todos");
}

export async function searchTodosAction(formData: FormData) {
  const search = String(formData.get("search") ?? "").trim();
  const status = String(formData.get("status") ?? "all");
  const safeStatus =
    status === "active" || status === "completed" ? status : "all";

  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (safeStatus !== "all") params.set("status", safeStatus);

  redirect(`/todos${params.size ? `?${params.toString()}` : ""}`);
}
