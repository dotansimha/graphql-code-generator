export interface OperationsDocumentConfig {
  /**
   * @default Infinity
   * @description Allows you choose how many levels of depth selection sets will be generated
   */
  depthLimit?: number;
  /**
   * @default 1
   * @description Allows you choose how many times the circular references can repeat
   */
  circularReferenceDepth?: number;
}
