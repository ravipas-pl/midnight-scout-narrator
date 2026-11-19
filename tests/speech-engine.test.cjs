const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
function harness(supported=true){
  const spoken=[];let cancellations=0;
  const voices=[{voiceURI:'en-online',name:'English network',lang:'en-US',localService:false},{voiceURI:'th-online',name:'Thai network',lang:'th-TH',localService:false},{voiceURI:'th-local',name:'Thai local',lang:'th-TH',localService:true}];
  const synth={getVoices:()=>voices,addEventListener(){},resume(){},cancel(){cancellations++;},speak:u=>spoken.push(u)};
  const context={setTimeout,clearTimeout,SpeechSynthesisUtterance:class{constructor(text){this.text=text;}},...(supported?{speechSynthesis:synth}:{})};
  vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/speech-engine.js'),'utf8'),context);
  return {engine:new context.NightNarrator.SpeechEngine(),spoken,voices,get cancellations(){return cancellations;}};
}
const settings={speech:true,language:'th',voiceURI:'',rate:1,volume:65};
test('speech chooses a local matching voice before an online one',()=>{
  const h=harness();assert.equal(h.engine.choose(settings).voiceURI,'th-local');
  assert.equal(h.engine.choose({...settings,voiceURI:'th-online'}).voiceURI,'th-online');
  assert.equal(h.engine.choose({...settings,voiceURI:'en-online'}).voiceURI,'th-local');
});
test('new narration cancels and settles the previous queue item',async()=>{
  const h=harness();const first=h.engine.speak('first',settings);const second=h.engine.speak('second',settings);
  assert.equal((await first).status,'cancelled');assert.equal(h.spoken.length,2);
  h.spoken[0].onend();assert.ok(h.engine.pending,'stale onend must not clear the next utterance');
  h.spoken[1].onend();assert.equal((await second).status,'spoken');assert.equal(h.engine.pending,null);
});
test('explicit cancellation resolves pending speech for safe timer interruption',async()=>{
  const h=harness();const result=h.engine.speak('pause me',settings);h.engine.cancel();
  assert.equal((await result).status,'cancelled');assert.equal(h.engine.pending,null);
});
test('API errors and missing speech support return fallback results',async()=>{
  const h=harness();const pending=h.engine.speak('error',settings);h.spoken[0].onerror();assert.equal((await pending).status,'error');
  assert.equal((await harness(false).engine.speak('no api',settings)).status,'unavailable');
  assert.equal((await h.engine.speak('muted',{...settings,speech:false})).status,'muted');
});
test('missing language voice falls back instead of using an unrelated language',async()=>{
  const h=harness();h.voices.splice(1);
  assert.equal((await h.engine.speak('ภาษาไทย',settings)).status,'unavailable');
  assert.equal(h.spoken.length,0);
});
