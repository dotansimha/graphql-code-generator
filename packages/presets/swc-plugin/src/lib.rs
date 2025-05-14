use graphql_parser::query::parse_query;
use pathdiff::diff_paths;
use serde::Deserialize;
use std::path::{Path, PathBuf};
use swc_core::{
    atoms::Atom,
    common::{util::take::Take, Span},
    ecma::{
        ast::*,
        utils::{prepend_stmts, quote_ident},
        visit::{visit_mut_pass, VisitMut, VisitMutWith},
    },
    plugin::{
        errors::HANDLER, metadata::TransformPluginMetadataContextKind, plugin_transform,
        proxies::TransformPluginProgramMetadata,
    },
};

fn capitalize(s: &str) -> String {
    format!("{}{}", (&s[..1].to_string()).to_uppercase(), &s[1..])
}

#[cfg(test)]
mod tests;

pub struct GraphQLCodegenOptions {
    pub filename: String,
    pub cwd: String,
    pub artifact_directory: String,
    pub gql_tag_name: String,
}

pub struct GraphQLVisitor {
    options: GraphQLCodegenOptions,
    graphql_operations_or_fragments_to_import: Vec<GraphQLModuleItem>,
}

impl GraphQLVisitor {
    pub fn new(options: GraphQLCodegenOptions) -> Self {
        GraphQLVisitor {
            options,
            graphql_operations_or_fragments_to_import: Vec::new(),
        }
    }

    fn handle_error(&self, details: &str, span: Span) {
        let message = format!(
            "@graphql-codegen/client-preset-swc-plugin details: {}",
            details
        );
        HANDLER.with(|handler| handler.struct_span_err(span, &message).emit());
    }

    fn get_relative_import_path(&self, path_end: &str) -> String {
        // using PathBuf to add the relative path to the artifact directory
        let mut file_full_path = PathBuf::from(&self.options.cwd);
        file_full_path.push(&self.options.filename);
        let file_s_dirname = file_full_path.parent().unwrap();

        // The resolved artifact directory as seen from the current running SWC plugin working directory
        let resolved_artifact_directory =
            if Path::new(&self.options.artifact_directory).is_relative() {
                let mut cwd = PathBuf::from(&self.options.cwd);
                cwd.push(&self.options.artifact_directory);
                cwd.to_string_lossy().to_string()
            } else {
                self.options.artifact_directory.to_string()
            };

        let mut relative = diff_paths(resolved_artifact_directory, file_s_dirname).unwrap();

        let start_of_path = "./";

        // e.g. add 'graphql' to relative path
        relative.push(path_end);

        let platform_specific_path = start_of_path.to_string() + relative.to_str().unwrap();
        platform_specific_path.replace('\\', "/")
    }
}

pub fn create_graphql_codegen_visitor(options: GraphQLCodegenOptions) -> impl VisitMut {
    GraphQLVisitor::new(options)
}

