import test from "node:test";
import assert from "node:assert/strict";
import {
  ADMIN_PROFILE_PICTURE_KEY,
  getAdminProfilePicture,
  processAdminProfilePicture,
  removeAdminProfilePicture,
  saveAdminProfilePicture,
} from "../src/data/adminProfile.js";

test("admin profile pictures can be saved, read, and removed", () => {
  const originalWindow = globalThis.window;
  const entries = new Map();
  globalThis.window = {
    localStorage: {
      getItem: (key) => entries.get(key) ?? null,
      setItem: (key, value) => entries.set(key, value),
      removeItem: (key) => entries.delete(key),
    },
  };

  try {
    assert.equal(getAdminProfilePicture(), "");
    const picture = "data:image/jpeg;base64,dGVzdA==";
    saveAdminProfilePicture(picture);
    assert.equal(entries.get(ADMIN_PROFILE_PICTURE_KEY), picture);
    assert.equal(getAdminProfilePicture(), picture);
    removeAdminProfilePicture();
    assert.equal(getAdminProfilePicture(), "");
  } finally {
    if (originalWindow === undefined) {
      delete globalThis.window;
    } else {
      globalThis.window = originalWindow;
    }
  }
});

test("profile picture storage rejects data that is not a JPEG data URL", () => {
  const originalWindow = globalThis.window;
  globalThis.window = { localStorage: { setItem() {} } };
  try {
    assert.throws(() => saveAdminProfilePicture("data:text/html,not-an-image"), /expected format/);
  } finally {
    if (originalWindow === undefined) {
      delete globalThis.window;
    } else {
      globalThis.window = originalWindow;
    }
  }
});

test("profile picture processing rejects unsupported file types", async () => {
  await assert.rejects(
    processAdminProfilePicture({ type: "image/gif", size: 12 }),
    /Choose a JPEG, PNG, or WebP image/
  );
});
