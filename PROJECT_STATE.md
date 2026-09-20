# 📊 PROJECT STATE & ARCHITECTURE SPECIFICATION

> **Application Name**: **ShallotWHAM**  
> **Application Name**: **ShallotWHAM**  
> **Current Version**: `1.5.0`  
> **Author / Developer**: **Shallot**  
> **Status**: Stable / Fully Functional  
> **Last Updated**: 2026-09-20  
> **Target Platforms**: Web Browsers (Chrome, Firefox, Safari, Edge) & Windows Desktop (Electron Portable)

---

## 🧭 Executive Summary

**ShallotWHAM** is a modular, high-performance web audio synthesis workstation created by **Shallot**. It is engineered with zero external client-side frameworks (using pure HTML5, CSS3, Vanilla JavaScript, and the Web Audio API) paired with an optional Electron wrapper for native desktop execution.

---

## 🗂️ File & Directory Map

Below is a breakdown of every file and folder in the project and its exact responsibility:

```
ShallotWHAM/
├── index.html              # Main GUI structure, module bar, module manager modal, 10 modular pedal chassis, preset grids
├── style.css               # Dual-theme styling (Shallot Plum & Cyber Neon), animations, modular pedals, console layout
├── shallot-theme.css       # Unified Shallot Plum CSS custom properties & design tokens
├── shallot-theme.json      # Structured token specification schema
├── THEME.md                # Shallot Plum theme guide and token documentation
├── modules/                # Proprietary Sound Module files (.swm) - 10 Modules / 160 Presets / 10 Signature Pedalboards
│   ├── synthwave.swm               # Bank: Synthwave (8 leads, 8 basses, signature pedals)
│   ├── crystal-castles.swm         # Bank: Crystal Castles (Alice Practice, Crimewave, signature pedals)
│   ├── 8bit-arcade.swm             # Bank: 8-Bit Arcade (NES, Game Boy, SID 6581, signature pedals)
│   ├── pornophonique-sad-robot.swm # Bank: Pornophonique "Sad Robot" (SID 6581 + LSDJ, signature pedals)
│   ├── daft-punk.swm               # Bank: Daft Punk (French Touch, Talkbox, Aerodynamic, signature pedals)
│   ├── kraftwerk.swm               # Bank: Kraftwerk (Kling Klang, Computer World, Autobahn, signature pedals)
│   ├── dungeon-synth.swm           # Bank: Dungeon Synth (Castlevania Organ, Ancient Flute, signature pedals)
│   ├── depeche-mode.swm            # Bank: Depeche Mode (Enjoy the Silence, Personal Jesus, signature pedals)
│   ├── vaporwave-dreams.swm        # Bank: Vaporwave Dreams (DX7 Piano, Mall Chime, Slush Sub, signature pedals)
│   └── user-custom.swm             # Bank: User Custom Patches
├── scripts/                # IDE Tooling & DSP Testing
│   ├── create-module.js            # CLI Module validator and generator
│   ├── sync-modules.js             # Engine synchronizer compiling .swm files into app.js
│   ├── modular-pedal-engine.js     # Cartridge catalog (26 cartridges) and DSP node factories
│   └── test-modular-dsp.js         # Automated test suite for all 26 DSP cartridge branches
├── app.js                  # Audio engine, low-latency DSP, 10-chassis modular pedalboard, sound module vault
├── main.js                 # Electron main process entry point (spawns 1920x1080 desktop window)
├── package.json            # Node.js dependencies (Electron, electron-builder) and build scripts
├── package-lock.json       # Exact lockfile for deterministic dependency resolution
├── start-dev.bat           # Windows batch launcher (browser preview, electron dev, exe packager)
├── .gitignore              # Ignores node_modules, build outputs (dist), and local caches
├── README.md               # User manual and novice-friendly quick-start documentation
├── PROJECT_STATE.md        # Technical architecture snapshot and roadmap tracking (this file)
└── CHANGELOG.md            # Chronological revision and feature release log
```

---

## 🧩 Architectural Breakdown

