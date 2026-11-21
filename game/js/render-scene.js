// render-scene.js — draws one panel of a scene. Both panels come from the
// same painter: the left panel is painted with no differences applied, the
// right panel with every difference in the scene's list applied, so the two
// pictures are near-identical by construction and a difference is exactly
// the data that says how one element changes.
//
// A painter receives two helpers:
//   pick(id, base, changed) → changed when the variant applies diff `id`
//   has(id)                 → true when the variant applies diff `id`
// and draws in a 560×400 panel. Every random-looking scatter (stars, water
// shimmer, grass) comes from a seeded generator, so a scene paints the same
// way every time and the panels can never drift apart.

export const PANEL_WIDTH = 560;
export const PANEL_HEIGHT = 400;

// Deterministic pseudo-random numbers from a seed: identical on every call.
function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function circle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function poly(ctx, points, fill) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function line(ctx, x1, y1, x2, y2, stroke, width) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = width;
  ctx.stroke();
}

function text(ctx, value, x, y, font, fill, align = 'center') {
  ctx.font = font;
  ctx.fillStyle = fill;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x, y);
}

// A four-point sparkle star, the storybook kind.
function sparkle(ctx, x, y, s, fill) {
  ctx.beginPath();
  ctx.moveTo(x, y - s);
  ctx.quadraticCurveTo(x, y, x + s, y);
  ctx.quadraticCurveTo(x, y, x, y + s);
  ctx.quadraticCurveTo(x, y, x - s, y);
  ctx.quadraticCurveTo(x, y, x, y - s);
  ctx.fillStyle = fill;
  ctx.fill();
}

function cloud(ctx, x, y, scale, fill) {
  ellipse(ctx, x, y, 34 * scale, 13 * scale, fill);
  ellipse(ctx, x - 22 * scale, y + 3 * scale, 22 * scale, 10 * scale, fill);
  ellipse(ctx, x + 24 * scale, y + 3 * scale, 24 * scale, 11 * scale, fill);
  ellipse(ctx, x + 2 * scale, y - 7 * scale, 20 * scale, 11 * scale, fill);
}

// A gull: two shallow arcs meeting in the middle.
function gull(ctx, x, y, s, stroke) {
  ctx.beginPath();
  ctx.arc(x - s * 0.55, y, s * 0.55, Math.PI * 1.15, Math.PI * 1.85);
  ctx.arc(x + s * 0.55, y, s * 0.55, Math.PI * 1.15, Math.PI * 1.85);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.stroke();
}

// ---------------------------------------------------------------- Scene 1

