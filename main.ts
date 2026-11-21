// Twin Vista — hand-in program for the spot-the-difference entry.
//
// The game itself lives in game/ as plain static files (open game/index.html
// in a desktop browser, no build step, no network). This program's only job
// is to hand that game in: it copies game/ and screenshots/ into the output
// directory and writes dossier.json there with the vendored make.fun library,
// so the bytes the grader rebuilds are the bytes this program wrote.
//
// Run it the way the grader does, from beside this file:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// MAKEFUN_OUTPUT_DIR stands in for /output outside the grader's container.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoDir = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Copy the playable game first, then the screenshots of it in play.
mkdirSync(outputDir, { recursive: true });
cpSync(join(repoDir, 'game'), join(outputDir, 'game'), { recursive: true });

const shotsDir = join(repoDir, 'screenshots');
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(shotsDir)) {
  cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });
}

// The dossier is built from what now stands in the output directory, under
// the gate's own caps: at most 4 screenshots of 256 KiB, at most 993 files
// and 48 MiB under game/, no game path over 1,000 bytes, and the source text
// the judge reads capped at 160 KiB.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
