
import { Link } from 'react-router-dom';

function Dashboard() {
  return (
    <section>
      <div className="welcome-card">
        <div>
          <h2>Welcome to your dashboard!</h2>
          <p>
            Manage student registration and records
            from one place.
          </p>
          <Link to="/students" className="dashboard-button">
            Manage Students
          </Link>
        </div>
        <div className="welcome-icon">🎓</div>
      </div>

      <div className="dashboard-cards">
        <article className="overview-card">
          <span>Total Students</span>
          <strong>2</strong>
          <p>Sample registered students</p>
        </article>

        <article className="overview-card">
          <span>Available Trades</span>
          <strong>4</strong>
          <p>SOD, BDC, FAD, WOT</p>
        </article>

        <article className="overview-card">
          <span>Available Levels</span>
          <strong>3</strong>
          <p>Levels 3, 4 and 5</p>
        </article>
      </div>

      <div className="overview-card quick-actions">
        <h2>Quick Actions</h2>
        <p>What would you like to do today?</p>
        <Link to="/students" className="action-link">
          View and manage student records →
        </Link>
      </div>
    </section>
  );
}

export default Dashboard;
