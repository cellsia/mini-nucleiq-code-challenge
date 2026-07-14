import {
  SampleNotFoundError,
  type SampleReader,
} from "../../src/application/ports/sample-reader.ts";
import type { Sample } from "../../src/domain/sample.ts";

export class InMemorySampleReader implements SampleReader {
  readonly requestedNames: string[] = [];
  readonly #samples: Map<string, Sample>;

  constructor(samples: readonly Sample[] = []) {
    this.#samples = new Map(samples.map((sample) => [sample.name, sample]));
  }

  async getByName(name: string): Promise<Sample> {
    this.requestedNames.push(name);
    const sample = this.#samples.get(name);
    if (sample === undefined) {
      throw new SampleNotFoundError(name);
    }
    return sample;
  }
}