### 1. Audio Engine (`app.js`)
- **Web Audio Context**: Single master `AudioContext({ latencyHint: 'interactive' })` with master gain, brickwall safety limiter (`masterLimiter`), and real-time `AnalyserNode` connected to the oscilloscope canvas.
- **5-Slot Loadable Modular Sound Banks**:
  - Slots 1-5 customizable via the Sound Module Manager (`[📂 MODULES]`) or hotkeys `Alt+1` through `Alt+5`.
  - Default Loaded Configuration:
    - Slot 1: **Synthwave** (`synthwave.swm`)
    - Slot 2: **Crystal Castles** (`crystal-castles.swm`)
    - Slot 3: **8-Bit Arcade** (`8bit-arcade.swm`)
    - Slot 4: **Sad Robot** (`pornophonique-sad-robot.swm` - authentic C64 SID 6581 & Game Boy LSDJ presets)
    - Slot 5: **User Patches** (`user-custom.swm` - full in-app patch editor and export/import)
- **Proprietary Sound Module Specification (`.swm`)**:
  - Portable, standardized JSON specification with format ID `shallotwham_module_v1`, author metadata, and complete parameters for 8 leads and 8 basslines.
- **Latency & Performance Optimization**:
  - **Bitcrusher Buffer**: Reduced from 2048 (~46.4ms) down to 256 (~5.8ms), cutting processing latency by >87%.
  - **Key Element Pre-Caching**: $O(1)$ lookup maps (`KEY_CACHE`, `KEY_ELEMENTS`) eliminate DOM queries and layout thrashing during chord attacks.
  - **Audio Pre-Warming**: Pre-initializes audio context on first user interaction (`click`, `touchstart`, `keydown`).
- **Emergency & Diagnostics**:
  - **Panic Button (`[🚨 PANIC]` / `ESC`)**: Instant hardware cutoff stopping all voices, envelopes, and arpeggiators.
  - **Real-Time Polyphony Counter**: Live UI display tracking `[VOICES: 0/4]`.
- **Lead Synth Architecture**:
  - Dual oscillator topology (`osc1` + `osc2` with detuning).
  - Multi-mode Biquad Filter (lowpass / bandpass).
  - ADSR Envelope generator with dynamic polyphony management (1 to 6 simultaneous voices).
- **Bassline Synth Architecture**:
  - Main oscillator + dedicated Sub-Oscillator (frequency divided / octave lowered).
  - Filter envelope modulation with steep resonant decay curve (TB-303 emulation).
  - Dedicated polyphony limiter (1 to 6 voices) and independent volume mix.
- **Hardware Arpeggiator Engine**:
  - 60Hz SID/NES Chip Chord cycling + 1/16, 1/32, Octave Hop, and Random Glitch modes.
  - Dedicated LATCH (HOLD) state for seamless multi-key chiptune performances.

### 2. Dual 5-Pedal Mini FX Pedal Racks
Both Lead and Bass audio pipelines route through independent 5-stompbox series-parallel effect chains:
1. **DS-1 Distortion**: Non-linear waveshaping distortion curve + post-filter tone EQ.
2. **Decimator / Bitcrusher**: Sample-rate decimation downsampler + variable bit-depth quantizer (2-bit to 16-bit) with wet/dry mix.
3. **PS-6 Harmonist**: Intelligent pitch shift / interval generator using audio buffer delay modulation and scale quantizing.
4. **Stereo Delay**: Configurable feedback delay line with high-frequency damping.
5. **Reverb Engine**: Convolver / synthetic impulse room decay simulator.
6. **Master FX Bypass**: Global instantaneous FX killswitch (`FX: MASTER` / `FX: BYPASS`).

### 3. Input & Controller Bridge
- **4-Row Computer Keyboard**: Real-time `keydown` / `keyup` mapping with pitch calculation based on row root note and octave configuration.
- **Gamepad API Polling**: Continuous `requestAnimationFrame` loop detecting Xbox/USB controller connection, joystick pitch bend (Y-axis), tremolo (X-axis), and button shortcuts.
- **Hotkey Rebinding**: Interactive UI permitting users to click any key tag to remap octave or effect triggers.

### 4. Desktop Packaging (`main.js` & `electron-builder`)
- Configured to output a portable Windows executable (`ShallotWHAM.exe`) inside `dist/` with no installation required.

---

## 📋 Feature Status Checklist

