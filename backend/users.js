import { readFileSync, writeFileSync, existsSync } from 'fs';

const DB_FILE = './users.json';

function readUsers() {
  if (!existsSync(DB_FILE)) return [];
  try { return JSON.parse(readFileSync(DB_FILE, 'utf8')); }
  catch { return []; }
}

function writeUsers(users) {
  writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
}

export function findUserByEmail(email) {
  return readUsers().find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export function findUserById(id) {
  return readUsers().find(u => u.id === id) || null;
}

export function createUser({ email, passwordHash = null, name, googleId = null, avatar = null }) {
  const users = readUsers();
  const newUser = {
    id: Date.now().toString(),
    email: email.toLowerCase(),
    name,
    passwordHash,
    googleId,
    avatar,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  writeUsers(users);
  return { id: newUser.id, email: newUser.email, name: newUser.name, avatar: newUser.avatar };
}

export function findOrCreateGoogleUser({ googleId, email, name, avatar }) {
  const users = readUsers();
  let user = users.find(u => u.googleId === googleId || u.email.toLowerCase() === email.toLowerCase());
  if (user) {
    // Update google fields if missing
    if (!user.googleId) { user.googleId = googleId; user.avatar = avatar; writeUsers(users); }
    return { id: user.id, email: user.email, name: user.name, avatar: user.avatar };
  }
  return createUser({ email, name, googleId, avatar });
}