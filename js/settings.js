(function (root) {
  'use strict';
  const STORAGE_KEY='midnight-scout.narrator.v2';
  const defaults = Object.freeze({ language: 'th', wakeSeconds: 12, gapSeconds: 3, prepareSeconds: 5, discussionSeconds: 180, volume: 65, rate: 1, voiceURI: '', speech: false, sounds: true, theme: 'camp' });
  const clamp = (value, low, high, fallback) => Number.isFinite(Number(value)) ? Math.max(low, Math.min(high, Number(value))) : fallback;
  function normalize(input = {}) {
    if (!input || typeof input !== 'object') input = {};
    return {
      language: input.language === 'en' ? 'en' : 'th',
      wakeSeconds: Math.round(clamp(input.wakeSeconds, 5, 30, defaults.wakeSeconds)),
      gapSeconds: Math.round(clamp(input.gapSeconds, 2, 10, defaults.gapSeconds)),
      prepareSeconds: Math.round(clamp(input.prepareSeconds, 3, 15, defaults.prepareSeconds)),
      discussionSeconds: Math.round(clamp(input.discussionSeconds, 30, 600, defaults.discussionSeconds)),
      volume: clamp(input.volume, 0, 100, defaults.volume),
      rate: clamp(input.rate, 0.75, 1.25, defaults.rate),
      voiceURI: typeof input.voiceURI === 'string' ? input.voiceURI.slice(0, 300) : '',
      speech: typeof input.speech === 'boolean' ? input.speech : false,
      sounds: typeof input.sounds === 'boolean' ? input.sounds : true,
      theme: input.theme === 'soft' ? 'soft' : 'camp'
    };
  }
  class SettingsStore {
    constructor(storage) {
      this.storage = storage;
      this.available = true;
      this.value = { ...defaults };
      try {
        const saved=storage?.getItem(STORAGE_KEY);
        if(saved)this.value=normalize(JSON.parse(saved));
        else {
          const legacy=JSON.parse(storage?.getItem('midnight-scout.narrator.v1')||'{}');
          // Apply the requested new default once. Later explicit voice opt-ins persist.
          this.value=normalize({...legacy,speech:false,sounds:true});
          if(storage)storage.setItem(STORAGE_KEY,JSON.stringify(this.value));
        }
      }
      catch (_) { this.available = false; }
    }
    save(input) {
      this.value = normalize(input);
      try {
        if (!this.storage) throw new Error('Storage unavailable');
        this.storage.setItem(STORAGE_KEY, JSON.stringify(this.value));
        this.available = true;
      } catch (_) { this.available = false; }
      return this.value;
    }
  }
  const api = { defaults, normalize, SettingsStore, STORAGE_KEY };
  root.NightNarrator = Object.assign(root.NightNarrator || {}, api);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
