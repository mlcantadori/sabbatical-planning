#!/usr/bin/env node

// Validates that chapter numbering stays consistent across sources:
//   1. itinerary-data.js chapters have NO hardcoded `num` (numbers derive
//      from array order in itinerary-store.js).
//   2. itinerary-2026-2027.md overview table rows are sequential 1..N and
//      match data order/titles.
//   3. itinerary-2026-2027.md `## Chapter N` headings are sequential 1..N
//      and match data order/titles.

import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DATA_PATH = path.join(ROOT, 'itinerary-data.js');
const MD_PATH = path.join(ROOT, 'itinerary-2026-2027.md');

// Overview/markdown spellings that legitimately differ from data titles.
const ALIASES = new Map([
  ['türkiye', 'turkey'],
]);

function norm(s) {
  const n = s.toLowerCase().replace(/\(.*?\)/g, '').replace(/[—–-]/g, ' ').replace(/\s+/g, ' ').trim();
  return ALIASES.get(n) || n;
}

function loadChapters() {
  const source = fs.readFileSync(DATA_PATH, 'utf8');
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(source, ctx);
  return { source, chapters: ctx.window.TRIP.chapters };
}

function main() {
  const errors = [];
  const { source, chapters } = loadChapters();
  const md = fs.readFileSync(MD_PATH, 'utf8');

  // 1. No hardcoded nums in data.
  const hardNum = [...source.matchAll(/id:\s*'([^']*)',\s*num:\s*(\d+)/g)];
  hardNum.forEach((m) => errors.push(`Hardcoded num in data: id '${m[1]}' has num: ${m[2]} (remove it — numbers derive from order)`));

  // 2. Overview table.
  const overviewRows = [...md.matchAll(/^\| (\d+) \| (.+?) \|.*\|$/gm)]
    .map((m) => ({ num: Number(m[1]), title: m[2].trim() }));
  if (overviewRows.length !== chapters.length) {
    errors.push(`Overview has ${overviewRows.length} numbered rows but data has ${chapters.length} chapters`);
  }
  overviewRows.forEach((row, i) => {
    if (row.num !== i + 1) errors.push(`Overview row ${i + 1}: numbered ${row.num}, expected ${i + 1} ('${row.title}')`);
    const want = chapters[i] && norm(chapters[i].title);
    if (want && norm(row.title) !== want) {
      errors.push(`Overview row ${i + 1}: '${row.title}' does not match data title '${chapters[i].title}'`);
    }
  });

  // 3. Chapter headings.
  const headings = [...md.matchAll(/^## Chapter (\d+) — (.+?)$/gm)]
    .map((m) => ({ num: Number(m[1]), title: m[2].trim() }));
  if (headings.length !== chapters.length) {
    errors.push(`Found ${headings.length} chapter headings but data has ${chapters.length} chapters`);
  }
  headings.forEach((h, i) => {
    if (h.num !== i + 1) errors.push(`Heading ${i + 1}: numbered ${h.num}, expected ${i + 1} ('${h.title}')`);
    const want = chapters[i] && norm(chapters[i].title);
    if (want && norm(h.title) !== want) {
      errors.push(`Heading ${i + 1}: '${h.title}' does not match data title '${chapters[i].title}'`);
    }
  });

  console.log(`Data chapters: ${chapters.length}`);
  console.log(`Overview rows: ${overviewRows.length}`);
  console.log(`Chapter headings: ${headings.length}`);
  console.log(`Hardcoded nums in data: ${hardNum.length}`);

  if (errors.length) {
    console.log('\nChapter order errors:');
    for (const e of errors) console.log(`- ${e}`);
    process.exit(1);
  }
  console.log('\nChapter order check passed.');
}

main();
