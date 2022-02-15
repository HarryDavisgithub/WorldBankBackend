import { DB } from "https://deno.land/x/sqlite/mod.ts";

try {
  await Deno.remove("users.db");
} catch {
  // nothing to remove
}

const db = new DB("./users.db");

await db.query(
  `CREATE TABLE users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    encrypted_password TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    admin BOOLEAN
  )`
);

await db.query(
  `CREATE TABLE sessions (
    uuid TEXT PRIMARY KEY,
    created_at DATETIME NOT NULL,
    user_id INTEGER
  )`
);
