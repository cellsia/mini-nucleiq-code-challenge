import { describe, expect, test } from "bun:test";

import { ZeroSurroundedOneAlgorithm } from "../../src/domain/algorithms/zero-surrounded-one.ts";

describe("ZeroSurroundedOneAlgorithm", () => {
  const algorithm = new ZeroSurroundedOneAlgorithm();

  test("publishes the required identifier and threshold", () => {
    expect(algorithm.name).toBe("surrounded-ones");
    expect(algorithm.thresholdPercentage).toBe(10);
  });

  test("counts ones flanked by zeroes", () => {
    const result = algorithm.analyze([0, 0, 1, 0, 0, 1, 0, 1, 1, 1]);

    expect(result.positiveCells).toBe(2);
    expect(result.positivityPercentage).toBe(20);
    expect(result.isPositive).toBe(true);
  });

  test("counts a single surrounded one", () => {
    expect(algorithm.analyze([0, 1, 0]).positiveCells).toBe(1);
  });

  test("does not treat missing boundary neighbours as zeroes", () => {
    expect(algorithm.analyze([1, 0, 1]).positiveCells).toBe(0);
  });

  test("does not count adjacent ones", () => {
    expect(algorithm.analyze([0, 1, 1, 0]).positiveCells).toBe(0);
  });

  test("handles an empty sample", () => {
    expect(algorithm.analyze([]).isPositive).toBe(false);
  });
});
