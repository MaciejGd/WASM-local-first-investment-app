import { test, expect, vi, describe, beforeEach, afterEach } from "vitest";

const {
  eventsStore,
  metadataStore,
  makeEventsTable,
  metadataTable,
  mockDb,
  mockDbUpdater,
  mockEncrypt,
  mockDecrypt,
  mockRequestPOST,
  mockRequestGET,
} = vi.hoisted(() => {
  const eventsStore = [];
  const metadataStore = {};

  const makeEventsTable = () => ({
    count: vi.fn(() => Promise.resolve(eventsStore.length)),
    orderBy: vi.fn(() => ({
      first: vi.fn(() => Promise.resolve(eventsStore[0] ?? null)),
    })),
    add: vi.fn((data) => {
      eventsStore.push(data);
      return Promise.resolve(eventsStore.length);
    }),
    delete: vi.fn((id) => {
      const idx = eventsStore.findIndex((e) => e.id === id);
      if (idx !== -1) eventsStore.splice(idx, 1);
      return Promise.resolve();
    }),
  });

  const metadataTable = {
    get: vi.fn((key) => Promise.resolve(metadataStore[key] ?? undefined)),
    put: vi.fn((entry) => {
      metadataStore[entry.key] = entry;
      return Promise.resolve();
    }),
  };

  const mockDb = {
    metadata: metadataTable,
    table: vi.fn(),
  };

  const mockDbUpdater = {
    addRecord: vi.fn(),
    removeRecord: vi.fn(),
    updateLastEventId: vi.fn(),
    getLastEventId: vi.fn(),
  };

  const mockEncrypt = vi.fn();
  const mockDecrypt = vi.fn();

  const mockRequestPOST = vi.fn();
  const mockRequestGET = vi.fn();

  return {
    eventsStore,
    metadataStore,
    makeEventsTable,
    metadataTable,
    mockDb,
    mockDbUpdater,
    mockEncrypt,
    mockDecrypt,
    mockRequestPOST,
    mockRequestGET,
  };
});

vi.mock("../../src/db/db.js", () => ({
  getDBInstance: vi.fn(() => mockDb),
  getTablesHashes: vi.fn().mockResolvedValue({
    wallet_assets: "hash_a",
    sim_history: "hash_b",
  }),
  clearTable: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../src/sync/syncDBUpdater.js", () => ({
  SyncDBUpdater: vi.fn(function () { return mockDbUpdater; }),
}));

vi.mock("../../src/db/db_encryptor.js", () => ({
  DBEncryptor: {
    encrypt: mockEncrypt,
    decrypt: mockDecrypt,
  },
}));

vi.mock("../../src/Requests.js", () => ({
  RequestPOST: (...args) => mockRequestPOST(...args),
  RequestGET: (...args) => mockRequestGET(...args),
}));

let DBSynchronizer, sync;

