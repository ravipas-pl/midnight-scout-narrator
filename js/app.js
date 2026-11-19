(function () {
  'use strict';
  const N = globalThis.NightNarrator;
  const $ = id => document.getElementById(id);
  const messages = {
    th: {
      chapter:'คดีปริศนาส้วมกลางดึก',nightWatch:'NIGHT WATCH · CLASSIC',fieldNotes:'สมุดประจำค่าย',beforeStart:'ก่อนปิดไฟ',
      checkRoles:'แจกบทบาทลับแล้ว',checkRolesBody:'ผู้ก่อเหตุ 1 คน ที่เหลือผู้บริสุทธิ์',checkDice:'จำแต้ม แล้วครอบถ้วย',checkDiceBody:'แต้มของแต่ละคนคือเวลาที่ต้องตื่น',checkToilet:'หงายส้วมด้านสะอาด',checkToiletBody:'วางกลางวง ให้ทุกคนเอื้อมถึง',wakeWindow:'ช่วงตื่น',eyesClosed:'ช่วงหลับตา',testAudio:'ลองเสียงประจำค่ายทั้งหมด',privacy:'ไม่มีการกรอกหรือเก็บแต้มลับของผู้เล่น หน้าจอแสดงเฉพาะเวลาที่กำลังเรียก',lightsOut:'หลับตา',sunrise:'เช้าแล้ว',stop:'จบรอบ',foregroundHint:'วางโทรศัพท์ไว้กลางวง และเปิดหน้านี้ค้างไว้',footer:'ไม่ว่าใครก็เป็นผู้ต้องสงสัย…',settings:'ตั้งค่าคืนนี้',language:'ภาษา',voice:'เสียงบรรยาย',offlineVoice:'เลือกเสียงที่ติดตั้งบนเครื่องเพื่อใช้งานออฟไลน์ เสียงบางตัวอาจต้องต่ออินเทอร์เน็ต',volume:'ระดับเสียง',speed:'ความเร็วเสียงพูด',wakeSeconds:'ตื่น / วินาที',gapSeconds:'หลับตา / วินาที',prepareSeconds:'เตรียมตัว / วินาที',discussionSeconds:'สอบสวน / วินาที',theme:'เสียงประจำค่าย',campSound:'Camp bells · ระฆังค่าย',softSound:'Soft moon · เสียงนุ่ม',speechOn:'เสียงพูด',soundsOn:'ดนตรีและสัญญาณ',settingsNote:'ค่าเริ่มต้นเป็นโหมดไม่พูด ตื่น 12 / หลับตา 3 วินาที นับเวลาหลังสัญญาณจบ เสียงติ๊กจะเร่งใน 3 วินาทีสุดท้าย',save:'บันทึกการตั้งค่า',
      ready:'พร้อมเข้าค่าย',running:'กำลังดำเนินคดี',discussionRunning:'กำลังสอบสวน',pauseDiscussion:'พักการสอบสวน',discussionPausedDescription:'นาฬิกาหยุดแล้ว ดำเนินต่อเมื่อทุกคนพร้อม',discussionPausedToast:'พักเวลาสอบสวนแล้ว',discussionPauseSpoken:'พักการสอบสวนชั่วคราว',clockUnit:'นาที : วินาที',paused:'พักไว้ก่อน',completed:'จบช่วงนี้แล้ว',start:'เริ่มกลางคืน',pause:'พักชั่วคราว',resume:'ดำเนินต่อ',discuss:'เริ่มสอบสวน',newNight:'เริ่มคืนใหม่',seconds:'วินาที',windows:'ช่วงเวลาตื่น',narrating:'กำลังบรรยาย',readyEyebrow:'รอเริ่มคดี',readyTitle:'คืนนี้…ใครยังไม่นอน?',readyDescription:'เตรียมลูกเต๋า ครอบถ้วย แล้วให้เราพาทั้งค่ายผ่านค่ำคืนนี้',readyCaption:'6 ช่วงเวลา · ทุกคนเล่นได้ ไม่ต้องมีคนอ่านบท',activeCaption:'เวลาสาธารณะเท่านั้น · ไม่เก็บข้อมูลของผู้เล่น',pauseCaption:'เวลาหยุดแล้ว · สัญญาณจะเล่นซ้ำเมื่อดำเนินต่อ',pauseDescription:'ทุกคนหลับตาไว้ก่อน กดดำเนินต่อเมื่อทั้งวงพร้อม',prepareTitle:'ทุกคนหลับตา',prepareDescription:'จำแต้มของตัวเอง แล้วรอช่วงเวลาที่ตรงกัน',awakeTitle:'คนที่ได้แต้ม {hour} ลืมตา',awakeDescription:'สังเกตคนที่ตื่นพร้อมกัน ผู้ก่อเหตุทำภารกิจในช่วงของตนเอง',closeTitle:'ทุกคนหลับตา',closeDescription:'กลับไปพัก…ก่อนเรียกช่วงเวลาถัดไป',lastCloseDescription:'อีกนิดเดียว แสงเช้ากำลังมา',morningTitle:'เช้าแล้ว! ใครไม่กดน้ำ?',morningDescription:'ทุกคนลืมตา เตรียมคำให้การ เริ่มเวลาสอบสวนเมื่อทั้งวงพร้อม',discussionTitle:'ถึงเวลาสอบสวน',discussionDescription:'ใครตื่นตอนไหน? ใครเห็นอะไร? คุยกันได้ แต่ยังไม่เปิดไพ่หรือโชว์แต้ม',voteTitle:'3…2…1…ชี้!',voteDescription:'ลงคะแนนพร้อมกัน โหวตเสมอให้อภิปรายเพิ่ม 30 วินาทีแล้วโหวตรอบตัดสิน',hour:'เวลา {hour}',closed:'หลับตาไว้',morning:'รุ่งเช้า',discussion:'สอบสวน',vote:'ลงคะแนน',
      speechMuted:'โหมดสัญญาณเสียง · ไม่พูด',soundOnly:'นับระฆังสูงให้จบ = เวลาตื่น · 2 เสียงต่ำ = หลับตา · ติ๊กเร็วขึ้นใน 3 วินาทีสุดท้าย · เสียงขำขันสุ่มหลังแต่ละชั่วโมง ไม่ใช่เบาะแส',textOnly:'โหมดข้อความ',textOnlyDetail:'ปิดทั้งเสียงพูดและสัญญาณอยู่ ติดตามเวลาจากหน้าจอ',cueSound:'สัญญาณประจำค่าย',voiceReady:'พร้อมใช้เสียงบรรยาย',voiceLocal:'เสียงติดตั้งบนอุปกรณ์ · ใช้ออฟไลน์ได้',voiceRemote:'เสียงนี้อาจต้องต่ออินเทอร์เน็ต',voiceMissing:'ยังไม่พบเสียงสำหรับภาษานี้',voiceMissingDetail:'ลองทดสอบเสียง หรือเลือกเสียงอื่นในตั้งค่า',speechUnavailable:'อุปกรณ์นี้ไม่รองรับเสียงพูด',speechFallback:'ใช้ข้อความและสัญญาณเสียงแทนได้',systemVoice:'เลือกเสียงอัตโนมัติ',localVoice:'ในเครื่อง',onlineVoice:'อาจใช้อินเทอร์เน็ต',testText:'พร้อมเข้าค่ายแล้ว คืนนี้ทุกคนอาจเป็นผู้ต้องสงสัย',allMuted:'เปิดเสียงพูดหรือสัญญาณเสียงในตั้งค่าก่อนทดสอบ',testDone:'ทดสอบแล้ว พร้อมเริ่มคดี',speechError:'เสียงบรรยายไม่พร้อม ระบบใช้ข้อความและนาฬิกาต่อได้',audioError:'เปิดเสียงสังเคราะห์ไม่ได้ ใช้เสียงพูดหรือข้อความแทน',saved:'บันทึกการตั้งค่าแล้ว',notSaved:'ใช้การตั้งค่านี้ได้ แต่เบราว์เซอร์ไม่อนุญาตให้บันทึกไว้',hiddenPause:'พักรอบแล้ว เพราะออกจากหน้าเกม กลับมากดดำเนินต่อเมื่อพร้อม',pauseSpoken:'พักเกมชั่วคราว ทุกคนหลับตาไว้ก่อน',pausedToast:'พักเวลาแล้ว ทุกคนหลับตาไว้ก่อน',stopped:'จบรอบแล้ว อย่าลืมหงายส้วมด้านสะอาดก่อนรอบใหม่'
    },
    en: {
      chapter:'THE CASE OF THE MIDNIGHT TOILET',nightWatch:'NIGHT WATCH · CLASSIC',fieldNotes:'CAMP FIELD NOTES',beforeStart:'Before lights out',
      checkRoles:'Secret roles dealt',checkRolesBody:'One culprit. Everyone else is innocent.',checkDice:'Remember your roll. Cover it.',checkDiceBody:'Your die determines when you wake.',checkToilet:'Start with a clean toilet',checkToiletBody:'Place the flip token within everyone’s reach.',wakeWindow:'Wake window',eyesClosed:'Eyes-closed gap',testAudio:'Preview all camp sounds',privacy:'No secret dice numbers are entered or stored. Only the current public hour is displayed.',lightsOut:'LIGHTS OUT',sunrise:'SUNRISE',stop:'End round',foregroundHint:'Keep this page open and place the phone in the middle.',footer:'Everyone is a suspect after midnight.',settings:'Set up tonight',language:'Language',voice:'Narrator voice',offlineVoice:'Choose an on-device voice for offline speech. Some voices require an internet connection.',volume:'Volume',speed:'Speech speed',wakeSeconds:'Awake / seconds',gapSeconds:'Eyes closed / seconds',prepareSeconds:'Get ready / seconds',discussionSeconds:'Discussion / seconds',theme:'Camp sound',campSound:'Camp bells',softSound:'Soft moon',speechOn:'Voice narration',soundsOn:'Music & chimes',settingsNote:'Non-verbal by default: 12 seconds awake / 3 seconds eyes closed. Timers start after the cue; ticking accelerates in the last 3 seconds.',save:'Save settings',
      ready:'Camp is ready',running:'Night in progress',discussionRunning:'Discussion in progress',pauseDiscussion:'Pause discussion',discussionPausedDescription:'The timer is stopped. Continue when everyone is ready.',discussionPausedToast:'Discussion timer paused.',discussionPauseSpoken:'The discussion is paused.',clockUnit:'MIN : SEC',paused:'Round paused',completed:'Phase complete',start:'Start the night',pause:'Pause the night',resume:'Continue',discuss:'Start discussion',newNight:'Start a new night',seconds:'seconds',windows:'wake windows',narrating:'NARRATING',readyEyebrow:'WAITING FOR LIGHTS OUT',readyTitle:'Who’s still awake tonight?',readyDescription:'Remember your die, cover your cup, and let the camp settle into the night.',readyCaption:'6 wake windows · Everyone can play',activeCaption:'Public hours only · No player data',pauseCaption:'Timer paused · The cue repeats when you continue',pauseDescription:'Keep your eyes closed. Continue when the whole camp is ready.',prepareTitle:'Everyone, close your eyes',prepareDescription:'Remember your roll. Wait for the matching hour.',awakeTitle:'If you rolled {hour}, wake up',awakeDescription:'Notice who is awake. The culprit acts during their own wake window.',closeTitle:'Everyone, close your eyes',closeDescription:'Settle back down before the next hour.',lastCloseDescription:'Just a moment longer. Morning is on its way.',morningTitle:'Morning! Who forgot to flush?',morningDescription:'Everyone opens their eyes. Start the discussion when the camp is ready.',discussionTitle:'Time to investigate',discussionDescription:'Who woke when? What did they see? Talk, but keep roles and dice hidden.',voteTitle:'3…2…1…point!',voteDescription:'Vote simultaneously. A tie gets 30 seconds of discussion, then one runoff.',hour:'HOUR {hour}',closed:'EYES CLOSED',morning:'MORNING',discussion:'DISCUSSION',vote:'VOTE',
      speechMuted:'Non-verbal mode',soundOnly:'Count all high bells for the hour. Two low chimes mean eyes closed. Ticks speed up in the last 3 seconds. A random comic effect follows each hour; it is not a clue.',textOnly:'Text-only mode',textOnlyDetail:'Voice and chimes are both off. Follow the screen.',cueSound:'CAMP CHIME',voiceReady:'Narrator voice ready',voiceLocal:'On-device voice · Available offline',voiceRemote:'This voice may need an internet connection.',voiceMissing:'No matching voice found yet',voiceMissingDetail:'Test the audio or select a different voice in settings.',speechUnavailable:'Speech is unavailable here',speechFallback:'The screen and chimes still work.',systemVoice:'Choose voice automatically',localVoice:'on-device',onlineVoice:'may need internet',testText:'The camp is ready. Tonight, everyone is a suspect.',allMuted:'Turn on narration or chimes in settings before testing.',testDone:'Audio tested. Ready for the night.',speechError:'Voice unavailable. The text and timer will continue.',audioError:'Synthesized audio is unavailable. Voice or text can still be used.',saved:'Settings saved',notSaved:'Settings applied, but this browser cannot save them.',hiddenPause:'Paused because you left the game. Continue when everyone is ready.',pauseSpoken:'The game is paused. Everyone, close your eyes.',pausedToast:'Timer paused. Everyone should keep their eyes closed.',stopped:'Round ended. Reset the toilet to the clean side before the next night.'
    }
  };
  let storage;
  try { storage = localStorage; } catch (_) {}
  const store = new N.SettingsStore(storage);
  let settings = store.value;
  const audio = new N.AudioEngine(); audio.configure(settings);
  let speech;
  let cueGeneration = 0, toastTimer, wakeLock = null, testing = false, starting = false, lastRender = '', lastAnnouncement = '', countdownKey = null;
  let hourEffects=N.randomHourEffects();
  const form = $('settings-form');
  const t = (key, vars = {}) => Object.entries(vars).reduce((s, [k, v]) => s.replaceAll('{' + k + '}', v), (messages[settings.language] || messages.th)[key] || key);
  const say = (phase) => {
    const hour = phase.hour;
    if (settings.language === 'en') return ({ prepare:'Remember your die and cover it. Everyone, close your eyes.', awake:`Hour ${hour}. If you rolled ${hour}, open your eyes.`, close:'Time is up. Everyone, close your eyes.', morning:'Morning! Everyone, open your eyes. Someone forgot to flush last night. Start discussion when everyone is ready.', discussion:'Start your discussion now. Keep your roles and dice hidden.', vote:'Discussion is over. Get ready to vote. Three, two, one, point!' })[phase.kind];
    const words = ['','หนึ่ง','สอง','สาม','สี่','ห้า','หก'];
    return ({ prepare:'ทุกคนจำแต้มลูกเต๋าของตัวเอง แล้วครอบถ้วย ทุกคนหลับตา', awake:`เวลาที่${words[hour]} คนที่ได้แต้ม${words[hour]} ลืมตา`, close:'หมดเวลา ทุกคนหลับตา', morning:'เช้าแล้ว ทุกคนลืมตา เมื่อคืนมีคนใช้ห้องน้ำแล้วไม่กดน้ำ เริ่มสอบสวนเมื่อทุกคนพร้อม', discussion:'เริ่มสอบสวนได้แล้ว ยังไม่เปิดไพ่หรือแสดงแต้มลูกเต๋า', vote:'หมดเวลาสอบสวน เตรียมลงคะแนน สาม สอง หนึ่ง ชี้' })[phase.kind];
  };
  function toast(text) { clearTimeout(toastTimer); $('toast').textContent = text; $('toast').hidden = false; toastTimer = setTimeout(() => { $('toast').hidden = true; }, 5500); }
  function interrupt() { ++cueGeneration; audio.stop(); speech?.cancel(); }
  async function cue(phase) {
    const token = cueGeneration;
    await audio.play(phase.kind,phase);
    if (token !== cueGeneration) return;
    const result = await speech.speak(say(phase), settings);
    if (token === cueGeneration && ['unavailable','error','timeout'].includes(result.status)) toast(t('speechError'));
    // Close-eyes instruction always comes first. Comedy is never a player clue.
    const effect=N.hourEffectFor(phase,hourEffects);
    if(token===cueGeneration&&effect)await audio.play(effect);
  }
  async function releaseWakeLock() { const lock = wakeLock; wakeLock = null; try { await lock?.release(); } catch (_) {} }
  async function keepScreenOn() {
    try {
      if (navigator.wakeLock && document.visibilityState === 'visible') {
        const lock = await navigator.wakeLock.request('screen');
        if (engine.status === 'running') wakeLock = lock; else await lock.release();
      }
    } catch (_) {}
  }
  function populateVoices(language = settings.language, selected = settings.voiceURI) {
    const select = $('voice-select'); const voices = speech?.voices() || [];
    select.replaceChildren(new Option(messages[language].systemVoice, ''));
    voices.filter(v => v.lang.toLowerCase().startsWith(language)).sort((a,b) => Number(b.localService) - Number(a.localService)).forEach(v => {
      const option = new Option(`${v.name} · ${v.localService ? messages[language].localVoice : messages[language].onlineVoice}`, v.voiceURI); select.add(option);
    });
    select.value = selected;
    if (select.selectedIndex < 0) select.value = '';
  }
  function updateVoiceStatus() {
    if (!speech) return;
    let label, detail;
    if (!settings.speech) { label = settings.sounds ? 'speechMuted' : 'textOnly'; detail = settings.sounds ? 'soundOnly' : 'textOnlyDetail'; }
    else if (!speech.supported) { label = 'speechUnavailable'; detail = 'speechFallback'; }
    else {
      const voice = speech.choose(settings);
      label = voice ? 'voiceReady' : 'voiceMissing'; detail = voice ? (voice.localService ? 'voiceLocal' : 'voiceRemote') : 'voiceMissingDetail';
    }
    $('voice-label').textContent = t(label); $('voice-detail').textContent = t(detail);
  }
  speech = new N.SpeechEngine(() => { if (speech) { populateVoices(); updateVoiceStatus(); } });
  const engine = new N.GameEngine({ cue, interrupt, onChange: render });

  function phaseCopy(snapshot) {
    const p = snapshot.phase;
    if (snapshot.status === 'idle' || !p) return { title:t('readyTitle'), description:t('readyDescription'), eyebrow:t('readyEyebrow'), unit:t('windows'), clock:'06' };
    const titles = { prepare:'prepareTitle',awake:'awakeTitle',close:'closeTitle',morning:'morningTitle',discussion:'discussionTitle',vote:'voteTitle' };
    const descriptions = { prepare:'prepareDescription',awake:'awakeDescription',close:p.hour === 6 ? 'lastCloseDescription' : 'closeDescription',morning:'morningDescription',discussion:'discussionDescription',vote:'voteDescription' };
    const eyebrows = { prepare:t('closed'),awake:t('hour',{hour:p.hour}),close:t('closed'),morning:t('morning'),discussion:t('discussion'),vote:t('vote') };
    const seconds = Math.max(0,Math.ceil(snapshot.remaining / 1000));
    let clock = p.kind === 'discussion' ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2,'0')}` : String(seconds).padStart(2,'0');
    if (snapshot.waitingCue) clock = '…';
    else if (snapshot.status === 'completed') clock = p.kind === 'morning' ? '☀' : '✓';
    return { title:snapshot.status === 'paused' ? t('paused') : t(titles[p.kind],{hour:p.hour}), description:snapshot.status === 'paused' ? t(snapshot.mode === 'discussion' ? 'discussionPausedDescription' : 'pauseDescription') : t(descriptions[p.kind]), eyebrow:eyebrows[p.kind], unit:snapshot.waitingCue ? t(settings.speech?'narrating':'cueSound') : snapshot.status === 'completed' ? '' : p.kind === 'discussion' ? t('clockUnit') : t('seconds'), clock };
  }
  function render(snapshot = engine.snapshot()) {
    const clockRunning=snapshot.status==='running'&&!snapshot.waitingCue&&snapshot.phase?.seconds>0;
    if(!clockRunning){audio.stopCountdown();countdownKey=null;}
    else {
      const key=`${snapshot.mode}:${snapshot.index}`;
      if(key!==countdownKey){countdownKey=key;void audio.startCountdown(snapshot.remaining,{urgentOnly:snapshot.phase.kind==='discussion'});}
    }
    $('ring-progress').style.strokeDashoffset = String(1 - snapshot.progress);
    const key = [snapshot.status,snapshot.mode,snapshot.index,Math.ceil(snapshot.remaining/1000),snapshot.waitingCue,settings.language,testing,starting].join('|');
    if (key === lastRender) return; lastRender = key;
    const copy = phaseCopy(snapshot); const active = ['running','paused'].includes(snapshot.status);
    document.body.dataset.active = String(active); document.body.dataset.paused = String(snapshot.status === 'paused'); document.body.dataset.stage = snapshot.phase?.kind || 'idle';
    $('status-text').textContent = t(snapshot.status === 'idle' ? 'ready' : snapshot.status === 'running' ? (snapshot.mode === 'discussion' ? 'discussionRunning' : 'running') : snapshot.status);
    $('stage-title').textContent = copy.title; $('stage-description').textContent = copy.description;
    $('timer-eyebrow').textContent = copy.eyebrow; $('timer-unit').textContent = copy.unit; $('countdown').textContent = copy.clock;
    const announcementKey = [snapshot.status,snapshot.index,snapshot.waitingCue,settings.language].join('|');
    if (announcementKey !== lastAnnouncement) { $('announcement').textContent = `${t(snapshot.status === 'idle' ? 'ready' : snapshot.status === 'running' ? (snapshot.mode === 'discussion' ? 'discussionRunning' : 'running') : snapshot.status)}. ${copy.title}`; lastAnnouncement = announcementKey; }
    let main = 'start', icon = '▶';
    if (snapshot.status === 'running') { main = snapshot.mode === 'discussion' ? 'pauseDiscussion' : 'pause'; icon = 'Ⅱ'; }
    if (snapshot.status === 'paused') { main = 'resume'; icon = '▶'; }
    if (snapshot.status === 'completed') { main = snapshot.mode === 'night' ? 'discuss' : 'newNight'; icon = snapshot.mode === 'night' ? '◷' : '↻'; }
    $('main-label').textContent = t(main); $('main-icon').textContent = icon; $('main-button').disabled = testing || starting;
    $('stop-button').disabled = snapshot.status === 'idle' || starting;
    $('test-button').disabled = active || testing || starting; $('settings-button').disabled = active || testing || starting;
    $('control-caption').textContent = t(snapshot.status === 'paused' ? 'pauseCaption' : active ? 'activeCaption' : 'readyCaption');
    document.querySelectorAll('#hour-track li').forEach(li => {
      const hour = +li.dataset.hour, p = snapshot.phase;
      const done = snapshot.mode === 'discussion' || (p && (hour < p.hour || (hour === p.hour && ['close','morning'].includes(p.kind))));
      li.classList.toggle('done', !!done); li.classList.toggle('active', p?.kind === 'awake' && p.hour === hour);
      if (p?.kind === 'awake' && p.hour === hour) li.setAttribute('aria-current','step'); else li.removeAttribute('aria-current');
    });
    if (!active) void releaseWakeLock();
  }
  function translate() {
    document.documentElement.lang = settings.language;
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    $('wake-summary').textContent = `${settings.wakeSeconds} ${t('seconds')}`;
    $('gap-summary').textContent = `${settings.gapSeconds} ${t('seconds')}`;
    $('settings-button').setAttribute('aria-label',t('settings'));
    $('close-settings').setAttribute('aria-label',settings.language === 'th' ? 'ปิดการตั้งค่า' : 'Close settings');
    populateVoices(); updateVoiceStatus(); lastRender = ''; render();
  }
  function readForm() {
    return N.normalize(Object.fromEntries([...new FormData(form).entries(), ['speech',form.elements.speech.checked],['sounds',form.elements.sounds.checked]]));
  }
  function fillForm() {
    Object.entries(settings).forEach(([key,value]) => { const field = form.elements.namedItem(key); if (!field) return; if (field.type === 'checkbox') field.checked = value; else field.value = value; });
    populateVoices(); updateRangeLabels();
  }
  function updateRangeLabels() { $('volume-value').value = `${form.elements.volume.value}%`; $('rate-value').value = `${Number(form.elements.rate.value).toFixed(2)}×`; }
  $('settings-button').addEventListener('click',() => { fillForm(); $('settings-dialog').showModal(); });
  $('close-settings').addEventListener('click',() => $('settings-dialog').close());
  form.addEventListener('input',updateRangeLabels);
  form.elements.language.addEventListener('change',() => populateVoices(form.elements.language.value,''));
  form.addEventListener('submit',event => {
    event.preventDefault(); settings = store.save(readForm()); audio.configure(settings);
    translate(); $('settings-dialog').close(); toast(t(store.available ? 'saved' : 'notSaved'));
  });
  function pauseRound(message = 'pausedToast') {
    if (engine.status !== 'running') return;
    engine.pause();
    const token=cueGeneration;
    void audio.play(engine.mode==='discussion'?'pause':'close').then(()=>{
      if(token===cueGeneration)void speech.speak(t(engine.mode==='discussion'?'discussionPauseSpoken':'pauseSpoken'),settings);
    });
    void releaseWakeLock(); toast(t(message === 'pausedToast' && engine.mode === 'discussion' ? 'discussionPausedToast' : message));
  }
  async function unlock() {
    audio.configure(settings); if(settings.speech)speech.prime();
    const ok = await audio.unlock();
    if (!ok && settings.sounds) toast(t('audioError'));
    updateVoiceStatus();
    if (audio.context) audio.context.onstatechange = () => { if (audio.context.state !== 'running' && engine.status === 'running') { pauseRound(); } };
  }
  $('main-button').addEventListener('click',async () => {
    if (starting || testing) return;
    if (engine.status === 'running') { pauseRound(); return; }
    if(engine.status==='paused')interrupt();
    starting = true; render();
    try {
      await unlock(); void keepScreenOn();
      if (engine.status === 'paused') void engine.resume();
      else if (engine.status === 'completed' && engine.mode === 'night') void engine.discuss(settings.discussionSeconds);
      else {hourEffects=N.randomHourEffects();void engine.start(settings);}
    } finally { starting = false; render(); }
  });
  $('stop-button').addEventListener('click',() => { engine.stop(); void releaseWakeLock(); toast(t('stopped')); });
  $('test-button').addEventListener('click',async () => {
    if (testing || starting || ['running','paused'].includes(engine.status)) return;
    if (!settings.speech && !settings.sounds) { toast(t('allMuted')); return; }
    const token = cueGeneration;
    testing = true; render();
    try {
      await unlock(); if (token !== cueGeneration) return;
      await audio.play('awake',{hour:3}); if (token !== cueGeneration) return;
      await audio.startCountdown(3000); if(token!==cueGeneration)return;
      await audio.play('close'); if(token!==cueGeneration)return;
      for(const effect of ['fart','plop','flush']){
        await audio.play(effect);if(token!==cueGeneration)return;
      }
      const result = await speech.speak(t('testText'),settings);
      if (token === cueGeneration) toast(t(['error','timeout','unavailable'].includes(result.status) ? 'speechError' : 'testDone'));
    } finally { testing = false; render(); }
  });
  document.addEventListener('visibilitychange',() => {
    if (document.hidden) {
      if (engine.status === 'running') { pauseRound('hiddenPause'); }
      if (testing) interrupt();
      void releaseWakeLock();
    }
  });
  window.addEventListener('pagehide',() => { engine.pause(); interrupt(); void releaseWakeLock(); });
  window.addEventListener('keydown',event => {
    if (event.code === 'Space' && !event.repeat && !$('settings-dialog').open && !/INPUT|SELECT|BUTTON|TEXTAREA|A/.test(event.target.tagName)) { event.preventDefault(); $('main-button').click(); }
  });
  fillForm(); translate();
  // Public controller contains only global phases and preferences, never players or rolls.
  N.app = { engine, getSettings:() => ({...settings}) };
})();
