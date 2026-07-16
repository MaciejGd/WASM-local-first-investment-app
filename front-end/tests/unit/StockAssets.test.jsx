import {
  AssetData,
  AssetsEntry,
  AssetsTableData,
  AssetsMap,
} from "../../src/subpages/wallet/StockAssets";
import { expect, test, vi, describe } from "vitest";
import { GetRecentPrices } from "../../src/subpages/finance_api/FinanceApi";

function createDefaultAssetsMap() {
  const expected_map = new Map([
    ["LPP.WA", new AssetsEntry("LPP.WA")],
    ["ZAB.WA", new AssetsEntry("ZAB.WA")],
    ["TEST.WA", new AssetsEntry("TEST.WA")],
  ]);

  expected_map.get("LPP.WA")._data = [new AssetData(1, 3, 12)];
  expected_map.get("LPP.WA").folded_data = [new AssetData(-1, 3, 12)];
  expected_map.get("ZAB.WA")._data = [new AssetData(2, 4, 10)];
  expected_map.get("ZAB.WA").folded_data = [new AssetData(-1, 4, 10)];
  expected_map.get("TEST.WA")._data = [new AssetData(3, 1, 9)];
  expected_map.get("TEST.WA").folded_data = [new AssetData(-1, 1, 9)];

  return expected_map;
}

describe("AssetData", () => {
  test("Initialize", () => {
    const asset = new AssetData(1, 10, 4);
    expect(asset.quantity).toBe(10);
    expect(asset.price).toBe(4);
    expect(asset.cost).toBe(40);
    expect(asset.selected).toBe(false);
    expect(asset.id).toBe(1);
  });

  test("getProfitPercentage", () => {
    const asset = new AssetData(1, 10, 4);
    expect(asset.getProfitPercentage(100)).toBe(2400);
  });

  test("getProfit", () => {
    const asset = new AssetData(1, 10, 4);
    expect(asset.getProfit(100)).toBe(960);
  });

  test("getCurrentValue", () => {
    const asset = new AssetData(1, 10, 4);
    expect(asset.getCurrentValue(100)).toBe(1000);
  });
});

