import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { DB } from "https://deno.land/x/sqlite@v2.5.0/mod.ts";
import { existsSync } from "https://deno.land/std/fs/mod.ts";
import { test, TestSuite } from "https://deno.land/x/test_suite@0.9.5/mod.ts";
import { sleep } from "https://deno.land/x/sleep/mod.ts";

const dbName = "users.db";
let db = undefined;
let server = undefined;

const path =
  import.meta.url
    .replace("file://" + Deno.cwd() + "/", "")
    .replace("userServer.test.js", "") + "schema.js";

async function setupServer() {
  const server = await Deno.run({
    cmd: [
      "deno",
      "run",
      "--unstable",
      "--allow-all",
      "--allow-net",
      "--allow-read",
      "--allow-write",
      "--quiet",
      path,
      "--quiet",
    ],
  });
  await sleep(2.5);
  return server;
}

const suite = new TestSuite({
  name: "Test on users db",
  async beforeEach(context) {
    server = await setupServer();
    db = new DB(dbName);
  },
  async afterEach() {
    if (db) {
      await db.close();
      db = undefined;
    }

    if (server) {
      await server.close();
      server = undefined;
    }

    if (existsSync(dbName)) {
      await Deno.remove(dbName);
    }
  },
});

test(suite, "Users table was created", async (context) => {
  const result = [
    ...db
      .query("SELECT name FROM sqlite_master WHERE type='table'")
      .asObjects(),
  ];

  assertEquals(result[0].name, "users");
});

test(suite, "Sessions table was created", async (context) => {
  const result = [
    ...db
      .query("SELECT name FROM sqlite_master WHERE type='table'")
      .asObjects(),
  ];

  assertEquals(result[2].name, "sessions");
});

test(
  suite,
  "users table has been created with correct columns",
  async (context) => {
    let correctColumnCount = 0;
    const correctColumns = [
      { name: "id", type: "INTEGER", notnull: 0 },
      { name: "email", type: "TEXT", notnull: 1 },
      { name: "encrypted_password", type: "TEXT", notnull: 1 },
      { name: "created_at", type: "DATETIME", notnull: 1 },
      { name: "updated_at", type: "DATETIME", notnull: 1 },
      { name: "admin", type: "BOOLEAN", notnull: 0 },
    ];

    const result = [...db.query("PRAGMA table_info(users);").asObjects()];
    result.forEach((column) => {
      correctColumns.forEach((correctColumn) => {
        if (column.name === correctColumn.name) {
          correctColumnCount++;
          assertEquals(column.type, correctColumn.type);
          assertEquals(column.notnull, correctColumn.notnull);
        }
      });
    });
    assertEquals(correctColumnCount, correctColumns.length);
  }
);

test(
  suite,
  "sessions table has been created with correct columns",
  async (context) => {
    let correctColumnCount = 0;
    const correctColumns = [
      { name: "uuid", type: "TEXT", notnull: 0 },
      { name: "created_at", type: "DATETIME", notnull: 1 },
      { name: "user_id", type: "INTEGER", notnull: 0 },
    ];

    const result = [...db.query("PRAGMA table_info(sessions);").asObjects()];
    result.forEach((column) => {
      correctColumns.forEach((correctColumn) => {
        if (column.name === correctColumn.name) {
          correctColumnCount++;
          assertEquals(column.type, correctColumn.type);
          assertEquals(column.notnull, correctColumn.notnull);
        }
      });
    });
    assertEquals(correctColumnCount, correctColumns.length);
  }
);

//run using deno test --allow-read --allow-run --allow-write userServer.test.js
