import { test, vi, expect, describe } from "vitest";

vi.mock("../../src/db/db", () => ({
  putDataToDb: vi.fn(),
}));

import { putDataToDb } from "../../src/db/db";
import { SyncDBUpdater } from "../../src/sync/syncDBUpdater";

describe("addRecord", () => {
  test("correctly adding records to db", async () => {
    const updater = new SyncDBUpdater("example_db");

    await updater.addRecord("ulid", "wallet_asset", "testing_hash", {
      data: "testing_payload",
    });

    expect(putDataToDb).toHaveBeenCalledExactlyOnceWith(
      "example_db",
      "wallet_asset",
      {
        data: "testing_payload",
        hash: "testing_hash",
        ulid: "ulid",
      },
    );
  });
  test("error catched correctly", async () => {
    const error = new Error("DB failed");
    putDataToDb.mockRejectedValueOnce(error);

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const updater = new SyncDBUpdater("example_db");

    await updater.addRecord("ulid", "wallet_asset", "testing_hash", {
      data: "testing_payload",
    });

    expect(consoleSpy).toHaveBeenCalledWith(error);
    consoleSpy.mockRestore();
  });
});

describe("Removing records from db", () => {
  test("removing records works without issues", async () => {
    const deleteMock = vi.fn().mockResolvedValue(undefined);

    const equalsMock = vi.fn(() => ({
      delete: deleteMock,
    }));

    const whereMock = vi.fn(() => ({
      equals: equalsMock,
    }));

    const tableMock = vi.fn(() => ({
      where: whereMock,
    }));

    const db_handle = {
      table: tableMock,
    };

    const updater = new SyncDBUpdater(db_handle);
    await updater.removeRecord("testing_ulid", "wallet_assets");
    expect(tableMock).toHaveBeenCalledWith("wallet_assets");
    expect(whereMock).toHaveBeenCalledWith("ulid");
    expect(equalsMock).toHaveBeenCalledWith("testing_ulid");
    expect(deleteMock).toHaveBeenCalledOnce();
  });
  test("removing records catches error thrown", async () => {
    const error = new Error("testing error");
    const deleteMock = vi.fn().mockRejectedValueOnce(error);

    const equalsMock = vi.fn(() => ({
      delete: deleteMock,
    }));

    const whereMock = vi.fn(() => ({
      equals: equalsMock,
    }));

    const tableMock = vi.fn(() => ({
      where: whereMock,
    }));

    const db_handle = {
      table: tableMock,
    };

    const updater = new SyncDBUpdater(db_handle);
    await updater.removeRecord("testing_ulid", "wallet_asset");
    expect(tableMock).toHaveBeenCalledWith("wallet_assets");
    expect(whereMock).toHaveBeenCalledWith("ulid");
    expect(equalsMock).toHaveBeenCalledWith("testing_ulid");
    expect(deleteMock).toHaveBeenCalledOnce();
  });
});

describe("updateLastEventId", () => {
  test("correctly updated last event id", async () => {
    const put_mock = vi.fn();
    const db_mock = {
      metadata: {
        put: put_mock,
      },
    };

    const updater = new SyncDBUpdater(db_mock);
    await updater.updateLastEventId(2);
    expect(put_mock).toHaveBeenCalledWith({
      key: "lastEvent",
      value: 2,
    });
  });
});

describe("getLastEventId", () => {
  test("correctly updated last event id", async () => {
    const get_mock = vi.fn().mockResolvedValue({ value: "test" });
    const db_mock = {
      metadata: {
        get: get_mock,
      },
    };

    const updater = new SyncDBUpdater(db_mock);
    const record = await updater.getLastEventId(2);
    expect(get_mock).toHaveBeenCalledWith("lastEvent");
    expect(record).toBe("test");
  });
  test("last event id empty, returns 0", async () => {
    const get_mock = vi.fn().mockResolvedValue(undefined);
    const db_mock = {
      metadata: {
        get: get_mock,
      },
    };

    const updater = new SyncDBUpdater(db_mock);
    const record = await updater.getLastEventId(2);
    expect(get_mock).toHaveBeenCalledWith("lastEvent");
    expect(record).toBe(0);
  });
});
