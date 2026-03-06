#!/usr/bin/env node

/**
 * Deploy Skill Script
 * Deploys the packaged .skill file to an OpenClaw agent workspace
 *
 * Usage:
 *   node scripts/deploy-skill.js
 *   node scripts/deploy-skill.js --agent travel-agency
 *   node scripts/deploy-skill.js --agent travel-agency --path /custom/path
 *
 * Options:
 *   --agent, -a     Agent name (default: travel-agency)
 *   --path, -p      Custom agent workspace path
 *   --skip-package  Skip packaging, use existing dist file
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SKILL_ROOT = path.dirname(__dirname);
const DEFAULT_AGENT = 'travel-agency';
const DEFAULT_OPENCLAW_PATH = path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw');

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    agent: DEFAULT_AGENT,
    workspacePath: null,
    skipPackage: false
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--agent' || args[i] === '-a') {
      config.agent = args[++i];
    } else if (args[i] === '--path' || args[i] === '-p') {
      config.workspacePath = args[++i];
    } else if (args[i] === '--skip-package') {
      config.skipPackage = true;
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
Deploy Skill Script

Usage:
  node scripts/deploy-skill.js [options]

Options:
  --agent, -a <name>   Agent name (default: travel-agency)
  --path, -p <path>   Custom agent workspace path
  --skip-package      Skip packaging step
  --help, -h          Show this help

Examples:
  node scripts/deploy-skill.js
  node scripts/deploy-skill.js --agent travel-agency
  node scripts/deploy-skill.js -a custom-agent -p /custom/path
`);
      process.exit(0);
    }
  }

  return config;
}

/**
 * Get workspace path
 */
function getWorkspacePath(config) {
  if (config.workspacePath) {
    return config.workspacePath;
  }
  return path.join(DEFAULT_OPENCLAW_PATH, `workspace-${config.agent}`);
}

/**
 * Deploy skill to workspace
 */
function deploy(config) {
  const packagePath = path.join(SKILL_ROOT, 'dist', 'booking-com-automation.skill');
  const workspacePath = getWorkspacePath(config);
  const skillsPath = path.join(workspacePath, 'skills', 'booking-com-automation');

  console.log('📦 Deploying skill...');
  console.log(`   Agent: ${config.agent}`);
  console.log(`   Workspace: ${workspacePath}`);
  console.log(`   Package: ${packagePath}`);
  console.log('');

  // Check if package exists
  if (!fs.existsSync(packagePath)) {
    console.error('❌ Package not found. Run "npm run package" first.');
    process.exit(1);
  }

  // Check if workspace exists
  if (!fs.existsSync(workspacePath)) {
    console.error(`❌ Workspace not found: ${workspacePath}`);
    process.exit(1);
  }

  // Remove old skill
  console.log('🗑️  Removing old skill...');
  if (fs.existsSync(skillsPath)) {
    execSync(`rm -rf "${skillsPath}"`, { stdio: 'inherit' });
  }

  // Extract new skill
  console.log('📦 Extracting package...');
  execSync(`unzip -o "${packagePath}" -d "${workspacePath}/skills/"`, { stdio: 'inherit' });

  // Move files to subfolder if needed
  const extractedRoot = path.join(workspacePath, 'skills');
  const expectedFiles = ['index.js', 'package.json', 'SKILL.md'];

  const hasFilesAtRoot = expectedFiles.every(f =>
    fs.existsSync(path.join(extractedRoot, f))
  );

  if (hasFilesAtRoot) {
    console.log('📁 Organizing files...');
    execSync(`mkdir -p "${skillsPath}"`, { stdio: 'inherit' });
    expectedFiles.forEach(f => {
      const src = path.join(extractedRoot, f);
      if (fs.existsSync(src)) {
        execSync(`mv "${src}" "${skillsPath}/"`, { stdio: 'inherit' });
      }
    });

    // Move directories
    ['scripts', 'references', 'node_modules', 'tests'].forEach(dir => {
      const src = path.join(extractedRoot, dir);
      if (fs.existsSync(src)) {
        execSync(`mv "${src}" "${skillsPath}/"`, { stdio: 'inherit' });
      }
    });
  }

  console.log('');
  console.log('✅ Deployment complete!');
  console.log(`   Skill installed at: ${skillsPath}`);
  console.log('');
  console.log('⏳ Waiting 60 seconds for skill to load...');

  // Wait for skill to load
  setTimeout(() => {
    console.log('✅ Done! The skill is ready to use.');
  }, 60000);
}

// Main
const config = parseArgs();
deploy(config);
