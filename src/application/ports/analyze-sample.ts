import type { SampleAnalysis } from "../../domain/sample-analysis.ts";
import { NoAlgorithmsSelectedError } from "../errors.ts";

export class AnalyzeSampleCommand {
  readonly sampleName: string;
  readonly algorithmNames: readonly string[];

  constructor(sampleName: string, algorithmNames: readonly string[]) {
    if (algorithmNames.length === 0) {
      throw new NoAlgorithmsSelectedError("At least one algorithm must be selected");
    }

    this.sampleName = sampleName;
    this.algorithmNames = Object.freeze([...algorithmNames]);
    Object.freeze(this);
  }
}

export interface AnalyzeSampleUseCase {
  execute(command: AnalyzeSampleCommand): Promise<SampleAnalysis>;
}
