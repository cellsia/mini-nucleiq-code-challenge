import { SampleAnalysis } from "../../domain/sample-analysis.ts";
import type { AlgorithmCatalog } from "../algorithm-catalog.ts";
import type { AnalyzeSampleCommand, AnalyzeSampleUseCase } from "../ports/analyze-sample.ts";
import type { SampleReader } from "../ports/sample-reader.ts";

export class AnalyzeSampleService implements AnalyzeSampleUseCase {
  constructor(
    private readonly reader: SampleReader,
    private readonly catalog: AlgorithmCatalog,
  ) {}

  async execute(command: AnalyzeSampleCommand): Promise<SampleAnalysis> {
    const algorithms = command.algorithmNames.map((name) => this.catalog.getByName(name));
    const sample = await this.reader.getByName(command.sampleName);
    const results = algorithms.map((algorithm) => algorithm.analyze(sample.cells));

    return new SampleAnalysis(sample.name, results);
  }
}
