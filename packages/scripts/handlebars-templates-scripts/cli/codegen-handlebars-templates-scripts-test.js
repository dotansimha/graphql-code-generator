#!/usr/bin/env node

const program = require('commander');
const jest = require('jest-cli');

program.option('-o, --overwrite', 'Overwrite existing files');
program.parse(process.argv);

const projectDir = process.cwd();

jest.runCLI({ projects: [projectDir] }, [projectDir]);