function paintHarbour(ctx, pick, has) {
  // Dusk sky, banded from violet to ember at the horizon (y = 252).
  const sky = ctx.createLinearGradient(0, 0, 0, 252);
  sky.addColorStop(0, '#241640');
  sky.addColorStop(0.55, '#6d2a4e');
  sky.addColorStop(1, '#d95f38');
  rect(ctx, 0, 0, 560, 252, sky);

  // Stars pricking through the upper sky; one of them is a difference.
  const stars = [[60, 40, 3], [200, 30, 2.4], [300, 58, 2.8], [430, 36, 3], [505, 70, 2.4], [370, 80, 2], [40, 110, 2.2], [520, 128, 2]];
  for (const [x, y, s] of stars) sparkle(ctx, x, y, s + 2, 'rgba(255,240,200,0.85)');
  if (!has('star-missing')) sparkle(ctx, 120, 52, 5, 'rgba(255,240,200,0.95)');

  // Clouds in mauve, lit from below.
  cloud(ctx, 110, 84, 1.1, 'rgba(84,38,74,0.9)');
  cloud(ctx, 318, 122, 0.9, 'rgba(84,38,74,0.85)');
  cloud(ctx, 472, 96, 1.2, 'rgba(96,42,78,0.9)');

  // Gulls heading home; one fewer in the changed picture.
  gull(ctx, 180, 70, 13, 'rgba(30,16,34,0.8)');
  if (!has('gull-missing')) gull(ctx, 330, 90, 12, 'rgba(30,16,34,0.8)');
  gull(ctx, 255, 112, 10, 'rgba(30,16,34,0.7)');
  gull(ctx, 455, 122, 11, 'rgba(30,16,34,0.7)');
  gull(ctx, 92, 142, 9, 'rgba(30,16,34,0.6)');

  // The low sun, half sunk, and its glow.
  const glow = ctx.createRadialGradient(400, 240, 8, 400, 240, 120);
  glow.addColorStop(0, 'rgba(255,176,84,0.55)');
  glow.addColorStop(1, 'rgba(255,176,84,0)');
  rect(ctx, 280, 120, 240, 140, glow);
  circle(ctx, 400, 244, 44, '#ffb054');
  circle(ctx, 400, 244, 36, '#ffc978');

  // Sea below the horizon, with a seeded shimmer so both panels agree.
  const sea = ctx.createLinearGradient(0, 252, 0, 400);
  sea.addColorStop(0, '#4a2358');
  sea.addColorStop(0.25, '#2e1c4c');
  sea.addColorStop(1, '#16102e');
  rect(ctx, 0, 252, 560, 148, sea);
  const rand = seededRandom(7101);
  ctx.fillStyle = 'rgba(255,190,110,0.35)';
  for (let i = 0; i < 46; i++) {
    const y = 262 + rand() * 128;
    const w = 6 + rand() * 22;
    const x = 400 + (rand() - 0.5) * (30 + (y - 252) * 0.9) - w / 2;
    ctx.fillRect(x, y, w, 2);
  }
  ctx.fillStyle = 'rgba(210,200,255,0.20)';
  for (let i = 0; i < 60; i++) {
    const y = 258 + rand() * 136;
    const w = 5 + rand() * 16;
    ctx.fillRect(rand() * 548, y, w, 1.6);
  }

  // The rocky point on the left and the lighthouse standing on it.
  poly(ctx, [[0, 252], [0, 186], [52, 172], [104, 204], [126, 252]], '#2a1830');
  poly(ctx, [[58, 252], [84, 252], [79, 148], [63, 148]], '#e8ddc8'); // tower
  ctx.save();
  poly(ctx, [[58, 252], [84, 252], [79, 148], [63, 148]], '#e8ddc8');
  ctx.clip();
  rect(ctx, 56, 176, 30, 16, '#c0392b');
  rect(ctx, 56, 216, 30, 16, '#c0392b');
  ctx.restore();
  rect(ctx, 59, 140, 24, 9, '#33222e'); // gallery
  if (has('lighthouse-lamp')) {
    rect(ctx, 63, 118, 16, 22, '#241a26');
    circle(ctx, 71, 129, 5, '#4a3c46'); // the lamp, dark
  } else {
    const beam = ctx.createRadialGradient(71, 129, 2, 71, 129, 46);
    beam.addColorStop(0, 'rgba(255,214,110,0.65)');
    beam.addColorStop(1, 'rgba(255,214,110,0)');
    rect(ctx, 25, 83, 92, 92, beam);
    poly(ctx, [[79, 124], [196, 104], [196, 148], [79, 136]], 'rgba(255,214,110,0.10)');
    rect(ctx, 63, 118, 16, 22, '#33222e');
    circle(ctx, 71, 129, 5.5, '#ffd66e');
  }
  poly(ctx, [[59, 118], [83, 118], [71, 104]], '#8e2f26'); // cap

  // Quay and the row of harbour houses, bases on the horizon line.
  rect(ctx, 126, 248, 434, 10, '#20122a');
  const house = (x, w, top, peak, body, roof) => {
    rect(ctx, x, top, w, 252 - top, body);
    poly(ctx, [[x - 5, top], [x + w + 5, top], [x + w / 2, peak]], roof);
  };
  house(160, 72, 196, 166, '#46284d', '#2a1836');
  house(244, 86, 186, 156, '#513058', '#2e1a38');
  house(342, 68, 204, 176, '#40254a', '#281630');
  const litWindow = (x, y) => rect(ctx, x, y, 12, 15, '#ffd66e');
  const darkWindow = (x, y) => rect(ctx, x, y, 12, 15, '#241a2e');
  litWindow(174, 212);
  // One window of the first house is lit here, dark in the changed picture.
  if (has('window-dark')) darkWindow(209, 216); else litWindow(209, 216);
  rect(ctx, 190, 226, 14, 26, '#2a1836'); // door
  litWindow(260, 214);
  litWindow(304, 214);
  darkWindow(262, 232);
  litWindow(360, 220);
  darkWindow(386, 220);
  // The café's hanging sign.
  line(ctx, 285, 196, 285, 208, '#1c1024', 2);
  rect(ctx, 258, 208, 54, 15, '#33200f');
  text(ctx, 'THE SALTY FOX', 285, 216, '7.5px Georgia', '#f3c877');

  // The pier on the right and its lantern, lit in both pictures.
  rect(ctx, 462, 254, 98, 7, '#241426');
  for (const px of [478, 512, 546]) rect(ctx, px, 258, 6, 26, '#1c0f20');
  line(ctx, 520, 254, 520, 224, '#1c0f20', 4);
  const lampGlow = ctx.createRadialGradient(520, 216, 2, 520, 216, 26);
  lampGlow.addColorStop(0, 'rgba(255,205,100,0.75)');
  lampGlow.addColorStop(1, 'rgba(255,205,100,0)');
  rect(ctx, 494, 190, 52, 52, lampGlow);
  rect(ctx, 514, 208, 12, 15, '#ffd66e');
  poly(ctx, [[512, 208], [528, 208], [520, 199]], '#1c0f20');

  // A sailboat mid-harbour; its big sail changes colour.
  poly(ctx, [[216, 318], [288, 318], [274, 340], [230, 340]], '#5a3421');
  rect(ctx, 216, 314, 72, 5, '#6e422a');
  line(ctx, 252, 318, 252, 240, '#3a2415', 3);
  poly(ctx, [[252, 246], [252, 310], [284, 310]], pick('sail-colour', '#f3e5c0', '#c9502f'));
  poly(ctx, [[252, 254], [252, 304], [228, 304]], '#e2d0a4');
  line(ctx, 252, 240, 284, 310, 'rgba(40,20,10,0.35)', 1);
  line(ctx, 252, 240, 228, 304, 'rgba(40,20,10,0.35)', 1);

  // A fishing boat in the left foreground, with crates on its deck.
  poly(ctx, [[82, 346], [178, 346], [162, 368], [98, 368]], '#40260f');
  rect(ctx, 82, 341, 96, 6, '#54341a');
  line(ctx, 128, 341, 128, 292, '#33200f', 3);
  rect(ctx, 140, 322, 16, 13, '#8a5a33');
  rect(ctx, 158, 326, 13, 10, '#77502c');
  circle(ctx, 128, 288, 4, '#ffd66e');

  // A rowboat on the right; its pennant flies the other way in one picture.
  poly(ctx, [[406, 334], [474, 334], [460, 350], [420, 350]], '#4c2c17');
  line(ctx, 446, 334, 446, 296, '#33200f', 2.5);
  if (has('pennant-flip')) {
    poly(ctx, [[446, 296], [446, 309], [429, 302]], '#e8a33d');
  } else {
    poly(ctx, [[446, 296], [446, 309], [463, 302]], '#e8a33d');
  }
  ellipse(ctx, 440, 356, 40, 4, 'rgba(0,0,0,0.25)');

  // A buoy bobbing in the right foreground; its colour changes.
  ellipse(ctx, 505, 360, 17, 4, 'rgba(0,0,0,0.3)');
  poly(ctx, [[494, 358], [516, 358], [505, 332]], pick('buoy-colour', '#d23c2a', '#2a9d5c'));
  rect(ctx, 501, 322, 8, 10, '#2b2b2b');
  circle(ctx, 505, 320, 3.5, '#ffd66e');
}