impl VisitMut for GraphQLVisitor {
    fn visit_mut_var_decl(&mut self, e: &mut VarDecl) {
        e.visit_mut_children_with(self);

        for decl in e.decls.iter_mut() {
            if let Some(init) = &mut decl.init {
                if let Expr::Call(CallExpr { callee, args, .. }) = &mut **init {
                    if args.is_empty() {
                        return;
                    }

                    match callee.as_expr() {
                        Some(expr_box) => match &**expr_box {
                            Expr::Ident(ident) => {
                                if &ident.sym != self.options.gql_tag_name.as_str() {
                                    return;
                                }
                            }
                            _ => return,
                        },
                        _ => return,
                    }

                    let quasis = match &*args[0].expr {
                        Expr::Tpl(tpl) => &tpl.quasis,
                        _ => return,
                    };

                    let raw = match &quasis[0].cooked {
                        Some(cooked) => cooked,
                        None => return,
                    };

                    let graphql_ast = match parse_query::<&str>(raw) {
                        Ok(ast) => ast,
                        Err(e) => {
                            // Currently the parser outputs a string like: "query parse error", so we add "GraphQL" to the beginning
                            let error = format!("GraphQL {}", e);
                            self.handle_error(error.as_str(), quasis[0].span);
                            return;
                        }
                    };

                    let first_definition = match graphql_ast.definitions.get(0) {
                        Some(definition) => definition,
                        None => return,
                    };

                    let operation_name = match first_definition {
                        graphql_parser::query::Definition::Fragment(fragment) => {
                            fragment.name.to_string() + "FragmentDoc"
                        }
                        graphql_parser::query::Definition::Operation(op) => match op {
                            graphql_parser::query::OperationDefinition::Query(query) => {
                                match query.name {
                                    Some(name) => name.to_string() + "Document",
                                    None => return,
                                }
                            }
                            graphql_parser::query::OperationDefinition::Mutation(mutation) => {
                                match mutation.name {
                                    Some(name) => name.to_string() + "Document",
                                    None => return,
                                }
                            }
                            graphql_parser::query::OperationDefinition::Subscription(
                                subscription,
                            ) => match subscription.name {
                                Some(name) => name.to_string() + "Document",
                                None => return,
                            },
                            _ => return,
                        },
                    };

                    let capitalized_operation_name: Atom = capitalize(&operation_name).into();
                    self.graphql_operations_or_fragments_to_import
                        .push(GraphQLModuleItem {
                            operation_or_fragment_name: capitalized_operation_name.clone(),
                        });

                    // now change the call expression to a Identifier
                    let new_expr = Expr::Ident(quote_ident!(capitalized_operation_name).into());

                    *init = Box::new(new_expr);
                }
            }
        }
    }

    fn visit_mut_module(&mut self, module: &mut Module) {
        // First visit all its children, collect the GraphQL document names, and then add the necessary imports
        module.visit_mut_children_with(self);

        if self.graphql_operations_or_fragments_to_import.is_empty() {
            return;
        }

        let platform_specific_path: Atom = self.get_relative_import_path("graphql").into();

        let mut items = module.body.take();
        prepend_stmts(
            &mut items,
            self.graphql_operations_or_fragments_to_import
                .iter()
                .map(|module_item| module_item.as_module_item(platform_specific_path.clone())),
        );
        module.body = items;
    }
}

struct GraphQLModuleItem {
    operation_or_fragment_name: Atom,
}

impl GraphQLModuleItem {
    fn as_module_item(&self, platform_specific_path: Atom) -> ModuleItem {
        ModuleItem::ModuleDecl(ModuleDecl::Import(ImportDecl {
            span: Default::default(),
            specifiers: vec![ImportSpecifier::Named(ImportNamedSpecifier {
                span: Default::default(),
                local: quote_ident!(self.operation_or_fragment_name.clone()).into(),
                imported: None,
                is_type_only: false,
            })],
            src: Box::new(platform_specific_path.clone().into()),
            type_only: false,
            with: None,
            phase: ImportPhase::default(),
        }))
    }
}

fn gql_default() -> String {
    "gql".to_string()
}
#[allow(non_snake_case)]
#[derive(Deserialize)]
struct PluginOptions {
    artifactDirectory: String,

    #[serde(default = "gql_default")]
    gqlTagName: String,
}

#[plugin_transform]
pub fn process_transform(program: Program, metadata: TransformPluginProgramMetadata) -> Program {
    let filename = metadata
        .get_context(&TransformPluginMetadataContextKind::Filename)
        .unwrap_or_default();
    let cwd = metadata
        .get_context(&TransformPluginMetadataContextKind::Cwd)
        .unwrap_or_default();

    let plugin_config: PluginOptions = serde_json::from_str(
        &metadata
            .get_transform_plugin_config()
            .expect("Failed to get plugin config for @graphql-codegen/client-preset-swc-plugin"),
    )
    .expect("Invalid configuration for @graphql-codegen/client-preset-swc-plugin");

    let artifact_directory = plugin_config.artifactDirectory;
    if artifact_directory.is_empty() {
        panic!("artifactDirectory is not present in the config for @graphql-codegen/client-preset-swc-plugin");
    }

    let visitor = create_graphql_codegen_visitor(GraphQLCodegenOptions {
        filename,
        cwd,
        artifact_directory,
        gql_tag_name: plugin_config.gqlTagName,
    });

    program.apply(&mut visit_mut_pass(visitor))
}
