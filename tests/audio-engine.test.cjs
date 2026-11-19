const test=require('node:test');
const assert=require('node:assert/strict');
const {AudioEngine,countdownPattern,cuePattern,randomHourEffects,hourEffectFor}=require('../js/audio-engine.js');
const {nightPhases}=require('../js/game-engine.js');
const {defaults}=require('../js/settings.js');
test('steady ticking accelerates at 3, 2 and 1 seconds remaining',()=>{
  const beats=countdownPattern(12000);
  assert.deepEqual(beats.filter(b=>!b.urgent).map(b=>b.at),[1000,2000,3000,4000,5000,6000,7000,8000]);
  assert.equal(beats.filter(b=>b.at>=9000&&b.at<10000).length,2);
  assert.equal(beats.filter(b=>b.at>=10000&&b.at<11000).length,4);
  assert.equal(beats.filter(b=>b.at>=11000&&b.at<12000).length,6);
  assert.ok(beats.every(b=>b.at>=0&&b.at+38<12000));
});
test('discussion stays quiet until the final three seconds',()=>{
  const beats=countdownPattern(180000,{urgentOnly:true});
  assert.equal(beats.length,12);assert.equal(beats[0].at,177000);
  assert.ok(beats.every(b=>b.urgent&&b.at>=177000&&b.at<180000));
});
test('resuming partway through the last seconds schedules only remaining ticks',()=>{
  const beats=countdownPattern(1250);assert.equal(beats[0].at,0);
  assert.equal(beats.length,7);assert.ok(beats.every(b=>b.urgent&&b.at>=0&&b.at<1250));
  assert.deepEqual(countdownPattern(0),[]);assert.deepEqual(countdownPattern(NaN),[]);
});
test('non-verbal hour chimes encode all six public windows distinctly',()=>{
  for(let hour=1;hour<=6;hour++){
    const notes=cuePattern('awake',{speech:false},{hour});assert.equal(notes.length,hour);
    assert.ok(notes.every(n=>n[0]===659.25));
  }
  const close=cuePattern('close',{speech:false});assert.equal(close.length,2);assert.ok(close.every(n=>n[0]<250));
  assert.equal(cuePattern('awake',{speech:true},{hour:6}).length,2);
});
function harness(){
  const nodes=[];const param=()=>({value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}});
  const make=()=>({connect(){},disconnect(){},frequency:param(),Q:param(),gain:param(),start(t){this.startAt=t;},stop(t){this.stopAt=t??0;this.stopped=true;}});
  const e=new AudioEngine();e.context={currentTime:10,state:'running',sampleRate:8000,createBuffer(channels,length){const samples=new Float32Array(length);return{length,getChannelData:()=>samples};},createBufferSource(){const n=make();nodes.push(n);return n;},createOscillator(){const n=make();nodes.push(n);return n;},createGain:make,createBiquadFilter:make};
  e.master=make();e.configure({sounds:true,speech:false,theme:'camp',volume:65});return {e,nodes};
}
test('ticks use the Web Audio clock and pause/stop cancels every future oscillator',async()=>{
  const {e,nodes}=harness();const done=e.startCountdown(12000);
  assert.equal(nodes.length,20);assert.equal(nodes[0].startAt,11.01);
  e.stop();await done;assert.ok(nodes.every(n=>n.stopped&&n.stopAt===0));assert.equal(e.countdownNodes.size,0);assert.equal(e.countdownWaiter,null);
});
test('a new countdown replaces the old schedule and sound-off creates no oscillators',async()=>{
  const {e,nodes}=harness();const first=e.startCountdown(12000),old=[...nodes];
  const next=e.startCountdown(3000);await first;assert.ok(old.every(n=>n.stopped));assert.equal(e.countdownNodes.size,12);
  e.stopCountdown();await next;e.configure({sounds:false,volume:65});
  const count=nodes.length;await e.startCountdown(12000);await e.play('awake',{hour:6});assert.equal(nodes.length,count);
});
test('flush synthesizes a water buffer and drain bubbles, all cancellable on stop',async()=>{
  const {e,nodes}=harness();const done=e.play('flush');
  assert.equal(nodes.length,5);assert.equal(nodes[0].buffer.length,20000);
  assert.ok(nodes[0].buffer.getChannelData(0).some(v=>v!==0));
  assert.equal(nodes[0].startAt,10.025);
  assert.ok(nodes.slice(1).every(n=>n.startAt>nodes[0].startAt));
  e.stop();await done;assert.ok(nodes.every(n=>n.stopped&&n.stopAt===0));assert.equal(e.pending.size,0);
});
test('flush respects the sound toggle and an unavailable audio context',async()=>{
  const {e,nodes}=harness();e.configure({sounds:false,volume:65});
  await e.play('flush');await e.playFlush();assert.equal(nodes.length,0);
  e.configure({sounds:true,volume:65});e.context.state='suspended';await e.play('flush');assert.equal(nodes.length,0);
});
test('hour effects sample all three choices independently and allow repeats',()=>{
  const values=[0,.34,.67,.1,.5,.9];let index=0;
  assert.deepEqual(randomHourEffects(()=>values[index++]),['flush','fart','plop','flush','fart','plop']);
  assert.deepEqual(randomHourEffects(()=>0),Array(6).fill('flush'));
});
test('exactly one comic effect follows each of the six hours, without an extra morning effect',()=>{
  const effects=['flush','fart','plop','flush','plop','fart'];
  assert.deepEqual(nightPhases(defaults).map(p=>hourEffectFor(p,effects)).filter(Boolean),effects);
  assert.equal(hourEffectFor({kind:'close',hour:2},effects),'fart');
  assert.equal(hourEffectFor({kind:'close',hour:2},effects),'fart','same hour keeps its choice on resume');
  assert.equal(hourEffectFor({kind:'discussion',hour:0},effects),null);
  assert.equal(hourEffectFor({kind:'close',hour:7},effects),null);
});
test('fart and water plop create distinct sources and fully cancel on stop',async()=>{
  for(const [effect,count] of [['fart',1],['plop',3]]){
    const {e,nodes}=harness();const done=e.play(effect);assert.equal(nodes.length,count);
    if(effect==='fart')assert.equal(nodes[0].type,'sawtooth');
    if(effect==='plop')assert.ok(nodes.some(n=>n.buffer));
    e.stop();await done;assert.ok(nodes.every(n=>n.stopped&&n.stopAt===0));assert.equal(e.pending.size,0);
  }
});
test('all random comic effects respect muted audio',async()=>{
  const {e,nodes}=harness();e.configure({sounds:false,volume:65});
  for(const effect of ['flush','fart','plop'])await e.play(effect);
  assert.equal(nodes.length,0);assert.equal(e.pending.size,0);
});
