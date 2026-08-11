/**
 * Build-time placeholder check script tests
 * Validates: Requirement 14.3
 *
 * Tests that the check-placeholders.js script correctly:
 * - Passes when no placeholder text exists in source files
 * - Fails when placeholder text is found
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const SCRIPT_PATH = path.join(PROJECT_ROOT, 'scripts/check-placeholders.js');
const TEST_FILE_PATH = path.join(PROJECT_ROOT, 'components/_test-placeholder-check.tsx');

describe('scripts/check-placeholders.js', () => {
  afterEach(() => {
    // Clean up any test files
    if (fs.existsSync(TEST_FILE_PATH)) {
      fs.unlinkSync(TEST_FILE_PATH);
    }
  });

  it('passes when no placeholder content exists in source', () => {
    const result = execSync(`node ${SCRIPT_PATH}`, {
      cwd: PROJECT_ROOT,
      encoding: 'utf-8',
    });
    expect(result).toContain('No placeholder content found');
  });

  it('fails with exit code 1 when placeholder content is found', () => {
    // Write a file with placeholder content
    fs.writeFileSync(
      TEST_FILE_PATH,
      'export const data = "[PLACEHOLDER: certification]";\n'
    );

    try {
      execSync(`node ${SCRIPT_PATH}`, {
        cwd: PROJECT_ROOT,
        encoding: 'utf-8',
        stdio: 'pipe',
      });
      // Should not reach here
      fail('Expected script to exit with code 1');
    } catch (error: unknown) {
      const execError = error as { status: number; stderr: string };
      expect(execError.status).toBe(1);
      expect(execError.stderr).toContain('BUILD FAILED');
      expect(execError.stderr).toContain('_test-placeholder-check.tsx');
    }
  });

  it('reports the correct line number of the violation', () => {
    fs.writeFileSync(
      TEST_FILE_PATH,
      'const a = 1;\nconst b = 2;\nconst c = "[PLACEHOLDER: award]";\n'
    );

    try {
      execSync(`node ${SCRIPT_PATH}`, {
        cwd: PROJECT_ROOT,
        encoding: 'utf-8',
        stdio: 'pipe',
      });
      fail('Expected script to exit with code 1');
    } catch (error: unknown) {
      const execError = error as { status: number; stderr: string };
      expect(execError.stderr).toContain(':3');
      expect(execError.stderr).toContain('[PLACEHOLDER: award]');
    }
  });

  it('excludes lib/contentIntegrity.ts and components/Placeholder.tsx from scanning', () => {
    // These files contain placeholder format references as part of their definition.
    // The script should not flag them.
    const result = execSync(`node ${SCRIPT_PATH}`, {
      cwd: PROJECT_ROOT,
      encoding: 'utf-8',
    });
    expect(result).toContain('No placeholder content found');
  });
});
