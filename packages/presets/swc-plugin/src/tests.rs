use std::path::PathBuf;
use swc_core::{
    ecma::{
        parser::{Syntax, TsSyntax},
        transforms::testing::{test, test_fixture},
        visit::visit_mut_pass,
    },
    testing,
};

use super::*;

fn get_test_code_visitor() -> GraphQLVisitor {
    GraphQLVisitor::new(GraphQLCodegenOptions {
        filename: "test.ts".to_string(),
        cwd: "/home/faketestproject".to_string(),
        artifact_directory: "./src/gql".to_string(),
        gql_tag_name: "gql".to_string(),
    })
}

#[testing::fixture("tests/fixtures/simple-uppercase-operation-name.ts")]
fn import_files_from_same_directory(input_path: PathBuf) {
    let cwd = std::env::current_dir().unwrap();

    let relative_file_path = diff_paths(&input_path, &cwd).unwrap();

    let output_path = input_path.with_extension("js");

    test_fixture(
        Syntax::Typescript(TsSyntax {
            tsx: input_path.to_string_lossy().ends_with(".tsx"),
            ..Default::default()
        }),
        &|_metadata| {
            visit_mut_pass(GraphQLVisitor::new(GraphQLCodegenOptions {
                filename: relative_file_path.to_string_lossy().to_string(),
                cwd: cwd.to_string_lossy().to_string(),
                artifact_directory: "./tests/fixtures".to_string(),
                gql_tag_name: "gql".to_string(),
            }))
        },
        &input_path,
        &output_path,
        Default::default(),
    );
}

#[testing::fixture("tests/fixtures/simple-uppercase-operation-name.ts")]
fn import_files_from_other_directory(input_path: PathBuf) {
    // Let's do the same test as for the babel plugin, assume we are in the tests folder
    let mut cwd = std::env::current_dir().unwrap();
    cwd.push("tests");

    let relative_file_path = diff_paths(&input_path, &cwd).unwrap();

    let output_path = input_path.with_extension("other-dir.js");

    test_fixture(
        Syntax::Typescript(TsSyntax {
            tsx: input_path.to_string_lossy().ends_with(".tsx"),
            ..Default::default()
        }),
        &|_metadata| {
            visit_mut_pass(GraphQLVisitor::new(GraphQLCodegenOptions {
                filename: relative_file_path.to_string_lossy().to_string(),
                cwd: cwd.to_string_lossy().to_string(),
                artifact_directory: cwd.to_string_lossy().to_string(),
                gql_tag_name: "gql".to_string(),
            }))
        },
        &input_path,
        &output_path,
        Default::default(),
    );
}

test!(
    Default::default(),
    |_| visit_mut_pass(get_test_code_visitor()),
    expect_normal_declarations_to_not_panic_and_to_be_ignored,
    // Example from Next.js' server.js
    r#"const emitter = (0, _mitt).default();
    const looseToArray = (input)=>[].slice.call(input);
    const targetTag = document.querySelector(`style[data-n-href="${href}"]`);"#
);

#[testing::fixture("tests/fixtures/use-client.ts")]
fn use_client(input_path: PathBuf) {
    let cwd = std::env::current_dir().unwrap();

    let relative_file_path = diff_paths(&input_path, &cwd).unwrap();

    let output_path = input_path.with_extension("js");

    test_fixture(
        Syntax::Typescript(TsSyntax {
            tsx: input_path.to_string_lossy().ends_with(".tsx"),
            ..Default::default()
        }),
        &|_metadata| {
            visit_mut_pass(GraphQLVisitor::new(GraphQLCodegenOptions {
                filename: relative_file_path.to_string_lossy().to_string(),
                cwd: cwd.to_string_lossy().to_string(),
                artifact_directory: "./tests/fixtures".to_string(),
                gql_tag_name: "gql".to_string(),
            }))
        },
        &input_path,
        &output_path,
        Default::default(),
    );
}
