import { validateAsset } from "../../src/subpages/wallet/Stock";
import { expect, test } from "vitest";

const ticker_list_dummy = ["LPP.WA"]

test("validate correct assetData", () => {
  expect(validateAsset(ticker_list_dummy, "LPP.WA", 0.2, 4)).toBe("")
});

test("validate empty ticker", () => {
  expect(validateAsset(ticker_list_dummy, "", 2, 4)).toBe("Ticker should not be empty!");
});

test("validate invalid ticker", () => {
  expect(validateAsset(ticker_list_dummy, "ZAB.WA", 2, 4)).toBe("Please select ticker from the list.");
});

test("validate quantity not a number", () => {
  expect(validateAsset(ticker_list_dummy, "LPP.WA", "test", 4)).toBe("Quantity value should be a number.");
});

test("validate price not a number", () => {
  expect(validateAsset(ticker_list_dummy, "LPP.WA", 4, "test")).toBe("Price value should be a number.");
});
