import test from "node:test";
import assert from "node:assert/strict";
import { createAssignments } from "../src/data/storage.js";

test("assignments stay within capacity and report remaining students as unassigned", () => {
  const students = Array.from({ length: 8 }, (_, index) => ({
    id: index + 1,
    fullName: `Student ${index + 1}`,
    gender: index % 2 ? "Female" : "Male",
    trade: "SOD",
    level: "Level 4",
  }));
  const tables = [
    { id: 1, tableNumber: "A", capacity: 3 },
    { id: 2, tableNumber: "B", capacity: 3 },
  ];

  const assignments = createAssignments(students, tables);
  const counts = tables.map((table) =>
    assignments.filter((student) => student.tableId === table.id).length
  );

  assert.deepEqual(counts, [3, 3]);
  assert.equal(assignments.filter((student) => student.tableId == null).length, 2);
});

test("automatic assignment balances gender, trade, and level across equal tables", () => {
  const students = [];
  for (const gender of ["Female", "Male"]) {
    for (const trade of ["SOD", "BDC"]) {
      for (const level of ["Level 3", "Level 4"]) {
        for (let index = 0; index < 2; index += 1) {
          students.push({
            id: students.length + 1,
            fullName: `Student ${students.length + 1}`,
            gender,
            trade,
            level,
          });
        }
      }
    }
  }
  const tables = [
    { id: 1, tableNumber: "A", capacity: 8 },
    { id: 2, tableNumber: "B", capacity: 8 },
  ];

  const assignments = createAssignments(students, tables);
  for (const table of tables) {
    const members = assignments.filter((student) => student.tableId === table.id);
    assert.equal(members.length, 8);
    for (const dimension of ["gender", "trade", "level"]) {
      const categories = new Map();
      for (const student of members) {
        categories.set(student[dimension], (categories.get(student[dimension]) ?? 0) + 1);
      }
      assert.equal(Math.max(...categories.values()) - Math.min(...categories.values()), 0);
    }
  }
});

test("students remain unassigned if there are no tables", () => {
  const students = [{ id: 1, fullName: "A Student", gender: "Female", trade: "BDC", level: "Level 3" }];
  assert.deepEqual(createAssignments(students, []), [{ ...students[0], tableId: null }]);
});
