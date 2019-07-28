const { exec } = require('child_process');

exec('tsc --incremental -m esnext --outDir dist/esnext && tsc --incremental -m commonjs --outDir dist/commonjs', { cwd: process.cwd() }, (err, stdout, stderr) => {
  if (err) {
    // node couldn't execute the command
    return;
  }

  // the *entire* stdout and stderr (buffered)
  console.log(`stdout: ${stdout}`);
  console.log(`stderr: ${stderr}`);
});
