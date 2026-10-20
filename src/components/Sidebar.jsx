
import { NavLink } from 'react-router-dom';

function Sidebar() {
  return (
    <aside className="sidebar">
      <h2 className="brand">School<span>SMS</span></h2>

      <p className="menu-label">MAIN MENU</p>

      <nav className="navigation">
        <NavLink to="/" end className={({ isActive }) =>
          isActive ? 'nav-link active' : 'nav-link'
        }>
          <span>▦</span> Dashboard
        </NavLink>

        <NavLink to="/students" className={({ isActive }) =>
          isActive ? 'nav-link active' : 'nav-link'
        }>
          <span>♙</span> Students
        </NavLink>
<NavLink to="/tables" className="nav-link">
  Table Management
</NavLink>
        <NavLink to="/students" className="nav-link">
          <span>＋</span> Register Student
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        Student Management System
      </div>
    </aside>
  );
}

export default Sidebar;
