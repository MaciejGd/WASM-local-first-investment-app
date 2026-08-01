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
  await page.route('**/api/finance/get_recent_prices', (route) =>
    route.fulfill({ json: { AAPL: { price: 150 }, MSFT: { price: 400 } } }),
  );
  await page.route('**/api/finance/get_stocks_prices', (route) =>
    route.fulfill({ json: mockStockPrices(300) }),
  );
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
    const modal = page.locator('.modal_container');
    await expect(modal.getByText('Add asset')).toBeVisible();

    const inputs = modal.locator('input');
    await inputs.nth(0).fill('AAPL');
    await inputs.nth(1).fill('not_a_number');
    await inputs.nth(2).fill('150');

    await modal.getByRole('button', { name: 'Accept' }).click();

    // quantity is not a number, so the modal should remain open
    await expect(modal.getByText('Add asset')).toBeVisible();
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
  });
});

test.describe('Graphs page', () => {
  test('shows the graph selector by default', async ({ page, db }) => {
    await registerAndLogin(page, 'test', 'pass');
    await page.locator('.sidebar a', { hasText: 'Graphs' }).click();

    await expect(page.getByText('Graphs!!!')).toBeVisible();
    await expect(page.getByPlaceholder('Ticker...')).toBeVisible();
    await expect(page.getByPlaceholder('Indicator...')).toBeVisible();
  });

  test('adding a graph record displays it in the legend', async ({ page, db }) => {
    await registerAndLogin(page, 'test', 'pass');
    await page.locator('.sidebar a', { hasText: 'Graphs' }).click();

    await page.getByPlaceholder('Ticker...').fill('AAPL');
    await page.getByPlaceholder('Indicator...').fill('Revenue');
    await page.getByRole('button', { name: '+' }).click();

    await expect(page.getByText('Ticker: AAPL')).toBeVisible();
    await expect(page.getByText('Indicator: Revenue')).toBeVisible();
  });

  test('deleting a graph record removes it from the legend', async ({
    page,
    db,
  }) => {
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
