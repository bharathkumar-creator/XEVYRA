export class DomainError extends Error {
  public readonly code: string;

  constructor(message: string, code: string = 'DOMAIN_ERROR') {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class Result<T, E = DomainError> {
  public readonly isSuccess: boolean;
  public readonly isFailure: boolean;
  public readonly error?: E;
  private readonly _value?: T;

  private constructor(isSuccess: boolean, error?: E, value?: T) {
    if (isSuccess && error) {
      throw new Error('InvalidOperation: A result cannot be successful and contain an error');
    }
    if (!isSuccess && !error) {
      throw new Error('InvalidOperation: A failing result must contain an error');
    }

    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.error = error;
    this._value = value;
  }

  public getValue(): T {
    if (!this.isSuccess) {
      throw new Error(`Cannot get value of a failure result. Error: ${JSON.stringify(this.error)}`);
    }
    return this._value as T;
  }

  public static ok<U>(value?: U): Result<U, never> {
    return new Result<U, never>(true, undefined, value);
  }

  public static fail<U, F = DomainError>(error: F): Result<U, F> {
    return new Result<U, F>(false, error);
  }
}
