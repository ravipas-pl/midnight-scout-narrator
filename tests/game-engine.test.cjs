const test = require('node:test');
const assert = require('node:assert/strict');
const { GameEngine, nightPhases } = require('../js/game-engine.js');
const { normalize, defaults, SettingsStore, STORAGE_KEY } = require('../js/settings.js');
const settle = async () => { for (let i=0;i<6;i++) await Promise.resolve(); };
function harness(cue = async () => {}) {
  let clock=0, nextID=0;const frames=new Map();const cues=[];let interruptions=0;
  const engine=new GameEngine({ now:()=>clock,frame:cb=>{const id=++nextID;frames.set(id,cb);return id;},cancelFrame:id=>frames.delete(id),cue:phase=>{cues.push({...phase});return cue(phase);},interrupt:()=>{interruptions++;} });
  return {engine,cues,frames,get interruptions(){return interruptions;},async advance(ms){clock+=ms;const callbacks=[...frames.values()];frames.clear();callbacks.forEach(cb=>cb());await settle();},async start(settings=defaults){await engine.start(settings);await settle();}};
}
test('night has exactly six public wake windows and a closed gap after every one',()=>{
  const phases=nightPhases(defaults);
  assert.equal(phases.length,14);
  assert.deepEqual(phases.filter(p=>p.kind==='awake').map(p=>p.hour),[1,2,3,4,5,6]);
  assert.equal(phases[12].kind,'close');assert.equal(phases[13].kind,'morning');
  assert.ok(phases.every(p=>!('player' in p)&&!('roll' in p)));
});
test('wake countdown begins after asynchronous narration finishes, not when it starts',async()=>{
  let finish;const h=harness(()=>new Promise(resolve=>{finish=resolve;}));
  void h.engine.start(defaults);assert.equal(h.engine.waitingCue,true);
  await h.advance(20000);assert.equal(h.engine.remaining,5000);assert.equal(h.frames.size,0);
  finish();await settle();await h.advance(1000);assert.equal(h.engine.remaining,4000);
});
test('timestamp deadlines stay accurate after delayed animation frames',async()=>{
  const h=harness();await h.start();await h.advance(4200);assert.equal(h.engine.remaining,800);
  await h.advance(5000);assert.equal(h.engine.snapshot().phase.kind,'awake');assert.equal(h.engine.snapshot().phase.hour,1);
  assert.equal(h.engine.remaining,12000,'late frame must not shorten the next wake window');
});
test('pause preserves remaining time and resume repeats the current public instruction',async()=>{
  const h=harness();await h.start();await h.advance(2000);h.engine.pause();
  assert.equal(h.engine.status,'paused');assert.equal(h.engine.remaining,3000);assert.equal(h.frames.size,0);
  await h.advance(30000);await h.engine.resume();await h.advance(1000);
  assert.equal(h.engine.remaining,2000);assert.equal(h.cues.length,2);assert.equal(h.cues[1].kind,'prepare');
});
test('a cancelled narration cannot restart the timer after stop',async()=>{
  let finish;const h=harness(()=>new Promise(resolve=>{finish=resolve;}));
  void h.engine.start(defaults);h.engine.stop();finish();await settle();
  assert.equal(h.engine.status,'idle');assert.equal(h.frames.size,0);assert.equal(h.engine.index,-1);
});
test('pause during a cue invalidates its old completion',async()=>{
  const finishes=[];const h=harness(()=>new Promise(resolve=>finishes.push(resolve)));
  void h.engine.start(defaults);h.engine.pause();void h.engine.resume();
  finishes[0]();await settle();assert.equal(h.engine.waitingCue,true);assert.equal(h.frames.size,0);
  finishes[1]();await settle();assert.equal(h.engine.waitingCue,false);assert.equal(h.frames.size,1);
});
test('complete round reaches morning once and starts discussion only on request',async()=>{
  const h=harness();await h.start();
  for(let i=0;i<13;i++)await h.advance(h.engine.remaining);
  assert.equal(h.engine.status,'completed');assert.equal(h.engine.snapshot().phase.kind,'morning');assert.equal(h.frames.size,0);
  assert.equal(h.cues.filter(p=>p.kind==='awake').length,6);
  await h.engine.discuss(180);await h.advance(179000);assert.equal(h.engine.remaining,1000);
  await h.advance(1000);assert.equal(h.engine.status,'completed');assert.equal(h.engine.snapshot().phase.kind,'vote');
});
test('cue failures retain a usable timer',async()=>{
  const h=harness(async()=>{throw new Error('device API unavailable');});await h.start();
  assert.equal(h.engine.waitingCue,false);await h.advance(5000);assert.equal(h.engine.snapshot().phase.kind,'awake');
});
test('settings sanitize corrupt values and reject unsupported options',()=>{
  const s=normalize({wakeSeconds:999,gapSeconds:-7,volume:'loud',language:'xx',theme:'other',rate:Infinity,speech:'yes',voiceURI:{bad:true}});
  assert.equal(s.wakeSeconds,30);assert.equal(s.gapSeconds,2);assert.equal(s.volume,65);assert.equal(s.language,'th');assert.equal(s.theme,'camp');assert.equal(s.rate,1);assert.equal(s.speech,false);assert.equal(s.voiceURI,'');
  assert.deepEqual(normalize(null),defaults);
});
test('blocked or malformed storage never prevents using the narrator',()=>{
  const corrupt=new SettingsStore({getItem(){return '{broken';},setItem(){throw new Error('denied');}});
  assert.equal(corrupt.value.wakeSeconds,12);assert.equal(corrupt.available,false);
  const settings=corrupt.save({wakeSeconds:15,language:'en'});assert.equal(settings.wakeSeconds,15);assert.equal(corrupt.available,false);
  const absent=new SettingsStore();assert.equal(absent.save({volume:20}).volume,20);assert.equal(absent.available,false);
});
test('new and legacy installations default to chimes without voice',()=>{
  const values=new Map([['midnight-scout.narrator.v1',JSON.stringify({speech:true,sounds:false,language:'en',wakeSeconds:15,volume:42})]]);
  const storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};
  const store=new SettingsStore(storage);
  assert.equal(store.value.speech,false);assert.equal(store.value.sounds,true);
  assert.equal(store.value.wakeSeconds,15);assert.equal(store.value.language,'en');assert.equal(store.value.volume,42);
  assert.equal(JSON.parse(values.get(STORAGE_KEY)).speech,false);
  assert.equal(defaults.speech,false);assert.equal(defaults.sounds,true);
});
test('an explicit voice opt-in persists after the one-time non-verbal migration',()=>{
  const values=new Map();const storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};
  const first=new SettingsStore(storage);first.save({...first.value,speech:true});
  assert.equal(new SettingsStore(storage).value.speech,true);
});
