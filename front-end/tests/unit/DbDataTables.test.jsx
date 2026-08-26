import { test, expect, vi, describe, beforeEach, afterEach } from "vitest";

const mockTable = (table_name) => ({
  toArray: vi.fn().mockResolvedValue([]),
  bulkDelete: vi.fn().mockResolvedValue(undefined),
  bulkGet: vi.fn().mockResolvedValue([]),
  get: vi.fn().mockResolvedValue(undefined),
  put: vi.fn().mockResolvedValue(1),
  name : table_name,
});

const mockSyncWorker = {
  AddAdditionEvent: vi.fn(),
  AddRemovalEvent: vi.fn(),
};

const mockDb = {
  wallet_assets: mockTable("wallet_assets"),
  sim_history: mockTable("sim_history"),
  table : vi.fn((table_name)=> {
    if (table_name === "wallet_assets") return mockDb.wallet_assets;
    return mockDb.sim_history;
  }),
};

vi.mock("../../src/db/db", () => ({
  getDBInstance: vi.fn(() => mockDb),
  putDataToDb: vi.fn().mockResolvedValue(1),
  getTablesHashes: vi.fn().mockResolvedValue({
    wallet_assets: "aabb",
    sim_history: "ccdd",
  }),
  bulkDeleteFromDb: vi.fn()
}));

vi.mock("../../src/sync/syncWorkerWrapper", () => ({
  SyncWorkerWrapper: {
    getInstance: vi.fn(() => mockSyncWorker),
  },
}));

vi.mock("object-hash", () => ({
  default: vi.fn().mockResolvedValue("mocked_hash_123"),
}));

let IndexedDbHandler;

