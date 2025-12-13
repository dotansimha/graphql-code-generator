type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type CartLineFragment = { id: string; quantity: number };

export type TestQueryVariables = Exact<{ [key: string]: never }>;

export type TestQuery = { cart?: { lines: { nodes: Array<{ id: string; quantity: number }> } } | null };
