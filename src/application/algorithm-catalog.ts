import type { Algorithm } from "../domain/algorithm.ts";
import { DuplicateAlgorithmNameError, UnknownAlgorithmError } from "./errors.ts";

export class AlgorithmCatalog {
  readonly #algorithms = new Map<string, Algorithm>();

  constructor(algorithms: readonly Algorithm[]) {
    for (const algorithm of algorithms) {
      if (this.#algorithms.has(algorithm.name)) {
        throw new DuplicateAlgorithmNameError(algorithm.name);
      }
      this.#algorithms.set(algorithm.name, algorithm);
    }
  }

  get availableNames(): readonly string[] {
    return Object.freeze([...this.#algorithms.keys()]);
  }

  getByName(name: string): Algorithm {
    const algorithm = this.#algorithms.get(name);
    if (algorithm === undefined) {
      throw new UnknownAlgorithmError(name, this.availableNames);
    }
    return algorithm;
  }
}
