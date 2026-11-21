// main.js — Twin Vista's conductor. It owns the state of the run (which
// scene, playing or paused, between scenes or done), wires the HUD and the
// two panels to the hunt, the timer and the hints, and runs the draw loop:
// every frame it paints both panels from the same scene — the left with no
// differences applied, the right with all of them — then the found markers,
// the hint pulse and any fading miss marks on top.

import { SCENES, HINTS_PER_SCENE } from './scene-data.js';
import { drawScene } from './render-scene.js';
import { DifferenceHunt } from './differences.js';
import { CountdownTimer, formatClock } from './timer.js';
import { HintSupply, HINT_SCORE_COST } from './hints.js';
import {
  playFindChime,
  playWrongThud,
  playSceneComplete,
  playTimeUp,
} from './sound.js';

const FIND_SCORE = 100;
const WRONG_CLICK_SCORE_COST = 15;
const WRONG_CLICK_TIME_COST = 5;
const SECOND_LEFT_BONUS = 2;

const $ = (id) => document.getElementById(id);
const leftCanvas = $('panel-left');
const rightCanvas = $('panel-right');
const leftCtx = leftCanvas.getContext('2d');
const rightCtx = rightCanvas.getContext('2d');

const ALL_DIFFS = SCENES.map((s) => new Set(s.differences.map((d) => d.id)));
const NO_DIFFS = new Set();

let sceneIndex = 0;
let hunt = null;
let hints = new HintSupply(HINTS_PER_SCENE);
let timer = null;
let score = 0;
let scoreAtSceneStart = 0;
let mode = 'start'; // start | playing | paused | sceneComplete | timeUp | gameComplete
let misses = []; // { x, y, side, at } — fading marks for wrong clicks
let animationFrame = 0;

// ------------------------------------------------------------------- HUD

function refreshHud() {
  const scene = SCENES[sceneIndex];
  $('scene-name').textContent =
    `Scene ${sceneIndex + 1} of ${SCENES.length} · ${scene.name}`;
  $('remaining-count').textContent = hunt ? hunt.remaining : scene.differences.length;
  $('found-count').textContent = hunt ? hunt.found.size : 0;
  $('score').textContent = score;
  $('hints-left').textContent = hints.left;
  $('hint-btn').disabled = mode !== 'playing' || hints.left <= 0;
}

function refreshTimerFace() {
  if (!timer) return;
  $('clock').textContent = formatClock(timer.remaining);
  const fill = $('timer-fill');
  fill.style.width = `${timer.fractionLeft() * 100}%`;
  fill.classList.toggle('low', timer.fractionLeft() < 0.25);
}

// ---------------------------------------------------------------- overlay

function showOverlay(title, text, buttonLabel, onButton) {
  $('overlay-title').textContent = title;
  $('overlay-text').textContent = text;
  const btn = $('overlay-btn');
  btn.textContent = buttonLabel;
  btn.onclick = onButton;
  $('overlay').classList.add('shown');
}

function hideOverlay() {
  $('overlay').classList.remove('shown');
}

// ---------------------------------------------------------------- scenes

function beginScene(index) {
  sceneIndex = index;
  const scene = SCENES[index];
  hunt = new DifferenceHunt(scene);
  hints = new HintSupply(HINTS_PER_SCENE);
  misses = [];
  scoreAtSceneStart = score;
  timer = new CountdownTimer(scene.timeSeconds, {
    onTick: refreshTimerFace,
    onExpire: handleTimeUp,
  });
  mode = 'playing';
  refreshHud();
  refreshTimerFace();
  timer.start();
  runLoop();
}

function handleTimeUp() {
  if (mode !== 'playing') return;
  mode = 'timeUp';
  playTimeUp();
  score = scoreAtSceneStart; // a failed scene earns nothing
  refreshHud();
  showOverlay(
    'Out of time',
    `The light faded on ${SCENES[sceneIndex].name} with ${hunt.remaining} ` +
      `difference${hunt.remaining === 1 ? '' : 's'} still hiding.\n` +
      'The scene resets — the differences stay where they were.',
    'Try this scene again',
    () => {
      hideOverlay();
      beginScene(sceneIndex);
    },
  );
}

function handleSceneComplete() {
  mode = 'sceneComplete';
  timer.pause();
  drawStill(); // the final find's ring must land before the loop stops
  const timeLeft = Math.ceil(timer.remaining);
  const bonus = timeLeft * SECOND_LEFT_BONUS;
  score += bonus;
  playSceneComplete();
  refreshHud();
  const hintsUsed = HINTS_PER_SCENE - hints.left;
  const isLast = sceneIndex === SCENES.length - 1;
  showOverlay(
    isLast ? 'The whole hunt is yours' : `${SCENES[sceneIndex].name} — complete`,
    `Every difference found with ${formatClock(timeLeft)} to spare ` +
      `(+${bonus} for the time left).\n` +
      `Hints used: ${hintsUsed}. Score so far: ${score}.` +
      (isLast
        ? '\nThree scenes, thirty differences, one pair of eyes. Well hunted.'
        : `\nNext: ${SCENES[sceneIndex + 1].name} — ${SCENES[sceneIndex + 1].differences.length} differences, and they hide better.`),
    isLast ? 'Play again from the start' : 'On to the next scene',
    () => {
      hideOverlay();
      if (isLast) {
        score = 0;
        beginScene(0);
      } else {
        beginScene(sceneIndex + 1);
      }
    },
  );
  if (isLast) mode = 'gameComplete';
}

