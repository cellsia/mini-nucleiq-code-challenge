import { HttpSampleReader } from "./adapters/http-sample-reader.ts";
import { AlgorithmCatalog } from "./application/algorithm-catalog.ts";
import type { AnalyzeSampleUseCase } from "./application/ports/analyze-sample.ts";
import type { SampleReader } from "./application/ports/sample-reader.ts";
import { AnalyzeSampleService } from "./application/services/analyze-sample.ts";
import { EvenIndexZeroAlgorithm } from "./domain/algorithms/even-index-zero.ts";
import { ForwardAdjacentOnesAlgorithm } from "./domain/algorithms/forward-adjacent-ones.ts";
import { ZeroSurroundedOneAlgorithm } from "./domain/algorithms/zero-surrounded-one.ts";

export function buildAnalyzeSampleUseCase(
  reader: SampleReader = new HttpSampleReader(),
): AnalyzeSampleUseCase {
  const catalog = new AlgorithmCatalog([
    new EvenIndexZeroAlgorithm(),
    new ForwardAdjacentOnesAlgorithm(),
    new ZeroSurroundedOneAlgorithm(),
  ]);

  return new AnalyzeSampleService(reader, catalog);
}
