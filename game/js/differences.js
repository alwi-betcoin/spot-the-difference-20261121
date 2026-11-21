// differences.js — the state of one scene's hunt: which of its differences
// have been found, which click finds one, and how the found ones are marked.
// A difference is data from scene-data.js: a centre (x, y) in panel
// coordinates and a radius r — the forgiving circle a click must land in.

export class DifferenceHunt {
  constructor(scene) {
    this.scene = scene;
    this.found = new Set(); // ids of differences already marked
    this.lastFoundAt = new Map(); // id → timestamp, for the pop animation
  }

  get total() {
    return this.scene.differences.length;
  }

  get remaining() {
    return this.total - this.found.size;
  }

  get isComplete() {
    return this.remaining === 0;
  }

  unfound() {
    return this.scene.differences.filter((d) => !this.found.has(d.id));
  }

  // The nearest unfound difference whose circle holds the point, or null.
  // Nearest-centre wins so two close differences never fight over a click.
  hitTest(x, y) {
    let best = null;
    let bestDistance = Infinity;
    for (const diff of this.unfound()) {
      const distance = Math.hypot(x - diff.x, y - diff.y);
      if (distance <= diff.r && distance < bestDistance) {
        best = diff;
        bestDistance = distance;
      }
    }
    return best;
  }

  markFound(diff, now) {
    this.found.add(diff.id);
    this.lastFoundAt.set(diff.id, now);
  }

  // Draw the marker for every found difference on one panel: a double ring
  // in gold and cream. The newest find pops — it springs from small to full
  // size over a quarter of a second, which is the satisfying part.
  drawMarkers(ctx, now) {
    for (const diff of this.scene.differences) {
      if (!this.found.has(diff.id)) continue;
      const age = (now - this.lastFoundAt.get(diff.id)) / 260;
      const pop = age >= 1 ? 1 : 1 + Math.sin(age * Math.PI) * 0.35 - (1 - age) * 0.25;
      const radius = diff.r * pop;
      ctx.save();
      ctx.beginPath();
      ctx.arc(diff.x, diff.y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(43, 24, 8, 0.55)';
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(diff.x, diff.y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffd66e';
      ctx.lineWidth = 3.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(diff.x, diff.y, radius * 0.82, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 246, 214, 0.9)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }
  }
}
