"use client";

import { useActionState, useEffect, useState } from "react";
import {
  bulkDeleteAction,
  bulkUpdateAction,
  createTodoAction,
  deleteTodoAction,
  searchTodosAction,
  toggleTodoAction,
  type Todo,
  type TodoActionState,
} from "./actions";

const initialState: TodoActionState = { error: "", success: "" };

function relativeTime(isoDate: string) {
  const seconds = Math.round(
    (new Date(isoDate).getTime() - Date.now()) / 1000,
  );
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "always" });
  const ranges = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
    ["second", 1],
  ] as const;

  for (const [unit, secondsInUnit] of ranges) {
    if (Math.abs(seconds) >= secondsInUnit) {
      return formatter.format(
        Math.round(seconds / secondsInUnit),
        unit,
      );
    }
  }
  return "just now";
}

export default function TodoApp({
  todos,
  initialSearch,
  initialStatus,
}: {
  todos: Todo[];
  initialSearch: string;
  initialStatus: "all" | "active" | "completed";
}) {
  const [state, formAction, isPending] = useActionState(
    createTodoAction,
    initialState,
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [, refreshRelativeTimes] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(
      () => refreshRelativeTimes((value) => value + 1),
      60_000,
    );
    return () => window.clearInterval(interval);
  }, []);

  function toggleSelected(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    );
  }

  return (
    <main className="todo-app">
      <header className="todo-header">
        <p className="todo-eyebrow">Personal workspace</p>
        <h1>Todo List</h1>
      </header>

      <form action={formAction} className="todo-create-form">
        <input
          name="title"
          required
          placeholder="What needs to be done?"
          className="todo-title-input"
        />
        <select name="priority" defaultValue="medium" className="todo-select">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button
          type="submit"
          disabled={isPending}
          className="todo-primary-button"
        >
          {isPending ? "Adding..." : "Add"}
        </button>
      </form>

      {state.error && <p role="alert" className="todo-feedback todo-error">{state.error}</p>}
      {state.success && <p role="status" className="todo-feedback todo-success">{state.success}</p>}

      <form action={searchTodosAction} className="todo-filter-form">
        <input
          name="search"
          defaultValue={initialSearch}
          placeholder="Search todos"
          className="todo-search-input"
        />
        <select
          name="status"
          defaultValue={initialStatus}
          className="todo-select"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
        <button type="submit" className="todo-secondary-button">Search</button>
      </form>

      {selected.length > 0 && (
        <div className="todo-bulk-actions">
          <button
            type="button"
            onClick={() => bulkUpdateAction(selected, true)}
            className="todo-secondary-button"
          >
            Mark complete
          </button>
          <button
            type="button"
            onClick={() => bulkUpdateAction(selected, false)}
            className="todo-secondary-button"
          >
            Mark incomplete
          </button>
          <button
            type="button"
            onClick={() => bulkDeleteAction(selected)}
            className="todo-danger-button"
          >
            Delete
          </button>
        </div>
      )}

      <ul className="todo-list">
        {todos.map((todo) => (
          <li key={todo.id} className={`todo-item ${todo.completed ? "todo-item-completed" : ""}`}>
            <input
              type="checkbox"
              checked={selected.includes(todo.id)}
              onChange={() => toggleSelected(todo.id)}
              aria-label={`Select ${todo.title}`}
              className="todo-checkbox"
            />
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodoAction(todo.id)}
              aria-label={`Toggle ${todo.title}`}
              className="todo-complete-checkbox"
            />
            <div className="todo-content">
              <p className="todo-title">
                {todo.title}
              </p>
              <p className="todo-meta">
                {todo.priority} priority · created {relativeTime(todo.createdAt)}
                {todo.updatedAt !== todo.createdAt &&
                  ` · updated ${relativeTime(todo.updatedAt)}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => deleteTodoAction(todo.id)}
              className="todo-delete-button"
              aria-label={`Delete ${todo.title}`}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {todos.length === 0 && (
        <p className="todo-empty">No todos found.</p>
      )}
    </main>
  );
}
