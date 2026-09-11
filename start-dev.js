const { spawn } = require('child_process');
const path = require('path');

console.log('========================================================');
console.log('🚀 Starting MediBook Full-Stack Healthcare Platform');
console.log('========================================================');
console.log('• Backend API will listen on: http://localhost:5000');
console.log('• Frontend UI will listen on:  http://localhost:3000');
console.log('========================================================\n');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

// Spawn Server
const server = spawn(npmCmd, ['start'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'pipe',
  shell: true,
});

server.stdout.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach((line) => {
    if (line.trim()) console.log(`\x1b[36m[Server]\x1b[0m ${line}`);
  });
});

server.stderr.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach((line) => {
    if (line.trim()) console.error(`\x1b[31m[Server Error]\x1b[0m ${line}`);
  });
});

// Spawn Client
const client = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'pipe',
  shell: true,
});

client.stdout.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach((line) => {
    if (line.trim()) console.log(`\x1b[32m[Client]\x1b[0m ${line}`);
  });
});

client.stderr.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach((line) => {
    if (line.trim()) console.error(`\x1b[33m[Client Warning]\x1b[0m ${line}`);
  });
});

// Handle termination
const cleanup = () => {
  console.log('\n[MediBook] Stopping backend and frontend servers...');
  server.kill();
  client.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
