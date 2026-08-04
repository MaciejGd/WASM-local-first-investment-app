// Tests in this file require an access to the real sqlite3 database file.
// They rely on the db fixture (fixtures/db.js) which recreates the database
// from schema.sql for every single test case.
//
// Because all of the tests share a single database file, the tests in this file
// are executed serially and the file should be run with a single playwright
// project (as it is done in the e2e/Dockerfile).
const { test, expect } = require('./fixtures/db');
import { BASE_URL } from './conftest';

// tests in this file modify the shared database file, so they must not run in parallel
test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ page }) => {
  console.log(`Running ${test.info().title}`);
  await page.goto(BASE_URL);
});

// register a brand new user account through the register modal
async function registerUser(page, username, password) {
  await page.getByText('Register').click();
  // 2 first elements are input fields from login pop-ups
  const inputs = page.locator('input');
  await inputs.nth(2).fill(username);
  await inputs.nth(3).fill(password);
  await inputs.nth(4).fill(password);
  // modal is shown over the old one so take the 2nd Accept button
  await page.getByRole('button', { name: 'Accept' }).nth(1).click();

  await expect(page.getByText('Info')).toBeVisible();
  await expect(
    page.getByText('Succeed to register user account'),
  ).toBeVisible();
  // close the info pop-up, which also closes the register modal
  await page.getByRole('button', { name: 'Close' }).last().click();
  await expect(page.getByText('Login')).toBeVisible();
}

// log into the application through the login modal
async function login(page, username, password) {
  await page.locator('input:not([type])').first().fill(username);
  await page.locator('input[type="password"]').first().fill(password);
  await page.getByRole('button', { name: 'Accept' }).first().click();
  // after successful login the default stock page is rendered
  await expect(page.getByText('Stock holdings')).toBeVisible();
}

// register and log in with a fresh user account
async function registerAndLogin(page, username, password) {
  await registerUser(page, username, password);
  await login(page, username, password);
}

// stub finance endpoints so that tests do not depend on the remote finance service
async function mockFinanceApi(page) {
  await page.route('**/api/finance/get_stocks_list', (route) =>
    route.fulfill({ json: ['AAPL', 'MSFT', 'GOOGL'] }),
  );
  await page.route('**/api/finance/get_indicators_list', (route) =>
    route.fulfill({ json: mockIndicatorList() }),
  );
  await page.route('**/api/finance/get_indicator/**', (route) =>
    route.fulfill({ json: mockIndicatorValues() }),
  );
  await page.route('**/api/finance/get_recent_prices', (route) =>
    route.fulfill({ json: { AAPL: { price: 150 }, MSFT: { price: 400 } } }),
  );
  await page.route('**/api/finance/get_stocks_prices', (route) =>
    route.fulfill({ json: mockStockPrices(300) }),
  );
}

function mockIndicatorList() {
  return [
    'Revenue', 'NetIncome', 'EBITDA'
  ]
}

// indicator values over a few dates, as returned by the get_indicator endpoint
function mockIndicatorValues() {
  return {
    '2020-01-01': 100,
    '2020-02-01': 150,
    '2020-03-01': 200,
  };
}

// create 300 days of monotonically increasing prices for a single stock
function mockStockPrices(days) {
  const prices = {};
  for (let i = 0; i < days; i++) {
    const day = new Date(Date.UTC(2020, 0, 1) + i * 86400000);
    prices[day.toISOString().slice(0, 10)] = 100 + i;
  }
  return [{ prices: prices }];
}

// check whether a table with the given name exists in the sqlite db.
// the server creates user's tables lazily once the first sync event arrives
function tableExists(db, tableName) {
  return (
    db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?",
      )
      .get(tableName) !== undefined
  );
}

// wait until the given user's table on the remote server holds exactly
// expectedCount records. The sync worker propagates local changes to the
// remote server every few seconds, so the expected state should be reached
// shortly after the test modified the local db.
async function expectSyncedTableCount(db, username, tableName, expectedCount) {
  const fullName = `${tableName}_${db
    .prepare('SELECT id FROM user WHERE username = ?')
    .get(username).id}`;
  await expect
    .poll(
      () =>
        tableExists(db, fullName)
          ? db.prepare(`SELECT COUNT(*) AS count FROM ${fullName}`).get().count
          : 0,
      { timeout: 20_000, intervals: [500] },
    )
    .toBe(expectedCount);
}

