import { ASTNode, visit } from 'graphql';

type VisitFn = typeof visit;
type NewVisitor = Partial<Parameters<VisitFn>[1]>;
type OldVisitor = {
  enter?: Partial<Record<keyof NewVisitor, NonNullable<NewVisitor[keyof NewVisitor]>['enter']>>;
  leave?: Partial<Record<keyof NewVisitor, NonNullable<NewVisitor[keyof NewVisitor]>['leave']>>;
} & NewVisitor;

export function oldVisit(
  root: ASTNode,
  { enter: enterVisitors, leave: leaveVisitors, ...newVisitor }: OldVisitor
): any {
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
