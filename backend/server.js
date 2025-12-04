// Start server and keep it alive
const { spawn } = require('child_process');
const http = require('http');

console.log('🚀 Starting backend server...\n');

// Start the backend
const backend = spawn('node', ['app.js'], {
    cwd: __dirname,
    stdio: 'inherit'
});

// Keep the process alive
backend.on('exit', (code) => {
    console.log(`Backend exited with code ${code}`);
    process.exit(code);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down...');
    backend.kill();
    process.exit(0);
});

// Wait for backend to start
setTimeout(() => {
    console.log('\n✅ Backend should be running on port 5000');
    console.log('Use Ctrl+C to stop\n');
}, 2000);
