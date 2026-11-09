#!/usr/bin/env python3
"""Generate one MP3 per prepared stop using free Microsoft Edge TTS voices."""
import asyncio
import json
import re
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "generated-audio"
VOICES = {
    "uk": "uk-UA-PolinaNeural",
    "ja": "ja-JP-NanamiNeural",
    "vi": "vi-VN-HoaiMyNeural",
}

def load_texts(language):
    if language == "uk":
        source = (ROOT / "teksten-data-uk.js").read_text(encoding="utf-8")
        match = re.search(r"THOLEN_TEXTS\.uk\s*=\s*\{([\s\S]*?)\n\s*\};", source)
        if not match:
            raise RuntimeError("Could not locate Ukrainian stop texts")
        values = {}
        for key, raw in re.findall(r'^\s*"(\d{1,2})"\s*:\s*("(?:\\.|[^"\\])*")\s*,?\s*$', match.group(1), re.M):
            values[int(key)] = json.loads(raw)
        if set(values) != set(range(1, 16)):
            raise RuntimeError(f"Ukrainian text count is {len(values)}, expected 15")
        return values
    values = {}
    for number in range(1, 16):
        path = ROOT / "teksten" / language / f"stop-{number:02d}.txt"
        values[number] = path.read_text(encoding="utf-8")
    return values

def spoken_text(raw):
    lines = raw.replace("\r\n", "\n").split("\n")
    output = []
    skip_ambience_description = False
    for line in lines:
        stripped = line.strip()
        if not stripped:
            if output and output[-1] != "":
                output.append("")
            continue
        if stripped.startswith("[") and stripped.endswith("]"):
            cue = stripped.casefold()
            if any(word in cue for word in ("ambience", "環境音", "атмосфера", "âm thanh khung cảnh")):
                skip_ambience_description = True
            continue
        if skip_ambience_description:
            skip_ambience_description = False
            continue
        # Remove an optional STOP/STOPP heading; the stop number is already in the filename.
        if re.match(r"^(STOP|STOPP|ЗУПИНКА|ДІЛЯНКА|[０-９0-9]{2}\s*[—-])", stripped, re.I):
            continue
        output.append(stripped)
    text = "\n".join(output)
    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    if len(text) < 80:
        raise RuntimeError("Extracted narration is unexpectedly short")
    return text

async def generate(language, number, raw):
    voice = VOICES[language]
    target_dir = OUTPUT / language
    target_dir.mkdir(parents=True, exist_ok=True)
    target = target_dir / f"stop-{number:02d}.mp3"
    text = spoken_text(raw)
    last_error = None
    for attempt in range(3):
        try:
            communicate = edge_tts.Communicate(text, voice, rate="-5%", volume="+0%", pitch="+0Hz")
            await communicate.save(str(target))
            if target.exists() and target.stat().st_size >= 1024:
                return target
            raise RuntimeError("TTS returned an empty or too-small MP3")
        except Exception as exc:
            last_error = exc
            await asyncio.sleep(2 + attempt * 3)
    raise RuntimeError(f"{language} stop {number:02d} failed: {last_error}")

async def main():
    total = 0
    for language in VOICES:
        texts = load_texts(language)
        for number in range(1, 16):
            target = await generate(language, number, texts[number])
            print(f"OK {target.relative_to(ROOT)} ({target.stat().st_size} bytes)")
            total += 1
    if total != 45:
        raise RuntimeError(f"Generated {total} files, expected 45")
    print("SUCCESS: all 45 separate MP3 files generated.")

if __name__ == "__main__":
    asyncio.run(main())