beforeEach(async () => {
  vi.resetModules();

  eventsStore.length = 0;
  Object.keys(metadataStore).forEach((k) => delete metadataStore[k]);

  const outEventsTable = makeEventsTable();
  mockDb.out_events = outEventsTable;
  mockDb.table.mockImplementation((name) => {
    if (name === "out_events") return outEventsTable;
    return {
      count: vi.fn().mockResolvedValue(0),
      add: vi.fn(),
      delete: vi.fn(),
      orderBy: vi.fn().mockReturnValue({ first: vi.fn().mockResolvedValue(null) }),
      where: vi.fn().mockReturnValue({ equals: vi.fn().mockReturnValue({ delete: vi.fn().mockResolvedValue(undefined) }) }),
    };
  });

  mockDbUpdater.addRecord.mockReset().mockResolvedValue(undefined);
  mockDbUpdater.removeRecord.mockReset().mockResolvedValue(undefined);
  mockDbUpdater.updateLastEventId.mockReset().mockResolvedValue(undefined);
  mockDbUpdater.getLastEventId.mockReset().mockResolvedValue(0);

  mockEncrypt.mockReset().mockImplementation((p) => Promise.resolve(`encrypted_${JSON.stringify(p)}`));
  mockDecrypt.mockReset().mockImplementation((p) => Promise.resolve({ decrypted: true }));

  mockRequestPOST.mockReset();
  mockRequestGET.mockReset();

  const mod = await import("../../src/sync/synchronizer.js");
  DBSynchronizer = mod.DBSynchronizer;
  sync = mod.sync;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("constructor", () => {
  test("initializes all properties", () => {
    const s = new DBSynchronizer();
    expect(s.db_handle).toBe(mockDb);
    expect(s.metadata).toBe(mockDb.metadata);
    expect(s.event_queue).toBeDefined();
    expect(s.db_updater).toBe(mockDbUpdater);
    expect(s.incoming_queue).toEqual([]);
    expect(s.outgoing_events_pending).toBe(false);
  });

  test("module-level sync is a DBSynchronizer instance", () => {
    expect(sync).toBeInstanceOf(DBSynchronizer);
  });
});

describe("PersistentEventQueue", () => {
  describe("empty", () => {
    test("returns true when queue is empty", async () => {
      const s = new DBSynchronizer();
      expect(await s.event_queue.empty()).toBe(true);
    });

    test("returns false when queue has items", async () => {
      eventsStore.push({ id: 1 });
      const s = new DBSynchronizer();
      expect(await s.event_queue.empty()).toBe(false);
    });
  });

  describe("front", () => {
    test("returns the oldest item", async () => {
      const item = { id: 1, type: "add" };
      const item2 = { id: 2, type: "del" };
      eventsStore.push(item);
      eventsStore.push(item2);
      const s = new DBSynchronizer();
      expect(await s.event_queue.front()).toEqual(item);
    });

    test("returns undefined when empty", async () => {
      const s = new DBSynchronizer();
      expect(await s.event_queue.front()).toBeNull();
    });
  });

  describe("pop", () => {
    test("removes and returns the oldest item", async () => {
      eventsStore.push({ id: 1, type: "add" }, { id: 2, type: "remove" });
      const s = new DBSynchronizer();
      const popped = await s.event_queue.pop();
      expect(popped).toEqual({ id: 1, type: "add" });
      expect(eventsStore).toHaveLength(1);
    });

    test("returns null when empty", async () => {
      const s = new DBSynchronizer();
      expect(await s.event_queue.pop()).toBeNull();
    });
  });

  describe("length", () => {
    test("returns number of items", async () => {
      eventsStore.push({ id: 1 }, { id: 2 }, { id: 3 });
      const s = new DBSynchronizer();
      expect(await s.event_queue.length()).toBe(3);
    });
  });

  describe("push", () => {
    test("adds item to the queue", async () => {
      const s = new DBSynchronizer();
      await s.event_queue.push({ type: "add" });
      expect(eventsStore).toHaveLength(1);
      expect(eventsStore[0].type).toBe("add");
    });
  });
});

describe("addAdditionToEventQueue", () => {
  test("creates add event and pushes to queue", async () => {
    const s = new DBSynchronizer();
    await s.addAdditionToEventQueue("ulid-1", "wallet_assets", "hash1", { ticker: "AAPL" });

    expect(eventsStore).toHaveLength(1);
    expect(eventsStore[0]).toMatchObject({
      ulid: "ulid-1",
      table_name: "wallet_assets",
      type: "add",
      hash: "hash1",
    });
    expect(mockEncrypt).toHaveBeenCalledWith({ ticker: "AAPL" });
  });
});

describe("addRemovalToEventQueue", () => {
  test("creates remove event with null hash and payload", async () => {
    const s = new DBSynchronizer();
    await s.addRemovalToEventQueue("ulid-2", "sim_history");

    expect(eventsStore).toHaveLength(1);
    expect(eventsStore[0]).toMatchObject({
      ulid: "ulid-2",
      table_name: "sim_history",
      type: "remove",
      hash: null,
      payload: null,
    });
  });
});

describe("_addEventToQueue", () => {
  test("encrypts payload and pushes to queue", async () => {
    const s = new DBSynchronizer();
    await s._addEventToQueue({ ulid: "u1", payload: { data: 42 } });

    expect(mockEncrypt).toHaveBeenCalledWith({ data: 42 });
    expect(eventsStore[0].payload).toBe('encrypted_{"data":42}');
  });

  test("encrypts payload and pushes to queue", async () => {
    const s = new DBSynchronizer();
    await s._addEventToQueue({ ulid: "u1", payload: null });

    expect(mockEncrypt).not.toHaveBeenCalledOnce();
    expect(eventsStore[0].payload).toBe(null);
  });
});

describe("pushToRemote", () => {
  test("returns early if queue is empty", async () => {
    const s = new DBSynchronizer();
    const ret = await s.pushToRemote();

    expect(ret).toBe(true);
    expect(mockRequestPOST).not.toHaveBeenCalled();
  });

  test("posts events to server, pops on success, updates lastEventId", async () => {
    eventsStore.push({ id: 1, type: "add", ulid: "u1" });
    mockRequestPOST.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ event_id: 42 }),
    });

    const s = new DBSynchronizer();
    const ret = await s.pushToRemote();

    expect(mockRequestPOST).toHaveBeenCalledWith(
      "/api/sync/push_event",
      { id: 1, type: "add", ulid: "u1" },
    );
    expect(mockDbUpdater.updateLastEventId).toHaveBeenCalledWith(42);
    expect(eventsStore).toHaveLength(0);
    expect(ret).toBe(true);
  });

  test("stops on request failure and does not pop", async () => {
    eventsStore.push({ id: 1 }, { id: 2 });
    mockRequestPOST.mockRejectedValueOnce(new Error("network error"));

    const s = new DBSynchronizer();
    const ret = await s.pushToRemote();
    
    expect(ret).toBe(false);
    expect(eventsStore).toHaveLength(2);
  });

  test("stops when response is not ok", async () => {
    eventsStore.push({ id: 1 });
    mockRequestPOST.mockResolvedValue({ ok: false });

    const s = new DBSynchronizer();
    const ret = await s.pushToRemote();

    expect(ret).toBe(false );
    expect(eventsStore).toHaveLength(1);
  });
});

