import * as ts from 'typescript';
import * as tsdoc from '@microsoft/tsdoc';
import * as os from 'os';
import { writeFileSync } from 'fs';

type Example = { title?: string; description?: string; code: string };
type ConfigComment = {
  name: string;
  type: string;
  description: string;
  defaultValue: string;
  warning: string;
  examples: Example[];
};

export async function generateConfig(inputFile: string): Promise<string> {
  const program: ts.Program = ts.createProgram([inputFile], {
    target: ts.ScriptTarget.ES5,
    allowSyntheticDefaultImports: true,
    lib: ['es6', 'esnext', 'es2015', 'dom'],
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    module: ts.ModuleKind.CommonJS,
  });

  const compilerDiagnostics: ReadonlyArray<ts.Diagnostic> = program.getSemanticDiagnostics();
  if (compilerDiagnostics.length > 0) {
    for (const diagnostic of compilerDiagnostics) {
      const message: string = ts.flattenDiagnosticMessageText(diagnostic.messageText, os.EOL);
      if (diagnostic.file) {
        const location: ts.LineAndCharacter = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
        const formattedMessage: string = `${diagnostic.file.fileName}(${location.line + 1},${location.character + 1}):` + ` [TypeScript] ${message}`;
        // tslint:disable-next-line:no-console
        console.error(formattedMessage);
      } else {
        // tslint:disable-next-line:no-console
        console.error(message);
      }
    }
  }

  const sourceFile: ts.SourceFile | undefined = program.getSourceFile(inputFile);

  if (!sourceFile) {
    throw new Error('Error retrieving source file');
  }

  const foundComments: IFoundComment[] = [];
  walkCompilerAstAndFindComments(sourceFile, foundComments);
  const configuration: ConfigComment[] = foundComments.map(comment => parseTSDoc(comment));

  const output = configuration
    .map(config => {
      return `
### ${config.name} (\`${config.type}\`${!config.defaultValue ? '' : `, default value: \`${config.defaultValue}\``})

${config.description ? config.description + '\n' : ''}
${config.warning ? '> ' + config.warning + '\n' : ''}
${config.examples
  .map(example => {
    return `#### ${example.title ? `Usage Example: ${example.title}` : 'Usage Example'}
${example.description ? `${example.description}\n` : ''}\n${example.code}`;
  })
  .join('\n')}`;
    })
    .join('\n');

  return output;
}

const nameDefinition: tsdoc.TSDocTagDefinition = new tsdoc.TSDocTagDefinition({
  tagName: '@name',
  syntaxKind: tsdoc.TSDocTagSyntaxKind.BlockTag,
  allowMultiple: false,
});
const typeDefinition: tsdoc.TSDocTagDefinition = new tsdoc.TSDocTagDefinition({
  tagName: '@type',
  syntaxKind: tsdoc.TSDocTagSyntaxKind.BlockTag,
  allowMultiple: false,
});
const descriptionDefinition: tsdoc.TSDocTagDefinition = new tsdoc.TSDocTagDefinition({
  tagName: '@description',
  syntaxKind: tsdoc.TSDocTagSyntaxKind.BlockTag,
  allowMultiple: false,
});
const defaultDefinition: tsdoc.TSDocTagDefinition = new tsdoc.TSDocTagDefinition({
  tagName: '@default',
  syntaxKind: tsdoc.TSDocTagSyntaxKind.BlockTag,
  allowMultiple: false,
});
const warningDefinition: tsdoc.TSDocTagDefinition = new tsdoc.TSDocTagDefinition({
  tagName: '@warning',
  syntaxKind: tsdoc.TSDocTagSyntaxKind.BlockTag,
  allowMultiple: false,
});

function parseTSDoc(foundComment: IFoundComment): ConfigComment {
  const customConfiguration: tsdoc.TSDocConfiguration = new tsdoc.TSDocConfiguration();

  customConfiguration.addTagDefinitions([nameDefinition, typeDefinition, descriptionDefinition, defaultDefinition]);

  const tsdocParser: tsdoc.TSDocParser = new tsdoc.TSDocParser(customConfiguration);
  const parserContext: tsdoc.ParserContext = tsdocParser.parseRange(foundComment.textRange);
  const docComment: tsdoc.DocComment = parserContext.docComment;

  return {
    name: getTagValue(nameDefinition, docComment).trim(),
    type: (getTagValue(typeDefinition, docComment) || '').trim(),
    description: getTagValue(descriptionDefinition, docComment, false) || '',
    defaultValue: (getTagValue(defaultDefinition, docComment) || '').trim(),
    warning: (getTagValue(warningDefinition, docComment) || '').trim(),
    examples: extractExamples(docComment),
  };
}

function extractExamples(docComment: tsdoc.DocComment): Example[] {
  const exampleBlocks = docComment.customBlocks.filter(block => block.blockTag.tagName === '@example');

  return exampleBlocks.map(exampleBlock => {
    let title = null;
    let description = null;
    let codeNodes = exampleBlock.content.nodes;
    const firstNodeIsText = exampleBlock.content.nodes[0].kind === 'Paragraph';

    if (firstNodeIsText) {
      const content = extractContentFromParagraph(exampleBlock.content.nodes[0] as tsdoc.DocParagraph);

      if (content.trim() !== '') {
        const splitted = content.split('\n');
        title = splitted[0].trim();
        description =
          splitted.length > 1
            ? splitted
                .slice(1)
                .join('\n')
                .trim()
            : null;
      }
      codeNodes = codeNodes.slice(1);
    }

    const code = codeNodes.map(node => extractStringFromNode(node)).join('\n');

    return {
      title,
      description,
      code,
    };
  });
}

function getTagValue(tag: tsdoc.TSDocTagDefinition, docComment: tsdoc.DocComment, withLineBreaks = true): string | null {
  const block = docComment.customBlocks.find(block => block.blockTag.tagName === tag.tagName);

  if (!block) {
    return null;
  }

  return extractContentFromBlock(block, withLineBreaks);
}

function extractContentFromBlock(block: tsdoc.DocBlock, withLineBreaks: boolean) {
  const paragraphNode = block.content.nodes.find(node => node.kind === 'Paragraph') as tsdoc.DocParagraph;

  if (!paragraphNode) {
    return null;
  }

  return extractContentFromParagraph(paragraphNode, withLineBreaks);
}

function extractContentFromParagraph(parentNode: tsdoc.DocParagraph, withLineBreaks = true) {
  const nodesString = parentNode.nodes.map(node => extractStringFromNode(node, withLineBreaks));

  return nodesString.join('').trim();
}

function extractStringFromNode(node: tsdoc.DocNode, withLineBreaks = true): string {
  if (node.kind === 'PlainText') {
    return (node as tsdoc.DocPlainText).text;
  }
  if (node.kind === 'CodeSpan') {
    return `\`${(node as tsdoc.DocCodeSpan).code}\``;
  }
  if (node.kind === 'FencedCode') {
    const codeNode = node as tsdoc.DocFencedCode;
    return `\`\`\`${codeNode.language || ''}\n${codeNode.code}\`\`\``;
  }
  if (node.kind === 'LinkTag') {
    const linkNode = node as tsdoc.DocLinkTag;
    return `[${linkNode.linkText}](${linkNode.urlDestination})`;
  }
  if (node.kind === 'SoftBreak') {
    if (!withLineBreaks) {
      return ' ';
    }

    return `\n`;
  }

  return '';
}

