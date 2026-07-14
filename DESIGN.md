# Design decisions — mini-nucleiq

This document makes the architectural boundaries and trade-offs explicit without
turning a small code challenge into a framework-heavy application.

## 1. Design goals

The challenge prioritizes simple code and good tests. The solution therefore follows
four rules:

1. Analysis logic is pure, synchronous, and deterministic.
2. Sample retrieval is asynchronous and hidden behind a replaceable port.
3. Domain values validate their invariants and cannot be mutated after construction.
4. Dependency direction is checked by tooling rather than documented only in prose.

There is no CLI or server. Consumers and tests drive the use-case port directly; a
future delivery mechanism would only translate its input to `AnalyzeSampleCommand`.

## 2. Hexagonal boundaries

```text
                       application

consumer ─────▶ AnalyzeSampleUseCase ◀──── AnalyzeSampleService
                 driving port                       │
                                                    │ uses
                                                    ▼
                                               SampleReader
                                                driven port
                                                    ▲
                                                    │ implements
                                             HttpSampleReader
                                               driven adapter
```

Source dependencies point inward:

```text
adapters ─────▶ application ─────▶ domain
    │                                  ▲
    └──────────────────────────────────┘
```

The composition root is the only module that knows the service, adapter, and standard
algorithm implementations at the same time.

## 3. Domain model

`Sample` copies and freezes its cells and accepts only `0` and `1`. The algorithms
receive a readonly cell array and share an abstract `Algorithm.analyze` template:
concrete algorithms supply only their public name, threshold, and counting rule.

`AlgorithmResult` centralizes:

- count and threshold invariants;
- zero-safe positivity calculation;
- strict threshold comparison using integer arithmetic.

`SampleAnalysis` copies and freezes its per-algorithm results. Its final verdict also
uses integer arithmetic, so a tie cannot accidentally become positive through a
floating-point comparison.

The external identifiers remain exactly those in the challenge, while implementation
names explain the counting direction:

| Public identifier | Implementation |
| --- | --- |
| `even-zeroes` | `EvenIndexZeroAlgorithm` |
| `contiguous-ones` | `ForwardAdjacentOnesAlgorithm` |
| `surrounded-ones` | `ZeroSurroundedOneAlgorithm` |

## 4. Application and error model

`AlgorithmCatalog` maps external strings to domain algorithms and rejects duplicate
registrations. The use case resolves every requested name before reading a sample, so
an invalid command performs no external I/O. Requested order and repetitions are
preserved deliberately.

Errors live at the boundary that gives them meaning:

- invalid samples and results belong to the domain;
- selection and catalog failures belong to application behavior;
- retrieval failures belong to the `SampleReader` contract;
- the HTTP adapter converts status codes, rejected requests, malformed JSON, and
  incompatible payloads into those reader errors while preserving native causes.

The adapter injects a minimal `HttpClient` function instead of mocking global `fetch`.
This keeps tests isolated and makes timeout, URL, status, and payload behavior explicit.

## 5. Verification and TDD

Each functional commit was developed test-first and committed only after returning to
green. Tests cover domain boundaries, all three algorithms, catalog and use-case
orchestration, HTTP translation, composition, and the complete `sample-c` example.

The complete gate is `bun run check`:

1. TypeScript strict type checking with no emitted files.
2. Biome lint, formatting, and import checks.
3. Dependency Cruiser rules for hexagonal direction and cycles.
4. Offline Bun tests with a minimum 95% line-coverage threshold.

Using Bun's native runner and `fetch` avoids runtime dependencies. Biome combines
formatting and linting in one tool, while Dependency Cruiser adds the one specialized
check that TypeScript's type system does not provide: architectural dependency rules.
