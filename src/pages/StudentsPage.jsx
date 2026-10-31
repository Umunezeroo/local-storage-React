import { useEffect, useRef, useState } from "react";
import {
  downloadCsv,
  createAssignments,
  getStudents,
  getTables,
  saveStudents,
} from "../data/storage.js";

const emptyForm = { fullName: "", gender: "", trade: "", level: "" };

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"' && quoted && text[index + 1] === '"') {
      cell += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(cell.trim());
      cell = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function StudentsPage() {
  const [students, setStudents] = useState(() => getStudents());
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const fileInput = useRef(null);

  useEffect(() => {
    const update = () => setStudents(getStudents());
    window.addEventListener("studentsUpdated", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("studentsUpdated", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  function updateStudents(nextStudents) {
    const balancedStudents = createAssignments(nextStudents, getTables());
    setStudents(balancedStudents);
    saveStudents(balancedStudents);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const fullName = form.fullName.trim().replace(/\s+/g, " ");
    const duplicate = students.some(
      (student) =>
        student.fullName.toLowerCase() === fullName.toLowerCase() &&
        student.trade === form.trade &&
        student.level === form.level &&
        student.id !== editingId
    );
    if (duplicate) {
      setMessage("This student already exists in the same trade and level.");
      return;
    }

    const updated = editingId === null
      ? [...students, { id: Date.now(), ...form, fullName, tableId: null }]
      : students.map((student) =>
          student.id === editingId
            ? { ...student, ...form, fullName, tableId: student.tableId ?? null }
            : student
        );
    updateStudents(updated);
    setForm(emptyForm);
    setEditingId(null);
    setMessage(editingId === null ? "Student registered." : "Student updated.");
  }

  function editStudent(student) {
    setForm({
      fullName: student.fullName,
      gender: student.gender,
      trade: student.trade,
      level: student.level,
    });
    setEditingId(student.id);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteStudent(student) {
    if (!window.confirm(`Remove ${student.fullName} from the student list?`)) return;
    updateStudents(students.filter((item) => item.id !== student.id));
    if (editingId === student.id) {
      setForm(emptyForm);
      setEditingId(null);
    }
    setMessage("Student removed.");
  }

  async function importStudents(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const rows = parseCsv(await file.text());
      if (rows.length < 2) throw new Error("The CSV must include a header and at least one student.");
      const headers = rows[0].map((header) => header.toLowerCase().replace(/[^a-z]/g, ""));
      const findColumn = (...names) => headers.findIndex((header) => names.includes(header));
      const columns = {
        fullName: findColumn("fullname", "name", "studentname"),
        gender: findColumn("gender"),
        trade: findColumn("trade"),
        level: findColumn("level", "class"),
      };
      if (Object.values(columns).some((index) => index < 0)) {
        throw new Error("CSV headers must include Name, Gender, Trade, and Level.");
      }
      const imported = rows.slice(1).map((values, index) => {
        const student = Object.fromEntries(
          Object.entries(columns).map(([key, column]) => [key, (values[column] ?? "").trim()])
        );
        if (Object.values(student).some((value) => !value)) {
          throw new Error(`Row ${index + 2} is missing a required student field.`);
        }
        if (!["male", "female"].includes(student.gender.toLowerCase())) {
          throw new Error(`Row ${index + 2} has an invalid gender (use Male or Female).`);
        }
        student.gender = student.gender[0].toUpperCase() + student.gender.slice(1).toLowerCase();
        student.id = Date.now() + index;
        student.tableId = null;
        return student;
      });
      updateStudents([...students, ...imported]);
      setMessage(`${imported.length} student(s) imported. Review records before assigning tables.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to import this CSV file.");
    } finally {
      event.target.value = "";
    }
  }

  const filteredStudents = students.filter((student) =>
    [student.fullName, student.gender, student.trade, student.level]
      .some((value) => value?.toLowerCase().includes(search.toLowerCase().trim()))
  );
  const trades = new Set(students.map((student) => student.trade)).size;
  const levels = new Set(students.map((student) => student.level)).size;

  return (
    <section className="page-stack">
      <div className="page-intro">
        <div>
          <p className="eyebrow">STUDENT DIRECTORY</p>
          <h2>Manage student records</h2>
          <p>Add students one at a time or import a class list from a CSV file.</p>
        </div>
        <button className="button button-secondary" onClick={() => fileInput.current?.click()}>
          Import class list
        </button>
        <input ref={fileInput} className="visually-hidden" type="file" accept=".csv,text/csv" onChange={importStudents} />
      </div>

      <section className="stat-grid" aria-label="Student totals">
        <article className="stat-card"><span>Registered students</span><strong>{students.length}</strong></article>
        <article className="stat-card"><span>Trades represented</span><strong>{trades}</strong></article>
        <article className="stat-card"><span>Levels represented</span><strong>{levels}</strong></article>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div><p className="eyebrow">{editingId === null ? "NEW RECORD" : "UPDATE RECORD"}</p><h3>{editingId === null ? "Register a student" : "Edit student"}</h3></div>
          {editingId !== null && <button className="button button-quiet" type="button" onClick={() => { setForm(emptyForm); setEditingId(null); setMessage(""); }}>Cancel edit</button>}
        </div>
        <form className="student-form" onSubmit={handleSubmit}>
          <label className="field"><span>Full name</span><input name="fullName" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} required maxLength={100} placeholder="e.g. Aline Uwase" /></label>
          <label className="field"><span>Gender</span><select name="gender" value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value })} required><option value="">Select gender</option><option>Female</option><option>Male</option></select></label>
          <label className="field"><span>Trade</span><input name="trade" value={form.trade} onChange={(event) => setForm({ ...form, trade: event.target.value })} required maxLength={40} placeholder="e.g. SOD" /></label>
          <label className="field"><span>Level / class</span><input name="level" value={form.level} onChange={(event) => setForm({ ...form, level: event.target.value })} required maxLength={40} placeholder="e.g. Level 4" /></label>
          <div className="form-actions"><button className="button button-primary" type="submit">{editingId === null ? "Add student" : "Save changes"}</button></div>
        </form>
        {message && <p className="notice" role="status">{message}</p>}
      </section>

      <section className="panel">
        <div className="section-heading list-heading">
          <div><p className="eyebrow">ROSTER</p><h3>Student list <span className="count-pill">{filteredStudents.length}</span></h3></div>
          <div className="list-tools">
            <input className="search-input" type="search" placeholder="Search name, trade, level..." value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search students" />
            <button className="button button-quiet" type="button" onClick={() => downloadCsv("student-roster.csv", [["Name", "Gender", "Trade", "Level"], ...filteredStudents.map(({ fullName, gender, trade, level }) => [fullName, gender, trade, level])])}>Export CSV</button>
          </div>
        </div>
        <div className="table-wrapper"><table>
          <thead><tr><th>Student</th><th>Gender</th><th>Trade</th><th>Level / class</th><th>Actions</th></tr></thead>
          <tbody>{filteredStudents.map((student) => <tr key={student.id}>
            <td className="student-name">{student.fullName}</td><td>{student.gender}</td><td><span className="tag">{student.trade}</span></td><td>{student.level}</td>
            <td><div className="actions"><button className="button button-quiet" type="button" onClick={() => editStudent(student)}>Edit</button><button className="button button-danger" type="button" onClick={() => deleteStudent(student)}>Remove</button></div></td>
          </tr>)}
          {filteredStudents.length === 0 && <tr><td colSpan="5" className="empty-state">{students.length === 0 ? "No students yet. Register a student or import a class list." : "No students match your search."}</td></tr>}</tbody>
        </table></div>
        <p className="helper-text">CSV import headers: Name, Gender, Trade, Level. Data is saved in this browser.</p>
      </section>
    </section>
  );
}

export default StudentsPage;
