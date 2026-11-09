#!/usr/bin/env node
"use strict";

// Structural release gate for the three prepared languages.
// Usage: node scripts/check-language-readiness.js [repo-root]
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(process.argv[2] || process.cwd());
const indexPath = path.join(root, "index.html");
const index = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, "utf8") : "";
const languages = [
  { code: "uk", name: "Ukrainian", source: "teksten-data-uk.js" },
  { code: "ja", name: "Japanese", source: null },
  { code: "vi", name: "Vietnamese", source: null }
];
const uiDictionaries = [
  "ui", "stopUi", "feedbackUi", "writeReviewLabels",
  "routeActionLabels", "navigateLabels"
];
let failures = 0;

function report(ok, message) {
  console.log((ok ? "PASS " : "FAIL ") + message);
  if (!ok) failures += 1;
}

report(Boolean(index), "index.html is present");
if (!index) process.exit(2);

for (const language of languages) {
  let textCount = 0;
  if (language.source) {
    const sourcePath = path.join(root, language.source);
    const source = fs.existsSync(sourcePath) ? fs.readFileSync(sourcePath, "utf8") : "";
    const match = source.match(/THOLEN_TEXTS\.uk\s*=\s*\{([\s\S]*?)\n\s*\};/);
    if (match) {
      const keys = [...match[1].matchAll(/["'](\d{1,2})["']\s*:/g)]
        .map((item) => Number(item[1]));
      textCount = new Set(keys.filter((n) => n >= 1 && n <= 15)).size;
    }
    report(textCount === 15, language.code + " stop texts in " + language.source + ": " + textCount + "/15");
    report(index.includes(language.source), language.code + " data script is loaded by index.html");
  } else {
    for (let stop = 1; stop <= 15; stop += 1) {
      const file = path.join(root, "teksten", language.code, "stop-" + String(stop).padStart(2, "0") + ".txt");
      if (fs.existsSync(file) && fs.statSync(file).isFile() && fs.readFileSync(file, "utf8").trim()) textCount += 1;
    }
    report(textCount === 15, language.code + " stop text files: " + textCount + "/15");
  }

  for (const dictionary of uiDictionaries) {
    // Match a language property inside the named UI dictionary.
    const escaped = dictionary.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp("const\\s+" + escaped + "\\s*=\\s*\\{[\\s\\S]{0,25000}?\\b" + language.code + "\\s*:");
    report(pattern.test(index), language.code + " UI dictionary: " + dictionary);
  }

  let audioCount = 0;
  for (let stop = 1; stop <= 15; stop += 1) {
    const file = path.join(root, "audio", language.code, "stop-" + String(stop).padStart(2, "0") + ".mp3");
    if (fs.existsSync(file) && fs.statSync(file).isFile() && fs.statSync(file).size >= 1024) audioCount += 1;
  }
  report(audioCount === 15, language.code + " non-empty audio files: " + audioCount + "/15");
}

if (failures) {
  console.error("\nReadiness check failed: " + failures + " issue(s). New languages must remain hidden.");
  process.exit(1);
}
console.log("\nAll structural readiness checks passed.");
