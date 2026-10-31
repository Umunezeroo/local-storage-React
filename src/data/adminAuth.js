export const ADMIN_CREDENTIALS_KEY = "tableMateAdminCredentials";
export const MIN_PASSWORD_LENGTH = 12;

const PBKDF2_ITERATIONS = 310_000;
const USERNAME_PATTERN = /^[a-zA-Z0-9._-]{3,32}$/;

function getCrypto() {
  if (!globalThis.crypto?.subtle || !globalThis.crypto?.getRandomValues) {
    throw new Error("Secure password hashing is unavailable in this browser. Use HTTPS or localhost.");
  }
  return globalThis.crypto;
}

function normalizeUsername(username) {
  return username.trim().toLowerCase();
}

function validateCredentials(username, password) {
  if (!USERNAME_PATTERN.test(username.trim())) {
    throw new Error("Username must be 3–32 characters using letters, numbers, dots, underscores, or hyphens.");
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
}

function toHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function fromHex(value) {
  if (typeof value !== "string" || !/^(?:[a-f0-9]{2})+$/i.test(value)) {
    throw new Error("Saved administrator credentials are invalid.");
  }
  return Uint8Array.from(value.match(/.{2}/g), (byte) => Number.parseInt(byte, 16));
}

async function hashPassword(password, salt, iterations = PBKDF2_ITERATIONS) {
  const crypto = getCrypto();
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    key,
    256
  );
  return new Uint8Array(bits);
}

function readCredentials() {
  const saved = window.localStorage.getItem(ADMIN_CREDENTIALS_KEY);
  if (saved === null) return null;

  let credentials;
  try {
    credentials = JSON.parse(saved);
  } catch {
    throw new Error("Saved administrator credentials are invalid.");
  }
  if (
    credentials?.version !== 1 ||
    typeof credentials.username !== "string" ||
    !USERNAME_PATTERN.test(credentials.username) ||
    !Number.isInteger(credentials.iterations) ||
    credentials.iterations < 100_000 ||
    credentials.iterations > 1_000_000 ||
    typeof credentials.salt !== "string" ||
    !/^[a-f0-9]{32}$/i.test(credentials.salt) ||
    typeof credentials.passwordHash !== "string" ||
    !/^[a-f0-9]{64}$/i.test(credentials.passwordHash)
  ) {
    throw new Error("Saved administrator credentials are invalid.");
  }
  fromHex(credentials.salt);
  fromHex(credentials.passwordHash);
  return credentials;
}

async function createCredentialRecord(username, password) {
  validateCredentials(username, password);
  const salt = getCrypto().getRandomValues(new Uint8Array(16));
  const passwordHash = await hashPassword(password, salt);
  return {
    version: 1,
    username: normalizeUsername(username),
    salt: toHex(salt),
    passwordHash: toHex(passwordHash),
    iterations: PBKDF2_ITERATIONS,
  };
}

async function passwordMatches(password, credentials) {
  const actual = await hashPassword(password, fromHex(credentials.salt), credentials.iterations);
  const expected = fromHex(credentials.passwordHash);
  if (actual.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < actual.length; index += 1) {
    difference |= actual[index] ^ expected[index];
  }
  return difference === 0;
}

export function hasAdminAccount() {
  return readCredentials() !== null;
}

export async function createAdminAccount(username, password) {
  if (readCredentials() !== null) {
    throw new Error("An administrator account already exists.");
  }
  const credentials = await createCredentialRecord(username, password);
  if (readCredentials() !== null) {
    throw new Error("An administrator account already exists.");
  }
  window.localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify(credentials));
  return credentials.username;
}

export async function verifyAdminLogin(username, password) {
  const credentials = readCredentials();
  if (credentials === null) return false;
  const passwordIsValid = await passwordMatches(password, credentials);
  return normalizeUsername(username) === credentials.username && passwordIsValid;
}

export async function changeAdminCredentials(currentPassword, username, newPassword) {
  const credentials = readCredentials();
  if (credentials === null) {
    throw new Error("No administrator account is set up.");
  }
  if (!(await passwordMatches(currentPassword, credentials))) {
    throw new Error("Current password is incorrect.");
  }
  const updated = await createCredentialRecord(username, newPassword);
  window.localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify(updated));
  return updated.username;
}
