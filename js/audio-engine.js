(function (root) {
  'use strict';
  const HOURLY_EFFECTS=Object.freeze(['flush','fart','plop']);
  function randomHourEffects(random=Math.random){
    return Array.from({length:6},()=>{
      const value=random();
      return HOURLY_EFFECTS[Math.max(0,Math.min(2,Math.floor((Number.isFinite(value)?value:0)*3)))];
    });
  }
  function hourEffectFor(phase,effects){
    if(phase.kind!=='close'||!Number.isInteger(phase.hour)||phase.hour<1||phase.hour>6)return null;
    const effect=effects[phase.hour-1];return HOURLY_EFFECTS.includes(effect)?effect:null;
  }
  // Offsets are relative to the actual remaining phase time, including after resume.
  // Final bands: 2 ticks/sec, then 4/sec, then 6/sec. No tick crosses the deadline.
  function countdownPattern(durationMs, { urgentOnly = false } = {}) {
    if (!Number.isFinite(durationMs) || durationMs <= 0) return [];
    const duration = Math.min(600000, durationMs), beats = [];
    if (!urgentOnly) for (let at = 1000; at < duration - 3000; at += 1000) beats.push({ at, urgent:false });
    for (const [upper, lower, step] of [[3000,2000,500],[2000,1000,250],[1000,0,1000/6]]) {
      for (let remaining = upper; remaining > lower + .01; remaining -= step) {
        if (remaining <= duration + .01) beats.push({ at:Math.max(0,duration - remaining), urgent:true });
      }
    }
    return beats.sort((a,b) => a.at - b.at);
  }
  function cuePattern(kind, settings, { hour = 1 } = {}) {
    if (kind === 'awake' && !settings.speech) {
      return Array.from({length:Math.max(1,Math.min(6,Math.round(hour)))},(_,i)=>[659.25,i*.32,.18]);
    }
    return ({
      prepare: [[261.63, 0, .16], [329.63, .18, .16], [392, .36, .25], [523.25, .63, .35]],
      awake: [[523.25, 0, .17], [659.25, .2, .24]],
      close: [[196, 0, .12], [164.81, .15, .17]],
      pause: [[329.63,0,.17],[261.63,.22,.22]],
      morning: [[392, 0, .15], [523.25, .17, .15], [659.25, .34, .15], [783.99, .52, .36]],
      discussion: [[392, 0, .18], [523.25, .22, .22]],
      vote: [[523.25, 0, .16], [523.25, .22, .16], [783.99, .45, .32]]
    })[kind] || [[523.25,0,.17],[659.25,.2,.24]];
  }
  class AudioEngine {
    constructor() { this.context = null; this.master = null; this.nodes = new Set(); this.pending = new Set(); this.settings = {}; this.countdownNodes = new Set(); this.countdownWaiter = null; }
    configure(settings) {
      this.settings = settings;
      if (this.master && this.context) this.master.gain.setValueAtTime(settings.volume / 100 * 0.24, this.context.currentTime);
    }
    async unlock() {
      const Constructor = root.AudioContext || root.webkitAudioContext;
      if (!Constructor) return false;
      try {
        if (!this.context) {
          this.context = new Constructor(); this.master = this.context.createGain(); this.master.connect(this.context.destination); this.configure(this.settings);
        }
        if (this.context.state !== 'running') {
          let timer;
          try { await Promise.race([this.context.resume(), new Promise(resolve => { timer = setTimeout(resolve, 2500); })]); }
          finally { clearTimeout(timer); }
        }
        return this.context.state === 'running';
      } catch (_) { return false; }
    }
    play(kind, phase = {}) {
      if (!this.settings.sounds || !this.context || this.context.state !== 'running') return Promise.resolve();
      if(kind==='flush')return this.playFlush();
      if(kind==='fart')return this.playFart();
      if(kind==='plop')return this.playPlop();
      const notes = cuePattern(kind, this.settings, phase);
      const start = this.context.currentTime + .025;
      notes.forEach(([frequency, offset, duration]) => {
        const oscillator = this.context.createOscillator(); const envelope = this.context.createGain(); const filter = this.context.createBiquadFilter();
        oscillator.type = this.settings.theme === 'soft' ? 'sine' : 'triangle'; oscillator.frequency.value = frequency;
        filter.type = 'lowpass'; filter.frequency.value = this.settings.theme === 'soft' ? 1400 : 2400;
        oscillator.connect(filter); filter.connect(envelope); envelope.connect(this.master);
        const t = start + offset;
        envelope.gain.setValueAtTime(.0001, t); envelope.gain.exponentialRampToValueAtTime(.8, t + .012);
        envelope.gain.exponentialRampToValueAtTime(.0001, t + duration);
        oscillator.start(t); oscillator.stop(t + duration + .025); this.nodes.add(oscillator);
        oscillator.onended = () => { this.nodes.delete(oscillator); oscillator.disconnect(); filter.disconnect(); envelope.disconnect(); };
      });
      const length = Math.max(...notes.map(n => n[1] + n[2])) + .08;
      return new Promise(resolve => {
        const item = { resolve, timer: setTimeout(() => { this.pending.delete(item); resolve(); }, length * 1000) };
        this.pending.add(item);
      });
    }
    playFlush() {
      if(!this.settings.sounds||!this.context||this.context.state!=='running')return Promise.resolve();
      const context=this.context,start=context.currentTime+.025,duration=2.5;
      const buffer=context.createBuffer(1,Math.ceil(context.sampleRate*duration),context.sampleRate);
      const samples=buffer.getChannelData(0);let water=0;
      for(let i=0;i<samples.length;i++){
        water=.6*water+.4*(Math.random()*2-1);
        samples[i]=water;
      }
      const rush=context.createBufferSource(),filter=context.createBiquadFilter(),envelope=context.createGain();
      rush.buffer=buffer;filter.type='bandpass';filter.Q.value=.65;
      filter.frequency.setValueAtTime(1600,start);
      filter.frequency.exponentialRampToValueAtTime(750,start+.8);
      filter.frequency.exponentialRampToValueAtTime(210,start+duration);
      envelope.gain.setValueAtTime(.0001,start);
      envelope.gain.exponentialRampToValueAtTime(1.1,start+.18);
      envelope.gain.exponentialRampToValueAtTime(.75,start+.9);
      envelope.gain.exponentialRampToValueAtTime(.38,start+1.35);
      envelope.gain.exponentialRampToValueAtTime(.55,start+1.6);
      envelope.gain.exponentialRampToValueAtTime(.15,start+2.05);
      envelope.gain.exponentialRampToValueAtTime(.0001,start+duration);
      rush.connect(filter);filter.connect(envelope);envelope.connect(this.master);
      rush.start(start);rush.stop(start+duration);this.nodes.add(rush);
      rush.onended=()=>{this.nodes.delete(rush);rush.disconnect();filter.disconnect();envelope.disconnect();};
      // Low, rounded drain bubbles follow the water rush. All sources share stop().
      for(const [offset,frequency] of [[1.25,105],[1.62,85],[1.94,70],[2.18,58]]){
        const bubble=context.createOscillator(),gain=context.createGain(),t=start+offset;
        bubble.type='sine';bubble.frequency.setValueAtTime(frequency,t);
        bubble.frequency.exponentialRampToValueAtTime(38,t+.22);
        gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(.26,t+.025);
        gain.gain.exponentialRampToValueAtTime(.0001,t+.24);
        bubble.connect(gain);gain.connect(this.master);bubble.start(t);bubble.stop(t+.25);this.nodes.add(bubble);
        bubble.onended=()=>{this.nodes.delete(bubble);bubble.disconnect();gain.disconnect();};
      }
      return new Promise(resolve=>{
        const item={resolve,timer:setTimeout(()=>{this.pending.delete(item);resolve();},(duration+.08)*1000)};
        this.pending.add(item);
      });
    }
    waitForSound(milliseconds){
      return new Promise(resolve=>{
        const item={resolve,timer:setTimeout(()=>{this.pending.delete(item);resolve();},milliseconds)};
        this.pending.add(item);
      });
    }
    playFart(){
      if(!this.settings.sounds||!this.context||this.context.state!=='running')return Promise.resolve();
      const context=this.context,start=context.currentTime+.025;
      const buzz=context.createOscillator(),filter=context.createBiquadFilter(),gain=context.createGain();
      buzz.type='sawtooth';buzz.frequency.setValueAtTime(105,start);
      buzz.frequency.exponentialRampToValueAtTime(58,start+.48);
      buzz.frequency.exponentialRampToValueAtTime(42,start+.84);
      filter.type='lowpass';filter.frequency.setValueAtTime(720,start);
      filter.frequency.exponentialRampToValueAtTime(180,start+.85);
      gain.gain.setValueAtTime(.0001,start);
      for(let i=0;i<12;i++){
        const t=start+i*.06,level=.62*(1-i*.045);
        gain.gain.exponentialRampToValueAtTime(level,t+.008);
        gain.gain.exponentialRampToValueAtTime(.055,t+.05);
      }
      gain.gain.exponentialRampToValueAtTime(.0001,start+.86);
      buzz.connect(filter);filter.connect(gain);gain.connect(this.master);
      buzz.start(start);buzz.stop(start+.88);this.nodes.add(buzz);
      buzz.onended=()=>{this.nodes.delete(buzz);buzz.disconnect();filter.disconnect();gain.disconnect();};
      return this.waitForSound(960);
    }
    playPlop(){
      if(!this.settings.sounds||!this.context||this.context.state!=='running')return Promise.resolve();
      const context=this.context,start=context.currentTime+.025;
      for(const [offset,frequency,level] of [[0,740,.65],[.16,330,.32]]){
        const drop=context.createOscillator(),gain=context.createGain(),t=start+offset;
        drop.type='sine';drop.frequency.setValueAtTime(frequency,t);
        drop.frequency.exponentialRampToValueAtTime(85,t+.19);
        gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(level,t+.008);
        gain.gain.exponentialRampToValueAtTime(.0001,t+.23);
        drop.connect(gain);gain.connect(this.master);drop.start(t);drop.stop(t+.25);this.nodes.add(drop);
        drop.onended=()=>{this.nodes.delete(drop);drop.disconnect();gain.disconnect();};
      }
      const length=Math.ceil(context.sampleRate*.22),buffer=context.createBuffer(1,length,context.sampleRate);
      const samples=buffer.getChannelData(0);
      for(let i=0;i<length;i++)samples[i]=Math.random()*2-1;
      const splash=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();
      splash.buffer=buffer;filter.type='bandpass';filter.frequency.value=1900;filter.Q.value=.7;
      gain.gain.setValueAtTime(.0001,start+.025);gain.gain.exponentialRampToValueAtTime(.32,start+.038);
      gain.gain.exponentialRampToValueAtTime(.0001,start+.24);
      splash.connect(filter);filter.connect(gain);gain.connect(this.master);
      splash.start(start+.025);splash.stop(start+.25);this.nodes.add(splash);
      splash.onended=()=>{this.nodes.delete(splash);splash.disconnect();filter.disconnect();gain.disconnect();};
      return this.waitForSound(520);
    }
    startCountdown(durationMs, options = {}) {
      this.stopCountdown();
      if (!this.settings.sounds || !this.context || this.context.state !== 'running' || durationMs <= 0) return Promise.resolve();
      const origin = this.context.currentTime + .01;
      for (const beat of countdownPattern(durationMs,options)) {
        const oscillator = this.context.createOscillator(), envelope = this.context.createGain(), filter = this.context.createBiquadFilter();
        const t = origin + beat.at / 1000;
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(beat.urgent ? 1800 : 1400,t);
        oscillator.frequency.exponentialRampToValueAtTime(520,t+.025);
        filter.type='lowpass';filter.frequency.value=this.settings.theme==='soft'?1100:1700;
        oscillator.connect(filter);filter.connect(envelope);envelope.connect(this.master);
        envelope.gain.setValueAtTime(.0001,t);
        envelope.gain.exponentialRampToValueAtTime(beat.urgent ? .3 : .19,t+.002);
        envelope.gain.exponentialRampToValueAtTime(.0001,t+.033);
        oscillator.start(t);oscillator.stop(t+.038);this.countdownNodes.add(oscillator);
        oscillator.onended=()=>{this.countdownNodes.delete(oscillator);oscillator.disconnect();filter.disconnect();envelope.disconnect();};
      }
      return new Promise(resolve=>{
        const item={resolve,timer:setTimeout(()=>{if(this.countdownWaiter===item)this.countdownWaiter=null;resolve();},durationMs)};
        this.countdownWaiter=item;
      });
    }
    stopCountdown() {
      for(const node of this.countdownNodes){try{node.stop();}catch(_){}}
      this.countdownNodes.clear();
      if(this.countdownWaiter){clearTimeout(this.countdownWaiter.timer);this.countdownWaiter.resolve();this.countdownWaiter=null;}
    }
    stop() {
      this.stopCountdown();
      for (const node of this.nodes) { try { node.stop(); } catch (_) {} }
      this.nodes.clear();
      for (const item of this.pending) { clearTimeout(item.timer); item.resolve(); }
      this.pending.clear();
    }
  }
  const api={ AudioEngine, countdownPattern, cuePattern, randomHourEffects, hourEffectFor, HOURLY_EFFECTS };
  root.NightNarrator = Object.assign(root.NightNarrator || {}, api);
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