describe("AssetsEntry", () => {
  test("initialize", () => {
    const asset = new AssetsEntry("LPP.WA");
    expect(asset.ticker).toBe("LPP.WA");
    expect(asset.current_price).toBe(10);
    expect(asset.folded).toBe(false);
    expect(asset.folded_data).toEqual([new AssetData(null, 0, 0)]);
    expect(asset._data).toEqual([]);
  });

  test("getter average_data", () => {
    const asset = new AssetsEntry("LPP.WA");
    expect(asset.average_data).toBe(asset.folded_data[0]);
  });

  test("getter accumulated_cost", () => {
    const asset = new AssetsEntry("LPP.WA");
    expect(asset.accumulated_cost).toBe(0);
  });

  test("getter current_value", () => {
    const asset = new AssetsEntry("LPP.WA");
    asset.folded_data = [new AssetData(1, 10, 23)];
    expect(asset.current_value).toBe(100);
  });

  test("getter profit", () => {
    const asset = new AssetsEntry("LPP.WA");
    asset.folded_data = [new AssetData(1, 10, 23)];
    expect(asset.profit).toBe(-130);
  });

  test("getter profit_percentage", () => {
    const asset = new AssetsEntry("LPP.WA");
    asset.folded_data = [new AssetData(1, 10, 23)];
    expect(asset.profit_percentage).toBeCloseTo(-56.52173);
  });

  test("getter data", () => {
    const asset = new AssetsEntry("LPP.WA");
    asset.folded_data = [new AssetData(1, 10, 23)];
    asset._data = [1, 2, 3, 4];
    expect(asset.data).toEqual([1, 2, 3, 4]);
  });

  test("getter data folded", () => {
    const asset = new AssetsEntry("LPP.WA");
    asset.folded = true;
    asset.folded_data = [new AssetData(1, 10, 23)];
    asset._data = [1, 2, 3, 4];
    expect(asset.data).toEqual([new AssetData(1, 10, 23)]);
  });

  test("getter selected when folded", () => {
    const asset_data = new AssetData(1, 10, 23);
    asset_data.selected = true;

    const data_1 = new AssetData(1, 2, 4);
    const data_2 = new AssetData(4, 2, 1);
    const data_3 = new AssetData(2, 1, 1);
    data_1.selected = true;
    data_2.selected = false;
    data_3.selected = true;

    const asset = new AssetsEntry("LPP.WA");
    asset.folded = true;
    asset.folded_data = [asset_data];
    asset._data = [data_1, data_2, data_3];
    expect(asset.selected).toEqual([data_1, data_2, data_3]);
  });

  test("getter selected when not folded", () => {
    const asset_data = new AssetData(1, 10, 23);
    asset_data.selected = true;

    const data_1 = new AssetData(1, 2, 4);
    const data_2 = new AssetData(4, 2, 1);
    const data_3 = new AssetData(2, 1, 1);
    data_1.selected = true;
    data_2.selected = false;
    data_3.selected = true;

    const asset = new AssetsEntry("LPP.WA");
    asset.folded_data = [asset_data];
    asset._data = [data_1, data_2, data_3];
    expect(asset.selected).toEqual([data_1, data_3]);
  });

  test("addAsset correct", () => {
    const asset = new AssetsEntry("LPP.WA");
    const new_asset = new AssetData(0, 0, 0);
    asset.addAsset(new_asset);
    expect(asset._data).toEqual([new_asset]);
  });

  test("addAsset wrong param type", () => {
    const asset = new AssetsEntry("LPP.WA");
    const new_asset = 4;
    asset.addAsset(new_asset);
    expect(asset._data).toEqual([]);
  });

  test("triggerVisibility already folded", () => {
    const asset = new AssetsEntry("LPP.WA");
    asset.folded = true;
    asset.triggerVisibility();
    expect(asset.folded).toBe(0);
  });

  test("triggerVisibility not folded", () => {
    const asset = new AssetsEntry("LPP.WA");
    asset.folded = false;
    asset.triggerVisibility();
    expect(asset.folded).toBe(1);
  });

  test("updateAverageData", () => {
    const asset = new AssetsEntry("LPP.WA");

    const data_1 = new AssetData(1, 2, 4);
    const data_2 = new AssetData(4, 2, 1);
    const data_3 = new AssetData(2, 1, 1);
    data_1.selected = true;
    data_2.selected = false;
    data_3.selected = true;

    asset._data = [data_1, data_2, data_3];
    asset.udpateAverageData();

    expect(asset.folded_data).toEqual([new AssetData(-1, 5, 2.2)]);
  });

  test("insert", () => {
    const asset = new AssetsEntry("LPP.WA");
    asset.insert(1, 2, 3);

    expect(asset._data).toEqual([new AssetData(1, 2, 3)]);
    expect(asset.folded_data).toEqual([new AssetData(-1, 2, 3)]);
  });

  test("insertIfNotExists id not existing in data", () => {
    const asset = new AssetsEntry("LPP.WA");
    asset.insertIfNotExists(1, 2, 3);

    expect(asset._data).toEqual([new AssetData(1, 2, 3)]);
    expect(asset.folded_data).toEqual([new AssetData(-1, 2, 3)]);
  });

  test("insertIfNotExists id existing in data", () => {
    const asset = new AssetsEntry("LPP.WA");
    asset._data = [new AssetData(1, 2, 3)];
    asset.insertIfNotExists(1, 4, 5);

    expect(asset._data).toEqual([new AssetData(1, 2, 3)]);
    expect(asset.folded_data).toEqual([new AssetData(null, 0, 0)]);
  });

  test("removeNotMatchingAssets", () => {
    const asset = new AssetsEntry("LPP.WA");
    asset._data = [
      new AssetData(1, 3, 4),
      new AssetData(3, 4, 5),
      new AssetData(5, 6, 1),
    ];

    const assets = [
      { ulid: 1, ticker: "LPP.WA" },
      { ulid: 2, ticker: "ZAB.WA" },
      { ulid: 3, ticker: "TEST.WA" },
    ];

    asset.removeNotMatchingAssets(assets);
    expect(asset._data).toEqual([
      new AssetData(1, 3, 4),
      new AssetData(3, 4, 5),
    ]);
  });

  test("selectData, entry not folded, set to true", () => {
    const asset = new AssetsEntry("LPP.WA");
    const data1 = new AssetData(1, 3, 4);
    const data2 = new AssetData(3, 4, 5);
    const data3 = new AssetData(5, 6, 1);
    asset._data = [data1, data2, data3];
    expect(asset._data[1].selected).toBe(false);
    asset._data = [
      new AssetData(1, 3, 4),
      new AssetData(3, 4, 5),
      new AssetData(5, 6, 1),
    ];

    asset.selectData(1, true);
    expect(asset._data[1].selected).toBe(true);
  });

  test("selectData, entry not folded, set to false", () => {
    const asset = new AssetsEntry("LPP.WA");
    const data1 = new AssetData(1, 3, 4);
    const data2 = new AssetData(3, 4, 5);
    const data3 = new AssetData(5, 6, 1);
    data2.selected = true;
    asset._data = [data1, data2, data3];
    expect(asset._data[1].selected).toBe(true);

    asset.selectData(1, false);
    expect(asset._data[1].selected).toBe(false);
  });

  test("selectData, entry folded, set to true", () => {
    const asset = new AssetsEntry("LPP.WA");
    const data1 = new AssetData(1, 3, 4);
    const data2 = new AssetData(3, 4, 5);
    const data3 = new AssetData(5, 6, 1);
    asset._data = [data1, data2, data3];
    asset.folded = true;
    expect(asset._data[1].selected).toBe(false);
    asset._data = [
      new AssetData(1, 3, 4),
      new AssetData(3, 4, 5),
      new AssetData(5, 6, 1),
    ];

    asset.selectData(1, true);
    expect(asset._data[0].selected).toBe(true);
    expect(asset._data[1].selected).toBe(true);
    expect(asset._data[2].selected).toBe(true);
  });

  test("selectData, entry not folded, set to true", () => {
    const asset = new AssetsEntry("LPP.WA");
    const data1 = new AssetData(1, 3, 4);
    const data2 = new AssetData(3, 4, 5);
    const data3 = new AssetData(5, 6, 1);
    asset._data = [data1, data2, data3];
    expect(asset._data[1].selected).toBe(false);
    asset._data = [
      new AssetData(1, 3, 4),
      new AssetData(3, 4, 5),
      new AssetData(5, 6, 1),
    ];

    asset.selectData(1, true);
    expect(asset._data[1].selected).toBe(true);
  });

  test("deleteData, entry not folded, selected one entry", () => {
    const asset = new AssetsEntry("LPP.WA");
    const data1 = new AssetData(1, 3, 4);
    const data2 = new AssetData(3, 4, 5);
    const data3 = new AssetData(5, 6, 1);
    data2.selected = true;
    asset._data = [data1, data2, data3];

    asset.deleteData();
    expect(asset._data[0]).toEqual(data1);
    expect(asset._data[1]).toEqual(data3);
    expect(asset._data.length).toBe(2);

    expect(asset.folded_data[0]).toEqual(new AssetData(-1, 9, 2));
  });

  test("deleteData, entry folded, selected avg data", () => {
    const asset = new AssetsEntry("LPP.WA");
    asset.folded = true;

    const data1 = new AssetData(1, 3, 4);
    const data2 = new AssetData(3, 4, 5);
    const data3 = new AssetData(5, 6, 1);
    asset._data = [data1, data2, data3];
    asset.average_data.selected = true;

    asset.deleteData();
    expect(asset._data.length).toBe(0);

    expect(asset.folded_data[0]).toEqual(new AssetData(-1, 0, NaN));
  });
});

