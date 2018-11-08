import { toPascalCase } from 'graphql-codegen-core';

export function propsType({ name, operationType }: any, options: Handlebars.HelperOptions) {
  const { noNamespaces } = options.data.root.config || { noNamespaces: false };
  if (operationType === 'mutation') {
    return `
            Partial<
                ReactApollo.MutateProps<
                                        ${noNamespaces ? toPascalCase(name) : ''}Mutation, 
                                        ${noNamespaces ? toPascalCase(name) : ''}Variables
                                        >
                >
        `;
  } else {
    return `
            Partial<
                ReactApollo.DataProps<
                                        ${noNamespaces ? toPascalCase(name) : ''}${toPascalCase(operationType)}, 
                                        ${noNamespaces ? toPascalCase(name) : ''}Variables
                                    >
                    >
        `;
  }
}
