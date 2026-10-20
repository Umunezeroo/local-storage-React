import TablesPage from "./pages/TablesPage.jsx";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import StudentsPage from './pages/StudentsPage';

import './App.css';

function Layout() {
  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Header />

        <div className="page-content">
          <Routes>
            <Route
              path="/"
              element={<Dashboard />}
            />

            <Route
              path="/students"
              element={<StudentsPage />}
            />

            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />
            <Route path="/tables" 
            element={<TablesPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
import './App.css';

export default App;
