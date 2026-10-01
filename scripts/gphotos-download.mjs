#!/usr/bin/env node
// Download Picker-API picks to extra-pictures/<chapter>/gphotos-*.jpg
// Usage: GOOGLE_PHOTOS_TOKEN=<fresh token from picker> node scripts/gphotos-download.mjs gphotos-manifest.json
// Manifest shape: { sessionId, slots: [{slot,chapter,type,name,pick:{id,...}}] }
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const token = process.env.GOOGLE_PHOTOS_TOKEN;
if (!token) { console.error('Missing GOOGLE_PHOTOS_TOKEN'); process.exit(1); }
const manifestPath = process.argv[2] || path.join(ROOT, 'gphotos-manifest.json');
const raw = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const sessionId = raw.sessionId || process.env.GPICKER_SESSION;
const items = Array.isArray(raw) ? raw : (raw.slots || []);
if (!sessionId) { console.error('Missing sessionId in manifest (export from new picker)'); process.exit(1); }
const picked = items.filter(m => m.pick && m.pick.id);

function slug(s){ return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,40) || 'photo'; }

for (const m of picked) {
  const id = m.pick.id;
  const r = await fetch(`https://photospicker.googleapis.com/v1/mediaItems/${encodeURIComponent(id)}?sessionId=${encodeURIComponent(sessionId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) { console.error(`FAIL get ${m.slot}: ${r.status} ${await r.text()}`); continue; }
  const item = await r.json();
  const baseUrl = item.mediaFile?.baseUrl;
  const mime = item.mediaFile?.mimeType || '';
  if (!baseUrl) { console.error(`FAIL no baseUrl ${m.slot}`); continue; }
  const img = await fetch(`${baseUrl}=w2048-h1536-d`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!img.ok) { console.error(`FAIL download ${m.slot}: ${img.status} ${await img.text().catch(() => '')}`); continue; }
  const buf = Buffer.from(await img.arrayBuffer());
  const dir = path.join(ROOT, 'extra-pictures', m.chapter);
  fs.mkdirSync(dir, { recursive: true });
  const ext = mime.includes('png') ? 'png' : 'jpg';
  const out = path.join(dir, `gphotos-${slug(m.name)}.${ext}`);
  fs.writeFileSync(out, buf);
  console.log(`OK ${m.slot} -> ${path.relative(ROOT, out)} (${(buf.length/1024).toFixed(0)}KB)`);
}
console.log(`Done ${picked.length} slots. Next: update itinerary-photos.js mapping.`);