// ---------------------------------------------------------------- Scene 2

function paintWorkshop(ctx, pick, has) {
  // A soft daytime sky over a forest clearing.
  const sky = ctx.createLinearGradient(0, 0, 0, 210);
  sky.addColorStop(0, '#a8d8e8');
  sky.addColorStop(1, '#e8f4da');
  rect(ctx, 0, 0, 560, 210, sky);
  cloud(ctx, 150, 52, 0.8, 'rgba(255,255,255,0.9)');
  cloud(ctx, 420, 38, 0.65, 'rgba(255,255,255,0.85)');

  // Distant tree line and the clearing's grass.
  poly(ctx, [[0, 210], [60, 168], [130, 196], [210, 160], [300, 192], [390, 158], [470, 190], [560, 166], [560, 210]], '#5d8a4a');
  const grass = ctx.createLinearGradient(0, 210, 0, 400);
  grass.addColorStop(0, '#84b45e');
  grass.addColorStop(1, '#5d8a3e');
  rect(ctx, 0, 210, 560, 190, grass);
  const rand = seededRandom(2202);
  ctx.strokeStyle = 'rgba(46,90,30,0.5)';
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 130; i++) {
    const x = rand() * 556;
    const y = 226 + rand() * 168;
    line(ctx, x, y, x - 2, y - 5 - rand() * 4, 'rgba(46,90,30,0.45)', 1.4);
  }
  // A worn path from the bottom edge to the cabin door.
  poly(ctx, [[356, 400], [392, 400], [398, 322], [384, 322]], '#c9b183');
  poly(ctx, [[352, 400], [396, 400], [400, 322], [382, 322]], 'rgba(160,132,88,0.5)');

  // The big oak on the left, trunk and layered canopy.
  poly(ctx, [[30, 400], [46, 250], [40, 190], [58, 190], [56, 250], [74, 400]], '#6e4a2a');
  line(ctx, 52, 210, 18, 160, '#6e4a2a', 10);
  line(ctx, 54, 200, 96, 148, '#6e4a2a', 9);
  for (const [x, y, r] of [[40, 120, 52], [100, 92, 46], [150, 122, 40], [70, 70, 38], [128, 60, 30]]) {
    circle(ctx, x, y, r, '#4a7a34');
  }
  for (const [x, y, r] of [[62, 104, 34], [118, 84, 28], [36, 138, 26]]) {
    circle(ctx, x, y, r, '#5d9040');
  }

  // Pines standing behind the cabin on the right.
  for (const [x, base, h] of [[486, 250, 120], [524, 258, 140], [452, 244, 96]]) {
    poly(ctx, [[x - 26, base], [x + 26, base], [x, base - h]], '#3c6a2c');
    poly(ctx, [[x - 19, base - h * 0.38], [x + 19, base - h * 0.38], [x, base - h * 1.04]], '#477c34');
    rect(ctx, x - 3, base, 6, 12, '#5d4023');
  }

  // The log cabin: walls with log lines, a shingled roof, a brick chimney.
  rect(ctx, 296, 190, 190, 132, '#8a5a33');
  ctx.strokeStyle = 'rgba(70,42,18,0.55)';
  ctx.lineWidth = 2;
  for (let y = 204; y < 322; y += 15) line(ctx, 296, y, 486, y, 'rgba(70,42,18,0.55)', 2);
  poly(ctx, [[282, 194], [498, 194], [391, 122]], '#6e4630');
  ctx.strokeStyle = 'rgba(46,28,12,0.5)';
  for (let i = 1; i < 5; i++) {
    const t = i / 5;
    line(ctx, 282 + (391 - 282) * t, 194 - (194 - 122) * t, 498 - (498 - 391) * t, 194 - (194 - 122) * t, 'rgba(46,28,12,0.45)', 1.6);
  }
  rect(ctx, 438, 96, 24, 48, '#9a4a3a'); // chimney
  rect(ctx, 434, 90, 32, 9, '#7c3a2e');
  // Chimney smoke curls — present in one picture, gone in the other.
  if (!has('smoke-removed')) {
    circle(ctx, 452, 76, 8, 'rgba(245,245,245,0.75)');
    circle(ctx, 460, 60, 11, 'rgba(245,245,245,0.6)');
    circle(ctx, 472, 42, 14, 'rgba(245,245,245,0.45)');
  }
  // A bird on the roof ridge — only in the changed picture.
  if (has('bird-added')) {
    ellipse(ctx, 428, 118, 10, 7, '#3a6ea8');
    circle(ctx, 436, 111, 5, '#3a6ea8');
    poly(ctx, [[418, 116], [408, 110], [419, 122]], '#2c5580');
    circle(ctx, 437.5, 110, 1.2, '#101418');
    line(ctx, 424, 125, 424, 129, '#c9862e', 1.6);
    line(ctx, 431, 125, 431, 129, '#c9862e', 1.6);
  }
  // Door, centred, with a step.
  rect(ctx, 379, 246, 26, 76, '#5d3a1e');
  rect(ctx, 379, 246, 26, 76, 'rgba(0,0,0,0.08)');
  circle(ctx, 399, 286, 2.6, '#e8a33d');
  rect(ctx, 370, 320, 44, 6, '#a0855c');
  // The left window and its curtains, whose colour changes.
  rect(ctx, 314, 224, 44, 44, '#33241a');
  rect(ctx, 318, 228, 36, 36, '#bfe0ea');
  const curtain = pick('curtain-colour', '#2e7f86', '#d9a441');
  rect(ctx, 318, 228, 11, 36, curtain);
  rect(ctx, 343, 228, 11, 36, curtain);
  line(ctx, 336, 228, 336, 264, '#33241a', 3);
  line(ctx, 318, 246, 354, 246, '#33241a', 3);
  // The right window, plainly lit.
  rect(ctx, 428, 224, 44, 44, '#33241a');
  rect(ctx, 432, 228, 36, 36, '#cfe8ef');
  line(ctx, 450, 228, 450, 264, '#33241a', 3);
  line(ctx, 432, 246, 468, 246, '#33241a', 3);
  // A handsaw hanging on the wall right of the door — gone in one picture.
  if (!has('saw-removed')) {
    poly(ctx, [[440, 282], [472, 282], [466, 296], [446, 294], [440, 290]], '#c8ccd2');
    ctx.fillStyle = '#c8ccd2';
    for (let i = 0; i < 6; i++) {
      poly(ctx, [[446 + i * 4.4, 294], [450 + i * 4.4, 294], [448 + i * 4.4, 298]], '#c8ccd2');
    }
    rect(ctx, 468, 278, 12, 12, '#8a5a33');
  }
  // A lantern hanging from the eave by the door: lit, or not.
  line(ctx, 300, 196, 306, 208, '#3a2a18', 2);
  if (has('lantern-unlit')) {
    rect(ctx, 299, 208, 14, 19, '#4c4c4c');
    rect(ctx, 302, 212, 8, 11, '#6a6a6a');
  } else {
    const glow = ctx.createRadialGradient(306, 218, 2, 306, 218, 24);
    glow.addColorStop(0, 'rgba(255,205,100,0.7)');
    glow.addColorStop(1, 'rgba(255,205,100,0)');
    rect(ctx, 282, 194, 48, 48, glow);
    rect(ctx, 299, 208, 14, 19, '#3a2c1c');
    rect(ctx, 302, 212, 8, 11, '#ffd66e');
  }
  poly(ctx, [[297, 208], [315, 208], [306, 201]], '#3a2c1c');
  // The cat asleep on the doorstep: black in one picture, ginger in the other.
  const cat = pick('cat-colour', '#26221f', '#d97b2f');
  ellipse(ctx, 360, 314, 15, 8, cat); // curled body
  circle(ctx, 347, 308, 7, cat);      // head
  poly(ctx, [[342, 303], [340, 296], [347, 300]], cat); // ear
  poly(ctx, [[352, 302], [351, 295], [357, 300]], cat); // ear
  ctx.beginPath();
  ctx.arc(372, 310, 7, Math.PI * 0.4, Math.PI * 1.5);   // tail curl
  ctx.strokeStyle = cat;
  ctx.lineWidth = 3.4;
  ctx.stroke();

  // The workbench on the left, with its stack of planks.
  rect(ctx, 92, 268, 128, 9, '#7a4e28');
  rect(ctx, 98, 277, 9, 42, '#64401f');
  rect(ctx, 202, 277, 9, 42, '#64401f');
  rect(ctx, 92, 316, 128, 6, '#64401f');
  const planks = has('plank-count') ? 4 : 5;
  for (let i = 0; i < planks; i++) {
    rect(ctx, 102, 262 - i * 6, 58, 5.4, i % 2 ? '#b0824a' : '#a87840');
  }
  rect(ctx, 176, 252, 26, 16, '#9a4a3a'); // a flowerpot on the bench
  circle(ctx, 189, 248, 8, '#5d9040');
  circle(ctx, 182, 252, 6, '#6ea34c');
  circle(ctx, 196, 252, 6, '#6ea34c');
  line(ctx, 168, 268, 168, 256, '#8a8f96', 3); // a chisel standing in a block
  rect(ctx, 160, 250, 16, 7, '#8a5a33');

  // The chopping stump with its axe — the axe is gone in one picture.
  ellipse(ctx, 300, 322, 19, 6, 'rgba(0,0,0,0.22)');
  rect(ctx, 284, 292, 32, 30, '#a87840');
  ellipse(ctx, 300, 292, 16, 5, '#c49a62');
  ctx.beginPath();
  ctx.arc(300, 292, 9, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(122,78,40,0.6)';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  if (!has('axe-removed')) {
    line(ctx, 306, 292, 322, 262, '#8a5a33', 5); // handle
    poly(ctx, [[318, 250], [336, 258], [330, 272], [314, 264]], '#9aa0a8'); // head
    poly(ctx, [[318, 250], [336, 258], [333, 264], [316, 257]], '#c3c9d1');
  }
  // Split logs waiting beside the stump.
  for (const [x, y] of [[338, 330], [356, 336], [346, 318], [368, 328]]) {
    circle(ctx, x, y, 10, '#b0824a');
    circle(ctx, x, y, 7, '#cfa96e');
  }

  // The wheelbarrow on the right; its wheel changes colour.
  poly(ctx, [[452, 292], [516, 292], [504, 318], [464, 318]], '#7a8a3a');
  rect(ctx, 452, 286, 64, 7, '#67752f');
  line(ctx, 464, 318, 446, 330, '#5d4023', 4);
  line(ctx, 504, 318, 522, 330, '#5d4023', 4);
  circle(ctx, 478, 330, 13, '#4c3826');
  circle(ctx, 478, 330, 6, pick('wheel-colour', '#8a6742', '#c0392b'));
  rect(ctx, 470, 272, 30, 15, '#a87840'); // a log riding in it
  circle(ctx, 500, 279, 7.5, '#cfa96e');

  // Mushrooms in the oak's shade; the big one's cap changes colour.
  const cap = pick('mushroom-colour', '#c93a2e', '#8a6742');
  poly(ctx, [[80, 356], [96, 356], [93, 342], [83, 342]], '#efe3cc');
  ctx.beginPath();
  ctx.arc(88, 344, 17, Math.PI, 0);
  ctx.fillStyle = cap;
  ctx.fill();
  if (!has('mushroom-colour')) {
    circle(ctx, 80, 336, 2.6, '#fff6e8');
    circle(ctx, 93, 331, 2, '#fff6e8');
    circle(ctx, 99, 339, 1.7, '#fff6e8');
  }
  poly(ctx, [[112, 364], [122, 364], [120, 354], [114, 354]], '#efe3cc');
  ctx.beginPath();
  ctx.arc(117, 355, 8, Math.PI, 0);
  ctx.fillStyle = '#d97b2f';
  ctx.fill();

  // A deer watching from the right-hand trees.
  ellipse(ctx, 532, 268, 17, 24, '#a87848');
  circle(ctx, 524, 238, 11, '#b0824a');
  poly(ctx, [[516, 232], [510, 218], [518, 226]], '#b0824a');
  poly(ctx, [[530, 231], [534, 216], [538, 228]], '#b0824a');
  line(ctx, 513, 220, 506, 206, '#8a6742', 2.4); // antler
  line(ctx, 535, 219, 540, 204, '#8a6742', 2.4); // antler
  circle(ctx, 521, 236, 1.8, '#201812');
  ellipse(ctx, 516, 244, 3.4, 2.4, '#7c5636');

  // Flowers dotted through the grass.
  const rand2 = seededRandom(909);
  for (let i = 0; i < 26; i++) {
    const x = rand2() * 550 + 5;
    const y = 336 + rand2() * 56;
    circle(ctx, x, y, 2, ['#e86a8a', '#f3c877', '#ffffff'][i % 3]);
  }
}

