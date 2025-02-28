const fs = require('fs');
const path = require('path');

// Ensure dist directory exists
if (!fs.existsSync(path.join(process.cwd(), 'dist'))) {
  fs.mkdirSync(path.join(process.cwd(), 'dist'), { recursive: true });
}

// Function to copy directory recursively
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`Source directory does not exist: ${src}`);
    return;
  }

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Function to copy a single file if it exists
function copyFileIfExists(src, dest) {
  if (fs.existsSync(src)) {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
    console.log(`Copied ${src} to ${dest}`);
    return true;
  }
  console.log(`Source file does not exist: ${src}`);
  return false;
}

// List of important files to copy
const filesToCopy = [
  'BUILD_ID',
  'routes-manifest.json',
  'required-server-files.json',
  'prerender-manifest.json',
  'server/pages-manifest.json',
  'server/middleware-manifest.json',
  'server/middleware-build-manifest.js',
  'build-manifest.json',
  'react-loadable-manifest.json'
];

// Copy each file
filesToCopy.forEach(file => {
  const srcPath = path.join(process.cwd(), '.next', file);
  const destPath = path.join(process.cwd(), 'dist', file);
  copyFileIfExists(srcPath, destPath);
});

// Copy directories
const dirsToCopy = [
  'static',
  'server',
  'cache',
  'chunks',
  'pages'
];

dirsToCopy.forEach(dir => {
  const srcPath = path.join(process.cwd(), '.next', dir);
  const destPath = path.join(process.cwd(), 'dist', dir);
  console.log(`Copying directory ${srcPath} to ${destPath}`);
  copyDirRecursive(srcPath, destPath);
});

console.log('Finished copying files from .next to dist'); 