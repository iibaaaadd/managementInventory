const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'server.log');

module.exports = {
  log: (message) => {
    const timestamp = new Date().toISOString();
    const formatted = `[LOG - ${timestamp}] ${message}`;
    console.log(formatted);
    fs.appendFileSync(logFile, formatted + '\n');
  }
};
