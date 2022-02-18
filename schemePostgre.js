import { Client } from "https://deno.land/x/postgres@v0.11.3/mod.ts";

const client = new Client("postgres://localhost:5432/users");
await client.connect();

await client.queryArray(`
    CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    encrypted_password TEXT NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
)`);

await client.queryArray(`
    CREATE TABLE sessions (
    uuid TEXT PRIMARY KEY NOT NULL,
    created_at timestamp with time zone NOT NULL,
    user_id INTEGER NOT NULL
  )`);

await userDatabase.end();
