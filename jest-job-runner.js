/// @ts-check
const TestRunner = require('jest-runner');
const fs = require('fs');
const path = require('path');
const calculate = require('./jest-job-calculator');

function makeRelative(filepath) {
  return path.relative(fs.realpathSync(process.cwd()), filepath);
}

const JOB_ID_PREFIX = '--jobId=';
const JOB_COUNT_PREFIX = '--jobCount=';

function parseArgv() {
  let jobId;
  let jobCount;

  process.argv.forEach(arg => {
    if (arg.startsWith(JOB_ID_PREFIX)) {
      jobId = parseInt(arg.substring(JOB_ID_PREFIX.length), 10);
    }

    if (arg.startsWith(JOB_COUNT_PREFIX)) {
      jobCount = parseInt(arg.substring(JOB_COUNT_PREFIX.length), 10);
    }
  });

  if (jobId && jobCount) {
    return {
      jobId,
      jobCount,
    };
  }
}

class JobTestRunner extends TestRunner {
  runTests(tests, watcher, onStart, onResult, onFailure, options) {
    const jobInfo = parseArgv();

    if (!jobInfo) {
      return super.runTests(tests, watcher, onStart, onResult, onFailure, options);
    }

    const job = calculate({
      jobId: jobInfo.jobId,
      jobCount: jobInfo.jobCount,
      records() {
        try {
          return JSON.parse(fs.readFileSync('tests.json', { encoding: 'utf-8' })) || {};
        } catch (e) {
          console.log('Failed to read records:', e);
          return {};
        }
      },
      files() {
        return tests.map(t => makeRelative(t.path));
      },
    });

    const toRun = tests.filter(t => {
      const rel = makeRelative(t.path);
      const included = job.files.includes(rel)

      return included;
    });


    return super.runTests(toRun, watcher, onStart, onResult, onFailure, options);
  }
}

module.exports = JobTestRunner;
