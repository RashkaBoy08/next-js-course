"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

type Draft = {
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string;
};

const columns: { status: TaskStatus; label: string; note: string }[] = [
  { status: "TODO", label: "To do", note: "A good place to start" },
  { status: "IN_PROGRESS", label: "In progress", note: "Keep the momentum" },
  { status: "DONE", label: "Done", note: "Look what you did" },
];

const emptyDraft: Draft = { title: "", description: "", status: "TODO", dueDate: "" };

function formatDate(value: string) {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  const date = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(value);
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}

function isPastDue(value: string) {
  const due = new Date(value);
  const today = new Date();
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return due < today;
}

export function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  async function loadTasks() {
    setIsLoading(true);
    setLoadError("");
    try {
      const response = await fetch("/api/tasks", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "I couldn't load your tasks.");
      setTasks(data.tasks);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "I couldn't load your tasks.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadTasks();
  }, []);

  const matchingTasks = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return tasks;
    return tasks.filter((task) => `${task.title} ${task.description}`.toLowerCase().includes(needle));
  }, [search, tasks]);

  const finishedCount = tasks.filter((task) => task.status === "DONE").length;
  const openCount = tasks.length - finishedCount;
  const completion = tasks.length ? Math.round((finishedCount / tasks.length) * 100) : 0;

  function startCreate() {
    setEditingId(null);
    setDraft(emptyDraft);
    setIsModalOpen(true);
  }

  function startEdit(task: Task) {
    setEditingId(task.id);
    setDraft({
      title: task.title,
      description: task.description,
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
    });
    setIsModalOpen(true);
  }

  async function saveTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setNotice("");
    try {
      const response = await fetch(editingId ? `/api/tasks/${editingId}` : "/api/tasks", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, dueDate: draft.dueDate || null }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Your task could not be saved.");
      setIsModalOpen(false);
      setDraft(emptyDraft);
      setEditingId(null);
      setNotice(editingId ? "Task updated. Nice work." : "Task added. One step closer.");
      await loadTasks();
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Your task could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  async function moveTask(taskId: string, status: TaskStatus) {
    const task = tasks.find((item) => item.id === taskId);
    if (!task || task.status === status) return;
    const oldTasks = tasks;
    setTasks(tasks.map((item) => item.id === taskId ? { ...item, status } : item));
    setNotice("");
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The task could not be moved.");
      setNotice(`Moved to ${columns.find((column) => column.status === status)?.label}.`);
    } catch (error) {
      setTasks(oldTasks);
      setLoadError(error instanceof Error ? error.message : "The task could not be moved.");
    }
  }

  async function deleteTask(task: Task) {
    if (!window.confirm(`Delete “${task.title}”?`)) return;
    const oldTasks = tasks;
    setTasks(tasks.filter((item) => item.id !== task.id));
    try {
      const response = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The task could not be deleted.");
      setNotice("Task deleted.");
    } catch (error) {
      setTasks(oldTasks);
      setLoadError(error instanceof Error ? error.message : "The task could not be deleted.");
    }
  }

  return (
    <section className="task-workspace" aria-label="Your task board">
      <div className="stats-row">
        <div className="stat-card stat-card-focus"><span className="stat-label">IN YOUR FLOW</span><div className="stat-value-row"><strong>{openCount}</strong><span>tasks to go</span><span className="stat-star" aria-hidden="true">✳</span></div><div className="stat-progress"><span style={{ width: `${completion}%` }} /></div><small>{tasks.length ? `${completion}% of your list is done` : "Your first task starts here"}</small></div>
        <div className="stat-card"><span className="stat-label">COMPLETED</span><div className="stat-value-row"><strong>{finishedCount}</strong><span>{finishedCount === 1 ? "task" : "tasks"} finished</span><span className="stat-icon stat-icon-green" aria-hidden="true">✓</span></div><small>Every finished task counts.</small></div>
        <div className="stat-card stat-card-note"><span className="stat-note-mark" aria-hidden="true">✦</span><p>Progress is progress, <em>no matter the pace.</em></p><span className="note-squiggle" aria-hidden="true">〰</span></div>
      </div>

      <div className="board-toolbar">
        <div><h2>Your board <span className="task-total">{tasks.length}</span></h2><p>Drag a task into the next column as you go.</p></div>
        <div className="toolbar-actions"><label className="search-box"><span aria-hidden="true">⌕</span><input aria-label="Search tasks" placeholder="Find a task..." value={search} onChange={(event) => setSearch(event.target.value)} /></label><button className="button button-dark add-task-button" onClick={startCreate}><span aria-hidden="true">＋</span> Add a task</button></div>
      </div>

      {notice && <p className="notice-message" role="status"><span aria-hidden="true">✓</span> {notice}<button aria-label="Dismiss message" onClick={() => setNotice("")}>×</button></p>}
      {loadError && <div className="error-message" role="alert"><span>{loadError}</span><button onClick={() => void loadTasks()}>Try again</button><button className="dismiss-error" aria-label="Dismiss error" onClick={() => setLoadError("")}>×</button></div>}

      {isLoading ? (
        <div className="board-columns loading-columns" aria-label="Loading tasks"><div /><div /><div /></div>
      ) : (
        <div className="board-columns">
          {columns.map((column) => {
            const columnTasks = matchingTasks.filter((task) => task.status === column.status);
            return (
              <section className={`board-column column-${column.status.toLowerCase().replace("_", "-")}`} key={column.status} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const id = event.dataTransfer.getData("text/plain") || draggingId; if (id) void moveTask(id, column.status); setDraggingId(null); }} aria-label={`${column.label} tasks`}>
                <div className="column-heading"><div><span className={`column-dot dot-${column.status.toLowerCase().replace("_", "-")}`} /><h3>{column.label}</h3><span className="column-count">{columnTasks.length}</span></div><span className="column-note">{column.note}</span></div>
                <div className="column-task-list">
                  {columnTasks.map((task) => (
                    <article className="task-card" key={task.id} draggable onDragStart={(event) => { setDraggingId(task.id); event.dataTransfer.setData("text/plain", task.id); event.dataTransfer.effectAllowed = "move"; }} onDragEnd={() => setDraggingId(null)}>
                      <div className="task-card-kicker"><span className="task-type-mark" aria-hidden="true">{column.status === "DONE" ? "✓" : "↗"}</span><span>{column.status === "DONE" ? "WRAPPED UP" : "PERSONAL TASK"}</span><div className="task-actions"><button aria-label={`Edit ${task.title}`} title="Edit task" onClick={() => startEdit(task)}>✎</button><button aria-label={`Delete ${task.title}`} title="Delete task" onClick={() => void deleteTask(task)}>×</button></div></div>
                      <h4>{task.title}</h4>
                      {task.description && <p className="task-description">{task.description}</p>}
                      <div className="task-card-bottom">
                        {task.dueDate ? <span className={`due-date ${isPastDue(task.dueDate) && task.status !== "DONE" ? "due-date-late" : ""}`}><span aria-hidden="true">◷</span>{formatDate(task.dueDate)}</span> : <span className="due-date no-date">No due date</span>}
                        <label className="move-select-label"><span className="sr-only">Move {task.title}</span><select value={task.status} onChange={(event) => void moveTask(task.id, event.target.value as TaskStatus)}><option value="TODO">To do</option><option value="IN_PROGRESS">In progress</option><option value="DONE">Done</option></select></label>
                      </div>
                    </article>
                  ))}
                  {columnTasks.length === 0 && <button className="empty-column" onClick={column.status === "TODO" ? startCreate : undefined} onDragOver={(event) => event.preventDefault()}>{search ? "No matching tasks here" : column.status === "TODO" ? <><span>＋</span> Add the first task</> : <>Drop a task here<br /><small>{column.note}</small></>}</button>}
                </div>
                {column.status === "TODO" && <button className="column-add" onClick={startCreate}>＋ Add a task</button>}
              </section>
            );
          })}
        </div>
      )}

      {!isLoading && tasks.length === 0 && !search && <div className="first-task-tip"><span className="tip-spark" aria-hidden="true">✳</span><span><strong>Start with one small thing.</strong><small>Big plans feel easier once the first step is on the board.</small></span><button onClick={startCreate}>Write it down ↗</button></div>}

      {isModalOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !isSaving) setIsModalOpen(false); }}>
          <section className="task-modal" role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
            <button className="modal-close" aria-label="Close form" onClick={() => setIsModalOpen(false)} disabled={isSaving}>×</button>
            <span className="eyebrow"><span className="eyebrow-dot" /> TAKE THE NEXT STEP</span>
            <h2 id="task-modal-title">{editingId ? "Shape this task." : "What’s on your mind?"}</h2>
            <p className="modal-lede">Keep it simple. You can change it as you go.</p>
            <form onSubmit={saveTask}>
              <label className="form-label">Task name<input autoFocus maxLength={100} required placeholder="e.g. Finish my science notes" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label>
              <label className="form-label">A little more detail <span className="optional-label">OPTIONAL</span><textarea maxLength={500} rows={3} placeholder="What would help you remember?" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></label>
              <div className="form-split"><label className="form-label">Status<select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as TaskStatus })}><option value="TODO">To do</option><option value="IN_PROGRESS">In progress</option><option value="DONE">Done</option></select></label><label className="form-label">Due date <span className="optional-label">OPTIONAL</span><input type="date" value={draft.dueDate} onChange={(event) => setDraft({ ...draft, dueDate: event.target.value })} /></label></div>
              <div className="modal-actions"><button className="button button-quiet" type="button" onClick={() => setIsModalOpen(false)} disabled={isSaving}>Cancel</button><button className="button button-dark" type="submit" disabled={isSaving}>{isSaving ? "Saving..." : editingId ? "Save changes" : "Add to my board"} <span aria-hidden="true">↗</span></button></div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
