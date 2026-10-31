
import { NavLink } from 'react-router-dom';

function Sidebar() {
  return (
    <aside className="sidebar">
      <h2 className="brand">Table<span>Mate</span></h2>

      <p className="menu-label">WORKSPACE</p>

      <nav className="navigation">
        <NavLink to="/" end className={({ isActive }) =>
          isActive ? 'nav-link active' : 'nav-link'
        }>
          <span aria-hidden="true">⌂</span> Dashboard
        </NavLink>

        <NavLink to="/students" className={({ isActive }) =>
          isActive ? 'nav-link active' : 'nav-link'
        }>
          <span aria-hidden="true">♙</span> Students
        </NavLink>
        <NavLink to="/tables" className={({ isActive }) =>
          isActive ? 'nav-link active' : 'nav-link'
        }>
          <span aria-hidden="true">▦</span> Tables & seating
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) =>
          isActive ? 'nav-link active' : 'nav-link'
        }>
          <span aria-hidden="true">⚙</span> Account
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        Local refectory workspace
      </div>
    </aside>
  );
}

export default Sidebar;
