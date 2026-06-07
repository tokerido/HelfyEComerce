export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly code: string,
    public readonly statusCode: number,
    public readonly isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}
