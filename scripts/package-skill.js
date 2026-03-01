#!/usr/bin/env node

/**
 * Skill Packaging Script
 * Packages the booking-com-automation skill into a .skill file
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const archiver = require('archiver');

const SKILL_ROOT = path.dirname(__dirname);
const OUTPUT_DIR = path.join(SKILL_ROOT, 'dist');
const PACKAGE_NAME = 'booking-com-automation';

// Files/directories to include
const INCLUDE_PATTERNS = [
  'SKILL.md',
  'package.json',
  'scripts/**/*',
  'references/**/*',
  'tests/**/*',
  '.github/workflows/**/*'
];

// Files/directories to exclude
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.git',
  '.state',
  'dist',
  '*.log',
  '.DS_Store',
  'coverage',
  '.gitignore',
  'README.md',
  'PROJECT_PLAN.md',
  'EPICS.md'
];

console.log('📦 Packaging booking-com-automation skill...\n');

// First validate
console.log('Step 1: Validating skill...');
try {
  execSync('node scripts/validate-skill.js', { 
    cwd: SKILL_ROOT, 
    stdio: 'inherit' 
  });
} catch (e) {
  console.error('\n❌ Validation failed. Aborting package.');
  process.exit(1);
}

// Create output directory
console.log('\nStep 2: Creating output directory...');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
console.log(`  ✓ Created ${OUTPUT_DIR}`);

// Create the .skill file (zip archive)
console.log('\nStep 3: Creating .skill package...');

const outputFileName = `${PACKAGE_NAME}.skill`;
const outputPath = path.join(OUTPUT_DIR, outputFileName);
const output = fs.createWriteStream(outputPath);

const archive = archiver('zip', {
  zlib: { level: 9 } // Maximum compression
});

output.on('close', () => {
  const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(2);
  console.log(`\n✅ Package created successfully!`);
  console.log(`   File: ${outputPath}`);
  console.log(`   Size: ${sizeMB} MB`);
  console.log(`\nTo install:`);
  console.log(`   clawhub install ${outputPath}`);
  console.log(`\nTo publish to clawhub:`);
  console.log(`   clawhub publish ${outputPath} --slug ${PACKAGE_NAME}`);
});

archive.on('error', (err) => {
  console.error('❌ Error creating package:', err);
  process.exit(1);
});

archive.pipe(output);

// Add files
console.log('  Adding files to package...');

INCLUDE_PATTERNS.forEach(pattern => {
  const glob = require('glob');
  const files = glob.sync(path.join(SKILL_ROOT, pattern));
  
  files.forEach(file => {
    // Check exclusions
    const relativePath = path.relative(SKILL_ROOT, file);
    const shouldExclude = EXCLUDE_PATTERNS.some(exclude => 
      relativePath.includes(exclude)
    );
    
    if (!shouldExclude) {
      const archivePath = path.join(PACKAGE_NAME, relativePath);
      archive.file(file, { name: archivePath });
      console.log(`    + ${relativePath}`);
    }
  });
});

archive.finalize();

console.log('\n  ✓ Files added');