// ---------------------------------------------------------------- Scene 3

function paintMarket(ctx, pick, has) {
  // Night sky, deep indigo, with a seeded field of stars.
  const sky = ctx.createLinearGradient(0, 0, 0, 240);
  sky.addColorStop(0, '#10102a');
  sky.addColorStop(1, '#33255c');
  rect(ctx, 0, 0, 560, 240, sky);
  const rand = seededRandom(3303);
  for (let i = 0; i < 70; i++) {
    const x = rand() * 556;
    const y = rand() * 150;
    circle(ctx, x, y, rand() * 1.3 + 0.5, 'rgba(255,246,214,0.8)');
  }
  // A bright little cluster at the top left; one of its stars goes missing.
  sparkle(ctx, 66, 34, 5, 'rgba(255,246,214,0.95)');
  sparkle(ctx, 84, 58, 4, 'rgba(255,246,214,0.9)');
  if (!has('stars-count')) sparkle(ctx, 106, 38, 4.4, 'rgba(255,246,214,0.95)');
  sparkle(ctx, 122, 62, 3.4, 'rgba(255,246,214,0.85)');
  sparkle(ctx, 48, 64, 3.4, 'rgba(255,246,214,0.85)');

  // The crescent moon, opening one way — or the other.
  circle(ctx, 478, 62, 24, '#f6e3ac');
  const bite = pick('moon-flip', 14, -14);
  circle(ctx, 478 + bite, 54, 21, '#171737');

  // Background rooftops and one shuttered window.
  poly(ctx, [[0, 240], [0, 176], [70, 150], [140, 176], [140, 240]], '#1d1838');
  poly(ctx, [[130, 240], [130, 168], [230, 168], [230, 240]], '#211b40');
  poly(ctx, [[420, 240], [420, 158], [492, 132], [560, 158], [560, 240]], '#1d1838');
  rect(ctx, 36, 196, 14, 18, '#ffd66e');
  rect(ctx, 168, 192, 13, 17, 'rgba(255,214,110,0.75)');
  // The shutter: swung open over a lit window, or closed across it.
  if (has('shutter-open')) {
    rect(ctx, 513, 182, 15, 20, '#151228');
    rect(ctx, 515, 184, 11, 16, '#3a2c14');
  } else {
    rect(ctx, 513, 182, 15, 20, '#ffd66e');
    poly(ctx, [[513, 182], [501, 188], [501, 208], [513, 202]], '#4a5a8a');
  }

  // String lights sagging between three poles, over the whole market.
  line(ctx, 30, 66, 30, 250, '#0e0b20', 5);
  line(ctx, 280, 50, 280, 246, '#0e0b20', 5);
  line(ctx, 530, 70, 530, 250, '#0e0b20', 5);
  const bulbPalette = ['#ffd66e', '#ff9d5c', '#ff7d6b', '#ffe9a8'];
  const drawString = (x1, y1, x2, y2, sag, seed) => {
    const r = seededRandom(seed);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo((x1 + x2) / 2, Math.max(y1, y2) + sag, x2, y2);
    ctx.strokeStyle = 'rgba(10,8,22,0.9)';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    for (let i = 1; i < 9; i++) {
      const t = i / 9;
      const x = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * ((x1 + x2) / 2) + t * t * x2;
      const y = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * (Math.max(y1, y2) + sag) + t * t * y2;
      const colour = bulbPalette[Math.floor(r() * bulbPalette.length)];
      circle(ctx, x, y + 5, 7, 'rgba(255,200,90,0.20)');
      // The bulb nearest the middle of the market changes colour.
      const isDiffBulb = seed === 31 && i === 4;
      circle(ctx, x, y + 5, 3.4, isDiffBulb ? pick('bulb-colour', '#ffd66e', '#6ec3ff') : colour);
    }
  };
  drawString(30, 66, 280, 50, 34, 31);
  drawString(280, 50, 530, 70, 34, 77);

  // The ground the stalls stand on.
  const ground = ctx.createLinearGradient(0, 240, 0, 400);
  ground.addColorStop(0, '#3a2c58');
  ground.addColorStop(1, '#241a3c');
  rect(ctx, 0, 240, 560, 160, ground);

  // One market stall: posts, a striped slanted awning, a counter.
  const stall = (x, w, stripeA, stripeB, top = 148) => {
    rect(ctx, x + 4, 236, 5, 106, '#171126');
    rect(ctx, x + w - 9, 236, 5, 106, '#171126');
    const awning = ctx.createLinearGradient(x, 0, x + w, 0);
    const steps = 6;
    for (let i = 0; i < steps; i++) {
      awning.addColorStop(i / steps, i % 2 ? stripeB : stripeA);
      awning.addColorStop((i + 1) / steps, i % 2 ? stripeB : stripeA);
    }
    poly(ctx, [[x - 8, top + 34], [x + w + 8, top + 34], [x + w - 6, top], [x + 6, top]], awning);
    rect(ctx, x, top + 34, w, 8, 'rgba(0,0,0,0.25)');
    rect(ctx, x + 2, 300, w - 4, 14, '#4a3220'); // counter
    rect(ctx, x + 2, 314, w - 4, 30, '#33241a');
  };

  // Stall 1 — rugs. Two hang in front; the left one's diamonds change count.
  stall(36, 160, '#b3392f', '#f0dfba');
  const rug = (x, diamonds, base, trim) => {
    rect(ctx, x, 196, 46, 96, base);
    rect(ctx, x + 4, 200, 38, 88, trim);
    const rows = diamonds;
    for (let i = 0; i < rows; i++) {
      const cy = 218 + i * 26;
      poly(ctx, [[x + 23, cy - 9], [x + 33, cy], [x + 23, cy + 9], [x + 13, cy]], '#f0dfba');
      circle(ctx, x + 23, cy, 2.4, base);
    }
    for (let f = 0; f < 5; f++) line(ctx, x + 5 + f * 9, 292, x + 5 + f * 9, 300, base, 2);
  };
  rug(54, has('rug-pattern') ? 2 : 3, '#7a2f4a', '#93395f');
  rug(112, 3, '#2f5a7a', '#3a6d93');
  rect(ctx, 62, 158, 108, 17, '#33200f'); // sign
  text(ctx, 'FINE RUGS', 116, 167, '10px Georgia', '#f3c877');
  // A lantern hanging from the first stall's awning corner — sometimes gone.
  if (!has('lantern-removed')) {
    line(ctx, 66, 182, 66, 192, '#0e0b20', 1.6);
    const glow = ctx.createRadialGradient(66, 200, 2, 66, 200, 20);
    glow.addColorStop(0, 'rgba(255,205,100,0.65)');
    glow.addColorStop(1, 'rgba(255,205,100,0)');
    rect(ctx, 46, 180, 40, 40, glow);
    rect(ctx, 60, 192, 12, 16, '#2c2118');
    rect(ctx, 63, 195, 6, 10, '#ffd66e');
  }

  // Stall 2 — spice. Its awning changes colour; so do its sign and vendor.
  stall(216, 160, pick('awning-colour', '#b3392f', '#2f7f7a'), '#f0dfba');
  rect(ctx, 242, 158, 108, 17, '#33200f');
  text(ctx, pick('sign-letter', 'SPICE', 'SPIGE'), 296, 167, '11px Georgia', '#f3c877');
  // The vendor behind the counter, in a hat that changes colour.
  circle(ctx, 250, 246, 11, '#c98d5f'); // head
  ellipse(ctx, 250, 232, 13, 5, pick('hat-colour', '#c0392b', '#2e8b57'));
  rect(ctx, 244, 219, 12, 6, pick('hat-colour', '#c0392b', '#2e8b57'));
  poly(ctx, [[232, 300], [268, 300], [262, 262], [238, 262]], '#5a4632'); // apron body
  // Mounds of spice in open sacks along the counter.
  for (const [x, colour] of [[292, '#e2703a'], [318, '#c93a2e'], [344, '#e8a33d']]) {
    poly(ctx, [[x - 13, 302], [x + 13, 302], [x + 9, 282], [x - 9, 282]], '#8a6a42');
    ellipse(ctx, x, 283, 10, 4.5, colour);
  }
  // Clay pots at the stall's feet: three, or two.
  const pot = (x, y, s) => {
    poly(ctx, [[x - 9 * s, y], [x + 9 * s, y], [x + 6 * s, y - 14 * s], [x - 6 * s, y - 14 * s]], '#a85f38');
    rect(ctx, x - 7 * s, y - 17 * s, 14 * s, 4 * s, '#8a4a2a');
  };
  pot(322, 348, 1);
  pot(350, 354, 0.85);
  if (!has('pot-count')) pot(296, 356, 0.8);

  // Stall 3 — lanterns and cloth. A cat may be asleep on its roof.
  stall(396, 148, '#5a3a7a', '#f0dfba');
  rect(ctx, 416, 158, 108, 17, '#33200f');
  text(ctx, 'LAMPS & SILK', 470, 167, '10px Georgia', '#f3c877');
  for (const [x, colour] of [[420, '#ffb054'], [452, '#ff7d6b'], [484, '#ffd66e'], [516, '#8ad0ff']]) {
    line(ctx, x, 182, x, 192, '#0e0b20', 1.4);
    rect(ctx, x - 6, 192, 12, 16, colour);
    rect(ctx, x - 6, 192, 12, 16, 'rgba(255,255,255,0.18)');
  }
  for (const [x, colour] of [[412, '#2f7f7a'], [436, '#b3392f'], [460, '#e8a33d'], [484, '#5a3a7a'], [508, '#2f5a7a']]) {
    rect(ctx, x, 268, 17, 34, colour); // bolts of cloth on the counter
    rect(ctx, x, 268, 17, 6, 'rgba(255,255,255,0.22)');
  }
  if (has('cat-added')) {
    const cat = '#14101f';
    ellipse(ctx, 452, 140, 13, 6.5, cat);
    circle(ctx, 441, 135, 5.5, cat);
    poly(ctx, [[437, 131], [436, 125], [441, 129]], cat);
    poly(ctx, [[445, 130], [445, 124], [449, 129]], cat);
    ctx.beginPath();
    ctx.arc(463, 137, 6, Math.PI * 0.5, Math.PI * 1.6);
    ctx.strokeStyle = cat;
    ctx.lineWidth = 3;
    ctx.stroke();
  }
  // A pennant on the middle stall's front pole, changing colour.
  line(ctx, 280, 148, 280, 108, '#0e0b20', 3.4);
  poly(ctx, [[280, 110], [280, 124], [303, 117]], pick('flag-colour', '#e8a33d', '#8a5fc0'));

  // Shoppers as soft silhouettes, backs to us, studying the stalls.
  const shopper = (x, y, s, colour) => {
    circle(ctx, x, y - 34 * s, 9 * s, colour);
    poly(ctx, [[x - 12 * s, y], [x + 12 * s, y], [x + 8 * s, y - 26 * s], [x - 8 * s, y - 26 * s]], colour);
  };
  shopper(150, 372, 1.05, '#0f0c22');
  shopper(262, 384, 1.2, '#120e26');
  shopper(478, 376, 1.1, '#0f0c22');

  // Fireflies drifting over the ground; one of them is missing in a picture.
  circle(ctx, 96, 330, 2.2, 'rgba(190,255,150,0.9)');
  circle(ctx, 520, 322, 2, 'rgba(190,255,150,0.8)');
  if (!has('firefly-removed')) {
    circle(ctx, 196, 344, 2.4, 'rgba(190,255,150,0.95)');
    circle(ctx, 196, 344, 6, 'rgba(190,255,150,0.25)');
  }
  circle(ctx, 372, 366, 2, 'rgba(190,255,150,0.8)');
}

// ------------------------------------------------------------------ entry

const PAINTERS = [paintHarbour, paintWorkshop, paintMarket];

// Draw scene `sceneIndex` into ctx. `appliedDiffs` is the set of difference
// ids the variant applies: empty for the left panel, all of them for the
// right — the two panels of the game.
export function drawScene(ctx, sceneIndex, appliedDiffs) {
  const pick = (id, base, changed) => (appliedDiffs.has(id) ? changed : base);
  const has = (id) => appliedDiffs.has(id);
  ctx.clearRect(0, 0, PANEL_WIDTH, PANEL_HEIGHT);
  PAINTERS[sceneIndex](ctx, pick, has);
}