interface IFoundComment {
  compilerNode: ts.Node;
  textRange: tsdoc.TextRange;
}

function walkCompilerAstAndFindComments(node: ts.Node, foundComments: IFoundComment[]): void {
  const buffer: string = node.getSourceFile().getFullText(); // don't use getText() here!

  // Only consider nodes that are part of a declaration form.  Without this, we could discover
  // the same comment twice (e.g. for a MethodDeclaration and its PublicKeyword).
  if (isDeclarationKind(node.kind)) {
    // Find "/** */" style comments associated with this node.
    // Note that this reinvokes the compiler's scanner -- the result is not cached.
    const comments: ts.CommentRange[] = getJSDocCommentRanges(node, buffer);

    if (comments.length > 0) {
      for (const comment of comments) {
        foundComments.push({
          compilerNode: node,
          textRange: tsdoc.TextRange.fromStringRange(buffer, comment.pos, comment.end),
        });
      }
    }
  }

  return node.forEachChild(child => walkCompilerAstAndFindComments(child, foundComments));
}

function getJSDocCommentRanges(node: ts.Node, text: string): ts.CommentRange[] {
  const commentRanges: ts.CommentRange[] = [];

  switch (node.kind) {
    case ts.SyntaxKind.Parameter:
    case ts.SyntaxKind.TypeParameter:
    case ts.SyntaxKind.FunctionExpression:
    case ts.SyntaxKind.ArrowFunction:
    case ts.SyntaxKind.ParenthesizedExpression:
      commentRanges.push(...(ts.getTrailingCommentRanges(text, node.pos) || []));
      break;
  }
  commentRanges.push(...(ts.getLeadingCommentRanges(text, node.pos) || []));

  // True if the comment starts with '/**' but not if it is '/**/'
  return commentRanges.filter(
    comment => text.charCodeAt(comment.pos + 1) === 0x2a /* ts.CharacterCodes.asterisk */ && text.charCodeAt(comment.pos + 2) === 0x2a /* ts.CharacterCodes.asterisk */ && text.charCodeAt(comment.pos + 3) !== 0x2f /* ts.CharacterCodes.slash */
  );
}

