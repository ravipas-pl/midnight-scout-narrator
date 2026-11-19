# The Midnight Scout · Night Narrator

A mobile-first narrator for the Thai scout-camp mystery game. The design uses the project's forest green, khaki, mustard, moon, tent, and camp-toilet motifs.

## Open

`dist/index.html` is the single-file release. It embeds the CSS, JavaScript and SVG artwork. There are no external assets, libraries, API keys, accounts, or network requests made by the app.

Open it in a browser that permits JavaScript in saved HTML files, or serve it from any static host. Some mobile file-preview apps do not execute HTML/JavaScript; use a real browser. When served, keeping a tab cached is not an offline guarantee: this version has no service worker. The downloadable self-contained HTML is the offline artifact.

For development, open `index.html` or start a local static preview:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

The server is optional development tooling, not an application backend.

## Play

1. Deal the classic roles, remember each player's private die, cover the cups, and put the toilet clean-side up. Do not enter any private rolls into this page.
2. Use **Preview chimes & ticks**. Non-verbal mode is the default; speech is optional in settings.
3. Press **Start the night**. Everyone can now play; no separate reader is required.
4. Follow the public hours 1–6: count the repeated high bells to know which hour is opening. Wait for the sequence to finish; two low chimes mean everyone closes their eyes. Defaults match Classic playtest v0.4: 12 seconds awake, then 3 seconds eyes closed. Preparation is 5 seconds.
5. When morning arrives, press **Start discussion** when the group is ready. The default discussion is 180 seconds, followed by the simultaneous voting cue.

The app does not adjudicate votes or roles. Follow the printed rules for a tie: discuss for 30 more seconds, then one runoff. Secret dice numbers, player names, and roles are never collected or saved. Only public wake-window numbers are announced.

## Timing and interruptions

- A phase countdown begins after its chime finishes, and after the spoken instruction only when optional speech is enabled.
- Quiet percussive ticking marks each second during night countdowns. In the final three seconds it accelerates to 2 ticks/sec, then 4, then 6. Discussion is quiet until its final three seconds.
- Ticks are scheduled against the Web Audio clock, not animation frames. Pause, stop, backgrounding and phase changes cancel future ticks. Resume schedules only the remaining time.
- The audio preview plays three high bells, the three-second accelerating tick pattern, then the two low closing chimes and all three comic effects: fart, water plop, and flush.
- Deadlines use `performance.now()`; `requestAnimationFrame` updates the display. A delayed frame cannot skip several wake windows or steal time from the next window.
- Pause cancels the active audio queue and freezes the clock. During night, two low pause chimes tell everyone to close their eyes. Optional spoken pause instructions follow the chime; discussion pauses use a separate cue.
- Continue repeats the current instruction, then uses the preserved remaining time.
- Switching away from the page or losing the AudioContext pauses an active round. Return and explicitly continue. Keep the page foregrounded.
- A screen wake lock is attempted where supported; failure is harmless. Screen locking and background audio behavior vary by device.
- Speech errors or an unavailable voice fall back to text and the timer; narration has a bounded timeout to avoid a permanently stuck phase.

## Audio and offline limitations

Web Audio synthesizes the short camp melodies and chimes through oscillators, gain envelopes, and a low-pass filter. It starts only after a button press.

Speech uses the operating system/browser's installed Web Speech voices. Thai and English UI/narration are included. On-device voices are preferred and labeled in settings; some other voices require a network connection. Install a Thai voice if the device does not have one. Speech support and offline availability cannot be guaranteed by a static HTML file.

The default non-verbal mode uses no speech synthesis at all. The application code, synthesized chimes and ticking need no network. A speech provider may make its own requests if an online voice is selected. The browser can restrict audio on silent mode, with certain output devices, or when the screen is locked. Test the target phone before a game.

## Source layout

```text
index.html             Accessible application markup and inline SVG motifs
css/style.css          Responsive camp theme, dark mode, reduced-motion support
js/app.js              UI, Thai/English copy, narration script, lifecycle events
js/game-engine.js      Independent phase state machine and timestamp clock
js/audio-engine.js     Independent synthesized audio engine
js/speech-engine.js    Independent speech queue, cancellation and voice selection
js/settings.js         Validated local preferences with safe storage fallback
scripts/build.mjs     Produces the self-contained dist/index.html
tests/                 Node built-in tests; no packages required
```

Classic scripts are intentional: both the development page and bundled page avoid ES-module CORS restrictions when opened from a file. Classes use the `NightNarrator` namespace, and the pure engines expose CommonJS exports for tests.

## Build and verify

```sh
npm test
npm run build
```

Tests cover all six wake windows, phase timing after narration, delayed frames, pause/resume, stale speech completions, cancellation, morning/discussion/voting transitions, voice-language selection, corrupt settings, and denied local storage.

Browser checks exercised a complete shortened six-hour night and a discussion-to-vote handoff, settings persistence, Thai voice completion, release start/pause/stop controls, and 390 px / 1280 px layouts without horizontal overflow. The single-file release was tested over localhost with zero external script/style assets. The preview browser disallowed `file://` navigation, so direct saved-file opening was not browser-tested here. Physical Android and iOS devices have not been tested.

Preferences use the `midnight-scout.narrator.v2` localStorage key. On first load of this update, v1 timing/language/volume preferences are carried over but speech is switched off and chimes on. A later explicit voice opt-in is saved normally. Storage denial is nonfatal. No analytics, fetch calls, cookies, remote fonts, or third-party scripts are included.

## v1.1 non-verbal update

23 automated tests pass, including tick-rate bands, deadline boundaries, resumed tick schedules, oscillator cancellation, public-hour chime counts, settings migration and optional voice persistence. Browser checks confirmed the no-voice default, the new preview sequence, and start/pause/resume/stop controls in the single-file build.

## v1.1.1 flush sound

A 2.5-second synthesized water rush and low drain bubbles play once at the end of the night, before the morning chime and optional narration. The effect uses generated noise and oscillators; no downloaded audio or network is needed. It obeys the sound toggle, and pause/stop cancels all sources. The sound-preview button includes the flush. All 25 automated tests pass; the full sound preview also completed in the browser.

## v1.2.0 random hourly effects

Each of the six hourly wake windows ends with the close-eyes cue, followed
by one randomly chosen flush, fart, or water-plop effect. Choices are sampled
independently with equal probability; repeats are allowed. A six-hour plan
is chosen at the start of each night, so resuming an hour keeps its choice.
The random sound is unrelated to players, roles, dice or the toilet state.

The closed-eye gap timer starts after the effect finishes. Awake-window
lengths and recognizable game chimes are preserved. Morning uses its dawn
chime, with no additional fixed flush. Speech remains off by default.

The preview button plays all three comic effects. Every effect is synthesized
locally, follows the sound toggle and volume, and cancels on pause/stop or
backgrounding. All 29 automated tests pass, and the complete preview played
successfully in the browser.
