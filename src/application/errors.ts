export class ApplicationError extends Error {}

export class DuplicateAlgorithmNameError extends ApplicationError {
  override readonly name = "DuplicateAlgorithmNameError";

  constructor(readonly algorithmName: string) {
    super(`Duplicate algorithm name: ${JSON.stringify(algorithmName)}`);
  }
}

export class UnknownAlgorithmError extends ApplicationError {
  override readonly name = "UnknownAlgorithmError";
  readonly availableNames: readonly string[];

  constructor(
    readonly algorithmName: string,
    availableNames: readonly string[],
  ) {
    super(
      `Unknown algorithm ${JSON.stringify(algorithmName)}; available algorithms: ${availableNames.join(", ")}`,
    );
    this.availableNames = Object.freeze([...availableNames]);
  }
}

export class NoAlgorithmsSelectedError extends ApplicationError {
  override readonly name = "NoAlgorithmsSelectedError";
}
