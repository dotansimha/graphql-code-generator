const fs = require('fs');
const path = require('path');

function save(filepath, records) {
  fs.writeFileSync(filepath, JSON.stringify(records, null, 2), {
    encoding: 'utf-8',
  });
}

function read(filepath) {
  try {
    return JSON.parse(
      fs.readFileSync(filepath, {
        encoding: 'utf-8',
      })
    );
  } catch (e) {
    console.error('Failed to read previous results:', e);

    return {};
  }
}

function executionTime(startTime, endTime) {
  return (endTime - startTime) / 1000;
}

class TimeReporter {
  constructor() {
    this.reportPath = path.join(process.cwd(), 'tests.json');
  }

  onRunComplete(_, results) {
    if (!results.wasInterrupted) {
      // we need to read those records from git notes
      // if a record is 2 months old, it should be removed
      const records = read(this.reportPath);

      results.testResults.forEach(suite => {
        const noResults = suite.testResults.length === 0;

        if (noResults) {
          return;
        }

        const filepath = path.relative(fs.realpathSync(process.cwd()), suite.testFilePath);
        const suiteExecutionTime = executionTime(suite.perfStats.start, suite.perfStats.end);

        records[filepath] = {
          timestamp: new Date(suite.perfStats.start).toISOString().slice(0, -5),
          time: suiteExecutionTime,
        };
      });

      // save(this.reportPath, records);
    }
  }
}

module.exports = TimeReporter;
