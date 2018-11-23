import { EnumTypeDefinitionNode } from 'graphql';
import { DeclarationBlock, wrapWithSingleQuotes, breakLine, indent } from './utils';
import { FlowCommonPluginConfig, ScalarsMap } from './index';

export interface VisitorConfig {
  scalars?: ScalarsMap;
  convert: (str: string) => string;
}

export const flowCommonPluginLeaveHandler = (config: VisitorConfig) => new FlowCommonVisitor(config);

export class FlowCommonVisitor {
  constructor(private config: VisitorConfig) {}

  EnumTypeDefinition(node: EnumTypeDefinitionNode): string {
    const enumValuesName = this.config.convert(node.name.value) + 'Values';

    const enumValues = new DeclarationBlock()
      .export()
      .asKind('const')
      .withName(enumValuesName)
      .withBlock(
        node.values
          .map(enumOption =>
            indent(`${this.config.convert(enumOption.name.value)} = ${wrapWithSingleQuotes(enumOption.name.value)}`)
          )
          .join(', \n')
      ).string;

    const enumType = new DeclarationBlock()
      .export()
      .asKind('type')
      .withName(this.config.convert(node.name.value))
      .withContent(`$Values<typeof ${enumValuesName}>`).string;

    return enumValues + enumType;
  }
}