test("AssetsTableData initialization", () => {
  var selected = true;
  var ticker = "LPP.WA";
  var isFolded = false;
  var isFirst = true;
  var quantity = 2;
  var current_price = 10;
  var current_value = 39;
  var profit = 3;
  var profit_percentage = 12;
  var cost = 14;
  var price = 11;
  var idx = 1;
  const asset = new AssetsTableData(
    selected,
    ticker,
    isFolded,
    isFirst,
    quantity,
    current_price,
    current_value,
    profit,
    profit_percentage,
    price,
    cost,
    idx,
  );

  expect(asset.selected).toBe(selected);
  expect(asset.ticker).toBe(ticker);
  expect(asset.isFolded).toBe(isFolded);
  expect(asset.isFirst).toBe(isFirst);
  expect(asset.quantity).toBe(quantity);
  expect(asset.current_price).toBe(current_price);
  expect(asset.current_value).toBe(current_value);
  expect(asset.profit).toBe(profit);
  expect(asset.profit_percentage).toBe(profit_percentage);
  expect(asset.cost).toBe(cost);
  expect(asset.price).toBe(price);
  expect(asset.idx).toBe(idx);
});

describe("AssetsMap", () => {
  test("Empty initialization", () => {
    const assets = new AssetsMap();
    expect(assets.asset_map).toEqual(new Map());
    expect(assets.summary).toEqual(
      new AssetsTableData(
        undefined,
        "Summary",
        false,
        false,
        0,
        "-",
        "0.00",
        "0.00",
        0,
        "-",
        "0.00",
        undefined,
      ),
    );
  });

  test("Initialization from another AssetsMap", () => {
    const assets1 = new AssetsMap();
    const dummy_map = new Map();
    dummy_map.set("test", 2);
    assets1.asset_map = dummy_map;
    assets1.summary = "test2";
    const assets2 = new AssetsMap(assets1);
    expect(assets2.asset_map).toEqual(dummy_map);
    expect(assets2.summary).toEqual("test2");
  });

  test("createFromDB", () => {
    const assets_arr = [
      { ticker: "LPP.WA", ulid: 1, price: 12, quantity: 3 },
      { ticker: "ZAB.WA", ulid: 2, price: 10, quantity: 4 },
      { ticker: "TEST.WA", ulid: 3, price: 9, quantity: 1 },
    ];

    const expected_map = createDefaultAssetsMap();

    const assets1 = AssetsMap.createFromDB(assets_arr);

    expect(assets1.asset_map).toEqual(expected_map);
    expect(assets1.summary).toEqual(
      new AssetsTableData(
        undefined,
        "Summary",
        false,
        false,
        8,
        "-",
        "80.00",
        "-5.00",
        "-5.88",
        "-",
        "85.00",
        undefined,
      ),
    );
  });

  test("createFromDB assets array is undefined", () => {
    const asset_map = AssetsMap.createFromDB(undefined);
    expect(asset_map).toEqual(new AssetsMap());
  });

  test("createFromDB assets array is empty", () => {
    const asset_map = AssetsMap.createFromDB([]);
    expect(asset_map).toEqual(new AssetsMap());
  });

  // we should mock Finance API module
  vi.mock("../../src/subpages/finance_api/FinanceApi", () => ({
    GetRecentPrices: vi.fn(),
  }));

  test("fetchAssetsPrice", async () => {
    GetRecentPrices.mockResolvedValue({
      AAPL: { price: 100 },
    });

    const assets = new AssetsMap();
    assets.asset_map.set("AAPL", new AssetData(1, 10, 100));
    assets.asset_map.set("LPP.WA", new AssetData(2, 5, 200));

    await assets.fetchAssetsPrice();

    expect(assets.asset_map.get("AAPL").current_price).toBe(100);
    expect(assets.asset_map.get("LPP.WA").current_price).toBe(10);
  });

  test("updateFromDB", () => {
    const assets_arr = [
      { ticker: "LPP.WA", ulid: 1, price: 12, quantity: 3 },
      { ticker: "ZAB.WA", ulid: 2, price: 10, quantity: 4 },
      { ticker: "TEST.WA", ulid: 3, price: 9, quantity: 1 },
    ];

    const expected_map = createDefaultAssetsMap();

    const assets1 = AssetsMap.createFromDB(assets_arr);

    expect(assets1.asset_map).toEqual(expected_map);
    expect(assets1.summary).toEqual(
      new AssetsTableData(
        undefined,
        "Summary",
        false,
        false,
        8,
        "-",
        "80.00",
        "-5.00",
        "-5.88",
        "-",
        "85.00",
        undefined,
      ),
    );
  });

  test("updateFromDB assets empty", () => {
    const assets = new AssetsMap();
    const new_assets = assets.updateFromDB([]);

    expect(new_assets).toEqual(assets);
  });

  test("updateFromDB, removing unused old entries", () => {
    const assets_arr = [
      { ticker: "LPP.WA", ulid: 1, price: 12, quantity: 3 },
      { ticker: "ZAB.WA", ulid: 2, price: 10, quantity: 4 },
      { ticker: "TEST.WA", ulid: 3, price: 9, quantity: 1 },
    ];

    const expected_map = createDefaultAssetsMap();

    const old_entry = new AssetsEntry("NEW.WA");
    old_entry._data = [new AssetData(4, 4, 4)];
    old_entry.folded_data = [new AssetData(-1, 4, 4)];

    const assets_og = new AssetsMap();
    assets_og.asset_map.set("NEW.WA", old_entry);
    const assets1 = assets_og.updateFromDB(assets_arr);

    expect(assets1.asset_map).toEqual(expected_map);
    expect(assets1.summary).toEqual(
      new AssetsTableData(
        undefined,
        "Summary",
        false,
        false,
        8,
        "-",
        "80.00",
        "-5.00",
        "-5.88",
        "-",
        "85.00",
        undefined,
      ),
    );
  });

  test("updateFromDB current assets empty", () => {
    const assets_arr = [
      { ticker: "LPP.WA", ulid: 1, price: 12, quantity: 3 },
      { ticker: "ZAB.WA", ulid: 2, price: 10, quantity: 4 },
      { ticker: "TEST.WA", ulid: 3, price: 9, quantity: 1 },
    ];

    const expected_map = createDefaultAssetsMap();

    const assets_og = new AssetsMap();
    const assets1 = assets_og.updateFromDB(assets_arr);

    expect(assets1.asset_map).toEqual(expected_map);
    expect(assets1.summary).toEqual(
      new AssetsTableData(
        undefined,
        "Summary",
        false,
        false,
        8,
        "-",
        "80.00",
        "-5.00",
        "-5.88",
        "-",
        "85.00",
        undefined,
      ),
    );
  });

  test("updateFromDB, removing old values, preserving entry", () => {
    const assets_arr = [
      { ticker: "LPP.WA", ulid: 1, price: 12, quantity: 3 },
      { ticker: "ZAB.WA", ulid: 2, price: 10, quantity: 4 },
      { ticker: "TEST.WA", ulid: 3, price: 9, quantity: 1 },
    ];

    const expected_map = createDefaultAssetsMap();

    const old_entry = new AssetsEntry("LPP.WA");
    old_entry._data = [new AssetData(4, 4, 4), new AssetData(1, 3, 12)];
    old_entry.folded_data = [new AssetData(-1, 4, 4)];

    const assets_og = new AssetsMap();
    assets_og.asset_map.set("LPP.WA", old_entry);
    const assets1 = assets_og.updateFromDB(assets_arr);

    expect(assets1.asset_map).toEqual(expected_map);
    expect(assets1.summary).toEqual(
      new AssetsTableData(
        undefined,
        "Summary",
        false,
        false,
        8,
        "-",
        "80.00",
        "-5.00",
        "-5.88",
        "-",
        "85.00",
        undefined,
      ),
    );
  });

  test("select data, set to true", () => {
    const expected_map = createDefaultAssetsMap();

    const assets_og = new AssetsMap();
    assets_og.asset_map = expected_map;

    assets_og.selectData("LPP.WA", 0, true);
    expect(assets_og.asset_map.get("LPP.WA")._data[0].selected).toEqual(true);
  });

  test("select data, set to false", () => {
    const expected_map = createDefaultAssetsMap();
    expected_map.get("LPP.WA")._data[0].selected = true;

    const assets_og = new AssetsMap();
    assets_og.asset_map = expected_map;

    assets_og.selectData("LPP.WA", 0, false);
    expect(assets_og.asset_map.get("LPP.WA")._data[0].selected).toEqual(false);
  });

  test("produceTableData", () => {
    const expected_map = createDefaultAssetsMap();

    const assets_og = new AssetsMap();
    assets_og.asset_map = expected_map;

    const table_data = assets_og.produceTableData();

    expect(table_data).toEqual([
      new AssetsTableData(
        false,
        "LPP.WA",
        false,
        true,
        3,
        "10.00",
        "30.00",
        "-6.00",
        "-16.67",
        "12.00",
        36,
        0,
      ),
      new AssetsTableData(
        false,
        "ZAB.WA",
        false,
        true,
        4,
        "10.00",
        "40.00",
        "0.00",
        "0.00",
        "10.00",
        40,
        0,
      ),
      new AssetsTableData(
        false,
        "TEST.WA",
        false,
        true,
        1,
        "10.00",
        "10.00",
        "1.00",
        "11.11",
        "9.00",
        9,
        0,
      ),
    ]);
  });

  test("set", () => {
    const asset_entry = new AssetsEntry("LPP.WA");
    asset_entry._data = [new AssetData(1, 2, 3)];
    asset_entry.folded_data = [new AssetData(-1, 2, 3)];

    const assets_map = new AssetsMap();

    assets_map.set("LPP.WA", asset_entry);

    expect(assets_map.asset_map).toEqual(new Map([["LPP.WA", asset_entry]]));
    expect(assets_map.summary).toEqual(
      new AssetsTableData(
        undefined,
        "Summary",
        false,
        false,
        2,
        "-",
        "20.00",
        "14.00",
        "233.33",
        "-",
        "6.00",
        undefined,
      ),
    );
  });

  test("get", () => {
    const asset_entry = new AssetsEntry("LPP.WA");
    asset_entry._data = [new AssetData(1, 2, 3)];
    asset_entry.folded_data = [new AssetData(-1, 2, 3)];

    const assets_map = new AssetsMap();
    assets_map.asset_map = new Map([["LPP.WA", asset_entry]]);

    expect(assets_map.get("LPP.WA")).toEqual(asset_entry);
  });

  test("has", () => {
    const asset_entry = new AssetsEntry("LPP.WA");
    asset_entry._data = [new AssetData(1, 2, 3)];
    asset_entry.folded_data = [new AssetData(-1, 2, 3)];

    const assets_map = new AssetsMap();
    assets_map.asset_map = new Map([["LPP.WA", asset_entry]]);

    expect(assets_map.has("LPP.WA")).toEqual(true);
    expect(assets_map.has("ZAB.WA")).toEqual(false);
  });

  test("countAssetsSummary", () => {
    const expected_map = createDefaultAssetsMap();
    expected_map.get("LPP.WA")._data.push(new AssetData(4, 2, 2));

    const assets_og = new AssetsMap();
    assets_og.asset_map = expected_map;

    assets_og.countAssetsSummary();
    expect(assets_og.summary).toEqual(
      new AssetsTableData(
        undefined, // selected
        "Summary", // ticker
        false, // isFolded
        false, // isFirst
        8, // quantity
        "-", // current_price
        "80.00", // current_value
        "-5.00", // profit
        "-5.88", // profit_percentage
        "-", // price
        "85.00", // cost
        undefined, // idx
      ),
    );
  });

  test("sort descending, by ticker", () => {
    const expected_map = createDefaultAssetsMap();

    const assets_og = new AssetsMap();
    assets_og.asset_map = new Map(expected_map);

    assets_og.sort("ticker", true);
    const sorted_map = [...assets_og.asset_map];

    expect(sorted_map[0][0]).toEqual("LPP.WA");
    expect(sorted_map[1][0]).toEqual("TEST.WA");
    expect(sorted_map[2][0]).toEqual("ZAB.WA");
  });

  test("sort ascending, by ticker", () => {
    const expected_map = createDefaultAssetsMap();

    const assets_og = new AssetsMap();
    assets_og.asset_map = new Map(expected_map);

    assets_og.sort("ticker", false);
    const sorted_map = [...assets_og.asset_map];

    expect(sorted_map[0][0]).toEqual("ZAB.WA");
    expect(sorted_map[1][0]).toEqual("TEST.WA");
    expect(sorted_map[2][0]).toEqual("LPP.WA");
  });

  test("sort descending, by quantity", () => {
    const expected_map = createDefaultAssetsMap();

    const assets_og = new AssetsMap();
    assets_og.asset_map = new Map(expected_map);

    assets_og.sort("quantity", true);
    const sorted_map = [...assets_og.asset_map];

    expect(sorted_map[0][0]).toEqual("TEST.WA");
    expect(sorted_map[1][0]).toEqual("LPP.WA");
    expect(sorted_map[2][0]).toEqual("ZAB.WA");
  });

  test("sort ascending, by quantity", () => {
    const expected_map = createDefaultAssetsMap();

    const assets_og = new AssetsMap();
    assets_og.asset_map = new Map(expected_map);

    assets_og.sort("quantity", false);
    const sorted_map = [...assets_og.asset_map];

    expect(sorted_map[0][0]).toEqual("ZAB.WA");
    expect(sorted_map[1][0]).toEqual("LPP.WA");
    expect(sorted_map[2][0]).toEqual("TEST.WA");
  });

  test("sort descending, by price", () => {
    const expected_map = createDefaultAssetsMap();

    const assets_og = new AssetsMap();
    assets_og.asset_map = new Map(expected_map);

    assets_og.sort("price", true);
    const sorted_map = [...assets_og.asset_map];

    expect(sorted_map[0][0]).toEqual("TEST.WA");
    expect(sorted_map[1][0]).toEqual("ZAB.WA");
    expect(sorted_map[2][0]).toEqual("LPP.WA");
  });

  test("sort ascending, by price", () => {
    const expected_map = createDefaultAssetsMap();

    const assets_og = new AssetsMap();
    assets_og.asset_map = new Map(expected_map);

    assets_og.sort("price", false);
    const sorted_map = [...assets_og.asset_map];

    expect(sorted_map[0][0]).toEqual("LPP.WA");
    expect(sorted_map[1][0]).toEqual("ZAB.WA");
    expect(sorted_map[2][0]).toEqual("TEST.WA");
  });

  // TODO modify the current_price value so we indeed test sorting
  test("sort descending, by current_price", () => {
    const expected_map = createDefaultAssetsMap();

    const assets_og = new AssetsMap();
    assets_og.asset_map = new Map(expected_map);

    assets_og.sort("current_price", true);
    const sorted_map = [...assets_og.asset_map];

    expect(sorted_map[0][0]).toEqual("LPP.WA");
    expect(sorted_map[1][0]).toEqual("ZAB.WA");
    expect(sorted_map[2][0]).toEqual("TEST.WA");
  });

  // TODO modify the current_price value so we indeed test sorting
  test("sort ascending, by current_price", () => {
    const expected_map = createDefaultAssetsMap();

    const assets_og = new AssetsMap();
    assets_og.asset_map = new Map(expected_map);

    assets_og.sort("current_price", false);
    const sorted_map = [...assets_og.asset_map];

    expect(sorted_map[0][0]).toEqual("LPP.WA");
    expect(sorted_map[1][0]).toEqual("ZAB.WA");
    expect(sorted_map[2][0]).toEqual("TEST.WA");
  });

  test("sort descending, by current_value", () => {
    const expected_map = createDefaultAssetsMap();

    const assets_og = new AssetsMap();
    assets_og.asset_map = new Map(expected_map);

    assets_og.sort("current_value", true);
    const sorted_map = [...assets_og.asset_map];

    expect(sorted_map[0][0]).toEqual("TEST.WA");
    expect(sorted_map[1][0]).toEqual("LPP.WA");
    expect(sorted_map[2][0]).toEqual("ZAB.WA");
  });

  test("sort ascending, by current_value", () => {
    const expected_map = createDefaultAssetsMap();

    const assets_og = new AssetsMap();
    assets_og.asset_map = new Map(expected_map);

    assets_og.sort("current_value", false);
    const sorted_map = [...assets_og.asset_map];

    expect(sorted_map[0][0]).toEqual("ZAB.WA");
    expect(sorted_map[1][0]).toEqual("LPP.WA");
    expect(sorted_map[2][0]).toEqual("TEST.WA");
  });

  test("sort descending, by cost", () => {
    const expected_map = createDefaultAssetsMap();

    const assets_og = new AssetsMap();
    assets_og.asset_map = new Map(expected_map);

    assets_og.sort("cost", true);
    const sorted_map = [...assets_og.asset_map];

    expect(sorted_map[0][0]).toEqual("TEST.WA");
    expect(sorted_map[1][0]).toEqual("LPP.WA");
    expect(sorted_map[2][0]).toEqual("ZAB.WA");
  });

  test("sort ascending, by cost", () => {
    const expected_map = createDefaultAssetsMap();

    const assets_og = new AssetsMap();
    assets_og.asset_map = new Map(expected_map);

    assets_og.sort("cost", false);
    const sorted_map = [...assets_og.asset_map];

    expect(sorted_map[0][0]).toEqual("ZAB.WA");
    expect(sorted_map[1][0]).toEqual("LPP.WA");
    expect(sorted_map[2][0]).toEqual("TEST.WA");
  });

  test("sort descending, by profit_percantage", () => {
    const expected_map = createDefaultAssetsMap();

    const assets_og = new AssetsMap();
    assets_og.asset_map = new Map(expected_map);

    assets_og.sort("profit_percantage", true);
    const sorted_map = [...assets_og.asset_map];

    expect(sorted_map[0][0]).toEqual("LPP.WA");
    expect(sorted_map[1][0]).toEqual("ZAB.WA");
    expect(sorted_map[2][0]).toEqual("TEST.WA");
  });

  test("sort ascending, by profit_percantage", () => {
    const expected_map = createDefaultAssetsMap();

    const assets_og = new AssetsMap();
    assets_og.asset_map = new Map(expected_map);

    assets_og.sort("profit_percantage", false);
    const sorted_map = [...assets_og.asset_map];

    expect(sorted_map[0][0]).toEqual("LPP.WA");
    expect(sorted_map[1][0]).toEqual("ZAB.WA");
    expect(sorted_map[2][0]).toEqual("TEST.WA");
  });

  test("getSelectedIds", () => {
    const expected_map = createDefaultAssetsMap();
    // select two assets from default map
    expected_map.get("LPP.WA")._data[0].selected = true;
    expected_map.get("TEST.WA")._data[0].selected = true;

    const assets = new AssetsMap();
    assets.asset_map = expected_map;
    const selected = assets.getSelectedIds();

    expect(selected).toEqual([1, 3]);
  });

  test("deleteSelected", () => {
    const expected_map = createDefaultAssetsMap();
    // select two assets from default map
    expected_map.get("LPP.WA")._data[0].selected = true;
    expected_map.get("TEST.WA")._data[0].selected = true;

    const assets = new AssetsMap();
    assets.asset_map = expected_map;
    assets.deleteSelected();

    expect(expected_map).toEqual(
      new Map([["ZAB.WA", expected_map.get("ZAB.WA")]]),
    );
  });
});
