const { exec } = require('child_process');
const requiredVersion = process.argv[2];

if (requiredVersion === '1') {
  exec(`yarn policies set-version ${requiredVersion}`)
} else {
  exec(`npm install -g yarn@berry`)
}