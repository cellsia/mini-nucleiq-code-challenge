import { Algorithm } from "../algorithm.ts";
import type { Cell } from "../sample.ts";

export class ForwardAdjacentOnesAlgorithm extends Algorithm {
  readonly name = "contiguous-ones";
  readonly thresholdPercentage = 20;

  protected countPositiveCells(cells: readonly Cell[]): number {
    let positiveCells = 0;

    for (let index = 0; index < cells.length - 1; index += 1) {
      if (cells[index] === 1 && cells[index + 1] === 1) {
        positiveCells += 1;
      }
    }

    return positiveCells;
  }
}
