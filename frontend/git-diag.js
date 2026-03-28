import { execSync } from 'child_process';
import fs from 'fs';

try {
  console.log("Checking git status...");
  let out = execSync('git status').toString();
  
  try {
     out += '\n\n' + execSync('git add .').toString();
     out += '\n\n' + execSync('git commit -m "Deployment preparation"').toString();
  } catch (commitErr) {
     out += '\n\nCommit Error:\n' + commitErr.message + '\n' + (commitErr.stdout ? commitErr.stdout.toString() : '') + '\n' + (commitErr.stderr ? commitErr.stderr.toString() : '');
  }

  try {
     out += '\n\n' + execSync('git push -u origin main').toString();
  } catch (pushErr) {
     out += '\n\nPush Error:\n' + pushErr.message + '\n' + (pushErr.stdout ? pushErr.stdout.toString() : '') + '\n' + (pushErr.stderr ? pushErr.stderr.toString() : '');
  }

  fs.writeFileSync('git-diag.log', out);
  console.log("Diagnostics written to git-diag.log");
} catch (e) {
  fs.writeFileSync('git-diag.log', 'Fatal Error: ' + e.message + '\n' + (e.stdout ? e.stdout.toString() : '') + '\n' + (e.stderr ? e.stderr.toString() : ''));
}
