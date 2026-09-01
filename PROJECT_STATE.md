# 📊 PROJECT STATE & ARCHITECTURE SPECIFICATION

> **Application Name**: **ShallotWHAM**  
> **Current Version**: `1.0.0`  
> **Author / Developer**: **Shallot**  
> **Status**: Stable / Fully Functional  
> **Last Updated**: 2026-09-01  
> **Target Platforms**: Web Browsers (Chrome, Firefox, Safari, Edge) & Windows Desktop (Electron Portable)

---

## 🧭 Executive Summary

**ShallotWHAM** is a modular, high-performance web audio synthesis workstation created by **Shallot**. It is engineered with zero external client-side frameworks (using pure HTML5, CSS3, Vanilla JavaScript, and the Web Audio API) paired with an optional Electron wrapper for native desktop execution.

---

## 🗂️ File & Directory Map

Below is a breakdown of every file and folder in the project and its exact responsibility:

```
audio-microWHAM/
├── index.html              # Main GUI structure, control panels, preset grids, and pedalboards
├── style.css               # Cyberpunk dark UI styling, responsive layout, animations, neon themes
├── app.js                  # Complete audio engine, Web Audio nodes, MIDI/Gamepad/Keyboard handlers
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
- **Web Audio Context**: Single master `AudioContext` with master gain and real-time `AnalyserNode` connected to the oscilloscope canvas.
- **Lead Synth Architecture**:
  - Dual oscillator topology (`osc1` + `osc2` with detuning).
  - Multi-mode Biquad Filter (lowpass / bandpass).
  - ADSR Envelope generator with dynamic polyphony management (1 to 6 simultaneous voices).
  - 8 Preset configurations (*Trance Saw, Chiptune, 80s Brass, Cyberpunk, G-Funk, Hyper Pluck, Voco Lead, Rave Hoover*).
- **Bassline Synth Architecture**:
  - Main oscillator + dedicated Sub-Oscillator (frequency divided / octave lowered).
  - Filter envelope modulation with steep resonant decay curve (TB-303 emulation).
  - Dedicated polyphony limiter (1 to 6 voices) and independent volume mix.
  - 8 Preset configurations (*Acid 303, Deep Sub, Fat Reese, FM Punch, Slap Square, 80s Analog, Warm Moog, Sub Drop*).

### 2. Dual Mini FX Pedal Racks
Both Lead and Bass audio pipelines route through independent series-parallel effect chains:
1. **DS-1 Distortion**: Non-linear waveshaping distortion curve + post-filter tone EQ.
2. **PS-6 Harmonist**: Intelligent pitch shift / interval generator using audio buffer delay modulation and scale quantizing.
3. **Stereo Delay**: Configurable feedback delay line with high-frequency damping.
4. **Reverb Engine**: Convolver / synthetic impulse room decay simulator.

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
| **Synthesis** | Dual Engine Audio Core | ✅ Complete | Polyphonic Lead + Monophonic/Polyphonic Bass |
| **Synthesis** | Lead Presets (8) | ✅ Complete | Saw, pulse, brass, pluck, vocal, hoover |
| **Synthesis** | Bass Presets (8) | ✅ Complete | Acid 303, Reese, Sub, Moog, FM |
| **Effects** | Lead 4-Pedal Rack | ✅ Complete | DS-1, PS-6 Harmonist, Delay, Reverb |
| **Effects** | Bass 4-Pedal Rack | ✅ Complete | Bass DS-1, Bass PS-6, Bass Delay, Bass Reverb |
| **Hardware** | Xbox Controller Bridge | ✅ Complete | Pitch bend stick, Tremolo stick, FX toggles |
| **Hardware** | Visual Feedback | ✅ Complete | Joystick position dot + tremolo level bar |
| **Visuals** | Oscilloscope Scope | ✅ Complete | HTML5 Canvas real-time audio waveform render |
| **UI / UX** | Responsive Cyberpunk Theme | ✅ Complete | Neon glowing UI, animated scanlines & grid |
| **Packaging** | Electron Desktop Wrapper | ✅ Complete | `main.js` configured with `autoHideMenuBar: true` |
| **Packaging** | Windows Portable Builder | ✅ Complete | Builds to `dist/ShallotWHAM.exe` |

---

## 🔮 Future Roadmap & Potential Enhancements

- [ ] **MIDI Hardware Input**: Web MIDI API listener for standard MIDI keyboards and drumpads.
- [ ] **Pattern Step Sequencer**: 16-step drum and melody sequencer with sync to tap-tempo.
- [ ] **Custom User Presets**: LocalStorage saving/loading for custom user-created synth patches.
- [ ] **Audio Recording / Export**: One-click `.wav` recording of live performance sessions.

---

## 🔄 Revision Update Protocol (For Maintainers & Agents)

Whenever a code modification or new feature revision is committed:
1. **Update Version & Date**: Ensure the header reflects the latest version and timestamp.
2. **Update Checklist**: Check off completed items or add newly introduced components.
3. **Verify File Map**: If files are added or renamed, reflect them in the File & Directory Map.
4. **Synchronize with CHANGELOG.md**: Add a corresponding release entry in `CHANGELOG.md`.
