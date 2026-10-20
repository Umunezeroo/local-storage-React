



import { useEffect, useState } from 'react';
import '../App.css';

const sampleStudents = [
  {
    id: 1,
    fullName: 'Jean Claude',
    gender: 'Male',
    trade: 'SOD',
    level: 'Level 4',
  },
  {
    id: 2,
    fullName: 'Alice Uwase',
    gender: 'Female',
    trade: 'BDC',
    level: 'Level 3',
  },
];

const emptyForm = {
  fullName: '',
  gender: '',
  trade: '',
  level: '',
};

function StudentsPage() {
  const [students, setStudents] = useState(sampleStudents);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  // Update the form when the user types or selects an option
  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  }

  // Add a new student or update an existing student
  function handleSubmit(event) {
    event.preventDefault();

    const fullName = form.fullName.trim().replace(/\s+/g, ' ');

    if (!fullName) {
      setMessage('Please enter the student full name.');
      return;
    }

    // Prevent duplicate names in the same trade and level
    const duplicate = students.some((student) => {
      const sameName =
        student.fullName.toLowerCase() === fullName.toLowerCase();

      const sameTrade = student.trade === form.trade;
      const sameLevel = student.level === form.level;
      const differentStudent = student.id !== editingId;

      return (
        sameName &&
        sameTrade &&
        sameLevel &&
        differentStudent
      );
    });

    if (duplicate) {
      setMessage(
        'This student already exists in the same trade and level.'
      );
      return;
    }

    const studentData = {
      ...form,
      fullName,
    };

    if (editingId !== null) {
      setStudents((previousStudents) =>
        previousStudents.map((student) =>
          student.id === editingId
            ? { ...student, ...studentData }
            : student
        )
      );

      setMessage('Student updated successfully!');
    } else {
      const newStudent = {
        id: Date.now(),
        ...studentData,
      };

      setStudents((previousStudents) => [
        ...previousStudents,
        newStudent,
      ]);

      setMessage('Student registered successfully!');
    }

    setForm(emptyForm);
    setEditingId(null);
  }

  // Load a student's information into the form
  function handleEdit(student) {
    setForm({
      fullName: student.fullName,
      gender: student.gender,
      trade: student.trade,
      level: student.level,
    });

    setEditingId(student.id);
    setMessage('');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Delete a student after confirmation
  function handleDelete(id) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this student?'
    );

    if (!confirmed) return;

    setStudents((previousStudents) =>
      previousStudents.filter((student) => student.id !== id)
    );

    if (editingId === id) {
      setForm(emptyForm);
      setEditingId(null);
    }

    setMessage('Student deleted successfully!');
  }

  function handleCancel() {
    setForm(emptyForm);
    setEditingId(null);
    setMessage('');
  }

  // Search all student fields
  const filteredStudents = students.filter((student) =>
    [
      student.fullName,
      student.gender,
      student.trade,
      student.level,
    ].some((value) =>
      value.toLowerCase().includes(search.toLowerCase().trim())
    )
  );

  return (
    <main className="app">
      <header className="topbar">
        <div>
          <h1>Student Management</h1>
          <p>School Registration Dashboard</p>
        </div>

        <span className="school-badge">SMS</span>
      </header>

      <section className="dashboard">
        <div className="stat-card">
          <span>Total Registered Students</span>
          <strong>{students.length}</strong>
        </div>

        <div className="stat-card">
          <span>Trades Offered</span>
          <strong>4</strong>
        </div>

        <div className="stat-card">
          <span>Levels Available</span>
          <strong>3</strong>
        </div>
      </section>

      <section className="panel">
        <h2>
          {editingId !== null
            ? 'Edit Student'
            : 'Register New Student'}
        </h2>

        <form onSubmit={handleSubmit} className="student-form">
          <div className="field">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Enter full name"
              value={form.fullName}
              onChange={handleChange}
              required
              maxLength={100}
            />
          </div>

          <div className="field">
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              name="gender"
              value={form.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="trade">Trade</label>
            <select
              id="trade"
              name="trade"
              value={form.trade}
              onChange={handleChange}
              required
            >
              <option value="">Select trade</option>
              <option value="SOD">SOD</option>
              <option value="BDC">BDC</option>
              <option value="FAD">FAD</option>
              <option value="WOT">WOT</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="level">Level</label>
            <select
              id="level"
              name="level"
              value={form.level}
              onChange={handleChange}
              required
            >
              <option value="">Select level</option>
              <option value="Level 3">Level 3</option>
              <option value="Level 4">Level 4</option>
              <option value="Level 5">Level 5</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="primary-btn">
              {editingId !== null
                ? 'Save Changes'
                : 'Register Student'}
            </button>

            {editingId !== null && (
              <button
                type="button"
                className="secondary-btn"
                onClick={handleCancel}
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
          <div>
            <h2>Registered Students</h2>
            <p>{filteredStudents.length} student(s) displayed</p>
          </div>

          <input
            className="search-input"
            type="search"
            placeholder="Search students..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search students"
          />
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Full Name</th>
                <th>Gender</th>
                <th>Trade</th>
                <th>Level</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, index) => (
                  <tr key={student.id}>
                    <td>{index + 1}</td>
                    <td>{student.fullName}</td>
                    <td>{student.gender}</td>
                    <td>
                      <span className="tag">{student.trade}</span>
                    </td>
                    <td>{student.level}</td>
                    <td className="actions">
                      <button
                        type="button"
                        className="edit-btn"
                        onClick={() => handleEdit(student)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => handleDelete(student.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-state">
                    No students found. Try another search or register
                    a new student.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <footer>
        Student Management System · React Practice Project
      </footer>
    </main>
  );
}

export default StudentsPage;


