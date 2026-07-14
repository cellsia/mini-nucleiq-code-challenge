import { describe, expect, test } from "bun:test";

import { EvenIndexZeroAlgorithm } from "../../src/domain/algorithms/even-index-zero.ts";

describe("EvenIndexZeroAlgorithm", () => {
  const algorithm = new EvenIndexZeroAlgorithm();

  test("publishes the required identifier and threshold", () => {
    expect(algorithm.name).toBe("even-zeroes");
    expect(algorithm.thresholdPercentage).toBe(30);
  });

  test("counts zeroes at even indexes", () => {
    const result = algorithm.analyze([0, 0, 1, 0, 0, 1, 0, 1, 1, 1]);

    expect(result.positiveCells).toBe(3);
    expect(result.totalCells).toBe(10);
  });

  test("is negative when positivity equals the strict threshold", () => {
    const result = algorithm.analyze([0, 0, 1, 0, 0, 1, 0, 1, 1, 1]);

    expect(result.positivity).toBe(0.3);
    expect(result.positivityPercentage).toBe(30);
    expect(result.isPositive).toBe(false);
  });

  test("is positive above the threshold", () => {
    expect(algorithm.analyze([0, 1, 0, 1, 0, 1]).isPositive).toBe(true);
  });

  test("does not count zeroes at odd indexes", () => {
    expect(algorithm.analyze([1, 0, 1, 0, 1, 0]).positiveCells).toBe(0);
  });

  test("handles an empty sample without division by zero", () => {
    const result = algorithm.analyze([]);

    expect(result.positiveCells).toBe(0);
    expect(result.positivity).toBe(0);
    expect(result.isPositive).toBe(false);
  });
});
