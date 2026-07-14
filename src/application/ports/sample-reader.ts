import type { Sample } from "../../domain/sample.ts";
import { ApplicationError } from "../errors.ts";

export class SampleReadError extends ApplicationError {
  override readonly name: string = "SampleReadError";

  constructor(
    readonly sampleName: string,
    message?: string,
    options?: ErrorOptions,
  ) {
    super(message ?? `Could not retrieve sample: ${JSON.stringify(sampleName)}`, options);
  }
}

export class SampleNotFoundError extends SampleReadError {
  override readonly name: string = "SampleNotFoundError";

  constructor(sampleName: string) {
    super(sampleName, `Sample not found: ${JSON.stringify(sampleName)}`);
  }
}

export class InvalidSamplePayloadError extends SampleReadError {
  override readonly name: string = "InvalidSamplePayloadError";

  constructor(sampleName: string, options?: ErrorOptions) {
    super(sampleName, `Invalid payload for sample: ${JSON.stringify(sampleName)}`, options);
  }
}

export interface SampleReader {
  getByName(name: string): Promise<Sample>;
}