| Feature Area | Component | Status | Notes |
| :--- | :--- | :---: | :--- |
| **Modules** | 5-Slot Modular Sound Banks | ✅ Complete | Dynamic slots 1-5 customizable via UI modal or Alt+1..Alt+5 |
| **Modules** | Proprietary `.swm` Format | ✅ Complete | Export/import standardized portable module file format |
| **Modules** | Pornophonique "Sad Robot" | ✅ Complete | Official module with 8 SID 6581 / LSDJ leads & 8 basses |
| **Modules** | Sound Module Manager Modal | ✅ Complete | Drag-and-drop `.swm` loader, slot assignment, preset info |
| **Performance**| Low-Latency Bitcrusher | ✅ Complete | 256-sample buffer (~5.8ms vs former ~46.4ms; >87% reduction) |
| **Performance**| O(1) Keyboard Key Caching | ✅ Complete | Pre-computed DOM maps eliminate layout thrashing during chords |
| **Performance**| Interactive Audio Latency | ✅ Complete | Web Audio Context configured with `latencyHint: interactive` |
| **Performance**| Pre-Warmed Audio Context | ✅ Complete | Pre-arms AudioContext on keydown/touchstart/click |
| **Safety** | Brickwall Limiter | ✅ Complete | Hardware safety compressor prevents clipping distortion |
| **Diagnostics**| Live Voice Counter | ✅ Complete | Real-time `[VOICES: 0/4]` readout tracking active hardware voices |
| **Emergency** | Global Panic Killswitch | ✅ Complete | `[🚨 PANIC]` button / `ESC` terminates all voices and arps |
| **Volume** | Master Volume in Header | ✅ Complete | Top header global bus slider + live numerical percentage readout |
| **Volume** | Lead Volume (`LEAD VOL`) | ✅ Complete | Dedicated Lead Synth matrix slider + quick mute `[M]` button |
| **Volume** | Bass Volume (`BASS VOL`) | ✅ Complete | Dedicated Bassline Engine matrix slider + quick mute `[M]` button |
| **Acoustics**| Perceptual Audio Taper | ✅ Complete | Logarithmic/exponential gain curves for wide dynamic spectrum |
| **Synthesis** | Dual Engine Audio Core | ✅ Complete | Polyphonic Lead + Monophonic/Polyphonic Bass |
| **Sound Banks**| Multi-Bank Architecture | ✅ Complete | 5 Loaded Slots with full persistence |
| **Sound Banks**| Patch Save / Export / Import | ✅ Complete | LocalStorage persistence and `.swm` file backup/restore |
| **Arpeggiator**| Chiptune Arp (60Hz Chip Chord) | ✅ Complete | 60Hz, 1/16, 1/32, Oct-Hop, Random + Latch/Hold |
| **Effects** | Decimator / Bitcrusher | ✅ Complete | 2 to 16 bits, sample downsampling, dry/wet mix |
| **Effects** | Master FX Bypass Switch | ✅ Complete | Global single-click killswitch |
| **Effects** | Lead 5-Pedal Rack | ✅ Complete | DS-1, Decimator, PS-6 Harmonist, Delay, Reverb |
| **Effects** | Bass 5-Pedal Rack | ✅ Complete | Bass DS-1, Bass Crush, Bass PS-6, Bass Delay, Bass Reverb |
| **Hardware** | Xbox Controller Bridge | ✅ Complete | Pitch bend stick, Tremolo stick, FX toggles |
| **Hardware** | Visual Feedback | ✅ Complete | Joystick position dot + tremolo level bar |
| **Visuals** | Oscilloscope Scope | ✅ Complete | HTML5 Canvas real-time audio waveform render |
| **UI / UX** | Shallot Plum & Cyber Themes | ✅ Complete | Flagship Shallot Plum & Warm Copper Glow + Cyber Neon |
| **UI / UX** | Theme Switcher | ✅ Complete | Instant switching with localStorage settings persistence |
| **Packaging** | Electron Desktop Wrapper | ✅ Complete | `main.js` configured with `autoHideMenuBar: true` |
| **Packaging** | Windows Portable Builder | ✅ Complete | Builds to `dist/ShallotWHAM.exe` (includes `modules/`) |

---

## 🔮 Future Roadmap & Potential Enhancements

- [ ] **MIDI Hardware Input**: Web MIDI API listener for standard MIDI keyboards and drumpads.
- [ ] **Pattern Step Sequencer**: 16-step drum and melody sequencer with sync to tap-tempo.
- [ ] **1-Click Audio Recording / Export**: One-click `.wav` recording of live performance sessions.

---

## 🔄 Revision Update Protocol (For Maintainers & Agents)

Whenever a code modification or new feature revision is committed:
1. **Update Version & Date**: Ensure the header reflects the latest version and timestamp.
2. **Update Checklist**: Check off completed items or add newly introduced components.
3. **Verify File Map**: If files are added or renamed, reflect them in the File & Directory Map.
4. **Synchronize with CHANGELOG.md**: Add a corresponding release entry in `CHANGELOG.md`.
