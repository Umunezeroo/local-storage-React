import { useEffect, useMemo, useState } from "react";
import {
  createAssignments,
  downloadCsv,
  getStudents,
  getTables,
  saveStudents,
  saveTables,
} from "../data/storage.js";

function TablesPage() {
  const [tables, setTables] = useState(() => getTables());
  const [students, setStudents] = useState(() => getStudents());
  const [tableNumber, setTableNumber] = useState("");
  const [capacity, setCapacity] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const updateStudents = () => setStudents(getStudents());
    const updateTables = () => setTables(getTables());
    window.addEventListener("studentsUpdated", updateStudents);
    window.addEventListener("tablesUpdated", updateTables);
    const updateFromStorage = () => {
      updateStudents();
      updateTables();
    };
    window.addEventListener("storage", updateFromStorage);
    return () => {
      window.removeEventListener("studentsUpdated", updateStudents);
      window.removeEventListener("tablesUpdated", updateTables);
      window.removeEventListener("storage", updateFromStorage);
    };
  }, []);

  const tableCounts = useMemo(
    () => new Map(tables.map((table) => [
      table.id,
      students.filter((student) => student.tableId === table.id).length,
    ])),
    [students, tables]
  );
  const totalSeats = tables.reduce((sum, table) => sum + table.capacity, 0);
  const assignedCount = students.filter((student) => student.tableId != null).length;
  const unassignedCount = students.length - assignedCount;
  const shortage = Math.max(0, students.length - totalSeats);
  const filteredTables = tables.filter((table) =>
    table.tableNumber.toLowerCase().includes(search.toLowerCase().trim())
  );
  const unassigned = students.filter((student) => student.tableId == null);

  function updateTables(updated) {
    setTables(updated);
    saveTables(updated);
  }

  function updateStudents(updated) {
    setStudents(updated);
    saveStudents(updated);
  }

  function resetForm() {
    setTableNumber("");
    setCapacity("");
    setEditingId(null);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const number = tableNumber.trim();
    const seats = Number(capacity);
    if (!number || !Number.isInteger(seats) || seats < 1) {
      setMessage("Enter a table name and a whole-number capacity of at least 1.");
      return;
    }
    if (tables.some((table) => table.tableNumber.toLowerCase() === number.toLowerCase() && table.id !== editingId)) {
      setMessage("That table name already exists.");
      return;
    }
    if (editingId !== null && seats < (tableCounts.get(editingId) ?? 0)) {
      setMessage(`This table already has ${tableCounts.get(editingId)} assigned student(s). Move students before lowering its capacity.`);
      return;
    }
    const updated = editingId === null
      ? [...tables, { id: Date.now(), tableNumber: number, capacity: seats }]
      : tables.map((table) => table.id === editingId ? { ...table, tableNumber: number, capacity: seats } : table);
    updateTables(updated);
    resetForm();
    setMessage(editingId === null ? "Table added." : "Table updated.");
  }

  function deleteTable(table) {
    if (!window.confirm(`Remove ${table.tableNumber}? Students at this table will become unassigned.`)) return;
    updateTables(tables.filter((item) => item.id !== table.id));
    updateStudents(students.map((student) => student.tableId === table.id ? { ...student, tableId: null } : student));
    if (editingId === table.id) resetForm();
    setMessage(`${table.tableNumber} removed; its students are unassigned.`);
  }

  function assignAutomatically() {
    if (tables.length === 0) {
      setMessage("Add at least one table before assigning students.");
      return;
    }
    updateStudents(createAssignments(students, tables));
    setMessage(`Assignments updated. ${Math.max(0, students.length - totalSeats)} student(s) remain unassigned if seats are insufficient.`);
  }

  function reassignStudent(student, value) {
    const nextTableId = value === "" ? null : Number(value);
    if (nextTableId !== null) {
      const table = tables.find((item) => item.id === nextTableId);
      const currentCount = tableCounts.get(nextTableId) ?? 0;
      if (!table || (currentCount >= table.capacity && student.tableId !== nextTableId)) {
        setMessage("That table is full. Increase its capacity or choose another table.");
        return;
      }
    }
    updateStudents(students.map((item) => item.id === student.id ? { ...item, tableId: nextTableId } : item));
    setMessage(`${student.fullName}'s assignment updated.`);
  }

  function exportAssignments() {
    const rows = [["Table", "Student name", "Gender", "Trade", "Level"]];
    for (const table of tables) {
      for (const student of students.filter((item) => item.tableId === table.id)) {
        rows.push([table.tableNumber, student.fullName, student.gender, student.trade, student.level]);
      }
    }
    for (const student of unassigned) rows.push(["Unassigned", student.fullName, student.gender, student.trade, student.level]);
    downloadCsv("refectory-table-assignments.csv", rows);
  }

  return (
    <section className="page-stack">
      <div className="page-intro">
        <div><p className="eyebrow">REFECTORY SEATING</p><h2>Table management</h2><p>Set capacities, balance the roster, and review or adjust every assignment.</p></div>
        <div className="intro-actions">
          <button className="button button-secondary" type="button" onClick={exportAssignments}>Export report</button>
          <button className="button button-primary" type="button" onClick={() => window.print()}>Print / Save PDF</button>
        </div>
      </div>

      <section className="stat-grid" aria-label="Seating totals">
        <article className="stat-card"><span>Dining tables</span><strong>{tables.length}</strong></article>
        <article className="stat-card"><span>Total seats</span><strong>{totalSeats}</strong></article>
        <article className="stat-card"><span>Students assigned</span><strong>{assignedCount}<small> / {students.length}</small></strong></article>
        <article className={`stat-card ${shortage ? "stat-warning" : ""}`}><span>Unassigned students</span><strong>{unassignedCount}</strong></article>
      </section>

      <section className={`capacity-alert ${shortage ? "capacity-shortage" : "capacity-sufficient"}`} role="status">
        <span className="alert-dot" />
        <div><strong>{shortage ? "Not enough seats for everyone" : "Seating capacity is sufficient"}</strong><p>{shortage ? `Add at least ${shortage} seat(s) to accommodate the full roster.` : `${totalSeats - students.length} seat(s) available across all tables.`}</p></div>
      </section>

      <section className="panel">
        <div className="section-heading"><div><p className="eyebrow">CONFIGURATION</p><h3>{editingId === null ? "Add a dining table" : "Edit dining table"}</h3></div></div>
        <form className="student-form" onSubmit={handleSubmit}>
          <label className="field"><span>Table name / number</span><input value={tableNumber} onChange={(event) => setTableNumber(event.target.value)} placeholder="e.g. North Hall 1" required maxLength={40} /></label>
          <label className="field"><span>Seat capacity</span><input type="number" min="1" step="1" value={capacity} onChange={(event) => setCapacity(event.target.value)} placeholder="e.g. 8" required /></label>
          <div className="form-actions"><button className="button button-primary" type="submit">{editingId === null ? "Add table" : "Save table"}</button>{editingId !== null && <button className="button button-quiet" type="button" onClick={resetForm}>Cancel</button>}</div>
        </form>
        {message && <p className="notice" role="status">{message}</p>}
      </section>

      <section className="panel">
        <div className="section-heading list-heading"><div><p className="eyebrow">SEATING PLAN</p><h3>Tables and occupancy</h3></div><div className="list-tools"><input className="search-input" type="search" placeholder="Search tables..." aria-label="Search tables" value={search} onChange={(event) => setSearch(event.target.value)} /><button className="button button-secondary" type="button" onClick={assignAutomatically}>Auto-assign students</button></div></div>
        <div className="table-grid">{filteredTables.map((table) => {
          const count = tableCounts.get(table.id) ?? 0;
          const members = students.filter((student) => student.tableId === table.id);
          return <article className="dining-table" key={table.id}>
            <div className="table-card-top"><div><span className="table-icon">T</span><div><h4>{table.tableNumber}</h4><p>{count} of {table.capacity} seats used</p></div></div><div className="actions"><button className="button button-quiet" type="button" onClick={() => { setTableNumber(table.tableNumber); setCapacity(String(table.capacity)); setEditingId(table.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Edit</button><button className="button button-danger" type="button" onClick={() => deleteTable(table)}>Remove</button></div></div>
            <div className="capacity-track"><span style={{ width: `${Math.min(100, table.capacity ? count / table.capacity * 100 : 0)}%` }} /></div>
            <p className="member-label">ASSIGNED STUDENTS</p>
            {members.length ? <ul className="member-list">{members.map((student) => <li key={student.id}><span>{student.fullName}</span><span>{student.gender} · {student.level} · {student.trade}</span></li>)}</ul> : <p className="muted-copy">No students assigned yet.</p>}
          </article>;
        })}{filteredTables.length === 0 && <p className="empty-state">{tables.length ? "No tables match your search." : "Add a dining table to start planning."}</p>}</div>
      </section>

      <section className="panel">
        <div className="section-heading"><div><p className="eyebrow">MANUAL ADJUSTMENTS</p><h3>Student assignments <span className="count-pill">{students.length}</span></h3></div></div>
        <div className="table-wrapper"><table><thead><tr><th>Student</th><th>Gender</th><th>Trade</th><th>Level</th><th>Assigned table</th></tr></thead><tbody>
          {students.map((student) => <tr key={student.id}><td className="student-name">{student.fullName}</td><td>{student.gender}</td><td>{student.trade}</td><td>{student.level}</td><td><select className="assignment-select" aria-label={`Assign table for ${student.fullName}`} value={student.tableId ?? ""} onChange={(event) => reassignStudent(student, event.target.value)}><option value="">Unassigned</option>{tables.map((table) => { const full = (tableCounts.get(table.id) ?? 0) >= table.capacity && student.tableId !== table.id; return <option key={table.id} value={table.id} disabled={full}>{table.tableNumber}{full ? " (Full)" : ""}</option>; })}</select></td></tr>)}
          {students.length === 0 && <tr><td className="empty-state" colSpan="5">Add students before creating table assignments.</td></tr>}
        </tbody></table></div>
        {unassignedCount > 0 && <p className="warning-copy">{unassignedCount} student(s) are currently unassigned. Increase table capacity or assign a free seat.</p>}
      </section>
    </section>
  );
}

export default TablesPage;
