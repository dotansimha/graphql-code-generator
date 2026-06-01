/**
 * `typedDocumentStringTemplate` is a utility template required by plugins
 * that use documentMode=string.
 * The class acts as a wrapper of string but allows it to type the string with
 * GraphQL Result and Variables type.
 */
export const typedDocumentStringTemplate = `export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}`;
