
import { useEffect, useState } from "react";
import "../App.css";

const initialTables = [
  { id: 1, tableNumber: "T-01", capacity: 8 },
  { id: 2, tableNumber: "T-02", capacity: 10 },
  { id: 3, tableNumber: "T-03", capacity: 8 },
];

function getSavedTables() {
  try {
    const saved = localStorage.getItem("refectoryTables");
    return saved ? JSON.parse(saved) : initialTables;
  } catch {
    return initialTables;
  }
}

function getStudentCount() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("schoolStudents") || "null"
    );

    return Array.isArray(saved) ? saved.length : 0;
  } catch {
    return 0;
  }
}

function TablesPage() {
  const [tables, setTables] = useState(getSavedTables);
  const [studentCount, setStudentCount] = useState(getStudentCount);
  const [tableNumber, setTableNumber] = useState("");
  const [capacity, setCapacity] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    localStorage.setItem("refectoryTables", JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    const updateStudents = () => {
      setStudentCount(getStudentCount());
    };

    window.addEventListener("studentsUpdated", updateStudents);
    window.addEventListener("storage", updateStudents);

    return () => {
      window.removeEventListener("studentsUpdated", updateStudents);
      window.removeEventListener("storage", updateStudents);
    };
  }, []);

  const totalSeats = tables.reduce(
    (total, table) => total + table.capacity,
    0
  );

  const availableSeats = Math.max(0, totalSeats - studentCount);
  const shortage = Math.max(0, studentCount - totalSeats);

  const filteredTables = tables.filter((table) =>
    table.tableNumber.toLowerCase().includes(search.toLowerCase())
  );

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
      setMessage("Enter a table number and a capacity of at least 1.");
      return;
    }

    const duplicate = tables.some(
      (table) =>
        table.tableNumber.toLowerCase() === number.toLowerCase() &&
        table.id !== editingId
    );

    if (duplicate) {
      setMessage("That table number already exists.");
      return;
    }

    if (editingId !== null) {
      setTables((previous) =>
        previous.map((table) =>
          table.id === editingId
            ? { ...table, tableNumber: number, capacity: seats }
            : table
        )
      );
      setMessage("Table updated successfully.");
    } else {
      setTables((previous) => [
        ...previous,
        {
          id: Date.now(),
          tableNumber: number,
          capacity: seats,
        },
      ]);
      setMessage("Table registered successfully.");
    }

    resetForm();
  }

  function editTable(table) {
    setTableNumber(table.tableNumber);
    setCapacity(String(table.capacity));
    setEditingId(table.id);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteTable(table) {
    if (
      window.confirm(
        `Are you sure you want to remove table ${table.tableNumber}?`
      )
    ) {
      setTables((previous) =>
        previous.filter((item) => item.id !== table.id)
      );

      if (editingId === table.id) {
        resetForm();
      }

      setMessage("Table removed successfully.");
    }
  }

  return (
    <div className="table-management-page">
      <section className="welcome-card">
        <h2>Refectory & Table Configuration</h2>
        <p>
          Manage dining tables and make sure every registered
          student has a seat during meal times.
        </p>
      </section>

      <section className="table-stats">
        <article className="table-stat-card">
          <span>Total tables</span>
          <strong>{tables.length}</strong>
        </article>

        <article className="table-stat-card">
          <span>Total seating capacity</span>
          <strong>{totalSeats}</strong>
        </article>

        <article className="table-stat-card">
          <span>Registered students</span>
          <strong>{studentCount}</strong>
        </article>

        <article className="table-stat-card">
          <span>Available seats</span>
          <strong>{availableSeats}</strong>
        </article>
      </section>

      <section
        className={`capacity-alert ${
          shortage > 0 ? "capacity-shortage" : "capacity-sufficient"
        }`}
      >
        <h3>
          {shortage > 0
            ? "Seating capacity shortage"
            : "Seating capacity is sufficient"}
        </h3>

        {shortage > 0 ? (
          <p>
            You need at least <strong>{shortage} more seats</strong>{" "}
            to accommodate all registered students.
          </p>
        ) : (
          <p>
            There are enough seats for all registered students.
            {availableSeats > 0 &&
              ` ${availableSeats} seat(s) remain available.`}
          </p>
        )}
      </section>

      <section className="panel">
        <h2>{editingId !== null ? "Edit Table" : "Register a Dining Table"}</h2>
        <p>Give each dining table a unique number and seating capacity.</p>

        <form className="student-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="tableNumber">Table number</label>
            <input
              id="tableNumber"
              type="text"
              placeholder="e.g. T-04"
              value={tableNumber}
              onChange={(event) => setTableNumber(event.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="capacity">Maximum seating capacity</label>
            <input
              id="capacity"
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 8"
              value={capacity}
              onChange={(event) => setCapacity(event.target.value)}
              required
            />
          </div>

          <div className="form-actions">
            <button className="primary-btn" type="submit">
              {editingId !== null ? "Save Changes" : "Add Table"}
            </button>

            {editingId !== null && (
              <button
                className="secondary-btn"
                type="button"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {message && (
          <p className="message" role="status">
            {message}
          </p>
        )}
      </section>

      <section className="panel">
        <div className="list-header">
          <h2>Registered Dining Tables</h2>

          <input
            className="search-input"
            type="search"
            placeholder="Search table number..."
            aria-label="Search tables by number"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Table number</th>
                <th>Capacity</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredTables.map((table) => (
                <tr key={table.id}>
                  <td>
                    <strong>{table.tableNumber}</strong>
                  </td>
                  <td>{table.capacity} seats</td>
                  <td>
                    <div className="actions">
                      <button
                        className="edit-btn"
                        type="button"
                        onClick={() => editTable(table)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-btn"
                        type="button"
                        onClick={() => deleteTable(table)}
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredTables.length === 0 && (
                <tr>
                  <td colSpan="3" className="empty-state">
                    No dining tables found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default TablesPage;
