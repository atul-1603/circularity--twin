const { spawn } = require('child_process');
const path = require('path');

async function runMatching(wasteStream) {
  return new Promise((resolve, reject) => {
    // Determine 'python' or 'python3' based on platform - using 'python' as we are on Windows in this context
    const pyScript = path.join(__dirname, '../python/match.py');
    const pythonProcess = spawn('python', [pyScript]);

    let dataOut = '';
    let dataErr = '';

    pythonProcess.stdout.on('data', (chunk) => {
      dataOut += chunk.toString();
    });

    pythonProcess.stderr.on('data', (chunk) => {
      dataErr += chunk.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python script failed: ${dataErr}`));
      } else {
        try {
          resolve(JSON.parse(dataOut));
        } catch (e) {
          reject(new Error(`Failed to parse python output: ${dataOut}`));
        }
      }
    });

    pythonProcess.stdin.write(JSON.stringify(wasteStream));
    pythonProcess.stdin.end();
  });
}

module.exports = { runMatching };
