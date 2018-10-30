export class DetailedError extends Error {
  constructor(public message: string, public error?: Error) {
    super(message);
  }
}
