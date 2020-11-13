/// @ts-check

function calculate({ jobId, jobCount, records: recordsReader, files: filesReader }) {
  if (jobId > jobCount) {
    throw new Error(`Requested job ID (${jobId}) is bigger than total jobs count (${jobCount})`);
  }

  if (jobId <= 0) {
    throw new Error(`Requested job ID (${jobId}) needs to be greater than 0`);
  }

  const files = filesReader();

  const records = recordsReader();

  const totalTime = Object.values(records).reduce((sum, suite) => sum + suite.time, 0);
  const averageSuiteTime = totalTime / Object.keys(records).length;
  const averageJobTime = totalTime / jobCount;
  console.log({ totalTime, averageSuiteTime, averageJobTime, jobCount, recordCount: Object.keys(records).length });

  const suites = files
    .map(file => ({
      ...(records[file] || {
        time: averageSuiteTime,
      }),
      file,
    }))
    .sort(byTimeASC);

  let currentJob = 0;

  const jobs = new Array(jobCount).fill(null).map(() => ({
    expectedTime: 0,
    files: [],
  }));

  function addToJob(suite) {
    jobs[currentJob].expectedTime += suite.time;
    jobs[currentJob].files.push(suite.file);
  }

  for (let i = 0; i < suites.length; i++) {
    const isLastJob = currentJob + 1 === jobCount;

    if (isLastJob) {
      addToJob(suites[i]);
      continue;
    }

    const nextSum = jobs[currentJob].expectedTime + suites[i].time;

    if (nextSum <= averageJobTime) {
      addToJob(suites[i]);
    } else {
      currentJob++;
      addToJob(suites[i]);
    }
  }

  return jobs[jobId - 1];
}

function byTimeASC(left, right) {
  return left.time - right.time;
}

module.exports = calculate;

function createCalculator() {
  let result = null;
  function subsetsByExecutionTime(numbers, target, partial) {
    let n
    let remaining;

    partial = partial || [];
    const s = partial.reduce((a, b) => a + b, 0);

    if (s > target || partial.length > 4) return null;

    // check if the partial sum is equals to target
    if (s === target && partial.length === 4) {
      if (!result) result = [];
      result.push(partial);
      // console.log("%s=%s", partial.join("+"), target)
    }

    for (let i = 0; i < numbers.length; i++) {
      n = numbers[i];
      remaining = numbers.slice(i + 1);
      subsetsByExecutionTime(remaining, target, partial.concat([n]));
    }

    return result;
  }

  return function calc(numbers, target, partial) {
    result = null;

    return subsetsByExecutionTime(numbers, target, partial);
  };
}
