// hints.js — the hint supply and the pulse a hint draws. Each scene grants
// a small number of hints; spending one pulses a soft ring around a single
// unfound difference for a couple of seconds — enough to draw the eye to
// the area, never a marker that gives the find away for free.

import { playHintShimmer } from './sound.js';

export const HINT_SCORE_COST = 40;
const PULSE_MS = 2200;

export class HintSupply {
  constructor(perScene) {
    this.perScene = perScene;
    this.left = perScene;
    this.pulse = null; // { diff, startedAt } while a pulse is on screen
  }

  reset() {
    this.left = this.perScene;
    this.pulse = null;
  }

  // Spend one hint on the given difference. Returns false when none are
  // left or a pulse is already showing.
  spend(diff, now) {
    if (this.left <= 0 || this.pulse) return false;
    this.left -= 1;
    this.pulse = { diff, startedAt: now };
    playHintShimmer();
    return true;
  }

  // Called every frame: ages the pulse out and reports whether the screen
  // needs another draw because of it.
  update(now) {
    if (this.pulse && now - this.pulse.startedAt > PULSE_MS) {
      this.pulse = null;
      return true;
    }
    return this.pulse !== null;
  }

  // Draw the pulse over one panel: two expanding rings and a breathing
  // halo, centred on the hinted difference.
  drawPulse(ctx, now) {
    if (!this.pulse) return;
    const { diff, startedAt } = this.pulse;
    const age = (now - startedAt) / PULSE_MS; // 0 → 1 over the pulse's life
    const fade = 1 - age;
    ctx.save();
    for (const phase of [0, 0.5]) {
      const t = (age + phase) % 1;
      ctx.beginPath();
      ctx.arc(diff.x, diff.y, 8 + t * 30, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 214, 110, ${(1 - t) * 0.85 * fade + 0.15})`;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(diff.x, diff.y, diff.r + 6, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 214, 110, ${0.10 + 0.08 * Math.sin(now / 160)})`;
    ctx.fill();
    ctx.restore();
  }
}
