export const STUDENTS_KEY = "schoolStudents";
export const TABLES_KEY = "refectoryTables";

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

    const chosen = availableTables.reduce((best, table) => {
      const score = (candidate) => {
        const count = assignedCounts.get(candidate.id) ?? 0;
        const groups = categoryCounts.get(candidate.id);
        const categoryPenalty = dimensions.reduce(
          (total, dimension) =>
            total + (groups.get(`${dimension}:${student[dimension]}`) ?? 0),
          0
        );
        return count / candidate.capacity + categoryPenalty * 0.12;
      };
      return score(table) < score(best) ? table : best;
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
