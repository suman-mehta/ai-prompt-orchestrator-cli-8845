#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { exit, argv } from 'node:process';

function printHelp() {
  console.log(`Usage: ai-prompt-orchestrator -t <template> -c <context> [-o <output>]
  -t   Path to prompt template file (UTF-8)
  -c   Path to JSON file containing key/value context
  -o   Optional output file; defaults to stdout`);
}

async function main() {
  const args = argv.slice(2);
  const opts = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '-t' && args[i + 1]) {
      opts.template = resolve(args[++i]);
    } else if (a === '-c' && args[i + 1]) {
      opts.context = resolve(args[++i]);
    } else if (a === '-o' && args[i + 1]) {
      opts.output = resolve(args[++i]);
    } else if (a === '-h' || a === '--help') {
      printHelp();
      exit(0);
    } else {
      console.error(`Unknown argument: ${a}`);
      printHelp();
      exit(1);
    }
  }

  if (!opts.template || !opts.context) {
    console.error('Template and context files are required.');
    printHelp();
    exit(1);
  }

  try {
    const [templateRaw, contextRaw] = await Promise.all([
      readFile(opts.template, 'utf8'),
      readFile(opts.context, 'utf8')
    ]);
    const context = JSON.parse(contextRaw);
    const result = templateRaw.replace(/{{\s*([\w.-]+)\s*}}/g, (_, key) => {
      return key in context ? context[key] : `{{${key}}}`;
    });

    if (opts.output) {
      await writeFile(opts.output, result, 'utf8');
    } else {
      console.log(result);
    }
    exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    exit(1);
  }
}

main();