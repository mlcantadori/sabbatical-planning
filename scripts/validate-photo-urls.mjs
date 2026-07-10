#!/usr/bin/env node

import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const PHOTOS_PATH = path.join(ROOT, 'itinerary-photos.js');
const DATA_PATH = path.join(ROOT, 'itinerary-data.js');

function loadWindowObject(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(source, ctx);
  return ctx.window;
}

function uniqueChapterPhotoKeywords(trip) {
  return [...new Set((trip?.chapters || []).flatMap((ch) => ch.photos || []))];
}

async function checkUrl(url, attempts = 3) {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  for (let i = 1; i <= attempts; i++) {
    try {
      const res = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        headers: { 'User-Agent': 'sabbatical-photo-validator/1.0' },
      });

      if (res.status === 405 || res.status === 403) {
        const retry = await fetch(url, {
          method: 'GET',
          redirect: 'follow',
          headers: { Range: 'bytes=0-0', 'User-Agent': 'sabbatical-photo-validator/1.0' },
        });
        if (retry.ok) return { ok: true, status: retry.status };
        if (retry.status === 429 && i < attempts) {
          await sleep(700 * i);
          continue;
        }
        return { ok: false, status: retry.status };
      }

      if (res.ok) return { ok: true, status: res.status };
      if (res.status === 429 && i < attempts) {
        await sleep(700 * i);
        continue;
      }
      return { ok: false, status: res.status };
    } catch (err) {
      if (i < attempts) {
        await sleep(700 * i);
        continue;
      }
      return { ok: false, status: 'ERR', error: String(err?.message || err) };
    }
  }
  return { ok: false, status: 'ERR', error: 'Unknown error' };
}

async function main() {
  const trip = loadWindowObject(DATA_PATH).TRIP;
  const photoIds = loadWindowObject(PHOTOS_PATH).PHOTO_IDS || {};

  const keywords = uniqueChapterPhotoKeywords(trip);
  const missing = keywords.filter((k) => !(k in photoIds));

  const directUrls = Object.entries(photoIds).filter(([, value]) => String(value).startsWith('http'));
  const broken = [];

  for (const [keyword, url] of directUrls) {
    const result = await checkUrl(url);
    if (!result.ok) broken.push({ keyword, url, ...result });
  }

  console.log(`Checked keywords: ${keywords.length}`);
  console.log(`Direct URLs: ${directUrls.length}`);
  console.log(`Missing keyword mappings: ${missing.length}`);
  console.log(`Broken URLs: ${broken.length}`);

  if (missing.length) {
    console.log('\nMissing mappings:');
    for (const key of missing) console.log(`- ${key}`);
  }

  if (broken.length) {
    console.log('\nBroken URLs:');
    for (const item of broken) {
      const suffix = item.error ? ` (${item.error})` : '';
      console.log(`- ${item.keyword}: [${item.status}] ${item.url}${suffix}`);
    }
  }

  if (missing.length || broken.length) process.exit(1);
  console.log('\nPhoto validation passed.');
}

main().catch((err) => {
  console.error('Photo validation failed with unexpected error:', err);
  process.exit(1);
});

