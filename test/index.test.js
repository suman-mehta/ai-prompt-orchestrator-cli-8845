import test from 'node:test';
import assert from 'node:assert/strict';
import { writeFile, readFile, rm, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const tmpDir = resolve('test-temp');

await mkdir(tmpDir, { recursive: true });

test('CLI replaces placeholders with context values', async (t) => {
  const templatePath = resolve(tmpDir, 'template.txt');
  const contextPath = resolve(tmpDir, 'context.json');

  await writeFile(templatePath, 'Hello {{name}}, welcome to {{place}}.', 'utf8');
  await writeFile(contextPath, JSON.stringify({ name: 'Alice', place: 'Wonderland' }), 'utf8');

  const result = spawnSync('node', [
    resolve('src', 'index.js'),
    '-t', templatePath,
    '-c', contextPath
  ], { encoding: 'utf8' });

  assert.strictEqual(result.status, 0);
  assert.match(result.stdout.trim(), /Hello Alice, welcome to Wonderland\./);

  // Clean up
  await rm(templatePath);
  await rm(contextPath);
});