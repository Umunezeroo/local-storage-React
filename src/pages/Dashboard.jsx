
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getStudents, getTables } from "../data/storage.js";

function Dashboard() {
  const [students, setStudents] = useState(() => getStudents());
  const [tables, setTables] = useState(() => getTables());

  useEffect(() => {
    const update = () => {
      setStudents(getStudents());
      setTables(getTables());
    };
    window.addEventListener("studentsUpdated", update);
    window.addEventListener("tablesUpdated", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("studentsUpdated", update);
      window.removeEventListener("tablesUpdated", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const seats = tables.reduce((total, table) => total + table.capacity, 0);
  const assigned = students.filter((student) => student.tableId != null).length;
  const unassigned = students.length - assigned;

  return (
    <section className="page-stack">
      <div className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">SCHOOL REFECTORY</p>
          <h2>Every student has a place at the table.</h2>
          <p>Keep class lists organized, balance seating, and make changes from one simple workspace.</p>
          <div className="intro-actions">
            <Link to="/tables" className="button button-primary">Plan table seating</Link>
            <Link to="/students" className="button button-secondary">Manage students</Link>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true"><div className="plate"><span>✦</span></div></div>
      </div>
      <section className="stat-grid" aria-label="School dining overview">
        <article className="stat-card"><span>Registered students</span><strong>{students.length}</strong><p>In the local student roster</p></article>
        <article className="stat-card"><span>Dining tables</span><strong>{tables.length}</strong><p>{seats} seats in total</p></article>
        <article className={`stat-card ${unassigned ? "stat-warning" : ""}`}><span>Awaiting a seat</span><strong>{unassigned}</strong><p>{assigned} students currently assigned</p></article>
      </section>
      <section className="panel dashboard-next">
        <div><p className="eyebrow">GET STARTED</p><h3>Your daily workflow</h3></div>
        <div className="workflow-grid">
          <Link to="/students" className="workflow-card"><span className="step-number">01</span><div><h4>Import or manage students</h4><p>Upload a class CSV, register students, or update their details.</p></div><span className="workflow-arrow">→</span></Link>
          <Link to="/tables" className="workflow-card"><span className="step-number">02</span><div><h4>Configure tables and seating</h4><p>Set capacities, balance assignments, and move students when needed.</p></div><span className="workflow-arrow">→</span></Link>
          <Link to="/tables" className="workflow-card"><span className="step-number">03</span><div><h4>Share the seating plan</h4><p>Print or save a PDF, or export the assignment list as CSV.</p></div><span className="workflow-arrow">→</span></Link>
        </div>
      </section>
    </section>
  );
}

export default Dashboard;
