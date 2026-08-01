import { DATABASE_PATH } from '../conftest';

const { test : base, expect } = require('@playwright/test');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// each testcase using db is getting its fresh new instance
const test = base.extend({
  db: async ({}, use) => {
    if (fs.existsSync(DATABASE_PATH)) {
      // remove db if it already exists
      fs.unlinkSync(DATABASE_PATH);
    }
    // create brand new sqlite3 database for the purpose of tests
    const db = new Database(DATABASE_PATH)
    const schema = fs.readFileSync(
      path.join(__dirname, '../schema.sql'), 
      'utf-8'
    ); 
    db.exec(schema);

    await use(db);

    // release the connection so the next test can safely recreate the file
    db.close();
  }
})

module.exports = { test, expect }