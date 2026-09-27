import { ASTNode, DocumentNode, visit } from 'graphql';

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
 * Visits `root` with `enter` and `leave` visitor maps keyed by AST node kind.
 *
 * Leave visitors replace nodes with whatever they return, so the result's shape depends on the
 * visitor. For a `DocumentNode`, it defaults to `OldVisitDocumentResult`. When a `Document` leave
 * visitor returns a value of its own, pass its type as `TResult`.
 */
export function oldVisit<TResult = OldVisitDocumentResult>(
  root: DocumentNode,
  visitor: any,
): TResult;
export function oldVisit<TResult = unknown>(root: ASTNode, visitor: any): TResult;
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
