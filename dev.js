import { spawn } from 'child_process';

console.log('Starting EcoSphere Development Environment...');

const backend = spawn('npm', ['run', 'dev'], {
  cwd: './backend',
  shell: true,
  stdio: 'inherit'
});

const frontend = spawn('npm', ['run', 'dev'], {
  cwd: './frontend',
  shell: true,
  stdio: 'inherit'
});

process.on('SIGINT', () => {
  console.log('Stopping all services...');
  backend.kill();
  frontend.kill();
  process.exit();
});
