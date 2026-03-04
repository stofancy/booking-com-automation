#!/usr/bin/env node

/**
 * Release Script
 * 
 * Automates the release process:
 * 1. Validate skill structure
 * 2. Run tests
 * 3. Build package
 * 4. Create git tag
 * 
 * Usage:
 *   npm run release
 *   npm run release -- --skip-tests
 *   npm run release -- --skip-tag
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SKILL_ROOT = path.dirname(__dirname);
const PACKAGE_NAME = 'booking-com-automation';

const args = process.argv.slice(2);
const skipTests = args.includes('--skip-tests');
const skipTag = args.includes('--skip-tag');
const dryRun = args.includes('--dry-run');

console.log('🚀 Release Script - ' + PACKAGE_NAME + '\n');
console.log('Options:');
console.log('  skip-tests:', skipTests);
console.log('  skip-tag:', skipTag);
console.log('  dry-run:', dryRun);
console.log('');

// Step 1: Validate
console.log('Step 1: Validating skill...');
if (!dryRun) {
  try {
    execSync('node scripts/validate-skill.js', { 
      cwd: SKILL_ROOT, 
      stdio: 'inherit' 
    });
    console.log('  ✅ Validation passed\n');
  } catch (e) {
    console.error('\n❌ Validation failed. Aborting release.');
    process.exit(1);
  }
} else {
  console.log('  ⏭️  Skipped (dry-run)\n');
}

// Step 2: Test
if (!skipTests) {
  console.log('Step 2: Running tests...');
  if (!dryRun) {
    try {
      execSync('npm test', { 
        cwd: SKILL_ROOT, 
        stdio: 'inherit' 
      });
      console.log('  ✅ Tests passed\n');
    } catch (e) {
      console.error('\n❌ Tests failed. Aborting release.');
      process.exit(1);
    }
  } else {
    console.log('  ⏭️  Skipped (dry-run)\n');
  }
} else {
  console.log('Step 2: Running tests...');
  console.log('  ⏭️  Skipped (--skip-tests)\n');
}

// Step 3: Package
console.log('Step 3: Building package...');
if (!dryRun) {
  try {
    execSync('npm run package', { 
      cwd: SKILL_ROOT, 
      stdio: 'inherit' 
    });
    console.log('  ✅ Package created\n');
  } catch (e) {
    console.error('\n❌ Package build failed. Aborting release.');
    process.exit(1);
  }
} else {
  console.log('  ⏭️  Skipped (dry-run)\n');
}

// Step 4: Git Tag
if (!skipTag) {
  console.log('Step 4: Creating git tag...');
  
  if (dryRun) {
    console.log('  ⏭️  Skipped (dry-run)\n');
  } else {
    try {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(SKILL_ROOT, 'package.json'), 'utf8')
      );
      const version = packageJson.version;
      const tagName = 'v' + version;
      
      // Check if tag exists
      const tags = execSync('git tag', { cwd: SKILL_ROOT })
        .toString()
        .split('\n')
        .filter(t => t.trim());
      
      if (tags.includes(tagName)) {
        console.log('  ⚠️  Tag ' + tagName + ' already exists. Skipping.\n');
      } else {
        // Create tag
        execSync('git tag -a ' + tagName + ' -m "Release ' + tagName + '"', {
          cwd: SKILL_ROOT,
          stdio: 'inherit'
        });
        console.log('  ✅ Created tag: ' + tagName + '\n');
        
        // Push tag
        console.log('  Pushing tag to remote...');
        execSync('git push origin ' + tagName, {
          cwd: SKILL_ROOT,
          stdio: 'inherit'
        });
        console.log('  ✅ Tag pushed\n');
      }
    } catch (e) {
      console.error('\n❌ Git tag failed:', e.message);
      console.log('  Continuing anyway...\n');
    }
  }
} else {
  console.log('Step 4: Creating git tag...');
  console.log('  ⏭️  Skipped (--skip-tag)\n');
}

// Summary
console.log('='.repeat(50));
console.log('✅ Release completed successfully!');
console.log('='.repeat(50));

if (!dryRun) {
  const distPath = path.join(SKILL_ROOT, 'dist', PACKAGE_NAME + '.skill');
  if (fs.existsSync(distPath)) {
    const stats = fs.statSync(distPath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log('\nPackage:');
    console.log('  ' + distPath);
    console.log('  Size: ' + sizeKB + ' KB');
  }
  
  console.log('\nNext steps:');
  console.log('  - Review the package');
  console.log('  - Publish to ClawHub (manual):');
  console.log('    clawhub publish dist/' + PACKAGE_NAME + '.skill --slug ' + PACKAGE_NAME);
}

console.log('');