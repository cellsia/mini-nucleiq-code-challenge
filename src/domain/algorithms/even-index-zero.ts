import { Algorithm } from "../algorithm.ts";
import type { Cell } from "../sample.ts";

export class EvenIndexZeroAlgorithm extends Algorithm {
  readonly name = "even-zeroes";
  readonly thresholdPercentage = 30;

  protected countPositiveCells(cells: readonly Cell[]): number {
    return cells.reduce<number>(
      (count, cell, index) => count + (cell === 0 && index % 2 === 0 ? 1 : 0),
      0,
    );
  }
}
