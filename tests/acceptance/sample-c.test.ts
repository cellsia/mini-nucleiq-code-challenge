import { describe, expect, test } from "bun:test";

import {
  AnalyzeSampleCommand,
  buildAnalyzeSampleUseCase,
  Sample,
  SampleVerdict,
} from "../../src/index.ts";
import { InMemorySampleReader } from "../fakes/in-memory-sample-reader.ts";

describe("README sample-c example", () => {
  test("produces every expected algorithm result and the final verdict", async () => {
    const reader = new InMemorySampleReader([
      new Sample("sample-c", [0, 0, 1, 0, 0, 1, 0, 1, 1, 1]),
    ]);
    const analyzeSample = buildAnalyzeSampleUseCase(reader);

    const analysis = await analyzeSample.execute(
      new AnalyzeSampleCommand("sample-c", ["even-zeroes", "contiguous-ones", "surrounded-ones"]),
    );

    expect(
      analysis.results.map((result) => ({
        name: result.name,
        positiveCells: result.positiveCells,
        positivityPercentage: result.positivityPercentage,
        isPositive: result.isPositive,
      })),
    ).toEqual([
      {
        name: "even-zeroes",
        positiveCells: 3,
        positivityPercentage: 30,
        isPositive: false,
      },
      {
        name: "contiguous-ones",
        positiveCells: 2,
        positivityPercentage: 20,
        isPositive: false,
      },
      {
        name: "surrounded-ones",
        positiveCells: 2,
        positivityPercentage: 20,
        isPositive: true,
      },
    ]);
    expect(analysis.verdict).toBe(SampleVerdict.Negative);
  });
});