// ---------------------------------------------------------------- drawing

function drawPanel(ctx, appliedDiffs, side, now) {
  drawScene(ctx, sceneIndex, appliedDiffs);
  hunt.drawMarkers(ctx, now);
  hints.drawPulse(ctx, now);
  // Fading crosses where wrong clicks landed on this panel.
  for (const miss of misses) {
    if (miss.side !== side) continue;
    const age = (now - miss.at) / 420;
    if (age >= 1) continue;
    ctx.save();
    ctx.globalAlpha = 1 - age;
    ctx.strokeStyle = '#ff8a75';
    ctx.lineWidth = 3;
    const r = 7;
    ctx.beginPath();
    ctx.moveTo(miss.x - r, miss.y - r);
    ctx.lineTo(miss.x + r, miss.y + r);
    ctx.moveTo(miss.x + r, miss.y - r);
    ctx.lineTo(miss.x - r, miss.y + r);
    ctx.stroke();
    ctx.restore();
  }
}

function runLoop() {
  cancelAnimationFrame(animationFrame);
  const frame = (now) => {
    if (mode !== 'playing') return;
    drawPanel(leftCtx, NO_DIFFS, 'left', now);
    drawPanel(rightCtx, ALL_DIFFS[sceneIndex], 'right', now);
    hints.update(now);
    misses = misses.filter((m) => now - m.at < 450);
    animationFrame = requestAnimationFrame(frame);
  };
  animationFrame = requestAnimationFrame(frame);
}

// One still frame, for the moments when the loop is stopped (pause, start).
function drawStill() {
  const now = performance.now();
  drawPanel(leftCtx, NO_DIFFS, 'left', now);
  drawPanel(rightCtx, ALL_DIFFS[sceneIndex], 'right', now);
}

// ------------------------------------------------------------------ input

function panelPoint(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (canvas.width / rect.width),
    y: (event.clientY - rect.top) * (canvas.height / rect.height),
  };
}

function handlePanelClick(event, side) {
  if (mode !== 'playing') return;
  const canvas = side === 'left' ? leftCanvas : rightCanvas;
  const { x, y } = panelPoint(event, canvas);
  const found = hunt.hitTest(x, y);
  if (found) {
    hunt.markFound(found, performance.now());
    score += FIND_SCORE;
    playFindChime();
    refreshHud();
    if (hunt.isComplete) handleSceneComplete();
  } else {
    score = Math.max(0, score - WRONG_CLICK_SCORE_COST);
    misses.push({ x, y, side, at: performance.now() });
    playWrongThud();
    const stage = $('stage');
    stage.classList.remove('shaking');
    void stage.offsetWidth; // restart the shake animation
    stage.classList.add('shaking');
    timer.penalise(WRONG_CLICK_TIME_COST);
    refreshHud();
    refreshTimerFace();
  }
}

function spendHint() {
  if (mode !== 'playing' || hints.left <= 0) return;
  const unfound = hunt.unfound();
  if (unfound.length === 0) return;
  const choice = unfound[Math.floor(Math.random() * unfound.length)];
  if (hints.spend(choice, performance.now())) {
    score = Math.max(0, score - HINT_SCORE_COST);
    refreshHud();
  }
}

function togglePause() {
  if (mode === 'playing') {
    mode = 'paused';
    timer.pause();
    cancelAnimationFrame(animationFrame);
    drawStill();
    showOverlay('Paused', 'The hunt waits. The clock is stopped.', 'Keep hunting', togglePause);
  } else if (mode === 'paused') {
    mode = 'playing';
    hideOverlay();
    timer.start();
    runLoop();
    refreshHud();
  }
}

leftCanvas.addEventListener('click', (e) => handlePanelClick(e, 'left'));
rightCanvas.addEventListener('click', (e) => handlePanelClick(e, 'right'));
$('hint-btn').addEventListener('click', spendHint);
$('pause-btn').addEventListener('click', togglePause);
document.addEventListener('keydown', (event) => {
  if (event.key === 'h' || event.key === 'H') spendHint();
  if (event.key === 'p' || event.key === 'P' || event.key === 'Escape') {
    if (mode === 'playing' || mode === 'paused') togglePause();
  }
});

// ------------------------------------------------------------------- boot

hunt = new DifferenceHunt(SCENES[0]);
refreshHud();
drawStill();
showOverlay(
  'Twin Vista',
  'Three pictures, each drawn twice — and each pair hides differences.\n' +
    'Click a difference in either picture to mark it in both. ' +
    'A wrong click costs 5 seconds; a hint costs 40 points.\n' +
    'Harbour at Dusk hides 7. The Night Market hides 13.',
  'Start the hunt',
  () => {
    hideOverlay();
    score = 0;
    beginScene(0);
  },
);
