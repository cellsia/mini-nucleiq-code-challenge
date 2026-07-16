import { describe, expect, test } from "bun:test";

import { AlgorithmResult, InvalidAlgorithmResultError } from "../../src/domain/algorithm-result.ts";

describe("AlgorithmResult", () => {
  test.each([
    [-1, 10, 30],
    [11, 10, 30],
    [1.5, 10, 30],
    [1, -1, 30],
    [1, 10.5, 30],
    [1, 10, -1],
    [1, 10, 101],
    [1, 10, Number.NaN],
  ])("rejects inconsistent values", (positiveCells, totalCells, threshold) => {
    expect(() => new AlgorithmResult("algorithm", positiveCells, totalCells, threshold)).toThrow(
      InvalidAlgorithmResultError,
    );
  });
});
