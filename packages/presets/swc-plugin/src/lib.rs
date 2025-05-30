use graphql_parser::query::parse_query;
use pathdiff::diff_paths;
use serde::Deserialize;
use std::path::{Path, PathBuf};
use swc_core::{
    atoms::Atom,
    common::Span,
    ecma::{
        ast::*,
        utils::{prepend_stmts, quote_ident},
        visit::{fold_pass, Fold, FoldWith},
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

pub struct GraphQLCodegen {
    options: GraphQLCodegenOptions,
    imports: Vec<GraphQLModuleItem>,
}

impl GraphQLCodegen {
    pub fn new(options: GraphQLCodegenOptions) -> Self {
        GraphQLCodegen {
            options,
            imports: Vec::new(),
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

    fn build_call_expr_from_call(&mut self, call: &CallExpr) -> Option<Expr> {
        let ident = call.callee.as_expr()?.as_ident()?;
        if &*ident.sym != self.options.gql_tag_name.as_str() {
            return None;
        }

        if call.args.is_empty() {
            self.handle_error("missing GraphQL query", call.span);
            return None;
        }

        let tpl = &dbg!(&call.args[0].expr).as_tpl()?;
        let graphql_ast = tpl.quasis.iter().find_map(|quasis| {
            match parse_query::<&str>(dbg!(quasis.cooked.as_ref()?)) {
                Ok(ast) => Some(ast),
                Err(e) => {
                    // Currently the parser outputs a string like: "query parse error", so we add "GraphQL" to the beginning
                    let error = format!("GraphQL {}", e);
                    self.handle_error(error.as_str(), quasis.span);
                    return None;
                }
            }
        })?;

        let first_definition = match graphql_ast.definitions.get(0) {
            Some(definition) => definition,
            None => return None,
        };

        let operation_name = match first_definition {
            graphql_parser::query::Definition::Fragment(fragment) => {
                fragment.name.to_string() + "FragmentDoc"
            }
            graphql_parser::query::Definition::Operation(op) => match op {
                graphql_parser::query::OperationDefinition::Query(query) => match query.name {
                    Some(name) => name.to_string() + "Document",
                    None => return None,
                },
                graphql_parser::query::OperationDefinition::Mutation(mutation) => {
                    match mutation.name {
                        Some(name) => name.to_string() + "Document",
                        None => return None,
                    }
                }
                graphql_parser::query::OperationDefinition::Subscription(subscription) => {
                    match subscription.name {
                        Some(name) => name.to_string() + "Document",
                        None => return None,
                    }
                }
                _ => return None,
            },
        };

        let capitalized_operation_name: Atom = capitalize(&operation_name).into();
        self.imports.push(GraphQLModuleItem {
            operation_or_fragment_name: capitalized_operation_name.clone(),
        });

        // now change the call expression to a Identifier
        Some(Expr::Ident(quote_ident!(capitalized_operation_name).into()))
    }
}

impl Fold for GraphQLCodegen {
    fn fold_expr(&mut self, expr: Expr) -> Expr {
        let expr = expr.fold_children_with(self);
        match &expr {
            Expr::Call(call) => {
                if let Some(built_expr) = dbg!(self.build_call_expr_from_call(call)) {
                    built_expr
                } else {
                    expr
                }
            }
            _ => expr,
        }
    }

    fn fold_module_items(&mut self, items: Vec<ModuleItem>) -> Vec<ModuleItem> {
        // First fold all its children, collect the GraphQL document names, and then add the necessary imports
        let mut items = items
            .into_iter()
            .map(|item| item.fold_children_with(self))
            .collect::<Vec<_>>();

        let platform_specific_path: Atom = self.get_relative_import_path("graphql").into();

        prepend_stmts(
            &mut items,
            self.imports
                .iter()
                .map(|module_item| module_item.as_module_item(platform_specific_path.clone())),
        );

        items
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

    let pass = fold_pass(GraphQLCodegen::new(GraphQLCodegenOptions {
        filename,
        cwd,
        artifact_directory,
        gql_tag_name: plugin_config.gqlTagName,
    }));
    program.apply(pass)
}