// wait until an event of the given type has been recorded for the given
// user's table (e.g. an "add" or "remove" sync event), proving that the
// change was pushed to the remote server.
async function expectSyncedEvent(db, username, tableName, eventType) {
  const eventsTable = `events_${db
    .prepare('SELECT id FROM user WHERE username = ?')
    .get(username).id}`;
  await expect
    .poll(
      () =>
        tableExists(db, eventsTable)
          ? db
              .prepare(
                `SELECT table_name, type FROM ${eventsTable} WHERE table_name = ? AND type = ?`,
              )
              .all(tableName, eventType).length
          : 0,
      { timeout: 20_000, intervals: [500] },
    )
    .toBeGreaterThan(0);
}

test.describe('Register modal', () => {
  test('Check registering user succeeded', async ({ page, db }) => {
    await registerUser(page, 'test', 'pass');

    // check if db has values expected
    const users = db.prepare('SELECT * FROM user;').all();

    expect(users).toHaveLength(1);
    expect(users[0].username).toBe('test');
  });
});

test.describe('Login', () => {
  test('logging in with a registered user redirects to the stock page', async ({
    page,
    db,
  }) => {
    await registerAndLogin(page, 'test', 'pass');

    await expect(page.getByText('Stock holdings')).toBeVisible();
    // navigation bar with all subpage links is rendered
    const sidebar = page.locator('.sidebar');
    await expect(sidebar).toBeVisible();
    await expect(sidebar.getByText('Stock')).toBeVisible();
    await expect(sidebar.getByText('Simulations')).toBeVisible();
    await expect(sidebar.getByText('Graphs')).toBeVisible();
  });
});

