#!/usr/bin/env node

/**
 * Skill Packaging Script
 * Packages the booking-com-automation skill into a .skill file
 * 
 * Note: Requires 'archiver' package: npm install archiver
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SKILL_ROOT = path.dirname(__dirname);
const OUTPUT_DIR = path.join(SKILL_ROOT, 'dist');
const PACKAGE_NAME = 'booking-com-automation';

console.log('📦 Packaging booking-com-automation skill...\n');

// First validate
console.log('Step 1: Validating skill...');
try {
  execSync('node scripts/validate-skill.js', { 
    cwd: SKILL_ROOT, 
    stdio: 'inherit' 
  });
  console.log('  ✓ Validation passed\n');
} catch (e) {
  console.error('\n❌ Validation failed. Aborting package.');
  process.exit(1);
}

// Check if archiver is available
let hasArchiver = false;
try {
  require('archiver');
  hasArchiver = true;
} catch (e) {
  console.log('⚠️  Note: archiver package not installed.');
  console.log('To create .skill package, run: npm install archiver\n');
}

// Create output directory
console.log('Step 2: Creating output directory...');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
console.log('  ✓ Created ' + OUTPUT_DIR);

// Create the .skill file (zip archive)
console.log('\nStep 3: Creating .skill package...');

const outputFileName = PACKAGE_NAME + '.skill';
const outputPath = path.join(OUTPUT_DIR, outputFileName);

if (!hasArchiver) {
  // Use system zip command as fallback
  console.log('  Using system zip command...');
  try {
    const zipCmd = 'cd "' + SKILL_ROOT + '" && zip -r "' + outputPath + '" ' +
      'SKILL.md package.json scripts/ references/ tests/ .github/workflows/ ' +
      '-x "*.git*" -x "node_modules*" -x ".state*" -x "dist*" -x "*.log" -x ".DS_Store"';
    execSync(zipCmd, { stdio: 'inherit' });
    
    const stats = fs.statSync(outputPath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    
    console.log('\n✅ Package created successfully!');
    console.log('   File: ' + outputPath);
    console.log('   Size: ' + sizeMB + ' MB');
    console.log('\nTo install:');
    console.log('   clawhub install ' + outputPath);
    console.log('\nTo publish to clawhub:');
    console.log('   clawhub publish ' + outputPath + ' --slug ' + PACKAGE_NAME);
  } catch (e) {
    console.error('❌ Error creating package:', e.message);
    process.exit(1);
  }
} else {
  // Use archiver package
  const archiver = require('archiver');
  const output = fs.createWriteStream(outputPath);
  const archive = archiver('zip', { zlib: { level: 9 } });
  
  output.on('close', () => {
    const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(2);
    console.log('\n✅ Package created successfully!');
    console.log('   File: ' + outputPath);
    console.log('   Size: ' + sizeMB + ' MB');
  });
  
  archive.on('error', (err) => {
    console.error('❌ Error creating package:', err);
    process.exit(1);
  });
  
  archive.pipe(output);
  
  // Include only necessary files for the skill package
  const includeFiles = [
    'SKILL.md',
    'README.md',
    'index.js',
    'plugin.json',
    'package.json'
  ];
  
  const includeDirs = [
    'scripts',
    'references'
  ];
  
  // Add specific files
  includeFiles.forEach(file => {
    const filePath = path.join(SKILL_ROOT, file);
    if (fs.existsSync(filePath)) {
      archive.file(filePath, { name: file });
    }
  });
  
  // Add directories
  includeDirs.forEach(dir => {
    const dirPath = path.join(SKILL_ROOT, dir);
    if (fs.existsSync(dirPath)) {
      const ignorePatterns = [
        '*.test.js',
        '*.log',
        '.DS_Store',
        'coverage'
      ];
      archive.directory(dirPath, dir, { ignore: ignorePatterns });
    }
  });
  
  // Include node_modules for runtime dependencies
  const nodeModulesPath = path.join(SKILL_ROOT, 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    archive.directory(nodeModulesPath, 'node_modules');
  }
  
  archive.finalize();
}
