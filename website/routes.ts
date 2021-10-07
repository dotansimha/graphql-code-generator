import {GenerateRoutes, IRoutes} from '@guild-docs/server';

export function getRoutes(): IRoutes {
    const Routes: IRoutes = {
        _: {
            docs: {
                $name: 'Docs',
                $routes: ['getting_started', 'plugins', 'presets', 'integrations', 'custom_codegen', 'migration'],
                _: {
                    getting_started: {
                        $name: 'Getting Started',
                        $routes: ['index', 'installation', 'config_reference', 'development-workflow', 'programmatic-usage', 'further-reading'],
                        _: {
                            config_reference: {
                                $name: 'Config Reference',
                                $routes: ['codegen-config', 'schema-field', 'documents-field', 'config-field', 'require-field', 'naming-convention', 'lifecycle-hooks']
                            }
                        }
                    },
                    plugins: {
                        $name: 'Plugins',
                        $routes: ['index'],
                        _: {
                            typescript: {
                                $name: 'TypeScript',
                                $routes: ['typescript', 'typescript-operations', 'typescript-resolvers', 'typed-document-node', 'typescript-apollo-client-helpers', 'typescript-graphql-request', 'typescript-generic-sdk', 'typescript-react-query', 'typescript-react-apollo', 'typescript-svelte-apollo', 'typescript-vue-apollo', 'typescript-vue-apollo-smart-ops', 'typescript-apollo-angular', 'typescript-stencil-apollo', 'typescript-rtk-query', 'typescript-graphql-files-modules', 'typescript-document-nodes', 'typescript-mongodb', 'typescript-urql', 'typescript-vue-urql', 'typescript-oclif', 'named-operations-object', 'typescript-type-graphql', 'typescript-apollo-next']
                            },
                            flow: {
                                $name: 'Flow',
                                $routes: ['flow', 'flow-resolvers', 'flow-operations']
                            },
                            reason: {
                                $name: 'Reason',
                                $routes: ['reason-client']
                            },
                            java: {
                                $name: 'Java',
                                $routes: ['kotlin','java','java-resolvers','java-apollo-android']
                            },
                            utilities: {
                                $name: 'Utilities',
                                $routes: ['fragment-matcher','urql-introspection','introspection','schema-ast','jsdoc','add','time','relay-operation-optimizer','urql-introspection','urql-introspection']
                            },

                        }
                    },
                    presets: {
                        $name: 'Presets',
                        $routes: ['index', 'gql-tag-operations', 'near-operation-file', 'import-types', 'graphql-modules']
                    },
                    integrations: {
                        $name: 'Integrations',
                        $routes: ['apollo-local-state', 'create-react-app', 'gatsby', 'prettier', 'federation', 'vscode']
                    },
                    custom_codegen: {
                        $name: 'Custom Plugins',
                        $routes: ['index', 'write-your-plugin', 'validate-configuration', 'extend-schema', 'using-visitor', 'contributing']
                    },
                    migration: {
                        $name: 'Migration Guide',
                        $routes: ['from-0-18', 'from-0-13']
                    }
                }
            }
        }
    };

    GenerateRoutes({
        Routes,
        folderPattern: 'docs',
        basePath: 'docs',
        basePathLabel: 'Documentation',
        ignorePaths: ['generated-config/add'],
        labels: {}
    });

    return Routes;
}
