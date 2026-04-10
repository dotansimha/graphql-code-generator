export class ApolloError extends Error {
  public graphQLErrors: any[];
  public clientErrors: any[];
  public networkError: any;
  public extraInfo: any;

  constructor(opts: {
    graphQLErrors?: any[];
    clientErrors?: any[];
    networkError?: any;
    errorMessage?: string;
    extraInfo?: any;
  }) {
    super(opts.errorMessage || 'Apollo Client Error');
    this.name = 'ApolloError';
    this.graphQLErrors = opts.graphQLErrors ?? [];
    this.clientErrors = opts.clientErrors ?? [];
    this.networkError = opts.networkError;
    this.extraInfo = opts.extraInfo;
  }
}

export function isApolloError(err: unknown): err is ApolloError {
  return err instanceof ApolloError;
}
