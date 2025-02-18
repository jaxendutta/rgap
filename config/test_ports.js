// test_ports.js
const { findAvailablePorts, getConfig } = require('./ports');  // Changed path since we're in config directory

console.log('Current directory:', __dirname);
console.log('Attempting to find available ports...');

findAvailablePorts()
  .then(ports => {
    console.log('Port configuration:');
    console.log(JSON.stringify(ports, null, 2));
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });