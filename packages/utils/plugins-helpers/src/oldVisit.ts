import { visit, type ASTKindToNode, type ASTNode, type DocumentNode } from 'graphql';

/**
 * The result of `oldVisit` on a `DocumentNode` with `leave` visitors.
 *
 * Each definition is replaced by whatever its leave visitor returned (usually a string). Definitions
 * without a leave visitor stay as AST nodes, so check each one before using it.
 */
export type OldVisitDocumentResult = Omit<DocumentNode, 'definitions'> & {
  definitions: unknown[];
};

/**
 * Visitor callbacks keyed by AST node kind, e.g. `{ Field(node) { ... } }`.
 *
 * Callbacks receive the same arguments as graphql's `visit` callbacks. In `leave`, a node's children
 * have already been replaced by their own leave results, so `node` only describes the node's own
 * fields reliably.
 *
 * Each callback is declared with method syntax so its parameters are checked bivariantly: visitor
 * classes can declare narrower parameter types (e.g. `ancestors: ASTNode[]`) for their methods.
 */
export type OldVisitorKindMap = {
  [K in keyof ASTKindToNode]?: {
    visit(
      node: ASTKindToNode[K],
      key: string | number | undefined,
      parent: any,
      path: ReadonlyArray<string | number>,
      ancestors: ReadonlyArray<ASTNode | ReadonlyArray<ASTNode>>,
    ): unknown;
  }['visit'];
};

/**
 * The `visitor` argument of `oldVisit`: `enter` and `leave` visitor maps keyed by AST node kind.
 */
export interface OldVisitor {
  enter?: OldVisitorKindMap;
  leave?: OldVisitorKindMap;
}

/**
 * Visits `root` with `enter` and `leave` visitor maps keyed by AST node kind.
 *
 * Leave visitors replace nodes with whatever they return, so the result's shape depends on the
 * visitor. For a `DocumentNode`, it defaults to `OldVisitDocumentResult`. When a `Document` leave
 * visitor returns a value of its own, pass its type as `TResult`.
 */
export function oldVisit<TResult = OldVisitDocumentResult>(
  root: DocumentNode,
  visitor: OldVisitor,
): TResult;
export function oldVisit<TResult = unknown>(root: ASTNode, visitor: OldVisitor): TResult;
export function oldVisit(
  root: ASTNode,
  { enter: enterVisitors, leave: leaveVisitors, ...newVisitor }: any,
): unknown {
  if (typeof enterVisitors === 'object') {
    for (const key in enterVisitors) {
      newVisitor[key] ||= {};
      newVisitor[key].enter = enterVisitors[key];
    }
  }
  if (typeof leaveVisitors === 'object') {
    for (const key in leaveVisitors) {
      newVisitor[key] ||= {};
      newVisitor[key].leave = leaveVisitors[key];
    }
  }
  return visit(root, newVisitor);
}
