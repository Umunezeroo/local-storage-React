import { useRef, useState } from "react";
import { changeAdminCredentials, MIN_PASSWORD_LENGTH } from "../data/adminAuth.js";
import {
  processAdminProfilePicture,
  removeAdminProfilePicture,
  saveAdminProfilePicture,
} from "../data/adminProfile.js";

function AdminSettings({ username, profilePicture, onCredentialsChanged, onProfilePictureChanged }) {
  const pictureInput = useRef(null);
  const [pictureMessage, setPictureMessage] = useState("");
  const [isProcessingPicture, setIsProcessingPicture] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newUsername, setNewUsername] = useState(username);
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handlePictureChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setPictureMessage("");
    setIsProcessingPicture(true);
    try {
      const picture = await processAdminProfilePicture(file);
      saveAdminProfilePicture(picture);
      onProfilePictureChanged(picture);
      setPictureMessage("Profile picture updated.");
    } catch (error) {
      setPictureMessage(error instanceof Error ? error.message : "Unable to update profile picture.");
    } finally {
      setIsProcessingPicture(false);
    }
  }

  function handlePictureRemoval() {
    setPictureMessage("");
    try {
      removeAdminProfilePicture();
      onProfilePictureChanged("");
      setPictureMessage("Profile picture removed.");
    } catch (error) {
      setPictureMessage(error instanceof Error ? error.message : "Unable to remove profile picture.");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setIsError(false);
    if (newPassword !== confirmation) {
      setMessage("New passwords do not match.");
      setIsError(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedUsername = await changeAdminCredentials(
        currentPassword,
        newUsername,
        newPassword
      );
      onCredentialsChanged(updatedUsername);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmation("");
      setMessage("Administrator credentials updated.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update administrator credentials.");
      setIsError(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-stack">
      <section className="page-intro">
        <div>
          <p className="eyebrow">ACCOUNT SECURITY</p>
          <h2>Administrator credentials</h2>
          <p>Update the username and password used to sign in to this workspace.</p>
        </div>
      </section>

      <section className="panel settings-panel profile-picture-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">PROFILE</p>
            <h3>Profile picture</h3>
          </div>
        </div>
        <div className="profile-picture-controls">
          <div className="profile-picture-preview" aria-label={`${username} profile picture`}>
            {profilePicture
              ? <img src={profilePicture} alt="" />
              : <span aria-hidden="true">{username.charAt(0).toUpperCase()}</span>}
          </div>
          <div className="profile-picture-actions">
            <p className="muted-copy">Choose a JPEG, PNG, or WebP image. It will be resized for local storage.</p>
            <div className="intro-actions">
              <button
                className="button button-secondary"
                disabled={isProcessingPicture}
                onClick={() => pictureInput.current?.click()}
                type="button"
              >
                {isProcessingPicture ? "Processing…" : "Change picture"}
              </button>
              {profilePicture && (
                <button className="button button-quiet" onClick={handlePictureRemoval} type="button">
                  Remove picture
                </button>
              )}
            </div>
            <input
              ref={pictureInput}
              accept="image/jpeg,image/png,image/webp"
              className="visually-hidden"
              onChange={handlePictureChange}
              type="file"
            />
            {pictureMessage && <p className="auth-message" role="status">{pictureMessage}</p>}
          </div>
        </div>
      </section>

      <section className="panel settings-panel">
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field">
            Current password
            <input
              autoComplete="current-password"
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
              type="password"
              value={currentPassword}
            />
          </label>
          <label className="field">
            New username
            <input
              autoComplete="username"
              maxLength={32}
              minLength={3}
              onChange={(event) => setNewUsername(event.target.value)}
              pattern={"[A-Za-z0-9._\\-]{3,32}"}
              required
              value={newUsername}
            />
          </label>
          <label className="field">
            New password
            <input
              autoComplete="new-password"
              minLength={MIN_PASSWORD_LENGTH}
              onChange={(event) => setNewPassword(event.target.value)}
              required
              type="password"
              value={newPassword}
            />
          </label>
          <label className="field">
            Confirm new password
            <input
              autoComplete="new-password"
              minLength={MIN_PASSWORD_LENGTH}
              onChange={(event) => setConfirmation(event.target.value)}
              required
              type="password"
              value={confirmation}
            />
          </label>

          {message && (
            <p className={`auth-message${isError ? " auth-message-error" : ""}`} role={isError ? "alert" : "status"}>
              {message}
            </p>
          )}
          <div className="form-actions">
            <button className="button button-primary" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Saving…" : "Save credentials"}
            </button>
          </div>
        </form>
        <p className="helper-text">
          Choose a password with at least {MIN_PASSWORD_LENGTH} characters. Your password is stored
          as a salted hash, not as plain text.
        </p>
      </section>
    </div>
  );
}

export default AdminSettings;
