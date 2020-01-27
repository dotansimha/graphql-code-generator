export class DetailedError extends Error {
  constructor(public message: string, public details: string, public source?: string) {
    super(message);
    Object.setPrototypeOf(this, DetailedError.prototype);
    Error.captureStackTrace(this, DetailedError);
  }
}

export function isDetailedError(error: any): error is DetailedError {
  return error.details;
}