beforeEach(async () => {
  vi.resetModules();
  vi.spyOn(crypto, "randomUUID").mockReturnValue("test-ulid-001");

  mockDb.wallet_assets = mockTable("wallet_assets");
  mockDb.sim_history = mockTable("sim_history");
  mockSyncWorker.AddAdditionEvent.mockClear();
  mockSyncWorker.AddRemovalEvent.mockClear();

  const mod = await import("../../src/db/DbDataTables.js");
  IndexedDbHandler = mod.IndexedDbHandler;
  IndexedDbHandler.instance = undefined;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("constructor / getInstance", () => {
  test("getInstance returns a new instance when none exists", () => {
    const handler = IndexedDbHandler.getInstance();
    expect(handler).toBeDefined();
    expect(handler.db).toBe(mockDb);
    expect(handler.version_id).toBe(0);
  });

  test("getInstance returns the same instance (singleton)", () => {
    const first = IndexedDbHandler.getInstance();
    const second = IndexedDbHandler.getInstance();
    expect(first).toBe(second);
  });
});

describe("addSimsHistory", () => {
  test("returns true when simulation is added successfully", async () => {
    mockDb.sim_history.toArray.mockResolvedValue([]);
    const { putDataToDb } = await import("../../src/db/db");
    putDataToDb.mockResolvedValue(1);

    const handler = IndexedDbHandler.getInstance();
    const result = await handler.addSimsHistory({ name: "sim1", data: {} });

    expect(result).toBe(true);
    expect(putDataToDb).toHaveBeenCalled();
  });

  test("returns false when simulation name already exists", async () => {
    mockDb.sim_history.toArray.mockResolvedValue([{ name: "sim1" }]);

    const handler = IndexedDbHandler.getInstance();
    const result = await handler.addSimsHistory({ name: "sim1", data: {} });

    expect(result).toBe(false);
  });

  test("returns false on error", async () => {
    mockDb.sim_history.toArray.mockRejectedValue(new Error("db error"));

    const handler = IndexedDbHandler.getInstance();
    const result = await handler.addSimsHistory({ name: "sim1" });

    expect(result).toBe(false);
  });
});

describe("getSimsHistory", () => {
  test("returns array from sim_history table", async () => {
    const expected = [{ name: "sim1" }, { name: "sim2" }];
    mockDb.sim_history.toArray.mockResolvedValue(expected);

    const handler = IndexedDbHandler.getInstance();
    const result = await handler.getSimsHistory();

    expect(result).toEqual(expected);
  });
});

describe("addWalletAsset", () => {
  test("calls _addRecord and returns id", async () => {
    const { putDataToDb } = await import("../../src/db/db");
    putDataToDb.mockResolvedValue(42);

    const handler = IndexedDbHandler.getInstance();
    const result = await handler.addWalletAsset({ ticker: "AAPL", qty: 10 });

    expect(result).toBe(42);
  });

  test("returns undefined on error", async () => {
    const { putDataToDb } = await import("../../src/db/db");
    putDataToDb.mockRejectedValue(new Error("write failed"));

    const handler = IndexedDbHandler.getInstance();
    const result = await handler.addWalletAsset({ ticker: "AAPL" });

    expect(result).toEqual([]);
  });
});

describe("_addRecord", () => {
  test("generates ulid, hashes payload, syncs and puts to db", async () => {
    const { putDataToDb, getTablesHashes } = await import("../../src/db/db");
    putDataToDb.mockResolvedValue(10);
    getTablesHashes.mockResolvedValue({
      wallet_assets: "aa",
      sim_history: "bb",
    });

    const handler = IndexedDbHandler.getInstance();
    const payload = { ticker: "AAPL" };
    const result = await handler._addRecord(mockDb.wallet_assets, payload);

    expect(crypto.randomUUID).toHaveBeenCalled();
    expect(mockSyncWorker.AddAdditionEvent).toHaveBeenCalledWith(
      "test-ulid-001",
      "wallet_assets",
      "mocked_hash_123",
      payload,
    );
    expect(payload.ulid).toBe("test-ulid-001");
    expect(payload.hash).toBe("mocked_hash_123");
    expect(putDataToDb).toHaveBeenCalledWith(mockDb, "wallet_assets", payload);
    expect(result).toBe(10);
  });

  test("returns undefined if table name not in map", async () => {
    const handler = IndexedDbHandler.getInstance();
    const unknownTable = { some: "unknown" };
    const result = await handler._addRecord(unknownTable, { data: 1 });

    expect(result).toBeUndefined();
  });
});

describe("hashRecord", () => {
  test("returns hash of { ulid, payload }", async () => {
    const hash = await import("object-hash");

    const handler = IndexedDbHandler.getInstance();
    const result = await handler.hashRecord({ ticker: "AAPL" }, "ulid-123");

    expect(hash.default).toHaveBeenCalledWith({
      ulid: "ulid-123",
      payload: { ticker: "AAPL" },
    });
    expect(result).toBe("mocked_hash_123");
  });
});

describe("getWalletAssets", () => {
  test("returns array from wallet_assets table", async () => {
    const expected = [{ ticker: "AAPL" }, { ticker: "MSFT" }];
    mockDb.wallet_assets.toArray.mockResolvedValue(expected);

    const handler = IndexedDbHandler.getInstance();
    const result = await handler.getWalletAssets();

    expect(result).toEqual(expected);
  });

  test("returns undefined on error", async () => {
    mockDb.wallet_assets.toArray.mockRejectedValue(new Error("read failed"));

    const handler = IndexedDbHandler.getInstance();
    const result = await handler.getWalletAssets();

    expect(result).toEqual([]);
  });
});

describe("getSimResult", () => {
  test("calls sim_history.get with the given index", async () => {
    mockDb.sim_history.get.mockResolvedValue({ data: { profit: 100 } });

    const handler = IndexedDbHandler.getInstance();
    await handler.getSimResult(1);

    expect(mockDb.sim_history.get).toHaveBeenCalledWith(1);
  });
});

describe("deleteWalletAssets", () => {
  test("dispatches remove events and bulk deletes", async () => {
    const { bulkDeleteFromDb } = await import("../../src/db/db");
    bulkDeleteFromDb.mockClear();

    mockDb.wallet_assets.bulkGet.mockResolvedValue([
      { ulid: "u1" },
      { ulid: "u2" },
    ]);

    const handler = IndexedDbHandler.getInstance();
    await handler.deleteWalletAssets([1, 2]);

    expect(mockSyncWorker.AddRemovalEvent).toHaveBeenCalledTimes(2);
    expect(mockSyncWorker.AddRemovalEvent).toHaveBeenCalledWith(
      "u1",
      "wallet_assets",
    );
    expect(mockSyncWorker.AddRemovalEvent).toHaveBeenCalledWith(
      "u2",
      "wallet_assets",
    );
    expect(bulkDeleteFromDb).toHaveBeenCalledWith(mockDb, "wallet_assets", [1, 2]);
  });
});

describe("deleteSimsResults", () => {
  test("dispatches remove events and bulk deletes", async () => {
    const { bulkDeleteFromDb } = await import("../../src/db/db");
    bulkDeleteFromDb.mockClear();
    bulkDeleteFromDb.mockResolvedValue(1);

    mockDb.sim_history.bulkGet.mockResolvedValue([{ ulid: "u3" }]);

    const handler = IndexedDbHandler.getInstance();
    await handler.deleteSimsResults([5]);

    expect(mockSyncWorker.AddRemovalEvent).toHaveBeenCalledWith(
      "u3",
      "sim_history",
    );
    expect(bulkDeleteFromDb).toHaveBeenCalledWith(mockDb, "sim_history", [5]);
  });
});

describe("dispatchRemoveEvents", () => {
  test("calls AddRemovalEvent for each record", async () => {
    mockDb.wallet_assets.bulkGet.mockResolvedValue([
      { ulid: "a" },
      { ulid: "b" },
      { ulid: "c" },
    ]);

    const handler = IndexedDbHandler.getInstance();
    await handler.dispatchRemoveEvents(mockDb.wallet_assets, [1, 2, 3]);

    expect(mockSyncWorker.AddRemovalEvent).toHaveBeenCalledTimes(3);
    expect(mockSyncWorker.AddRemovalEvent).toHaveBeenCalledWith(
      "a",
      "wallet_assets",
    );
    expect(mockSyncWorker.AddRemovalEvent).toHaveBeenCalledWith(
      "b",
      "wallet_assets",
    );
    expect(mockSyncWorker.AddRemovalEvent).toHaveBeenCalledWith(
      "c",
      "wallet_assets",
    );
  });

  test("calls AddRemovalEvent for selected records", async () => {
    const allRecords = [{ ulid: "a" }, { ulid: "b" }, { ulid: "c" }];

    mockDb.wallet_assets.bulkGet.mockImplementation((arr) => {
      return Promise.resolve(
        arr.map((id) => allRecords.find((r) => r.ulid === id)),
      );
    });

    const handler = IndexedDbHandler.getInstance();
    await handler.dispatchRemoveEvents(mockDb.wallet_assets, ["a", "c"]);

    expect(mockSyncWorker.AddRemovalEvent).toHaveBeenCalledTimes(2);
    expect(mockSyncWorker.AddRemovalEvent).toHaveBeenCalledWith(
      "a",
      "wallet_assets",
    );
    expect(mockSyncWorker.AddRemovalEvent).toHaveBeenCalledWith(
      "c",
      "wallet_assets",
    );
  });
});
