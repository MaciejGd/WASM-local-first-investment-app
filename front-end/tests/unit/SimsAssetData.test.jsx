import { test, describe, expect } from "vitest";
import { SimAssetMap } from "../../src/subpages/simulations/SimsAssetsData";

function createDefaultMap() {
  const mp = {
    "LPP.WA": { ticker: "LPP.WA", price: 12, percent: 0, selected: false },
    "ZAB.WA": { ticker: "ZAB.WA", price: 10, percent: 0, selected: true },
    "TEST.WA": { ticker: "TEST.WA", price: 5, percent: 0, selected: false },
  };
  return mp;
}

describe("SimAssetsMap", () => {
  describe("addRecord", () => {
    test("price is not a number", () => {
      const ret = SimAssetMap.addRecord(new Map(), "ticker", "new_price");
      expect(ret).toBe(false);
    });
    test("asset_map properly updated ", () => {
      const mp = new Map();
      const ret = SimAssetMap.addRecord(mp, "LPP.WA", "12");
      expect(ret).toBe(true);
      expect(mp["LPP.WA"]).toEqual({
        ticker: "LPP.WA",
        price: 12,
        percent: 0.0,
        selected: false,
      });
    });
  });

  describe("toArray", () => {
    test("Map turned to array and percentages appended correctly", () => {
      const mp = createDefaultMap();

      const arr = SimAssetMap.toArray(mp);
      expect(arr).toEqual([
        [
          "LPP.WA",
          {
            percent: "44.44",
            price: 12,
            selected: false,
            ticker: "LPP.WA",
          },
        ],
        [
          "ZAB.WA",
          {
            percent: "37.04",
            price: 10,
            selected: true,
            ticker: "ZAB.WA",
          },
        ],
        [
          "TEST.WA",
          {
            percent: "18.52",
            price: 5,
            selected: false,
            ticker: "TEST.WA",
          },
        ],
      ]);
    });

    describe("getTickersArray", () => {
      test("get tickers array returns array of tickers", () => {
        const mp = createDefaultMap();
        const arr = SimAssetMap.getTickersArray(mp);
        expect(arr).toEqual(["LPP.WA", "ZAB.WA", "TEST.WA"]);
      });
    });

    describe("getTickersArray", () => {
      test("get tickers array returns array of tickers", () => {
        const mp = createDefaultMap();
        const arr = SimAssetMap.getTickersArray(mp);
        expect(arr).toEqual(["LPP.WA", "ZAB.WA", "TEST.WA"]);
      });
    });

    describe("setSelected", () => {
      test("set selected as true for a ticker works", () => {
        const mp = createDefaultMap();
        SimAssetMap.setSelected(mp, "ZAB.WA", true);
        expect(mp["ZAB.WA"].selected).toEqual(true);
      });
      test("set selected as false for a ticker works", () => {
        const mp = createDefaultMap();
        SimAssetMap.setSelected(mp, "ZAB.WA", false);
        expect(mp["ZAB.WA"].selected).toEqual(false);
      });
    });

    describe("getTickers", () => {
      test("proper object of form 'tickers' : [tickers list] is returned", () => {
        const arr = SimAssetMap.getTickers(createDefaultMap());
        expect(arr).toEqual(["LPP.WA", "ZAB.WA", "TEST.WA"]);
      });
    });

    describe("getWeights", () => {
      test("proper object of form 'tickers' : [tickers list] is returned", () => {
        const arr = SimAssetMap.getPrices(createDefaultMap());
        expect(arr).toEqual([12, 10, 5]);
      });
    });

    describe("deleteSelected", () => {
      test("proper object of form 'tickers' : [tickers list] is returned", () => {
        const mp = createDefaultMap();
        mp["ZAB.WA"].selected = true;
        SimAssetMap.deleteSelected(mp);

        expect(mp).toEqual({
          "LPP.WA": {
            ticker: "LPP.WA",
            price: 12,
            percent: 0,
            selected: false,
          },
          "TEST.WA": {
            ticker: "TEST.WA",
            price: 5,
            percent: 0,
            selected: false,
          },
        });
      });
    });
  });
});
