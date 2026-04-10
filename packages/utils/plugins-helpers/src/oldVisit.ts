import { ASTNode, visit } from 'graphql';

export function oldVisit(
  root: ASTNode,
  { enter: enterVisitors, leave: leaveVisitors, ...newVisitor }: any,
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