test.describe('Stock page', () => {
  test('displays the empty holdings table after logging in', async ({
    page,
    db,
  }) => {
    await mockFinanceApi(page);
    await registerAndLogin(page, 'test', 'pass');

    await expect(
      page.getByRole('heading', { name: 'Stock holdings' }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add asset' })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Delete Selected' }),
    ).toBeVisible();

    const table = page.locator('.assets_table');
    for (const header of [
      'Ticker',
      'Quantity',
      'Price',
      'Cost',
      'Current Price',
      'Current Value',
      'Profit',
      'Profit-percentage',
    ]) {
      await expect(table.getByText(header, { exact: true })).toBeVisible();
    }
    await expect(table.getByText('Summary')).toBeVisible();
  });

  test('add asset modal validates inputs and stays open on invalid data', async ({
    page,
    db,
  }) => {
    await mockFinanceApi(page);
    await registerAndLogin(page, 'test', 'pass');

    await page.getByRole('button', { name: 'Add asset' }).click();
    const modal = page.locator('.modal_container').filter({
      hasText: 'Add asset',
    });
    await expect(modal.getByText('Add asset')).toBeVisible();

    const inputs = modal.locator('input');
    await inputs.nth(0).fill('AAPL');
    await inputs.nth(1).fill('not_a_number');
    await inputs.nth(2).fill('150');

    await modal.getByRole('button', { name: 'Accept' }).click();

    // quantity is not a number, so an error pop-up is shown and the modal stays open
    const errorPopUp = page.locator('.modal_container').filter({
      hasText: 'Error',
    });
    await expect(
      errorPopUp.getByText('Quantity value should be a number.'),
    ).toBeVisible();
    await expect(modal.getByText('Add asset')).toBeVisible();
  });

  test('empty ticker is rejected with an error message', async ({
    page,
    db,
  }) => {
    await mockFinanceApi(page);
    await registerAndLogin(page, 'test', 'pass');

    await page.getByRole('button', { name: 'Add asset' }).click();
    const modal = page.locator('.modal_container').filter({
      hasText: 'Add asset',
    });
    const inputs = modal.locator('input');
    // leave the ticker empty, only provide the numeric fields
    await inputs.nth(1).fill('10');
    await inputs.nth(2).fill('150');

    await modal.getByRole('button', { name: 'Accept' }).click();

    const errorPopUp = page.locator('.modal_container').filter({
      hasText: 'Error',
    });
    await expect(
      errorPopUp.getByText('Ticker should not be empty!'),
    ).toBeVisible();
    await expect(modal.getByText('Add asset')).toBeVisible();
  });

  test('ticker outside of the list is rejected with an error message', async ({
    page,
    db,
  }) => {
    await mockFinanceApi(page);
    await registerAndLogin(page, 'test', 'pass');

    await page.getByRole('button', { name: 'Add asset' }).click();
    const modal = page.locator('.modal_container').filter({
      hasText: 'Add asset',
    });
    const inputs = modal.locator('input');
    await inputs.nth(0).fill('UNKNOWN');
    await inputs.nth(1).fill('10');
    await inputs.nth(2).fill('150');

    await modal.getByRole('button', { name: 'Accept' }).click();

    const errorPopUp = page.locator('.modal_container').filter({
      hasText: 'Error',
    });
    await expect(
      errorPopUp.getByText('Please select ticker from the list.'),
    ).toBeVisible();
    await expect(modal.getByText('Add asset')).toBeVisible();
  });

  test('non-numeric price is rejected with an error message', async ({
    page,
    db,
  }) => {
    await mockFinanceApi(page);
    await registerAndLogin(page, 'test', 'pass');

    await page.getByRole('button', { name: 'Add asset' }).click();
    const modal = page.locator('.modal_container').filter({
      hasText: 'Add asset',
    });
    const inputs = modal.locator('input');
    await inputs.nth(0).fill('AAPL');
    await inputs.nth(1).fill('10');
    await inputs.nth(2).fill('not_a_number');

    await modal.getByRole('button', { name: 'Accept' }).click();

    const errorPopUp = page.locator('.modal_container').filter({
      hasText: 'Error',
    });
    await expect(
      errorPopUp.getByText('Price value should be a number.'),
    ).toBeVisible();
    await expect(modal.getByText('Add asset')).toBeVisible();
  });

  test('dismissing the error lets the user correct the input and add the asset', async ({
    page,
    db,
  }) => {
    await mockFinanceApi(page);
    await registerAndLogin(page, 'test', 'pass');

    await page.getByRole('button', { name: 'Add asset' }).click();
    const modal = page.locator('.modal_container').filter({
      hasText: 'Add asset',
    });
    const inputs = modal.locator('input');
    await inputs.nth(0).fill('UNKNOWN');
    await inputs.nth(1).fill('10');
    await inputs.nth(2).fill('150');

    await modal.getByRole('button', { name: 'Accept' }).click();

    // the invalid ticker shows an error pop-up; closing it keeps the modal open
    const errorPopUp = page.locator('.modal_container').filter({
      hasText: 'Error',
    });
    await expect(
      errorPopUp.getByText('Please select ticker from the list.'),
    ).toBeVisible();
    await errorPopUp.getByRole('button', { name: 'Close' }).click();
    await expect(errorPopUp).not.toBeVisible();
    await expect(modal.getByText('Add asset')).toBeVisible();

    // correct the ticker and submit again, the asset should be added
    await inputs.nth(0).fill('AAPL');
    await modal.getByRole('button', { name: 'Accept' }).click();

    await expect(modal.getByText('Add asset')).not.toBeVisible();
    await expect(page.locator('.assets_table').getByText('AAPL')).toBeVisible();

    // the asset should be synced to the remote database
    await expectSyncedTableCount(db, 'test', 'wallet_assets', 1);
  });

  test('adding a valid asset displays it in the holdings table', async ({
    page,
    db,
  }) => {
    await mockFinanceApi(page);
    await registerAndLogin(page, 'test', 'pass');

    await page.getByRole('button', { name: 'Add asset' }).click();
    const modal = page.locator('.modal_container');
    const inputs = modal.locator('input');
    await inputs.nth(0).fill('AAPL');
    await inputs.nth(1).fill('10');
    await inputs.nth(2).fill('150');
    await modal.getByRole('button', { name: 'Accept' }).click();

    // the modal closes once the asset has been added
    await expect(modal.getByText('Add asset')).not.toBeVisible();
    await expect(page.locator('.assets_table').getByText('AAPL')).toBeVisible();

    // the asset should be synced to the remote database
    await expectSyncedTableCount(db, 'test', 'wallet_assets', 1);
  });

  test('deleting a selected asset removes it from the table', async ({
    page,
    db,
  }) => {
    await mockFinanceApi(page);
    await registerAndLogin(page, 'test', 'pass');

    await page.getByRole('button', { name: 'Add asset' }).click();
    const modal = page.locator('.modal_container');
    const inputs = modal.locator('input');
    await inputs.nth(0).fill('AAPL');
    await inputs.nth(1).fill('10');
    await inputs.nth(2).fill('150');
    await modal.getByRole('button', { name: 'Accept' }).click();

    const table = page.locator('.assets_table');
    await expect(table.getByText('AAPL')).toBeVisible();

    await table.locator('input[type="checkbox"]').first().check();
    await page.getByRole('button', { name: 'Delete Selected' }).click();

    await expect(table.getByText('AAPL')).not.toBeVisible();

    // the removal should be synced to the remote database
    await expectSyncedEvent(db, 'test', 'wallet_assets', 'remove');
    await expectSyncedTableCount(db, 'test', 'wallet_assets', 0);
  });
});