describe("pullFromRemote", () => {
  test("returns true when no remote changes", async () => {
    mockDbUpdater.getLastEventId.mockResolvedValue(5);
    mockRequestGET.mockResolvedValue([]);

    const s = new DBSynchronizer();
    const result = await s.pullFromRemote();

    expect(result).toBe(true);
    expect(mockRequestGET).toHaveBeenCalledWith(
      "/api/sync/pull_events_ids/5",
    );
  });

  test("defaults lastId to 0 when undefined", async () => {
    mockDbUpdater.getLastEventId.mockResolvedValue(undefined);
    mockRequestGET.mockResolvedValue([]);

    const s = new DBSynchronizer();
    await s.pullFromRemote();

    expect(mockRequestGET).toHaveBeenCalledWith(
      "/api/sync/pull_events_ids/0",
    );
  });

  test("returns true and updates lastEventId when >100 ids", async () => {
    const manyIds = Array.from({ length: 101 }, (_, i) => i + 1);
    mockRequestGET.mockResolvedValue(manyIds);

    const s = new DBSynchronizer();
    const result = await s.pullFromRemote();

    expect(result).toBe(true);
    expect(mockDbUpdater.updateLastEventId).toHaveBeenCalledWith(101);
  });

  test("fetches events and calls updatePendingEvents", async () => {
    mockRequestGET
      .mockResolvedValueOnce([1, 2])
      .mockResolvedValueOnce([
        {
          id: 1,
          type: "add",
          ulid: "u1",
          table_name: "wallet_assets",
          hash: "h1",
          payload: "enc1",
        },
        {
          id: 2,
          type: "remove",
          ulid: "u2",
          table_name: "sim_history",
        },
      ]);

    const s = new DBSynchronizer();
    await s.pullFromRemote();

    expect(mockDecrypt).toHaveBeenCalledWith("enc1");
    expect(mockDbUpdater.addRecord).toHaveBeenCalledWith(
      "u1",
      "wallet_assets",
      "h1",
      { decrypted: true },
    );
    expect(mockDbUpdater.removeRecord).toHaveBeenCalledWith(
      "u2",
      "sim_history",
    );
    expect(mockDbUpdater.updateLastEventId).toHaveBeenCalledWith(2);
  });
});

describe("updatePendingEvents", () => {
  test("processes add events by decrypting and adding records", async () => {
    const events = [
      {
        id: 1,
        type: "add",
        ulid: "u1",
        table_name: "wallet_assets",
        hash: "h1",
        payload: "enc1",
      },
    ];

    const s = new DBSynchronizer();
    await s.updatePendingEvents(events);

    expect(mockDecrypt).toHaveBeenCalledWith("enc1");
    expect(mockDbUpdater.addRecord).toHaveBeenCalledWith(
      "u1",
      "wallet_assets",
      "h1",
      { decrypted: true },
    );
    expect(mockDbUpdater.updateLastEventId).toHaveBeenCalledWith(1);
  });

  test("processes remove events by removing records", async () => {
    const events = [
      { id: 1, type: "remove", ulid: "u3", table_name: "sim_history" },
    ];

    const s = new DBSynchronizer();
    await s.updatePendingEvents(events);

    expect(mockDbUpdater.removeRecord).toHaveBeenCalledWith(
      "u3",
      "sim_history",
    );
    expect(mockDbUpdater.updateLastEventId).toHaveBeenCalledWith(1);
  });

  test("updates lastEventId with the biggest event id", async () => {
    const events = [
      { id: 5, type: "remove", ulid: "u1", table_name: "t" },
      {
        id: 12,
        type: "add",
        ulid: "u2",
        table_name: "t",
        hash: "h",
        payload: "p",
      },
      { id: 3, type: "remove", ulid: "u3", table_name: "t" },
    ];

    const s = new DBSynchronizer();
    await s.updatePendingEvents(events);

    expect(mockDbUpdater.updateLastEventId).toHaveBeenCalledWith(12);
  });

  test("does not call updateLastEventId when events array is empty", async () => {
    const s = new DBSynchronizer();
    await s.updatePendingEvents([]);

    expect(mockDbUpdater.updateLastEventId).not.toHaveBeenCalled();
  });
});

