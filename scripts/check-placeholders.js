#!/usr/bin/env node

/**
 * Build-time Placeholder Check
 * Validates: Requirements 14.3
 *
 * Scans all source files in app/, components/, and lib/ directories for the
 * "[PLACEHOLDER:" pattern. If any are found, the script exits with code 1,
 * failing the build.
 *
 * This ensures no placeholder content reaches production deployments.
 *
 * Usage:
 *   node scripts/check-placeholders.js
 *
 * Configured as "prebuild" script in package.json to run before every build.
 */

const fs = require('fs');
const path = require('path');

const PLACEHOLDER_PATTERN = /\[PLACEHOLDER:\s*[^\]]+\]/g;

// Directories to scan for placeholder text
const SCAN_DIRS = ['app', 'components', 'lib'];

// File extensions to check
const SCAN_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.css', '.html'];

// Files to exclude from checking (this script itself, test files, utility definitions)
const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.next/,
  /__tests__/,
  /\.test\./,
  /\.spec\./,
  /scripts\/check-placeholders/,
  /lib\/contentIntegrity\.ts$/,
  /components\/Placeholder\.tsx$/,
];

/**
 * Recursively collects all files in a directory matching the allowed extensions.
 */
function collectFiles(dir, files = []) {
  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // Skip excluded patterns
    if (EXCLUDE_PATTERNS.some((pattern) => pattern.test(fullPath))) {
      continue;
    }

    if (entry.isDirectory()) {
      collectFiles(fullPath, files);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (SCAN_EXTENSIONS.includes(ext)) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

/**
 * Main check: scans files for placeholder patterns.
 */
function main() {
  const projectRoot = path.resolve(__dirname, '..');
  const violations = [];

  for (const dir of SCAN_DIRS) {
    const dirPath = path.join(projectRoot, dir);
    const files = collectFiles(dirPath);

    for (const filePath of files) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const matches = content.match(PLACEHOLDER_PATTERN);

      if (matches) {
        const relativePath = path.relative(projectRoot, filePath);
        // Find line numbers for each match
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const lineMatches = lines[i].match(PLACEHOLDER_PATTERN);
          if (lineMatches) {
            for (const match of lineMatches) {
              violations.push({
                file: relativePath,
                line: i + 1,
                text: match,
              });
            }
          }
        }
      }
    }
  }

  if (violations.length > 0) {
    console.error('\n❌ BUILD FAILED: Placeholder content detected in source files.\n');
    console.error(
      'Production builds must not contain "[PLACEHOLDER: ...]" text (Requirement 14.3).\n'
    );
    console.error('Found violations:\n');

    for (const v of violations) {
      console.error(`  ${v.file}:${v.line}`);
      console.error(`    → ${v.text}\n`);
    }

    console.error(
      `\nTotal: ${violations.length} placeholder(s) found. Replace with verified content before building.\n`
    );
    process.exit(1);
  }

  console.log('✓ No placeholder content found. Build check passed.');
  process.exit(0);
}

main();