test.describe('Sync worker', () => {
  test('pushed asset is stored in the remote database within a few sync cycles', async ({
    page,
    db,
  }) => {
    await mockFinanceApi(page);
    await registerAndLogin(page, 'test', 'pass');

    // add an asset through the UI, it gets stored locally and queued for sync
    await page.getByRole('button', { name: 'Add asset' }).click();
    const modal = page.locator('.modal_container');
    const inputs = modal.locator('input');
    await inputs.nth(0).fill('AAPL');
    await inputs.nth(1).fill('10');
    await inputs.nth(2).fill('150');
    await modal.getByRole('button', { name: 'Accept' }).click();
    await expect(page.locator('.assets_table').getByText('AAPL')).toBeVisible();

    // the sync worker polls the remote server every few seconds, so the asset
    // should show up in the remote database shortly afterwards
    await expectSyncedTableCount(db, 'test', 'wallet_assets', 1);

    // the sync event should also be recorded in the remote events table
    await expectSyncedEvent(db, 'test', 'wallet_assets', 'add');
  });
});

test.describe('Simulations page', () => {
  test('shows the options pane by default', async ({ page, db }) => {
    await mockFinanceApi(page);
    await registerAndLogin(page, 'test', 'pass');
    await page.locator('.sidebar a', { hasText: 'Simulations' }).click();

    await expect(
      page.getByRole('button', { name: 'Run Simulation' }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add asset' })).toBeVisible();

    const optionsPane = page.locator('.sims_options_pane');
    await expect(optionsPane.getByText('Timepoints')).toBeVisible();
    await expect(optionsPane.getByText('Simulations')).toBeVisible();

    // both sliders are initialized with default value 50
    const ranges = optionsPane.locator('input[type="range"]');
    await expect(ranges.nth(0)).toHaveValue('50');
    await expect(ranges.nth(1)).toHaveValue('50');
  });

  test('adding an asset with an unknown ticker shows an error', async ({
    page,
    db,
  }) => {
    await mockFinanceApi(page);
    await registerAndLogin(page, 'test', 'pass');
    await page.locator('.sidebar a', { hasText: 'Simulations' }).click();

    await page.getByRole('button', { name: 'Add asset' }).click();
    const modal = page.locator('.modal_container');
    await expect(modal.getByText('Add asset')).toBeVisible();

    const inputs = modal.locator('input');
    await inputs.nth(0).fill('UNKNOWN');
    await inputs.nth(1).fill('100');
    await modal.getByRole('button', { name: 'Accept' }).click();

    await expect(page.getByText('Error')).toBeVisible();
    await expect(
      page.getByText('No such asset with this tickers in database!'),
    ).toBeVisible();
  });

  test('adding an asset with a non numeric price shows an error', async ({
    page,
    db,
  }) => {
    await mockFinanceApi(page);
    await registerAndLogin(page, 'test', 'pass');
    await page.locator('.sidebar a', { hasText: 'Simulations' }).click();

    await page.getByRole('button', { name: 'Add asset' }).click();
    const modal = page.locator('.modal_container');
    const inputs = modal.locator('input');
    await inputs.nth(0).fill('AAPL');
    await inputs.nth(1).fill('not_a_number');
    await modal.getByRole('button', { name: 'Accept' }).click();

    await expect(
      page.getByText('Failed to add asset, price should be a number!'),
    ).toBeVisible();
  });

  test('adding a valid asset displays it in the simulations table', async ({
    page,
    db,
  }) => {
    await mockFinanceApi(page);
    await registerAndLogin(page, 'test', 'pass');
    await page.locator('.sidebar a', { hasText: 'Simulations' }).click();

    await page.getByRole('button', { name: 'Add asset' }).click();
    const modal = page.locator('.modal_container');
    const inputs = modal.locator('input');
    await inputs.nth(0).fill('AAPL');
    await inputs.nth(1).fill('100');
    await modal.getByRole('button', { name: 'Accept' }).click();

    await expect(modal.getByText('Add asset')).not.toBeVisible();
    await expect(page.locator('.sims_table').getByText('AAPL')).toBeVisible();
  });

  test('running a simulation with assets shows the results', async ({
    page,
    db,
  }) => {
    await mockFinanceApi(page);
    await registerAndLogin(page, 'test', 'pass');
    await page.locator('.sidebar a', { hasText: 'Simulations' }).click();

    await page.getByRole('button', { name: 'Add asset' }).click();
    const modal = page.locator('.modal_container');
    const inputs = modal.locator('input');
    await inputs.nth(0).fill('AAPL');
    await inputs.nth(1).fill('100');
    await modal.getByRole('button', { name: 'Accept' }).click();
    await expect(page.locator('.sims_table').getByText('AAPL')).toBeVisible();

    // reduce the simulation to its minimum to keep the run short
    const numberInputs = page.locator(
      '.sims_options_pane input:not([type="range"])',
    );
    await numberInputs.nth(0).fill('10');
    await numberInputs.nth(1).fill('10');

    // give the WASM worker some time to finish initialization
    await page.waitForTimeout(2000);

    await page.getByRole('button', { name: 'Run Simulation' }).click();

    await expect(page.getByText('Simulation Results')).toBeVisible({
      timeout: 30000,
    });

    // save the simulation so it is queued for sync to the remote database
    await page.getByRole('button', { name: 'Save Sim' }).click();
    const saveModal = page.locator('.modal_container').filter({
      hasText: 'Input simulation name:',
    });
    await saveModal.locator('input').fill('test_sim');
    await saveModal.getByRole('button', { name: 'Accept' }).click();
    await expect(saveModal).not.toBeVisible();

    // the saved simulation should be synced to the remote database
    await expectSyncedTableCount(db, 'test', 'sim_history', 1);
  });
});

test.describe('Graphs page', () => {
  test('shows the graph selector with tickers and indicators fetched from the remote', async ({
    page,
    db,
  }) => {
    await mockFinanceApi(page);
    await registerAndLogin(page, 'test', 'pass');
    await page.locator('.sidebar a', { hasText: 'Graphs' }).click();

    await expect(page.getByText('Graphs!!!')).toBeVisible();
    await expect(page.getByPlaceholder('Ticker...')).toBeVisible();
    await expect(page.getByPlaceholder('Indicator...')).toBeVisible();

    // the selector is populated from the remote finance service
    await page.getByPlaceholder('Ticker...').click();
    await expect(
      page.locator('.combo-options').getByText('AAPL'),
    ).toBeVisible();
    await page.getByPlaceholder('Indicator...').click();
    await expect(
      page.locator('.combo-options').getByText('Revenue'),
    ).toBeVisible();
  });

  test('adding a graph record displays it in the legend', async ({ page, db }) => {
    await mockFinanceApi(page);
    await registerAndLogin(page, 'test', 'pass');
    await page.locator('.sidebar a', { hasText: 'Graphs' }).click();

    await page.getByPlaceholder('Ticker...').fill('AAPL');
    await page.getByPlaceholder('Indicator...').fill('Revenue');
    await page.getByRole('button', { name: '+' }).click();

    await expect(page.getByText('Ticker: AAPL')).toBeVisible();
    await expect(page.getByText('Indicator: Revenue')).toBeVisible();
  });

  test('adding a graph record renders a chart with the fetched indicator values', async ({
    page,
    db,
  }) => {
    await mockFinanceApi(page);
    await registerAndLogin(page, 'test', 'pass');
    await page.locator('.sidebar a', { hasText: 'Graphs' }).click();

    await page.getByPlaceholder('Ticker...').fill('AAPL');
    await page.getByPlaceholder('Indicator...').fill('Revenue');
    await page.getByRole('button', { name: '+' }).click();

    // the chart canvas is drawn once the indicator values arrive
    await expect(page.locator('.graph_chart canvas')).toBeVisible();
  });

  test('ticker outside of the remote list is rejected with an error message', async ({
    page,
    db,
  }) => {
    await mockFinanceApi(page);
    await registerAndLogin(page, 'test', 'pass');
    await page.locator('.sidebar a', { hasText: 'Graphs' }).click();

    await page.getByPlaceholder('Ticker...').fill('UNKNOWN');
    await page.getByPlaceholder('Indicator...').fill('Revenue');
    await page.getByRole('button', { name: '+' }).click();

    await expect(
      page.getByText('Please choose ticker from list of available tickers.'),
    ).toBeVisible();
  });

  test('indicator outside of the remote list is rejected with an error message', async ({
    page,
    db,
  }) => {
    await mockFinanceApi(page);
    await registerAndLogin(page, 'test', 'pass');
    await page.locator('.sidebar a', { hasText: 'Graphs' }).click();

    await page.getByPlaceholder('Ticker...').fill('AAPL');
    await page.getByPlaceholder('Indicator...').fill('UnknownIndicator');
    await page.getByRole('button', { name: '+' }).click();

    await expect(
      page.getByText(
        'Please choose indicator from the list of available indicators.',
      ),
    ).toBeVisible();
  });

  test('adding the same ticker and indicator twice keeps a single legend entry', async ({
    page,
    db,
  }) => {
    await mockFinanceApi(page);
    await registerAndLogin(page, 'test', 'pass');
    await page.locator('.sidebar a', { hasText: 'Graphs' }).click();

    await page.getByPlaceholder('Ticker...').fill('AAPL');
    await page.getByPlaceholder('Indicator...').fill('Revenue');
    await page.getByRole('button', { name: '+' }).click();
    await expect(page.getByText('Ticker: AAPL')).toHaveCount(1);

    // the same ticker + indicator combination is silently ignored
    await page.getByPlaceholder('Ticker...').fill('AAPL');
    await page.getByPlaceholder('Indicator...').fill('Revenue');
    await page.getByRole('button', { name: '+' }).click();

    await expect(page.getByText('Ticker: AAPL')).toHaveCount(1);
  });

  test('deleting a graph record removes it from the legend', async ({
    page,
    db,
  }) => {
    await mockFinanceApi(page);
    await registerAndLogin(page, 'test', 'pass');
    await page.locator('.sidebar a', { hasText: 'Graphs' }).click();

    await page.getByPlaceholder('Ticker...').fill('AAPL');
    await page.getByPlaceholder('Indicator...').fill('Revenue');
    await page.getByRole('button', { name: '+' }).click();
    await expect(page.getByText('Ticker: AAPL')).toBeVisible();

    await page.getByRole('button', { name: 'X' }).click();

    await expect(page.getByText('Ticker: AAPL')).not.toBeVisible();
  });
});

test.describe('Logout', () => {
  test('logging out returns to the login modal', async ({ page, db }) => {
    await registerAndLogin(page, 'test', 'pass');
    await expect(page.getByText('Stock holdings')).toBeVisible();

    await page.locator('.sidebar button', { hasText: 'Logout' }).click();
    await expect(
      page.getByText('Are you sure, you wanna logout?'),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Accept' }).last().click();

    await expect(page.getByText('Login')).toBeVisible();
  });
});
