import { describe, expect, test } from "bun:test";

import { AlgorithmCatalog } from "../../src/application/algorithm-catalog.ts";
import { NoAlgorithmsSelectedError, UnknownAlgorithmError } from "../../src/application/errors.ts";
import { AnalyzeSampleCommand } from "../../src/application/ports/analyze-sample.ts";
import { SampleNotFoundError } from "../../src/application/ports/sample-reader.ts";
import { AnalyzeSampleService } from "../../src/application/services/analyze-sample.ts";
import { EvenIndexZeroAlgorithm } from "../../src/domain/algorithms/even-index-zero.ts";
import { ForwardAdjacentOnesAlgorithm } from "../../src/domain/algorithms/forward-adjacent-ones.ts";
import { ZeroSurroundedOneAlgorithm } from "../../src/domain/algorithms/zero-surrounded-one.ts";
import { Sample } from "../../src/domain/sample.ts";
import { SampleVerdict } from "../../src/domain/sample-analysis.ts";
import { InMemorySampleReader } from "../fakes/in-memory-sample-reader.ts";

const SAMPLE_C = new Sample("sample-c", [0, 0, 1, 0, 0, 1, 0, 1, 1, 1]);

function makeUseCase(...samples: Sample[]): {
  service: AnalyzeSampleService;
  reader: InMemorySampleReader;
} {
  const reader = new InMemorySampleReader(samples);
  const catalog = new AlgorithmCatalog([
    new EvenIndexZeroAlgorithm(),
    new ForwardAdjacentOnesAlgorithm(),
    new ZeroSurroundedOneAlgorithm(),
  ]);
  return { service: new AnalyzeSampleService(reader, catalog), reader };
}

describe("AnalyzeSampleCommand", () => {
  test("keeps an immutable copy of algorithm names", () => {
    const names = ["a", "b"];
    const command = new AnalyzeSampleCommand("sample-a", names);

    names.pop();

    expect(command.algorithmNames).toEqual(["a", "b"]);
    expect(Object.isFrozen(command.algorithmNames)).toBe(true);
    expect(Object.isFrozen(command)).toBe(true);
  });

  test("requires at least one algorithm", () => {
    expect(() => new AnalyzeSampleCommand("sample-a", [])).toThrow(NoAlgorithmsSelectedError);
  });
});

describe("AnalyzeSampleService", () => {
  test("retrieves the sample through the reader port", async () => {
    const { service, reader } = makeUseCase(SAMPLE_C);

    await service.execute(new AnalyzeSampleCommand("sample-c", ["even-zeroes"]));

    expect(reader.requestedNames).toEqual(["sample-c"]);
  });

  test("runs repeated requested algorithms in order", async () => {
    const { service } = makeUseCase(SAMPLE_C);

    const analysis = await service.execute(
      new AnalyzeSampleCommand("sample-c", ["surrounded-ones", "even-zeroes", "surrounded-ones"]),
    );

    expect(analysis.results.map((result) => result.name)).toEqual([
      "surrounded-ones",
      "even-zeroes",
      "surrounded-ones",
    ]);
  });

  test("produces the expected counts and final verdict", async () => {
    const { service } = makeUseCase(SAMPLE_C);

    const analysis = await service.execute(
      new AnalyzeSampleCommand("sample-c", ["even-zeroes", "contiguous-ones", "surrounded-ones"]),
    );

    expect(analysis.results.map((result) => result.positiveCells)).toEqual([3, 2, 2]);
    expect(analysis.verdict).toBe(SampleVerdict.Negative);
  });

  test("resolves all algorithms before reading the sample", async () => {
    const { service, reader } = makeUseCase(SAMPLE_C);

    await expect(
      service.execute(new AnalyzeSampleCommand("sample-c", ["even-zeroes", "unknown"])),
    ).rejects.toBeInstanceOf(UnknownAlgorithmError);
    expect(reader.requestedNames).toEqual([]);
  });

  test("propagates sample reader errors", async () => {
    const { service } = makeUseCase();

    await expect(
      service.execute(new AnalyzeSampleCommand("missing", ["even-zeroes"])),
    ).rejects.toBeInstanceOf(SampleNotFoundError);
  });
});