describe("compareHashes", () => {
  test("returns true when all hashes match", async () => {
    const { getTablesHashes } = await import("../../src/db/db.js");
    getTablesHashes.mockResolvedValue({
      wallet_assets: "aabb",
      sim_history: "ccdd",
    });
    mockRequestPOST.mockResolvedValue({
      json: () =>
        Promise.resolve({
          wallet_assets: { equal: true },
          sim_history: { equal: true },
        }),
    });

    const s = new DBSynchronizer();
    const result = await s.compareHashes();

    expect(result).toBe(true);
    expect(mockRequestPOST).toHaveBeenCalledWith(
      "/api/sync/hash_compare",
      { wallet_assets: "aabb", sim_history: "ccdd" },
    );
    expect(mockDbUpdater.addRecord).not.toHaveBeenCalled();
  });

  test("clears and refills table when hashes differ", async () => {
    const { getTablesHashes, clearTable } = await import("../../src/db/db.js");
    getTablesHashes.mockResolvedValue({ wallet_assets: "old_hash" });
    mockRequestPOST.mockResolvedValue({
      json: () =>
        Promise.resolve({
          wallet_assets: {
            equal: false,
            records: [{ ulid: "u1", hash: "h1", payload: "enc1" }],
          },
        }),
    });

    const s = new DBSynchronizer();
    const result = await s.compareHashes();

    expect(result).toBe(true);
    expect(clearTable).toHaveBeenCalledWith("wallet_assets");
    expect(mockDecrypt).toHaveBeenCalledWith("enc1");
    expect(mockDbUpdater.addRecord).toHaveBeenCalledWith(
      "u1",
      "wallet_assets",
      "h1",
      { decrypted: true },
    );
  });

  test("clears table but skips adding when no records provided", async () => {
    const { getTablesHashes, clearTable } = await import("../../src/db/db.js");
    getTablesHashes.mockResolvedValue({ wallet_assets: "hash" });
    mockRequestPOST.mockResolvedValue({
      json: () =>
        Promise.resolve({ wallet_assets: { equal: false } }),
    });

    const s = new DBSynchronizer();
    await s.compareHashes();

    expect(clearTable).toHaveBeenCalledWith("wallet_assets");
    expect(mockDbUpdater.addRecord).not.toHaveBeenCalled();
  });

  test("returns false on request failure", async () => {
    mockRequestPOST.mockRejectedValue(new Error("network error"));

    const s = new DBSynchronizer();
    const result = await s.compareHashes();

    expect(result).toBe(false);
  });
});

describe("pollData", () => {
  test("returns early if outgoing_events_pending is true", async () => {
    const s = new DBSynchronizer();
    s.outgoing_events_pending = true;

    await s.pollData();

    expect(mockRequestGET).not.toHaveBeenCalled();
    expect(mockRequestPOST).not.toHaveBeenCalled();
  });

  test("calls pull, push, and compare in sequence", async () => {
    mockRequestGET.mockResolvedValue([]);
    const { getTablesHashes } = await import("../../src/db/db.js");
    getTablesHashes.mockResolvedValue({
      wallet_assets: "a",
      sim_history: "b",
    });
    mockRequestPOST.mockResolvedValue({
      json: () =>
        Promise.resolve({
          wallet_assets: { equal: true },
          sim_history: { equal: true },
        }),
    });

    const s = new DBSynchronizer();
    await s.pollData();

    expect(s.outgoing_events_pending).toBe(false);
    expect(mockRequestGET).toHaveBeenCalled();
    expect(mockRequestPOST).toHaveBeenCalled();
  });

  test("sets outgoing_events_pending true during execution", async () => {
    const s = new DBSynchronizer();
    let capturedState;
    mockRequestGET.mockImplementation(async () => {
      capturedState = s.outgoing_events_pending;
      return [];
    });
    const { getTablesHashes } = await import("../../src/db/db.js");
    getTablesHashes.mockResolvedValue({
      wallet_assets: "a",
      sim_history: "b",
    });
    mockRequestPOST.mockResolvedValue({
      json: () =>
        Promise.resolve({
          wallet_assets: { equal: true },
          sim_history: { equal: true },
        }),
    });

    await s.pollData();

    expect(capturedState).toBe(true);
  });
});

describe("purgeTable", () => {
  test("posts purge request to server", async () => {
    mockRequestPOST.mockResolvedValue({ status: "ok" });

    const s = new DBSynchronizer();
    await s.purgeTable("wallet_assets");

    expect(mockRequestPOST).toHaveBeenCalledWith(
      "/api/sync/purge",
      { table_name: "wallet_assets" },
    );
  });

  test("does not throw on request failure", async () => {
    mockRequestPOST.mockRejectedValue(new Error("network error"));

    const s = new DBSynchronizer();
    await expect(s.purgeTable("wallet_assets")).resolves.toBeUndefined();
  });
});
