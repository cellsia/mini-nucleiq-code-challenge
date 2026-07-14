import { Algorithm } from "../algorithm.ts";
import type { Cell } from "../sample.ts";

export class ZeroSurroundedOneAlgorithm extends Algorithm {
  readonly name = "surrounded-ones";
  readonly thresholdPercentage = 10;

  protected countPositiveCells(cells: readonly Cell[]): number {
    let positiveCells = 0;

    for (let index = 1; index < cells.length - 1; index += 1) {
      if (cells[index] === 1 && cells[index - 1] === 0 && cells[index + 1] === 0) {
        positiveCells += 1;
      }
    }

    return positiveCells;
  }
}
