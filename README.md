# 🎹 ShallotWHAM Synth Station

Welcome to **ShallotWHAM**! 🚀  
ShallotWHAM is a cyber-styled, dual-engine synthesizer and performance station built by **Shallot**. It runs right inside your web browser or as a standalone Windows desktop app.

Whether you are a seasoned musician or touching a synthesizer for the very first time, this guide will walk you through everything in simple, everyday language.

---

## 📑 Table of Contents
1. [⚡ Quick Start (Get Playing in 5 Seconds)](#-quick-start-get-playing-in-5-seconds)
2. [🕹️ Ways to Run ShallotWHAM](#️-ways-to-run-shallotwham)
3. [🎹 How to Play: The 4-Row Keyboard](#-how-to-play-the-4-row-keyboard)
4. [🎛️ The Two Sound Engines Explained](#️-the-two-sound-engines-explained)
5. [🎸 Mini FX Pedalboards](#-mini-fx-pedalboards)
6. [🎮 Xbox Controller Whammy & Modulation](#-xbox-controller-whammy--modulation)
7. [⌨️ Keyboard Shortcuts & Hotkeys](#️-keyboard-shortcuts--hotkeys)
8. [❓ Frequently Asked Questions & Troubleshooting](#-frequently-asked-questions--troubleshooting)

---

## ⚡ Quick Start (Get Playing in 5 Seconds)

1. **Open the App**: Double-click `index.html` in your favorite web browser (Chrome, Edge, Firefox, or Brave).
2. **Wake Up the Audio Engine**: Click anywhere on the screen (modern web browsers require one click before they allow sound to play).
3. **Make Some Noise**:
   - Press the keys **`Q` `W` `E` `R`** on your computer keyboard to play **Lead Synth** melodies.
   - Press the keys **`Z` `X` `C` `V`** to play heavy **Bassline** notes.

---

## 🕹️ Ways to Run ShallotWHAM

You have three easy ways to launch the app:

| Mode | How to Launch | Best For |
| :--- | :--- | :--- |
| **1. Web Browser** *(Easiest)* | Double-click `index.html` | Instant play with zero installation. |
| **2. Interactive Launcher** | Double-click `start-dev.bat` | Menu to pick browser, desktop app, or build. |
| **3. Standalone Desktop App** | Run `npm start` in your terminal | Distraction-free native desktop window. |

> **To build a standalone `.exe` installer:** Run `npm run build` in your terminal. A portable Windows executable (`ShallotWHAM.exe`) will be generated inside the `dist/` folder.

---

## 🎹 How to Play: The 4-Row Keyboard

Your regular computer keyboard transforms into a 4-tier dual synthesizer:

```
+-------------------------------------------------------------------------------+
|  ROW 0: [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ] [ 6 ] [ 7 ] [ 8 ] [ 9 ] [ 0 ] [ - ] [ = ]  <-- LEAD SYNTH (Upper)
|  ROW 1:   [ Q ] [ W ] [ E ] [ R ] [ T ] [ Y ] [ U ] [ I ] [ O ] [ P ] [ [ ] [ ] ]  <-- LEAD SYNTH (Lower)
+-------------------------------------------------------------------------------+
|  ROW 2:   [ A ] [ S ] [ D ] [ F ] [ G ] [ H ] [ J ] [ K ] [ L ] [ ; ] [ ' ]        <-- BASS SYNTH (Upper)
|  ROW 3:     [ Z ] [ X ] [ C ] [ V ] [ B ] [ N ] [ M ] [ , ] [ . ] [ / ]            <-- BASS SYNTH (Lower)
+-------------------------------------------------------------------------------+
```

### Key Highlights:
- **Top 2 Rows (`1-=` and `Q-]`)**: Control the **Lead Synth** (crisp leads, chiptunes, brass, plucks).
- **Bottom 2 Rows (`A-'` and `Z-/`)**: Control the **Bassline Engine** (acid 303s, sub drops, reese basses).
- **Custom Root & Octave Tuning**: Above each section, dropdown menus allow you to change the starting note (e.g. C, D, G) and octave (Oct 1 to Oct 5) for any row independently.
- **Octave Shift Buttons**: Quickly transpose up or down with on-screen buttons or dedicated hotkeys.

---

## 🎛️ The Two Sound Engines Explained

ShallotWHAM runs two independent sound engines simultaneously so you can play a bassline with your left hand and lead solos with your right hand.

### 1. ⚡ Lead Synth (Rows 0 & 1)
- **Presets**: 8 built-in studio presets (*Trance Saw, Chiptune, 80s Brass, Cyberpunk, G-Funk Sine, Hyper Pluck, Voco Lead, Rave Hoover*).
- **Cutoff (Brightness)**: Low values make the sound dark and muffled; high values make it bright and sharp.
- **Resonance (Edge/Bite)**: Boosts frequencies near the cutoff for a piercing, laser-like synth tone.
- **Attack (Fade-In Speed)**: Low values give instant punch; high values create smooth swelling pads.
- **Release (Ring-Out Time)**: Controls how long notes linger after you let go of the keys.
- **Polyphony (Voices)**: Allows playing between 1 and 6 notes simultaneously.

### 2. 🔊 Bassline Engine (Rows 2 & 3)
- **Presets**: 8 deep bass presets (*303 Acid, Deep Sub, Fat Reese, FM Punch, Slap Square, 80s Analog, Warm Moog, Sub Drop*).
- **Cutoff & Resonance**: Dial in squelchy acid basslines or warm low-end rumbles.
- **Sub Mix**: Blends in a deep sub-bass oscillator one octave down for chest-thumping bass.
- **Bass Volume**: Balances the bass level against your lead sound.

---

## 🎸 Mini FX Pedalboards

Both the Lead Synth and Bassline Synth have their own independent **4-Pedal FX Racks** (modeled after classic Boss guitar pedals):

| Pedal | Name | What It Does | Controls |
| :--- | :--- | :--- | :--- |
| 🟠 **DS-1** | Distortion / Overdrive | Adds crunch, grit, and analog saturation. | **Dist/Drive**, **Tone**, **Level** |
| 🔵 **PS-6** | Harmonist / Octaver | Generates automatic musical harmonies (+3rd, +5th, +Octave, -Octave, Triads). | **Key**, **Scale**, **Interval**, **Mix** |
| ⚪ **DELAY** | Stereo Echo | Repeats notes rhythmically over time. | **Time (ms)**, **Feedback**, **Mix** |
| ⚫ **REVERB** | Space / Room Ambience | Simulates playing inside an arena or cavern. | **Mix** |

> 💡 **Tip**: Click the **ON/OFF footswitch** on any pedal to toggle it, or press its designated shortcut key!

---

## 🎮 Xbox Controller Whammy & Modulation

Plug in an **Xbox / USB Gamepad** to control sound effects in real time just like a physical whammy bar:

- **Right Joystick (Up/Down)**: Smooth **Pitch Bend / Whammy bar** (+/- 1 octave or more).
- **Left Joystick (Left/Right)**: **Tremolo Modulation** (creates a vibrating, rhythmic volume flutter).
- **Triggers / Bumpers (`RT` / `RB` & `LT` / `LB`)**: Increase or decrease the pitch bend octave range on the fly.
- **Face Buttons**:
  - `Y`: Toggle Lead Reverb
  - `X`: Toggle Lead Delay
  - `A`: Tap Tempo
  - `B`: Kill / Cancel all active effects

---

## ⌨️ Keyboard Shortcuts & Hotkeys

### Octave Controls:
- **Lead Octave Down / Up**: `F7` / `F8`
- **Bass Octave Down / Up**: `F5` / `F6`

### Lead FX Pedals:
- **Lead Distortion**: `` ` `` (Backtick)
- **Lead Harmonist**: `\` (Backslash)
- **Lead Delay**: `F10`
- **Lead Reverb**: `F9`

### Bass FX Pedals:
- **Bass Distortion**: `F1`
- **Bass Harmonist**: `F2`
- **Bass Delay**: `F3`
- **Bass Reverb**: `F4`

> 🏷️ **Rebinding Hotkeys**: Click any small key badge (e.g. `[F1]`, `[F8]`) in the interface to assign a new hotkey!

---

## ❓ Frequently Asked Questions & Troubleshooting

### Why is there no sound when I press keys?
1. Web browsers block audio until you interact with the page. **Click anywhere** inside the app window to unlock audio.
2. Check the **SYNTH VOL** slider in the top header and make sure your computer volume is unmuted.

### My Xbox controller isn't being detected?
1. Make sure your controller is connected via USB or Bluetooth.
2. Press any button on the controller (like the `A` button) so the browser's Gamepad API wakes up.
3. The indicator in the bottom panel will change from `DISCONNECTED` to `CONNECTED`.

### How can I make a portable .exe file for Windows?
1. Install Node.js if you don't have it.
2. Open a command prompt in the project folder.
3. Run `npm install` followed by `npm run build`.
4. Your standalone `ShallotWHAM.exe` will appear in the `dist/` folder.

---

## 📄 License & Credits
- **Author**: Shallot
- **Engine**: Pure Web Audio API + HTML5 Canvas + Electron
- **License**: MIT
