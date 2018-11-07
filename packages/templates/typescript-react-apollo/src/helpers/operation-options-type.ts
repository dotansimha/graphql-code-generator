import { toPascalCase } from 'graphql-codegen-core';

export function operationOptionsType({ name, operationType }: any, options: Handlebars.HelperOptions) {
  const { noNamespaces } = options.data.root.config || { noNamespaces: false };
  if (operationType === 'mutation') {
    return `
            ReactApollo.OperationOption<
                TProps, 
                ${noNamespaces ? toPascalCase(name) : ''}Mutation, 
                ${noNamespaces ? toPascalCase(name) : ''}Variables, 
                Partial<
                    ReactApollo.MutateProps<
                                            ${noNamespaces ? toPascalCase(name) : ''}Mutation, 
                                            ${noNamespaces ? toPascalCase(name) : ''}Variables
                                            >
                    >
                > | undefined
        `;
  } else {
    return `
            ReactApollo.OperationOption<
                TProps, 
                ${noNamespaces ? toPascalCase(name) : ''}${toPascalCase(operationType)}, 
                ${noNamespaces ? toPascalCase(name) : ''}Variables, 
                Partial<
                    ReactApollo.DataProps<
                                            ${noNamespaces ? toPascalCase(name) : ''}${toPascalCase(operationType)}, 
                                            ${noNamespaces ? toPascalCase(name) : ''}Variables
                                        >
                        >
                > | undefined
        `;
  }
}
