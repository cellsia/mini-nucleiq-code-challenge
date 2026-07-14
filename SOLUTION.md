# mini-nucleiq — TypeScript/Bun solution

A small TypeScript library that retrieves simplified tissue samples and analyzes
them with one or more marker-detection algorithms. It returns the positive-cell
count, positivity percentage, and verdict for every algorithm, plus a final sample
verdict.

The delivery mechanism is deliberately a library. Its public entry point is the
`AnalyzeSampleUseCase` driving port; the default implementation and HTTP adapter are
assembled by the composition root.

## Requirements and setup

- Bun 1.3+
- No runtime dependencies
- Development tools are pinned in `bun.lock`

```bash
bun install --frozen-lockfile
```

Run the complete quality gate:

```bash
bun run check
```

Or run each check separately:

```bash
bun test
bun run test:coverage
bun run typecheck
bun run lint
bun run architecture
```

The tests are deterministic and offline. The HTTP adapter is exercised through an
injected fake `fetch`-compatible client.

## Running an analysis

```typescript
import {
  AnalyzeSampleCommand,
  buildAnalyzeSampleUseCase,
} from "./src/index.ts";

const analyzeSample = buildAnalyzeSampleUseCase();
const analysis = await analyzeSample.execute(
  new AnalyzeSampleCommand("sample-c", [
    "even-zeroes",
    "contiguous-ones",
    "surrounded-ones",
  ]),
);

for (const result of analysis.results) {
  console.log(
    `${result.name}: positive cells = ${result.positiveCells}, ` +
      `positivity = ${result.positivityPercentage}%, ` +
      `result = ${result.isPositive ? "POSITIVE" : "NEGATIVE"}`,
  );
}

console.log("Final sample result:", analysis.verdict);
```

The output for `sample-c` is:

```text
even-zeroes: positive cells = 3, positivity = 30%, result = NEGATIVE
contiguous-ones: positive cells = 2, positivity = 20%, result = NEGATIVE
surrounded-ones: positive cells = 2, positivity = 20%, result = POSITIVE
Final sample result: NEGATIVE
```

## Architecture

```text
consumer
   │
   ▼
AnalyzeSampleUseCase                 driving port
   ▲
   │ implemented by
AnalyzeSampleService ───────────▶ domain
   │
   ▼
SampleReader                         driven port
   ▲
   │ implemented by
HttpSampleReader                     driven adapter
```

- `domain` contains immutable business concepts and pure analysis rules.
- `application` coordinates the use case and owns both port contracts.
- `adapters` translates HTTP and payload failures into application-level errors.
- `bootstrap.ts` selects the three standard algorithms and the default reader.
- `index.ts` is the supported package entry point.

Dependency Cruiser enforces that domain imports neither application nor adapters,
that application never imports adapters, and that no circular dependencies exist.

## Public contracts

### Driving port

```typescript
interface AnalyzeSampleUseCase {
  execute(command: AnalyzeSampleCommand): Promise<SampleAnalysis>;
}
```

`AnalyzeSampleCommand` copies and freezes algorithm names and rejects an empty
selection before any I/O can occur.

### Driven port

```typescript
interface SampleReader {
  getByName(name: string): Promise<Sample>;
}
```

Reader implementations expose `SampleNotFoundError`, `InvalidSamplePayloadError`,
or the general `SampleReadError`. Native `fetch` errors do not cross the port.

### Composition root

`buildAnalyzeSampleUseCase(reader?)` uses `HttpSampleReader` by default and accepts
an injected reader for tests or alternative integrations.

## Assumptions and trade-offs

- Thresholds are strict: exactly 30%, 20%, or 10% is not above the threshold.
- A tie in the final vote is `NEGATIVE`.
- Missing neighbours do not behave as zero-valued cells.
- Empty samples are valid and produce zero positivity.
- At least one algorithm must be selected.
- Repeated algorithm names are allowed, executed, and counted in request order.
- Percentages are not rounded internally.
- The HTTP timeout is 10 seconds.
- The working raw GitHub URL is used because the endpoint printed in the challenge
  statement contains a duplicated path segment.
- A library keeps the challenge focused on domain behavior and testability. A CLI or
  HTTP controller can be added later as another driving adapter.
