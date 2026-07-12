import { spawn } from 'child_process';
import path from 'path';

console.log('EcoSphere System Integration Suite Runner');
console.log('==========================================');

const runScript = (scriptName) => {
  return new Promise((resolve) => {
    console.log(`\n▶️ Running ${scriptName}...`);
    const child = spawn('node', [path.join('src', 'tests', scriptName)], {
      stdio: 'inherit',
      shell: true
    });
    child.on('close', (code) => {
      console.log(`⏹️ Finished ${scriptName} with code ${code}`);
      resolve(code);
    });
  });
};

async function main() {
  await runScript('db-test.js');
  await runScript('redis-test.js');
  console.log('\n==========================================');
  console.log('Integration Suite Execution Complete!');
}

main();
