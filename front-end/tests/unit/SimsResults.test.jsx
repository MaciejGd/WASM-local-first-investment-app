import { test, expect } from "vitest";
import {
  retrieveVar,
  PERCENTILES,
  PERCENTILE_SIZE,
} from "../../src/subpages/simulations/SimsResults";

test("Retrieve VaR data from results, dividing by zero throws", () => {
  const results = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0,
  ];

  expect(() => retrieveVar(results)).toThrow(
    new Error("Sum of the array should not be equal to 0!!!"),
  );
});

test("Retrieve VaR data from results, correct", () => {
  const results = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 10, 1, 2, 3,
  ];

  const var_obj = retrieveVar(results);
  expect(var_obj.VaR).toBe((1000).toFixed(2));
  expect(var_obj.cvars).toEqual([
    ((1 / 6) * 100).toFixed(2),
    ((2 / 6) * 100).toFixed(2),
    ((3 / 6) * 100).toFixed(2),
  ]);
});
