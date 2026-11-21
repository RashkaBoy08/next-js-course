import TodoApp from "./TodoApp";
import { getTodos } from "./actions";

type Props = {
  searchParams: Promise<{
    search?: string;
    status?: string;
  }>;
};

export default async function TodosPage({ searchParams }: Props) {
  const params = await searchParams;
  const status =
    params.status === "active" || params.status === "completed"
      ? params.status
      : "all";
  const search = params.search ?? "";
  const todos = await getTodos(search, status);

  return (
    <TodoApp
      todos={todos}
      initialSearch={search}
      initialStatus={status}
    />
  );
}
