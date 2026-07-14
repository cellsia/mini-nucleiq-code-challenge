export type Cell = 0 | 1;

export class InvalidSampleError extends Error {
  override readonly name = "InvalidSampleError";
}

export class Sample {
  readonly name: string;
  readonly cells: readonly Cell[];

  constructor(name: string, cells: readonly unknown[]) {
    if (name.trim().length === 0) {
      throw new InvalidSampleError("Sample name must be a non-empty string");
    }

    for (const [index, cell] of cells.entries()) {
      if (cell !== 0 && cell !== 1) {
        throw new InvalidSampleError(`Cell at index ${index} must be 0 or 1`);
      }
    }

    this.name = name;
    this.cells = Object.freeze([...cells] as Cell[]);
    Object.freeze(this);
  }

  get size(): number {
    return this.cells.length;
  }
}
