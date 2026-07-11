import { AssetData, AssetsEntry } from "../../src/subpages/wallet/StockAssets";
import { expect, test } from "vitest";

test('AssetData Initialize', () => {
  const asset = new AssetData(1, 10, 4);
  expect(asset.quantity).toBe(10);
  expect(asset.price).toBe(4);
  expect(asset.cost).toBe(40);
  expect(asset.selected).toBe(false);
  expect(asset.id).toBe(1);
})

test('AssetData getProfitPercentage', () => {
  const asset = new AssetData(1, 10, 4);
  expect(asset.getProfitPercentage(100)).toBe(2400);
})

test('AssetData getProfit', () => {
  const asset = new AssetData(1, 10, 4);
  expect(asset.getProfit(100)).toBe(960);
})

test('AssetData getCurrentValue', () => {
  const asset = new AssetData(1, 10, 4);
  expect(asset.getCurrentValue(100)).toBe(1000);
})

test('AsssetsEntry initialize', () => {
  const asset = new AssetsEntry("LPP.WA");
  expect(asset.ticker).toBe("LPP.WA");
  expect(asset.current_price).toBe(10);
  expect(asset.folded).toBe(false);
  expect(asset.folded_data).toEqual([new AssetData(null, 0, 0)]);
  expect(asset._data).toEqual([]);
})

test('AsssetsEntry getter average_data', () => {
  const asset = new AssetsEntry("LPP.WA");
  expect(asset.average_data).toBe(asset.folded_data[0]);
})

test('AsssetsEntry getter accumulated_cost', () => {
  const asset = new AssetsEntry("LPP.WA");
  expect(asset.accumulated_cost).toBe(0);
})

test('AsssetsEntry getter current_value', () => {
  const asset = new AssetsEntry("LPP.WA");
  asset.folded_data = [new AssetData(1, 10, 23)]
  expect(asset.current_value).toBe(100);
})

test('AsssetsEntry getter profit', () => {
  const asset = new AssetsEntry("LPP.WA");
  asset.folded_data = [new AssetData(1, 10, 23)]
  expect(asset.profit).toBe(-130);
})

test('AsssetsEntry getter profit_percentage', () => {
  const asset = new AssetsEntry("LPP.WA");
  asset.folded_data = [new AssetData(1, 10, 23)]
  expect(asset.profit_percentage).toBeCloseTo(-56.52173);
})

test('AsssetsEntry getter data', () => {
  const asset = new AssetsEntry("LPP.WA");
  asset.folded_data = [new AssetData(1, 10, 23)]
  asset._data = [1, 2, 3, 4]
  expect(asset.data).toEqual([1,2,3,4]);
})

test('AsssetsEntry getter data folded', () => {
  const asset = new AssetsEntry("LPP.WA");
  asset.folded = true;
  asset.folded_data = [new AssetData(1, 10, 23)]
  asset._data = [1, 2, 3, 4]
  expect(asset.data).toEqual([new AssetData(1,10,23)]);
})

test('AsssetsEntry getter selected when folded', () => {
  const asset_data = new AssetData(1, 10, 23)
  asset_data.selected = true;

  const data_1 = new AssetData(1,2,4);
  const data_2 = new AssetData(4,2,1);
  const data_3 = new AssetData(2,1,1);
  data_1.selected = true;
  data_2.selected = false;
  data_3.selected = true;

  const asset = new AssetsEntry("LPP.WA");
  asset.folded = true;
  asset.folded_data = [asset_data]  
  asset._data = [data_1, data_2, data_3]
  expect(asset.selected).toEqual([data_1, data_2, data_3]);
})


test('AsssetsEntry getter selected when not folded', () => {
  const asset_data = new AssetData(1, 10, 23)
  asset_data.selected = true;

  const data_1 = new AssetData(1,2,4);
  const data_2 = new AssetData(4,2,1);
  const data_3 = new AssetData(2,1,1);
  data_1.selected = true;
  data_2.selected = false;
  data_3.selected = true;

  const asset = new AssetsEntry("LPP.WA");
  asset.folded_data = [asset_data]  
  asset._data = [data_1, data_2, data_3]
  expect(asset.selected).toEqual([data_1, data_3]);
})

test('AssetsEntry addAsset correct', () => {
  const asset = new AssetsEntry("LPP.WA");
  const new_asset = new AssetData(0,0,0);
  asset.addAsset(new_asset)
  expect(asset._data).toEqual([new_asset]);
})

test('AssetsEntry addAsset wrong param type', () => {
  const asset = new AssetsEntry("LPP.WA");
  const new_asset = 4;
  asset.addAsset(new_asset)
  expect(asset._data).toEqual([]);
})

test('AssetsEntry triggerVisibility already folded', () => {
  const asset = new AssetsEntry("LPP.WA");
  asset.folded = true;
  asset.triggerVisibility();
  expect(asset.folded).toBe(0);
})

test('AssetsEntry triggerVisibility not folded', () => {
  const asset = new AssetsEntry("LPP.WA");
  asset.folded = false;
  asset.triggerVisibility();
  expect(asset.folded).toBe(1);
})

test('AssetsEntry updateAverageData', () => {
  const asset = new AssetsEntry("LPP.WA");

  const data_1 = new AssetData(1,2,4);
  const data_2 = new AssetData(4,2,1);
  const data_3 = new AssetData(2,1,1);
  data_1.selected = true;
  data_2.selected = false;
  data_3.selected = true;

  asset._data = [data_1, data_2, data_3];
  asset.udpateAverageData();

  expect(asset.folded_data).toEqual([new AssetData(-1, 5, 2.2)]);
})

test('AssetsEntry insert', () => {
  const asset = new AssetsEntry("LPP.WA");
  asset.insert(1, 2, 3);

  expect(asset._data).toEqual([new AssetData(1,2,3)]);
  expect(asset.folded_data).toEqual([new AssetData(-1,2,3)]);
})


test('AssetsEntry insertIfNotExists id not existing in data', () => {
  const asset = new AssetsEntry("LPP.WA");
  asset.insertIfNotExists(1, 2, 3);

  expect(asset._data).toEqual([new AssetData(1,2,3)]);
  expect(asset.folded_data).toEqual([new AssetData(-1,2,3)]);
})

test('AssetsEntry insertIfNotExists id existing in data', () => {
  const asset = new AssetsEntry("LPP.WA");
  asset._data = [new AssetData(1,2,3)]; 
  asset.insertIfNotExists(1, 4, 5);

  expect(asset._data).toEqual([new AssetData(1,2,3)]);
  expect(asset.folded_data).toEqual([new AssetData(null, 0, 0)]);
})