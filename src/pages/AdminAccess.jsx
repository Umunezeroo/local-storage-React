import { useState } from "react";
import {
  createAdminAccount,
  MIN_PASSWORD_LENGTH,
  verifyAdminLogin,
} from "../data/adminAuth.js";

function AdminAccess({ mode, onAuthenticated, errorMessage = "" }) {
  const isSetup = mode === "setup";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(errorMessage);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);
    try {
      const signedInUsername = isSetup
        ? await createAdminAccount(username, password)
        : (await verifyAdminLogin(username, password))
          ? username.trim().toLowerCase()
          : null;
      if (signedInUsername === null) {
        setMessage("Username or password is incorrect.");
        return;
      }
      onAuthenticated(signedInUsername);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to authenticate administrator.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel" aria-labelledby="auth-title">
        <h1 className="brand auth-brand">Table<span>Mate</span></h1>
        <p className="eyebrow">{isSetup ? "SECURE YOUR WORKSPACE" : "ADMINISTRATOR ACCESS"}</p>
        <h2 id="auth-title">{isSetup ? "Create your admin account" : "Sign in to TableMate"}</h2>
        <p className="auth-description">
          {isSetup
            ? "Set up the administrator account used to access this refectory workspace."
            : "Enter your administrator credentials to continue."}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field">
            Username
            <input
              autoComplete="username"
              maxLength={32}
              minLength={3}
              onChange={(event) => setUsername(event.target.value)}
              pattern={"[A-Za-z0-9._\\-]{3,32}"}
              required
              value={username}
            />
          </label>
          <label className="field">
            Password
            <input
              autoComplete={isSetup ? "new-password" : "current-password"}
              minLength={isSetup ? MIN_PASSWORD_LENGTH : undefined}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>
          {message && <p className="auth-message" role="alert">{message}</p>}
          <button className="button button-primary auth-submit" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Please wait…" : isSetup ? "Create admin account" : "Sign in"}
          </button>
        </form>

        {isSetup && (
          <p className="auth-footnote">
            Use 3–32 letters, numbers, dots, underscores, or hyphens for the username, and a
            password with at least {MIN_PASSWORD_LENGTH} characters.
          </p>
        )}
      </section>
    </main>
  );
}

export default AdminAccess;
