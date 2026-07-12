import { validateAsset } from "../../src/subpages/wallet/Stock";
import { expect, test } from "vitest";

test("validate correct assetData", () => {
  expect(validateAsset("LPP.WA", 0.2, 4)).toBe(true);
});

test("validate empty ticker", () => {
  expect(validateAsset("", 2, 4)).toBe(false);
});

test("validate quantity not a number", () => {
  expect(validateAsset("LPP.WA", "test", 4)).toBe(false);
});

test("validate price not a number", () => {
  expect(validateAsset("LPP.WA", 0, 2, "test")).toBe(false);
});
