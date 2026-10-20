
import { useLocation } from 'react-router-dom';

function Header() {
  const location = useLocation();

  const title =
    location.pathname === '/students'
      ? 'Student Management'
      : 'Dashboard Overview';

  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        <p>Welcome to your school management system.</p>
      </div>

      <div className="profile">
        <div className="avatar">A</div>
        <span>Administrator</span>
      </div>
    </header>
  );
}

export default Header;
