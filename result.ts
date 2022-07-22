export class Result<TOk, TError> {
  private ok: TOk | undefined;
  private error: TError | undefined;

  private constructor(value: TOk | undefined, error: TError | undefined) {
    if (!value && !error) throw "Can't have both values undefined";

    this.ok = value;
    this.error = error;
  }

  get IsError() {
    return this.error !== undefined;
  }

  static Ok<TOk, TError>(value: TOk) {
    return new Result<TOk, TError>(value, undefined);
  }
  static Error<TOk, TError>(value: TError) {
    return new Result<TOk, TError>(undefined, value);
  }

  match<TOutput>(
    successFn: (ok: TOk) => TOutput,
    errorFn: (err: TError) => TOutput,
  ) {
    if (this.error != undefined) return errorFn(this.error);
    if (this.ok != undefined) return successFn(this.ok);

    throw "Really shouldn't get here, neither branches matched";
  }

  map<TOk2>(mapFn: (value: TOk) => TOk2): Result<TOk2, TError> {
    return this.match(
      initValue => Result.Ok(mapFn(initValue)),
      err => Result.Error(err),
    );
  }
  bind<TOk2>(
    bindFn: (value: TOk) => Result<TOk2, TError>,
  ): Result<TOk2, TError> {
    return this.match(
      initValue => bindFn(initValue),
      err => Result.Error(err),
    );
  }
}

export type ValidationError = {
  errorType: 'ValidationError';
  message: string;
  errors: string[];
};
export type UnknownError = { errorType: 'UnknownError'; message: string };
export type DownstreamError = {
  errorType: 'DownstreamError';
  message: string;
  status: string;
  error: any;
};
export type PartialError = {
  errorType: 'PartialError';
  status: string;
  data: any;
};

export type ApplicationError =
  | ValidationError
  | PartialError
  | DownstreamError
  | UnknownError;