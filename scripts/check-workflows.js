const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const workflowsDir = path.join(__dirname, '..', '.github', 'workflows');
const files = fs.readdirSync(workflowsDir).filter(file => /\.ya?ml$/.test(file));
const errors = [];

for (const file of files) {
  const workflow = yaml.load(fs.readFileSync(path.join(workflowsDir, file), 'utf8'));
  if (!workflow || typeof workflow !== 'object') {
    continue;
  }

  for (const [jobName, job] of Object.entries(workflow.jobs || {})) {
    const matrix = job?.strategy?.matrix;
    if (!matrix || !Array.isArray(matrix.os)) {
      continue;
    }

    if (job['runs-on'] !== '${{ matrix.os }}') {
      errors.push(
        `${file}: job "${jobName}" defines an os matrix axis but runs on "${job['runs-on']}"`,
      );
    }

    const axes = new Set(Object.keys(matrix).filter(key => key !== 'include' && key !== 'exclude'));
    for (const [index, entry] of (Array.isArray(matrix.include) ? matrix.include : []).entries()) {
      for (const key of Object.keys(entry)) {
        if (!axes.has(key)) {
          errors.push(
            `${file}: job "${jobName}" include entry ${index + 1} uses unknown matrix key "${key}"`,
          );
        }
      }
    }
  }
}

if (errors.length > 0) {
  console.error('Workflow matrix validation failed:');
  for (const error of errors) {
    console.error(`  - ${error}`);
  }
  process.exit(1);
}

console.log(
  `Validated ${files.length} workflow files: matrix jobs consume matrix.os and include keys match their axes`,
);
