import { describe, expect, test } from "bun:test";

import { AlgorithmResult } from "../../src/domain/algorithm-result.ts";
import {
  InvalidSampleAnalysisError,
  SampleAnalysis,
  SampleVerdict,
} from "../../src/domain/sample-analysis.ts";

function result(name: string, positive: boolean): AlgorithmResult {
  return new AlgorithmResult(name, 1, 10, positive ? 5 : 50);
}

describe("SampleAnalysis", () => {
  test("keeps an immutable copy of the sample name and results", () => {
    const input = [result("a", true), result("b", false)];
    const analysis = new SampleAnalysis("sample-x", input);

    input.pop();

    expect(analysis.sampleName).toBe("sample-x");
    expect(analysis.results).toHaveLength(2);
    expect(Object.isFrozen(analysis.results)).toBe(true);
    expect(Object.isFrozen(analysis)).toBe(true);
  });

  test("is positive only with a strict majority", () => {
    const analysis = new SampleAnalysis("sample", [
      result("a", true),
      result("b", true),
      result("c", false),
    ]);

    expect(analysis.positiveCount).toBe(2);
    expect(analysis.verdict).toBe(SampleVerdict.Positive);
  });

  test("treats a tie as negative", () => {
    const analysis = new SampleAnalysis("sample", [result("a", true), result("b", false)]);

    expect(analysis.verdict).toBe(SampleVerdict.Negative);
  });

  test("a single algorithm determines the final verdict", () => {
    expect(new SampleAnalysis("sample", [result("a", true)]).verdict).toBe(SampleVerdict.Positive);
    expect(new SampleAnalysis("sample", [result("a", false)]).verdict).toBe(SampleVerdict.Negative);
  });

  test("requires at least one result", () => {
    expect(() => new SampleAnalysis("sample", [])).toThrow(InvalidSampleAnalysisError);
  });
});
