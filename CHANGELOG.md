# 📜 Change Log

All notable changes, bug fixes, and feature additions to the **ShallotWHAM** project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## 💡 How Version Numbers Work (For Beginners)

Version numbers use three numbers separated by dots: `MAJOR.MINOR.PATCH` (e.g. `1.0.0`).
- **MAJOR** (e.g., `1.0.0` -> `2.0.0`): Big redesigns or massive architectural overhauls.
- **MINOR** (e.g., `1.0.0` -> `1.1.0`): New features or instruments added in a backward-compatible way.
- **PATCH** (e.g., `1.0.0` -> `1.0.1`): Small bug fixes, performance improvements, or documentation tweaks.

---

## 📝 Revision Log

### [Unreleased]
*Future features and fixes currently planned or in development.*
- MIDI controller input support via Web MIDI API.
- Live session WAV recording and audio export.
- Custom preset saving and loading via browser local storage.

---

### [1.0.0] - 2026-09-01
#### Added
- **Project Identity & Rebranding**:
  - Rebranded project to **ShallotWHAM (Dual-Engine Synth & Whammy Station)** by **Shallot**.
  - Updated executable target to `ShallotWHAM.exe`.
  - Added backward-compatible settings persistence (`shallotwham_settings` / `shallotwham_keybinds`).
- **Dual-Engine Sound Architecture**:
  - Dedicated **Lead Synth Engine** (controlling keyboard rows 0 & 1) with dual detunable oscillators, filter cutoff, resonance, attack/release envelope, and polyphony up to 6 voices.
  - Dedicated **Bassline Synth Engine** (controlling keyboard rows 2 & 3) with TB-303-style resonant acid decay, sub-bass oscillator blend, and independent volume.
- **16 Studio Presets**:
  - 8 Lead presets (*Trance Saw, Chiptune, 80s Brass, Cyberpunk, G-Funk Sine, Hyper Pluck, Voco Lead, Rave Hoover*).
  - 8 Bass presets (*Acid 303, Deep Sub, Fat Reese, FM Punch, Slap Square, 80s Analog, Warm Moog, Sub Drop*).
- **Dual 4-Pedal Mini FX Racks**:
  - Independent guitar-style pedalboards for both Lead and Bass engines.
  - **DS-1 Distortion**: Crunch / saturation with drive, tone, and level knobs.
  - **PS-6 Harmonist**: Real-time interval harmonizer supporting major/minor keys, +3rd, +5th, octaves, and triads.
  - **Stereo Delay**: Tempo-synced echo with feedback and dry/wet mix.
  - **Convolver Reverb**: Spatial room ambience effect.
- **Xbox & USB Gamepad Integration**:
  - Right Joystick pitch bend whammy bar with real-time visual tracking.
  - Left Joystick tremolo modulation depth.
  - Dynamic pitch bend range shifting via triggers and bumpers (`RT`/`RB` and `LT`/`LB`).
  - Face button bindings for quick effect toggles, tap tempo, and FX cancel.
- **Visual Feedback & UI**:
  - Real-time oscilloscope audio visualizer canvas in header.
  - Cyberpunk dark neon UI theme with scanlines, glowing text, and responsive layout.
  - Dynamic virtual keyboard highlighting active keys during playback.
  - On-screen octave indicators with active LED feedback.
- **Desktop & Launcher Support**:
  - Standalone desktop support via Electron (`main.js`).
  - Portable single-file Windows EXE packaging configuration (`electron-builder`).
  - Multi-option launcher batch script (`start-dev.bat`) supporting browser, Electron dev, and release build modes.
- **Project Documentation**:
  - Novice-friendly `README.md` user guide and manual.
  - Technical `PROJECT_STATE.md` architectural blueprint and component map.
  - `CHANGELOG.md` version tracking document.

---

## 🔄 How to Update This Changelog on Every Revision

When making any new change to the project:
1. Add a brief bullet point under **`[Unreleased]`** or create a new version header (e.g. `### [1.0.1] - YYYY-MM-DD`).
2. Group the change under one of these standard labels:
   - **`Added`**: For brand new features or capabilities.
   - **`Changed`**: For changes to existing functionality.
   - **`Deprecated`**: For features soon to be removed.
   - **`Removed`**: For features now removed.
   - **`Fixed`**: For any bug or glitch fixes.
   - **`Security`**: For security improvements.
