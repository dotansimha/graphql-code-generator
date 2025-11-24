import {
  Kind,
  type DirectiveNode,
  type EnumValueDefinitionNode,
  type FieldDefinitionNode,
  type InputValueDefinitionNode,
} from 'graphql';
import { transformComment } from './utils';

export const getNodeComment = (
  node: FieldDefinitionNode | EnumValueDefinitionNode | InputValueDefinitionNode
): string => {
  let commentText = node.description?.value;
  const deprecationDirective = node.directives.find(v => v.name.value === 'deprecated');
  if (deprecationDirective) {
    const deprecationReason = getDeprecationReason(deprecationDirective);
    commentText = `${commentText ? `${commentText}\n` : ''}@deprecated ${deprecationReason}`;
  }
  const comment = transformComment(commentText, 1);
  return comment;
};

const getDeprecationReason = (directive: DirectiveNode): string | void => {
  if (directive.name.value === 'deprecated') {
    let reason = 'Field no longer supported';
    const deprecatedReason = directive.arguments[0];
    if (deprecatedReason && deprecatedReason.value.kind === Kind.STRING) {
      reason = deprecatedReason.value.value;
    }
    return reason;
  }
};
