import { describe, expect, test } from "bun:test";

import { InvalidSampleError, Sample } from "../../src/domain/sample.ts";

describe("Sample", () => {
  test("exposes an immutable copy of its name and cells", () => {
    const input = [0, 1, 0];
    const sample = new Sample("sample-a", input);

    input[0] = 1;

    expect(sample.name).toBe("sample-a");
    expect(sample.cells).toEqual([0, 1, 0]);
    expect(Object.isFrozen(sample.cells)).toBe(true);
    expect(Object.isFrozen(sample)).toBe(true);
    expect(sample.size).toBe(3);
  });

  test("allows an empty sample", () => {
    expect(new Sample("empty", []).cells).toEqual([]);
  });

  test.each([
    [[0, 2, 1]],
    [[0, -1]],
    [[1, "0"]],
    [[null]],
    [[true]],
  ])("rejects invalid cells: %p", (cells) => {
    expect(() => new Sample("invalid", cells)).toThrow(InvalidSampleError);
  });

  test("requires a non-empty name", () => {
    expect(() => new Sample("   ", [0, 1])).toThrow(InvalidSampleError);
  });
});
