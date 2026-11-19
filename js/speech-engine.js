(function (root) {
  'use strict';
  class SpeechEngine {
    constructor(onVoices = () => {}) {
      this.synth = root.speechSynthesis; this.pending = null; this.onVoices = onVoices;
      this.supported = !!(this.synth && root.SpeechSynthesisUtterance);
      this.update = () => this.onVoices(this.voices());
      if (this.supported) { this.synth.addEventListener?.('voiceschanged', this.update); this.update(); }
    }
    voices() { try { return this.synth?.getVoices() || []; } catch (_) { return []; } }
    choose(settings) {
      const voices = this.voices();
      const language = settings.language === 'th' ? 'th' : 'en';
      const candidates = voices.filter(v => v.lang.toLowerCase().startsWith(language));
      return candidates.find(v => v.voiceURI === settings.voiceURI) || candidates.find(v => v.localService) || candidates[0] || null;
    }
    prime() {
      if (!this.supported) return;
      try { this.synth.cancel(); const u = new root.SpeechSynthesisUtterance(' '); u.volume = 0; this.synth.speak(u); } catch (_) {}
    }
    speak(text, settings) {
      this.cancel();
      if (!settings.speech) return Promise.resolve({ status: 'muted' });
      if (!this.supported) return Promise.resolve({ status: 'unavailable' });
      return new Promise(resolve => {
        let settled = false;
        const finish = status => {
          if (settled) return; settled = true;
          clearTimeout(timer); if (this.pending?.finish === finish) this.pending = null;
          resolve({ status });
        };
        const timer = setTimeout(() => { finish('timeout'); try { this.synth.cancel(); } catch (_) {} }, Math.max(8000, text.length * 130 / settings.rate + 3500));
        this.pending = { finish };
        try {
          const utterance = new root.SpeechSynthesisUtterance(text);
          utterance.lang = settings.language === 'th' ? 'th-TH' : 'en-US';
          const voice = this.choose(settings);
          if (!voice && this.voices().length) { finish('unavailable'); return; }
          if (voice) utterance.voice = voice;
          utterance.rate = settings.rate; utterance.pitch = .98; utterance.volume = settings.volume / 100;
          utterance.onend = () => finish('spoken'); utterance.onerror = () => finish('error');
          this.synth.resume(); this.synth.speak(utterance);
        } catch (_) { finish('error'); }
      });
    }
    cancel() {
      this.pending?.finish('cancelled'); this.pending = null;
      try { this.synth?.cancel(); } catch (_) {}
    }
  }
  root.NightNarrator = Object.assign(root.NightNarrator || {}, { SpeechEngine });
})(globalThis);