function isDeclarationKind(kind: ts.SyntaxKind): boolean {
  return (
    kind === ts.SyntaxKind.ArrowFunction ||
    kind === ts.SyntaxKind.BindingElement ||
    kind === ts.SyntaxKind.ClassDeclaration ||
    kind === ts.SyntaxKind.ClassExpression ||
    kind === ts.SyntaxKind.Constructor ||
    kind === ts.SyntaxKind.EnumDeclaration ||
    kind === ts.SyntaxKind.EnumMember ||
    kind === ts.SyntaxKind.ExportSpecifier ||
    kind === ts.SyntaxKind.FunctionDeclaration ||
    kind === ts.SyntaxKind.FunctionExpression ||
    kind === ts.SyntaxKind.GetAccessor ||
    kind === ts.SyntaxKind.ImportClause ||
    kind === ts.SyntaxKind.ImportEqualsDeclaration ||
    kind === ts.SyntaxKind.ImportSpecifier ||
    kind === ts.SyntaxKind.InterfaceDeclaration ||
    kind === ts.SyntaxKind.JsxAttribute ||
    kind === ts.SyntaxKind.MethodDeclaration ||
    kind === ts.SyntaxKind.MethodSignature ||
    kind === ts.SyntaxKind.ModuleDeclaration ||
    kind === ts.SyntaxKind.NamespaceExportDeclaration ||
    kind === ts.SyntaxKind.NamespaceImport ||
    kind === ts.SyntaxKind.Parameter ||
    kind === ts.SyntaxKind.PropertyAssignment ||
    kind === ts.SyntaxKind.PropertyDeclaration ||
    kind === ts.SyntaxKind.PropertySignature ||
    kind === ts.SyntaxKind.SetAccessor ||
    kind === ts.SyntaxKind.ShorthandPropertyAssignment ||
    kind === ts.SyntaxKind.TypeAliasDeclaration ||
    kind === ts.SyntaxKind.TypeParameter ||
    kind === ts.SyntaxKind.VariableDeclaration ||
    kind === ts.SyntaxKind.JSDocTypedefTag ||
    kind === ts.SyntaxKind.JSDocCallbackTag ||
    kind === ts.SyntaxKind.JSDocPropertyTag
  );
}
