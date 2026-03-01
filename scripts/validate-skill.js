#!/usr/bin/env node

/**
 * Skill Validation Script
 * Validates the booking-com-automation skill structure and content
 */

const fs = require('fs');
const path = require('path');

const SKILL_ROOT = path.dirname(__dirname);
const REQUIRED_FILES = ['SKILL.md', 'package.json', 'README.md'];
const REQUIRED_DIRS = ['scripts', 'references', 'tests'];

let errors = [];
let warnings = [];

console.log('🔍 Validating booking-com-automation skill...\n');

// Check required files
console.log('Checking required files...');
REQUIRED_FILES.forEach(file => {
  const filePath = path.join(SKILL_ROOT, file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✓ ${file}`);
  } else {
    errors.push(`Missing required file: ${file}`);
    console.log(`  ✗ ${file} - MISSING`);
  }
});

// Check required directories
console.log('\nChecking required directories...');
REQUIRED_DIRS.forEach(dir => {
  const dirPath = path.join(SKILL_ROOT, dir);
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    console.log(`  ✓ ${dir}/`);
  } else {
    errors.push(`Missing required directory: ${dir}/`);
    console.log(`  ✗ ${dir}/ - MISSING`);
  }
});

// Validate SKILL.md frontmatter
console.log('\nValidating SKILL.md...');
const skillMdPath = path.join(SKILL_ROOT, 'SKILL.md');
if (fs.existsSync(skillMdPath)) {
  const content = fs.readFileSync(skillMdPath, 'utf8');
  
  // Check for YAML frontmatter
  if (!content.startsWith('---')) {
    errors.push('SKILL.md missing YAML frontmatter (must start with ---)');
  } else {
    const frontmatterEnd = content.indexOf('---', 3);
    if (frontmatterEnd === -1) {
      errors.push('SKILL.md YAML frontmatter not closed (missing closing ---)');
    } else {
      const frontmatter = content.substring(3, frontmatterEnd);
      
      // Check required fields
      if (!frontmatter.includes('name:')) {
        errors.push('SKILL.md missing "name:" field in frontmatter');
      } else {
        console.log('  ✓ Has name field');
      }
      
      if (!frontmatter.includes('description:')) {
        errors.push('SKILL.md missing "description:" field in frontmatter');
      } else {
        console.log('  ✓ Has description field');
      }
      
      // Check description length
      const descMatch = frontmatter.match(/description:\s*(.+)/);
      if (descMatch && descMatch[1].length < 50) {
        warnings.push('SKILL.md description is quite short (< 50 chars)');
      }
    }
  }
  
  // Check for usage sections
  if (!content.includes('## When to Use')) {
    warnings.push('SKILL.md missing "When to Use" section');
  } else {
    console.log('  ✓ Has "When to Use" section');
  }
  
  if (!content.includes('## Usage') && !content.includes('## Examples')) {
    warnings.push('SKILL.md missing usage examples');
  } else {
    console.log('  ✓ Has usage examples');
  }
}

// Validate package.json
console.log('\nValidating package.json...');
const packageJsonPath = path.join(SKILL_ROOT, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  try {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (!pkg.name) {
      errors.push('package.json missing "name" field');
    } else {
      console.log(`  ✓ Name: ${pkg.name}`);
    }
    
    if (!pkg.version) {
      errors.push('package.json missing "version" field');
    } else {
      console.log(`  ✓ Version: ${pkg.version}`);
    }
    
    if (!pkg.scripts || !pkg.scripts.test) {
      warnings.push('package.json missing test script');
    } else {
      console.log('  ✓ Has test script');
    }
  } catch (e) {
    errors.push(`package.json is not valid JSON: ${e.message}`);
  }
}

// Check for .gitignore
console.log('\nChecking .gitignore...');
const gitignorePath = path.join(SKILL_ROOT, '.gitignore');
if (fs.existsSync(gitignorePath)) {
  console.log('  ✓ .gitignore exists');
} else {
  warnings.push('Missing .gitignore file');
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('VALIDATION SUMMARY');
console.log('='.repeat(50));

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ All checks passed! Skill is ready.');
  process.exit(0);
}

if (errors.length > 0) {
  console.log(`\n❌ ${errors.length} error(s) found:`);
  errors.forEach(err => console.log(`   - ${err}`));
}

if (warnings.length > 0) {
  console.log(`\n⚠️  ${warnings.length} warning(s):`);
  warnings.forEach(warn => console.log(`   - ${warn}`));
}

if (errors.length > 0) {
  console.log('\nPlease fix errors before packaging.');
  process.exit(1);
} else {
  console.log('\nWarnings can be addressed later.');
  process.exit(0);
}
