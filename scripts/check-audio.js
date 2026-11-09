#!/usr/bin/env node
"use strict";

// Check that each requested language has 15 non-empty MP3 files.
// Usage: node scripts/check-audio.js [repo-root] [lang,lang,...]
// Without language codes, checks every directory under audio/.

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(process.argv[2] || process.cwd());
const audioRoot = path.join(root, "audio");
const requested = process.argv[3]
  ? process.argv[3].split(",").map((s) => s.trim()).filter(Boolean)
  : null;
const languages = requested || (
  fs.existsSync(audioRoot)
    ? fs.readdirSync(audioRoot, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort()
    : []
);

if (!fs.existsSync(audioRoot) || languages.length === 0) {
  console.error("No audio language folders found at " + audioRoot);
  process.exit(2);
}

let errors = 0;
for (const language of languages) {
  let missing = 0;
  let invalid = 0;
  for (let stop = 1; stop <= 15; stop += 1) {
    const filename = `stop-${String(stop).padStart(2, "0")}.mp3`;
    const fullPath = path.join(audioRoot, language, filename);
    if (!fs.existsSync(fullPath)) {
      console.error(`MISSING  ${language}/${filename}`);
      missing += 1;
      continue;
    }
    const stat = fs.statSync(fullPath);
    if (!stat.isFile() || stat.size < 1024) {
      console.error(`TOO SMALL ${language}/${filename} (${stat.size} bytes)`);
      invalid += 1;
      continue;
    }

    // MP3 files normally start with an ID3 tag or an MPEG audio frame sync.
    const fd = fs.openSync(fullPath, "r");
    const header = Buffer.alloc(3);
    fs.readSync(fd, header, 0, 3, 0);
    fs.closeSync(fd);
    const hasId3 = header.toString("ascii") === "ID3";
    const hasFrameSync = header[0] === 0xff && (header[1] & 0xe0) === 0xe0;
    if (!hasId3 && !hasFrameSync) {
      console.error(`BAD HEADER ${language}/${filename}`);
      invalid += 1;
    }
  }

  if (missing === 0 && invalid === 0) {
    console.log(`PASS ${language}: all 15 MP3 files present and headers look valid`);
  } else {
    console.error(`FAIL ${language}: ${missing} missing, ${invalid} invalid/small`);
    errors += missing + invalid;
  }
}

if (errors > 0) {
  console.error(`Audio check failed with ${errors} issue(s).`);
  process.exit(1);
}
console.log(`Audio check passed for ${languages.length} language(s).`);
