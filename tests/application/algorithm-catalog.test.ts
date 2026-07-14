import { describe, expect, test } from "bun:test";

import { AlgorithmCatalog } from "../../src/application/algorithm-catalog.ts";
import {
  DuplicateAlgorithmNameError,
  UnknownAlgorithmError,
} from "../../src/application/errors.ts";
import { EvenIndexZeroAlgorithm } from "../../src/domain/algorithms/even-index-zero.ts";
import { ForwardAdjacentOnesAlgorithm } from "../../src/domain/algorithms/forward-adjacent-ones.ts";
import { ZeroSurroundedOneAlgorithm } from "../../src/domain/algorithms/zero-surrounded-one.ts";

function makeCatalog(): AlgorithmCatalog {
  return new AlgorithmCatalog([
    new EvenIndexZeroAlgorithm(),
    new ForwardAdjacentOnesAlgorithm(),
    new ZeroSurroundedOneAlgorithm(),
  ]);
}

describe("AlgorithmCatalog", () => {
  test("exposes registered algorithm names in insertion order", () => {
    expect(makeCatalog().availableNames).toEqual([
      "even-zeroes",
      "contiguous-ones",
      "surrounded-ones",
    ]);
  });

  test("returns the matching algorithm instance", () => {
    expect(makeCatalog().getByName("even-zeroes")).toBeInstanceOf(EvenIndexZeroAlgorithm);
  });

  test("reports an unknown algorithm and the available names", () => {
    expect(() => makeCatalog().getByName("magic-marker")).toThrow(UnknownAlgorithmError);

    try {
      makeCatalog().getByName("magic-marker");
    } catch (error) {
      expect(error).toBeInstanceOf(UnknownAlgorithmError);
      expect((error as UnknownAlgorithmError).algorithmName).toBe("magic-marker");
      expect((error as UnknownAlgorithmError).availableNames).toEqual([
        "even-zeroes",
        "contiguous-ones",
        "surrounded-ones",
      ]);
    }
  });

  test("supports a custom algorithm set", () => {
    const catalog = new AlgorithmCatalog([new EvenIndexZeroAlgorithm()]);

    expect(catalog.availableNames).toEqual(["even-zeroes"]);
    expect(() => catalog.getByName("surrounded-ones")).toThrow(UnknownAlgorithmError);
  });

  test("rejects duplicate public names", () => {
    expect(
      () => new AlgorithmCatalog([new EvenIndexZeroAlgorithm(), new EvenIndexZeroAlgorithm()]),
    ).toThrow(DuplicateAlgorithmNameError);
  });
});
