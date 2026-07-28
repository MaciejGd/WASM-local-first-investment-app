const { test : base, expect } = require('@playwright/test');
const Database = require('better-sqlite3');

const test = base.extend({
  db: async ({}, use) => {
    const db = new Database('./test.sqlite')
  }
})
