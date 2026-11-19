(function (root) {
  'use strict';
  function nightPhases(settings) {
    const phases = [{ kind: 'prepare', hour: 0, seconds: settings.prepareSeconds }];
    for (let hour = 1; hour <= 6; hour++) {
      phases.push({ kind: 'awake', hour, seconds: settings.wakeSeconds });
      phases.push({ kind: 'close', hour, seconds: settings.gapSeconds });
    }
    phases.push({ kind: 'morning', hour: 6, seconds: 0 });
    return phases;
  }
  class GameEngine {
    constructor({ now = () => performance.now(), frame = cb => requestAnimationFrame(cb), cancelFrame = id => cancelAnimationFrame(id), cue = async () => {}, interrupt = () => {}, onChange = () => {} } = {}) {
      Object.assign(this, { now, frame, cancelFrame, cue, interrupt, onChange });
      this.status = 'idle'; this.mode = 'night'; this.phases = []; this.index = -1;
      this.remaining = 0; this.generation = 0; this.frameID = null; this.waitingCue = false;
    }
    snapshot() {
      const phase = this.phases[this.index] || null;
      return { status: this.status, mode: this.mode, phase, index: this.index, remaining: this.remaining, waitingCue: this.waitingCue, progress: phase?.seconds ? Math.max(0, Math.min(1, 1 - this.remaining / (phase.seconds * 1000))) : 0 };
    }
    emit() { this.onChange(this.snapshot()); }
    start(settings) {
      this.stop(false); this.mode = 'night'; this.phases = nightPhases(settings); this.status = 'running';
      return this.enter(0);
    }
    discuss(seconds) {
      this.stop(false); this.mode = 'discussion';
      this.phases = [{ kind: 'discussion', hour: 0, seconds }, { kind: 'vote', hour: 0, seconds: 0 }];
      this.status = 'running'; return this.enter(0);
    }
    async enter(index, remaining) {
      const token = ++this.generation;
      this.index = index; const phase = this.phases[index];
      this.remaining = remaining === undefined ? phase.seconds * 1000 : remaining;
      this.waitingCue = true; this.emit();
      try { await this.cue(phase); } catch (_) { /* Text + timer remain usable if a device API fails. */ }
      if (token !== this.generation || this.status !== 'running') return;
      this.waitingCue = false;
      if (!phase.seconds) { this.status = 'completed'; this.remaining = 0; this.emit(); return; }
      this.deadline = this.now() + this.remaining;
      this.emit(); this.schedule();
    }
    schedule() {
      this.frameID = this.frame(() => {
        this.frameID = null;
        if (this.status !== 'running' || this.waitingCue) return;
        this.remaining = Math.max(0, this.deadline - this.now()); this.emit();
        if (this.remaining <= 0) void this.enter(this.index + 1);
        else this.schedule();
      });
    }
    pause() {
      if (this.status !== 'running') return;
      if (!this.waitingCue) this.remaining = Math.max(0, this.deadline - this.now());
      this.status = 'paused'; ++this.generation;
      if (this.frameID !== null) this.cancelFrame(this.frameID);
      this.frameID = null; this.waitingCue = false; this.interrupt(); this.emit();
    }
    resume() {
      if (this.status !== 'paused') return Promise.resolve();
      this.status = 'running';
      return this.enter(this.index, this.remaining);
    }
    stop(notify = true) {
      ++this.generation;
      if (this.frameID !== null) this.cancelFrame(this.frameID);
      this.frameID = null; this.interrupt(); this.status = 'idle'; this.index = -1;
      this.remaining = 0; this.waitingCue = false; this.phases = [];
      if (notify) this.emit();
    }
  }
  const api = { GameEngine, nightPhases };
  root.NightNarrator = Object.assign(root.NightNarrator || {}, api);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
