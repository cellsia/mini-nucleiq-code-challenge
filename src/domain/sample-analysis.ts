import type { AlgorithmResult } from "./algorithm-result.ts";

export const SampleVerdict = Object.freeze({
  Positive: "POSITIVE",
  Negative: "NEGATIVE",
} as const);

export type SampleVerdict = (typeof SampleVerdict)[keyof typeof SampleVerdict];

export class InvalidSampleAnalysisError extends Error {
  override readonly name = "InvalidSampleAnalysisError";
}

export class SampleAnalysis {
  readonly sampleName: string;
  readonly results: readonly AlgorithmResult[];

  constructor(sampleName: string, results: readonly AlgorithmResult[]) {
    if (results.length === 0) {
      throw new InvalidSampleAnalysisError(
        "A sample analysis requires at least one algorithm result",
      );
    }

    this.sampleName = sampleName;
    this.results = Object.freeze([...results]);
    Object.freeze(this);
  }

  get positiveCount(): number {
    return this.results.filter((result) => result.isPositive).length;
  }

  get verdict(): SampleVerdict {
    return this.positiveCount * 2 > this.results.length
      ? SampleVerdict.Positive
      : SampleVerdict.Negative;
  }
}
