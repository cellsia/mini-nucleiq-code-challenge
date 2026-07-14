import { describe, expect, test } from "bun:test";

import { ForwardAdjacentOnesAlgorithm } from "../../src/domain/algorithms/forward-adjacent-ones.ts";

describe("ForwardAdjacentOnesAlgorithm", () => {
  const algorithm = new ForwardAdjacentOnesAlgorithm();

  test("publishes the required identifier and threshold", () => {
    expect(algorithm.name).toBe("contiguous-ones");
    expect(algorithm.thresholdPercentage).toBe(20);
  });

  test("counts each one whose next cell is also one", () => {
    const result = algorithm.analyze([0, 0, 1, 0, 0, 1, 0, 1, 1, 1]);

    expect(result.positiveCells).toBe(2);
    expect(result.positivityPercentage).toBe(20);
    expect(result.isPositive).toBe(false);
  });

  test("counts the first two cells in a run of three ones", () => {
    expect(algorithm.analyze([1, 1, 1]).positiveCells).toBe(2);
  });

  test("never counts the last cell without a next neighbour", () => {
    expect(algorithm.analyze([0, 0, 1]).positiveCells).toBe(0);
  });

  test("does not count isolated ones", () => {
    expect(algorithm.analyze([1, 0, 1, 0, 1]).positiveCells).toBe(0);
  });

  test("handles an empty sample", () => {
    expect(algorithm.analyze([]).isPositive).toBe(false);
  });
});
