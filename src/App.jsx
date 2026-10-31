import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import Header from "./components/Header.jsx";
import AdminAccess from "./pages/AdminAccess.jsx";
import AdminSettings from "./pages/AdminSettings.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import StudentsPage from "./pages/StudentsPage.jsx";
import TablesPage from "./pages/TablesPage.jsx";
import { ADMIN_CREDENTIALS_KEY, hasAdminAccount } from "./data/adminAuth.js";
import { ADMIN_PROFILE_PICTURE_KEY, getAdminProfilePicture } from "./data/adminProfile.js";
import "./App.css";

function Layout({ username, profilePicture, onLogout, onCredentialsChanged, onProfilePictureChanged }) {
  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Header username={username} profilePicture={profilePicture} onLogout={onLogout} />

        <div className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/tables" element={<TablesPage />} />
            <Route
              path="/settings"
              element={
                <AdminSettings
                  username={username}
                  profilePicture={profilePicture}
                  onCredentialsChanged={onCredentialsChanged}
                  onProfilePictureChanged={onProfilePictureChanged}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function AppAccess() {
  const [authState, setAuthState] = useState(() => {
    try {
      return {
        mode: hasAdminAccount() ? "login" : "setup",
        errorMessage: "",
        profilePicture: getAdminProfilePicture(),
      };
    } catch (error) {
      return {
        mode: "error",
        errorMessage: error instanceof Error ? error.message : "Unable to read administrator credentials.",
        profilePicture: "",
      };
    }
  });
  const [username, setUsername] = useState("");
  const [profilePicture, setProfilePicture] = useState(authState.profilePicture);
  const { mode, errorMessage } = authState;

  useEffect(() => {
    function handleCredentialChange(event) {
      if (event.key === ADMIN_PROFILE_PICTURE_KEY) {
        try {
          setProfilePicture(getAdminProfilePicture());
        } catch (error) {
          setAuthState({
            mode: "error",
            errorMessage: error instanceof Error
              ? error.message
              : "Unable to read the administrator profile picture.",
            profilePicture: "",
          });
        }
      } else if (event.key === ADMIN_CREDENTIALS_KEY) {
        setUsername("");
        try {
          setAuthState({
            mode: hasAdminAccount() ? "login" : "setup",
            errorMessage: "",
          });
        } catch (error) {
          setAuthState({
            mode: "error",
            errorMessage: error instanceof Error
              ? error.message
              : "Unable to read administrator credentials.",
          });
        }
      }
    }
    window.addEventListener("storage", handleCredentialChange);
    return () => window.removeEventListener("storage", handleCredentialChange);
  }, []);

  if (mode === "checking") return <main className="auth-shell" aria-busy="true" />;
  if (mode === "error") {
    return (
      <main className="auth-shell">
        <section className="auth-panel" role="alert">
          <h1 className="brand auth-brand">Table<span>Mate</span></h1>
          <h2>Administrator access unavailable</h2>
          <p className="auth-description">{errorMessage}</p>
        </section>
      </main>
    );
  }
  if (mode !== "authenticated") {
    return <AdminAccess mode={mode} onAuthenticated={(signedInUsername) => {
      setUsername(signedInUsername);
      setAuthState({ mode: "authenticated", errorMessage: "" });
    }} />;
  }
  return (
    <Layout
      username={username}
      profilePicture={profilePicture}
      onLogout={() => {
        setUsername("");
        setAuthState({ mode: "login", errorMessage: "" });
      }}
      onCredentialsChanged={setUsername}
      onProfilePictureChanged={setProfilePicture}
    />
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppAccess />
    </BrowserRouter>
  );
}

export default App;
