export const TASK_STATUSES = new Set(["TODO", "IN_PROGRESS", "DONE"]);

export function parseOptionalDueDate(value: unknown): Date | null | undefined {
  if (value === null || value === "" || (typeof value === "string" && value.trim() === "")) {
    return null;
  }
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return undefined;
  }

  return date;
}
