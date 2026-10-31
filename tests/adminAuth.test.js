import test from "node:test";
import assert from "node:assert/strict";
import {
  ADMIN_CREDENTIALS_KEY,
  changeAdminCredentials,
  createAdminAccount,
  hasAdminAccount,
  verifyAdminLogin,
} from "../src/data/adminAuth.js";

test("admin credentials are hashed, verified, and changeable with the current password", async () => {
  const originalWindow = globalThis.window;
  const entries = new Map();
  globalThis.window = {
    localStorage: {
      getItem: (key) => entries.get(key) ?? null,
      setItem: (key, value) => entries.set(key, value),
    },
  };

  try {
    assert.equal(hasAdminAccount(), false);
    assert.equal(await createAdminAccount("SchoolAdmin", "correct-horse-battery-staple"), "schooladmin");
    assert.equal(hasAdminAccount(), true);

    const storedCredentials = entries.get(ADMIN_CREDENTIALS_KEY);
    assert.equal(storedCredentials.includes("correct-horse-battery-staple"), false);
    await assert.rejects(
      createAdminAccount("secondadmin", "another-secure-password"),
      /An administrator account already exists/
    );
    assert.equal(JSON.parse(entries.get(ADMIN_CREDENTIALS_KEY)).username, "schooladmin");
    assert.equal(await verifyAdminLogin("SCHOOLADMIN", "correct-horse-battery-staple"), true);
    assert.equal(await verifyAdminLogin("schooladmin", "incorrect-password"), false);
    assert.equal(await verifyAdminLogin("another-admin", "correct-horse-battery-staple"), false);

    await assert.rejects(
      changeAdminCredentials("incorrect-password", "newadmin", "a-new-secure-password"),
      /Current password is incorrect/
    );
    assert.equal(
      await changeAdminCredentials("correct-horse-battery-staple", "newadmin", "a-new-secure-password"),
      "newadmin"
    );
    assert.equal(await verifyAdminLogin("schooladmin", "correct-horse-battery-staple"), false);
    assert.equal(await verifyAdminLogin("newadmin", "a-new-secure-password"), true);
  } finally {
    if (originalWindow === undefined) {
      delete globalThis.window;
    } else {
      globalThis.window = originalWindow;
    }
  }
});
