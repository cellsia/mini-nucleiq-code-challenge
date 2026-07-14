import { describe, expect, test } from "bun:test";

import {
  DEFAULT_BASE_URL,
  DEFAULT_TIMEOUT_MS,
  type HttpClient,
  HttpSampleReader,
} from "../../src/adapters/http-sample-reader.ts";
import {
  InvalidSamplePayloadError,
  SampleNotFoundError,
  SampleReadError,
} from "../../src/application/ports/sample-reader.ts";
import { Sample } from "../../src/domain/sample.ts";

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("HttpSampleReader", () => {
  test("builds a sample from a valid JSON payload", async () => {
    const client: HttpClient = async () => jsonResponse({ name: "sample-c", cells: [0, 0, 1, 0] });
    const reader = new HttpSampleReader({ client });

    await expect(reader.getByName("sample-c")).resolves.toEqual(
      new Sample("sample-c", [0, 0, 1, 0]),
    );
  });

  test("requests the expected URL with a timeout signal", async () => {
    let requestedUrl: string | undefined;
    let requestedInit: RequestInit | undefined;
    const client: HttpClient = async (url, init) => {
      requestedUrl = url;
      requestedInit = init;
      return jsonResponse({ name: "sample-a", cells: [0, 1] });
    };
    const reader = new HttpSampleReader({ baseUrl: "https://example.test", client });

    await reader.getByName("sample-a");

    expect(requestedUrl).toBe("https://example.test/samples/sample-a.json");
    expect(requestedInit?.signal).toBeInstanceOf(AbortSignal);
  });

  test("normalizes a trailing base URL slash", async () => {
    let requestedUrl: string | undefined;
    const client: HttpClient = async (url) => {
      requestedUrl = url;
      return jsonResponse({ name: "sample-a", cells: [] });
    };

    await new HttpSampleReader({ baseUrl: "https://example.test/", client }).getByName("sample-a");

    expect(requestedUrl).toBe("https://example.test/samples/sample-a.json");
  });

  test("translates a 404 response", async () => {
    const reader = new HttpSampleReader({
      client: async () => new Response(null, { status: 404 }),
    });

    await expect(reader.getByName("missing")).rejects.toBeInstanceOf(SampleNotFoundError);
  });

  test("translates other unsuccessful responses", async () => {
    const reader = new HttpSampleReader({
      client: async () => new Response(null, { status: 500 }),
    });

    await expect(reader.getByName("sample-a")).rejects.toBeInstanceOf(SampleReadError);
  });

  test("translates network failures and preserves their cause", async () => {
    const cause = new Error("offline");
    const reader = new HttpSampleReader({
      client: async () => {
        throw cause;
      },
    });

    try {
      await reader.getByName("sample-a");
      throw new Error("Expected getByName to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(SampleReadError);
      expect((error as SampleReadError).cause).toBe(cause);
    }
  });

  test.each([
    [new Response("not-json", { status: 200 })],
    [jsonResponse({ name: "sample-a" })],
    [jsonResponse({ name: "sample-a", cells: [0, 2] })],
  ])("translates an invalid payload", async (response) => {
    const reader = new HttpSampleReader({ client: async () => response });

    await expect(reader.getByName("sample-a")).rejects.toBeInstanceOf(InvalidSamplePayloadError);
  });

  test("exports production defaults", () => {
    expect(DEFAULT_BASE_URL).toBe(
      "https://raw.githubusercontent.com/cellsia/mini-nucleiq-code-challenge/main",
    );
    expect(DEFAULT_TIMEOUT_MS).toBe(10_000);
  });
});
