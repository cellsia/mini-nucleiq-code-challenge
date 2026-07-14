import {
  InvalidSamplePayloadError,
  SampleNotFoundError,
  SampleReadError,
  type SampleReader,
} from "../application/ports/sample-reader.ts";
import { Sample } from "../domain/sample.ts";

export const DEFAULT_BASE_URL =
  "https://raw.githubusercontent.com/cellsia/mini-nucleiq-code-challenge/main";
export const DEFAULT_TIMEOUT_MS = 10_000;

export type HttpClient = (url: string, init: RequestInit) => Promise<Response>;

export interface HttpSampleReaderOptions {
  readonly baseUrl?: string;
  readonly client?: HttpClient;
  readonly timeoutMs?: number;
}

export class HttpSampleReader implements SampleReader {
  readonly #baseUrl: string;
  readonly #client: HttpClient;
  readonly #timeoutMs: number;

  constructor(options: HttpSampleReaderOptions = {}) {
    this.#baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.#client = options.client ?? ((url, init) => fetch(url, init));
    this.#timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  async getByName(name: string): Promise<Sample> {
    const url = `${this.#baseUrl}/samples/${encodeURIComponent(name)}.json`;
    let response: Response;

    try {
      response = await this.#client(url, { signal: AbortSignal.timeout(this.#timeoutMs) });
    } catch (cause) {
      throw new SampleReadError(name, undefined, { cause });
    }

    if (response.status === 404) {
      throw new SampleNotFoundError(name);
    }
    if (!response.ok) {
      throw new SampleReadError(
        name,
        `Could not retrieve sample ${JSON.stringify(name)}: HTTP ${response.status}`,
      );
    }

    try {
      const payload: unknown = await response.json();
      if (!isRecord(payload) || typeof payload.name !== "string" || !Array.isArray(payload.cells)) {
        throw new TypeError("Payload must contain a name and cells array");
      }
      return new Sample(payload.name, payload.cells);
    } catch (cause) {
      throw new InvalidSamplePayloadError(name, { cause });
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
