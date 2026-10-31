export const STUDENTS_KEY = "schoolStudents";
export const TABLES_KEY = "refectoryTables";
export const TABLE_LIMIT_KEY = "refectoryTableLimit";

export function getTableLimit() {
  const saved = window.localStorage.getItem(TABLE_LIMIT_KEY);
  if (saved === null) return null;

  const limit = Number(saved);
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error("Saved refectory table limit is invalid. Please correct it before adding tables.");
  }
  return limit;
}

export function saveTableLimit(limit) {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error("Available table count must be a whole number of at least 1.");
  }
  const tables = getTables();
  if (limit < tables.length) {
    throw new Error(`The available table count cannot be less than the ${tables.length} tables already configured.`);
  }
  window.localStorage.setItem(TABLE_LIMIT_KEY, String(limit));
  window.dispatchEvent(new Event("tableLimitUpdated"));
}

function readArray(key, fallback) {
  const saved = window.localStorage.getItem(key);
  if (saved === null) return fallback;

  const parsed = JSON.parse(saved);
  if (!Array.isArray(parsed)) {
    throw new Error(`Saved ${key} data is invalid. Please clear or restore it.`);
  }
  return parsed;
}

export function getStudents() {
  return readArray(STUDENTS_KEY, []);
}

export function saveStudents(students) {
  window.localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
  window.dispatchEvent(new Event("studentsUpdated"));
}

export function getTables() {
  return readArray(TABLES_KEY, []);
}

export function saveTables(tables) {
  window.localStorage.setItem(TABLES_KEY, JSON.stringify(tables));
  window.dispatchEvent(new Event("tablesUpdated"));
}

export function createAssignments(students, tables) {
  const assignedCounts = new Map(tables.map((table) => [table.id, 0]));
  const categoryCounts = new Map(tables.map((table) => [table.id, new Map()]));
  const results = new Map();
  const dimensions = ["gender", "trade", "level"];

  const orderedStudents = [...students].sort((a, b) => {
    const keyA = `${a.gender}|${a.trade}|${a.level}`;
    const keyB = `${b.gender}|${b.trade}|${b.level}`;
    return keyA.localeCompare(keyB) || a.fullName.localeCompare(b.fullName);
  });

  for (const student of orderedStudents) {
    const availableTables = tables.filter(
      (table) => (assignedCounts.get(table.id) ?? 0) < table.capacity
    );
    if (availableTables.length === 0) continue;

    const leastAssigned = Math.min(...availableTables.map((table) => assignedCounts.get(table.id) ?? 0));
    const leastFilledTables = availableTables.filter(
      (table) => (assignedCounts.get(table.id) ?? 0) === leastAssigned
    );
    const chosen = leastFilledTables.reduce((best, table) => {
      const categoryPenalty = (candidate) => {
        const groups = categoryCounts.get(candidate.id);
        return dimensions.reduce(
          (total, dimension) =>
            total + (groups.get(`${dimension}:${student[dimension]}`) ?? 0),
          0
        );
      };
      return categoryPenalty(table) < categoryPenalty(best) ? table : best;
    });

    results.set(student.id, chosen.id);
    assignedCounts.set(chosen.id, (assignedCounts.get(chosen.id) ?? 0) + 1);
    const groups = categoryCounts.get(chosen.id);
    for (const dimension of dimensions) {
      const key = `${dimension}:${student[dimension]}`;
      groups.set(key, (groups.get(key) ?? 0) + 1);
    }
  }

  return students.map((student) => ({
    ...student,
    tableId: results.get(student.id) ?? null,
  }));
}

export function downloadCsv(filename, rows) {
  const escapeCell = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const csv = rows.map((row) => row.map(escapeCell).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
