import { DATABASE_PATH } from '../conftest';

const { test : base, expect } = require('@playwright/test');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// each testcase using db is getting its fresh new instance
const test = base.extend({
  db: async ({}, use) => {
    // wipe dbs content
    const db = new Database(DATABASE_PATH);
    // this query would return all user defined tables
    const tables = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'",
      )
      .all()
      .map((row) => row.name);
    // in here, drop all tables
    if (tables.length > 0) {
      db.exec(tables.map((name) => `DROP TABLE IF EXISTS "${name}"`).join(';\n'));
    }
    // recreate the base schema
    const schema = fs.readFileSync(
      path.join(__dirname, '../schema.sql'),
      'utf-8',
    );
    db.exec(schema);

    await use(db);

    db.close();
  }
})

module.exports = { test, expect }