
import { useLocation } from 'react-router-dom';

function Header() {
  const location = useLocation();

  const page = {
    "/": ["Dashboard", "A clear view of your school dining arrangements."],
    "/students": ["Student records", "Manage the roster used for refectory seating."],
    "/tables": ["Tables & seating", "Configure dining capacity and student assignments."],
  }[location.pathname] ?? ["School refectory", "Manage your school dining arrangements."];

  return (
    <header className="page-header">
      <div>
        <h1>{page[0]}</h1>
        <p>{page[1]}</p>
      </div>

      <div className="profile">
        <div className="avatar" aria-hidden="true">A</div>
        <span>Administrator</span>
      </div>
    </header>
  );
}

export default Header;
