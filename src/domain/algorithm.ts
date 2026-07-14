import { AlgorithmResult } from "./algorithm-result.ts";
import type { Cell } from "./sample.ts";

export abstract class Algorithm {
  abstract readonly name: string;
  abstract readonly thresholdPercentage: number;

  protected abstract countPositiveCells(cells: readonly Cell[]): number;

  analyze(cells: readonly Cell[]): AlgorithmResult {
    return new AlgorithmResult(
      this.name,
      this.countPositiveCells(cells),
      cells.length,
      this.thresholdPercentage,
    );
  }
}
