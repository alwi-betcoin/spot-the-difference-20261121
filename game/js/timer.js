// timer.js — the countdown. One CountdownTimer owns a scene's seconds: it
// ticks by animation frame against the wall clock (so a background tab or a
// slow frame cannot steal or grant time), reports every change, and can be
// paused, penalised and asked how much of the bar is left to draw.

export class CountdownTimer {
  constructor(totalSeconds, { onTick, onExpire }) {
    this.total = totalSeconds;
    this.remaining = totalSeconds;
    this.onTick = onTick;
    this.onExpire = onExpire;
    this.running = false;
    this.expired = false;
    this.lastStamp = 0;
    this.frame = 0;
  }

  start() {
    if (this.running || this.expired) return;
    this.running = true;
    this.lastStamp = performance.now();
    const step = (now) => {
      if (!this.running) return;
      const elapsed = (now - this.lastStamp) / 1000;
      this.lastStamp = now;
      this.remaining = Math.max(0, this.remaining - elapsed);
      this.onTick(this.remaining);
      if (this.remaining <= 0) {
        this.running = false;
        this.expired = true;
        this.onExpire();
        return;
      }
      this.frame = requestAnimationFrame(step);
    };
    this.frame = requestAnimationFrame(step);
  }

  pause() {
    this.running = false;
    cancelAnimationFrame(this.frame);
  }

  // A wrong click costs time: the bar visibly drops by the penalty at once.
  penalise(seconds) {
    if (this.expired) return;
    this.remaining = Math.max(0, this.remaining - seconds);
    this.onTick(this.remaining);
    if (this.remaining <= 0) {
      this.pause();
      this.expired = true;
      this.onExpire();
    }
  }

  // 1 when the bar is full, 0 when the scene's time is gone.
  fractionLeft() {
    return this.total === 0 ? 0 : this.remaining / this.total;
  }
}

export function formatClock(seconds) {
  const whole = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(whole / 60);
  const rest = String(whole % 60).padStart(2, '0');
  return `${minutes}:${rest}`;
}
