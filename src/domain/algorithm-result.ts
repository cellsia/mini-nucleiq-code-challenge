export class InvalidAlgorithmResultError extends Error {
  override readonly name = "InvalidAlgorithmResultError";
}

export class AlgorithmResult {
  constructor(
    readonly name: string,
    readonly positiveCells: number,
    readonly totalCells: number,
    readonly thresholdPercentage: number,
  ) {
    if (!Number.isInteger(totalCells) || totalCells < 0) {
      throw new InvalidAlgorithmResultError("Total cells must be a non-negative integer");
    }
    if (!Number.isInteger(positiveCells) || positiveCells < 0 || positiveCells > totalCells) {
      throw new InvalidAlgorithmResultError(
        "Positive cells must be an integer between zero and total cells",
      );
    }
    if (thresholdPercentage < 0 || thresholdPercentage > 100) {
      throw new InvalidAlgorithmResultError("Threshold must be between 0 and 100");
    }

    Object.freeze(this);
  }

  get positivity(): number {
    return this.totalCells === 0 ? 0 : this.positiveCells / this.totalCells;
  }

  get positivityPercentage(): number {
    return this.positivity * 100;
  }

  get isPositive(): boolean {
    return this.positiveCells * 100 > this.thresholdPercentage * this.totalCells;
  }
}
