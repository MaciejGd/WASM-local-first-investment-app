import { expect, test, vi, describe, beforeEach } from "vitest";

const ZERO_HASH = "0000000000000000000000000000000000000000";

const mockTable = () => ({
  get: vi.fn(),
  put: vi.fn(),
  clear: vi.fn(),
});

vi.mock("dexie", () => ({
  Dexie: vi.fn().mockImplementation(function () {
    this.version = vi.fn().mockReturnThis();
    this.stores = vi.fn().mockReturnThis();
    this.table = vi.fn().mockImplementation(() => mockTable());
    this.metadata = mockTable();
    this.transaction = vi.fn();
  }),
}));

describe("getDBInstance", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  test("returns a Dexie instance", async () => {
    const { getDBInstance } = await import("../../src/db/db");
    const db = getDBInstance();
    expect(db).toBeDefined();
  });

  test("returns the same instance on subsequent calls (singleton)", async () => {
    const { getDBInstance } = await import("../../src/db/db");
    const first = getDBInstance();
    const second = getDBInstance();
    expect(first).toBe(second);
  });
});

describe("resetTableHash", () => {
  let getDBInstance, resetTableHash;

  beforeEach(async () => {
    vi.resetModules();
    ({ getDBInstance, resetTableHash } = await import("../../src/db/db"));
  });

  test("resets hash to zero for given table", async () => {
    const db = getDBInstance();
    const metaPut = vi.fn();
    db.table.mockReturnValue({ put: metaPut });

    await resetTableHash("wallet_assets");

    expect(metaPut).toHaveBeenCalledWith({
      key: "wallet_assets_hash",
      value: ZERO_HASH,
    });
  });
});

describe("clearTable", () => {
  let getDBInstance, clearTable;

  beforeEach(async () => {
    vi.resetModules();
    ({ getDBInstance, clearTable } = await import("../../src/db/db"));
  });

  test("clears table and resets hash", async () => {
    const db = getDBInstance();
    const tableClear = vi.fn();
    const metaPut = vi.fn();
    db.table
      .mockReturnValueOnce({ put: metaPut, clear: tableClear })
      .mockReturnValueOnce({ put: metaPut, clear: tableClear });

    await clearTable("wallet_assets");

    expect(metaPut).toHaveBeenCalledWith({
      key: "wallet_assets_hash",
      value: ZERO_HASH,
    });
    expect(tableClear).toHaveBeenCalled();
  });
});

describe("getTablesHashes", () => {
  let getDBInstance, getTablesHashes;

  beforeEach(async () => {
    vi.resetModules();
    ({ getDBInstance, getTablesHashes } = await import("../../src/db/db"));
  });

  test("returns zero hashes when no metadata exists", async () => {
    const db = getDBInstance();
    const metaGet = vi.fn().mockResolvedValue(undefined);
    db.table.mockReturnValue({ get: metaGet });

    const hashes = await getTablesHashes();

    expect(hashes).toEqual({
      wallet_assets: ZERO_HASH,
      sim_history: ZERO_HASH,
    });
  });

  test("returns stored hashes when metadata exists", async () => {
    const db = getDBInstance();
    const walletHash = "aabbccdd";
    const simHash = "11223344";
    const metaGet = vi.fn().mockImplementation((key) => {
      if (key === "wallet_assets_hash") return { value: walletHash };
      if (key === "sim_history_hash") return { value: simHash };
      return undefined;
    });
    db.table.mockReturnValue({ get: metaGet });

    const hashes = await getTablesHashes();

    expect(hashes).toEqual({
      wallet_assets: walletHash,
      sim_history: simHash,
    });
  });
});

describe("updateHash", () => {
  let getDBInstance, updateHash;

  beforeEach(async () => {
    vi.resetModules();
    ({ getDBInstance, updateHash } = await import("../../src/db/db"));
  });

  test("sets hash when no existing hash", async () => {
    const db = getDBInstance();
    const metaPut = vi.fn();
    const metaGet = vi.fn().mockResolvedValue(undefined);
    db.table.mockReturnValue({ get: metaGet, put: metaPut });

    await updateHash(db, "wallet_assets", "aabbccdd");

    expect(metaPut).toHaveBeenCalledWith({
      key: "wallet_assets_hash",
      value: "aabbccdd",
    });
  });

  test("xors hash with existing hash", async () => {
    const db = getDBInstance();
    const metaPut = vi.fn();
    const metaGet = vi.fn().mockResolvedValue({ value: "aabbccdd" });
    db.table.mockReturnValue({ get: metaGet, put: metaPut });

    await updateHash(db, "wallet_assets", "aabbccdd");

    expect(metaPut).toHaveBeenCalledWith({
      key: "wallet_assets_hash",
      value: "00000000",
    });
  });

  test("xors two different hashes correctly", async () => {
    const db = getDBInstance();
    const metaPut = vi.fn();
    const metaGet = vi.fn().mockResolvedValue({ value: "ff00ff00" });
    db.table.mockReturnValue({ get: metaGet, put: metaPut });

    await updateHash(db, "wallet_assets", "00ff00ff");

    expect(metaPut).toHaveBeenCalledWith({
      key: "wallet_assets_hash",
      value: "ffffffff",
    });
  });
});

describe("putDataToDb", () => {
  let getDBInstance, putDataToDb;

  beforeEach(async () => {
    vi.resetModules();
    ({ getDBInstance, putDataToDb } = await import("../../src/db/db"));
  });

  test("puts asset and returns id", async () => {
    const db = getDBInstance();
    const expectedId = 42;
    const tablePut = vi.fn().mockResolvedValue(expectedId);
    const metaGet = vi.fn().mockResolvedValue({ value: "aabb" });
    const metaPut = vi.fn();

    db.table.mockReturnValue({ get: metaGet, put: tablePut });
    db.metadata = { get: metaGet, put: metaPut };
    db.transaction.mockImplementation(async (mode, table, metadata, cb) => {
      await cb();
    });

    const id = await putDataToDb(db, "wallet_assets", {
      ulid: "test123",
      hash: "aabbccdd",
    });

    expect(id).toBe(expectedId);
  });

  test("returns -1 when transaction fails", async () => {
    const db = getDBInstance();
    db.table.mockReturnValue({
      get: vi.fn(),
      put: vi.fn(),
      clear: vi.fn(),
    });
    db.metadata = { get: vi.fn(), put: vi.fn() };
    db.transaction.mockRejectedValue(new Error("tx failed"));

    await expect(
      putDataToDb(db, "wallet_assets", { hash: "aabb" }),
    ).rejects.toThrow("tx failed");
  });
});
