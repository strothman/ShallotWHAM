# 📋 ShallotWHAM Sound Module Standards Specification (SWM v2.0)

> **Format**: `ShallotWHAM-Module`  
> **Specification Version**: `2.0.0`  
> **Target**: Native Web Audio DSP Synthesis & Modular Pedal Ecosystem  
> **File Extension**: `.swm`

---

## 🧭 Purpose & Vision

In ShallotWHAM, a **Sound Module** (`.swm`) is a self-contained, portable sound bank containing:
1. **Metadata & Identity**: Module name, author, theme color, description, category, and tags.
2. **Dual 8-Patch Synth Matrices**: Exactly **8 Lead Presets** and **8 Bassline Presets** (16 presets total).
3. **Signature Pedalboard**: Pre-configured, tailored 5-pedal chains for both Lead and Bass that instantly bring the module's sonic character to life upon loading.

The goal of this standard is to ensure that **every module sounds punchy, polished, dynamic, and genre-authentic out-of-the-box**, eliminating thin waveforms, jarring volume spikes, broken labels, and dry sound design.

---

## 🗂️ Module File Schema

An `.swm` file is deterministic JSON adhering to the following top-level structure:

```json
{
  "format": "ShallotWHAM-Module",
  "version": "2.0.0",
  "id": "module-id-kebab-case",
  "name": "MODULE NAME",
  "subtitle": "Short Tagline Describing Vibe",
  "author": "Author Name",
  "category": "Synthwave | Chiptune | Darkwave | Lo-Fi | Electronic | Fantasy | Custom",
  "description": "Comprehensive summary of the module's sound design and intended musical context.",
  "themeGlow": "#00e5ff",
  "tags": ["retro", "80s", "analog"],
  "leads": [ /* Array of exactly 8 Lead Preset Objects */ ],
  "basses": [ /* Array of exactly 8 Bass Preset Objects */ ],
  "pedalboard": {
    "lead": [ /* Array of 5 Lead Pedal Slot Objects */ ],
    "bass": [ /* Array of 5 Bass Pedal Slot Objects */ ]
  }
}
```

---

## 🎹 1. Preset Requirements & Naming Standards

### Strict Quantity
- Every module **MUST** contain exactly **8 Leads** (`leads.length === 8`) and **8 Basslines** (`basses.length === 8`).

### Display Label Standard
- The `label` property is rendered directly onto the 16 physical preset buttons on the synth faceplate.
- **Maximum Length**: **12 characters** (all uppercase).
- **Rule**: Must be punchy and clear without awkward truncation (e.g., `"ALICE LEAD"`, `"TRANCE SAW"`, `"303 ACID"`, `"SAD ROBOT"`).
- The `name` property provides the full descriptive title (e.g. `"ALICE PRACTICE LEAD SAW"`, max 32 chars).

---

## 🔊 2. Gain Staging & Loudness Normalization

A major reason why sound banks "suck" is erratic loudness—switching between a gentle sine wave and an unfiltered square wave can result in inaudible murmurs or ear-splitting digital clipping.

- **Normalized `volume` Property**: Every preset **MUST** specify a normalized `volume` coefficient between `0.4` and `1.0` (default `0.8`):
  - Pure Sine / Soft Triangle: `0.9` – `1.0`
  - Dual Sawtooth / Analog Brass: `0.7` – `0.85`
  - High-Resonance Squares / Squelchy Acid: `0.55` – `0.7`
  - Screaming / Distorted leads: `0.5` – `0.65`
- **Output Target**: When routed through the voice bus, peak levels for individual voices should settle around **-12dB to -6dB FS** before pedal processing, allowing clean headroom for drives and harmonizers without tripping the master limiter unnecessarily.

---

## 🎛️ 3. Lead Synth Architecture Standard

Each of the 8 lead presets in `leads` must provide expressive synthesis parameters:

| Field | Type | Range / Allowed Values | Description |
| :--- | :---: | :---: | :--- |
| `name` | string | 1 - 32 chars | Full descriptive patch name |
| `label` | string | 1 - 12 chars | Uppercase faceplate button label |
| `osc1` | string | `sawtooth`, `square`, `triangle`, `sine` | Primary oscillator waveform |
| `osc2` | string | `sawtooth`, `square`, `triangle`, `sine` | Secondary oscillator waveform |
| `osc2Octave` | number | `-2`, `-1`, `0`, `1`, `2` | Octave transposition for osc2 (default `0`) |
| `osc2Detune` | number | `0.98` - `1.03` or cents | Detuning ratio (e.g. `1.006` for rich chorused spread) |
| `oscMix` | number | `0.0` - `1.0` | Balance between osc1 and osc2 (default `0.5`) |
| `noiseMix` | number | `0.0` - `0.8` | White/percussive noise blend for texture or bite |
| `filterType` | string | `lowpass`, `bandpass`, `highpass`, `notch` | Biquad filter topology (default `lowpass`) |
| `cutoff` | number | `100` - `16000` Hz | Base filter cutoff frequency |
| `reso` | number | `0.2` - `14.0` | Filter resonance / Q factor |
| `filterEnv` | object | `{ attack, decay, sustain, amount }` | Dynamic filter envelope for plucks, brass, and sweeps |
| `attack` | number | `0.001` - `2.0` s | Amplitude attack time |
| `decay` | number | `0.01` - `3.0` s | Amplitude decay time (default `0.2`) |
| `sustain` | number | `0.0` - `1.0` | Amplitude sustain level (default `0.7`) |
| `release` | number | `0.01` - `3.0` s | Amplitude release time after key release |
| `vibrato` | object | `{ rate, depth, delay }` | Pitch LFO modulation (optional) |
| `glide` | number | `0.0` - `0.5` s | Portamento time between notes (optional) |
| `volume` | number | `0.4` - `1.0` | Gain staging level normalization |

### Dynamic Filter Envelope Standard
Stagnant filters sound lifeless. Presets **MUST** utilize `filterEnv`:
- **Snappy Plucks / Chiptune Drops**: `attack: 0.001`, `decay: 0.15`, `sustain: 0.1`, `amount: 3500`
- **80s Analog Brass**: `attack: 0.05`, `decay: 0.35`, `sustain: 0.4`, `amount: 2500`
- **Lush Ambient Pads**: `attack: 0.4`, `decay: 0.8`, `sustain: 0.8`, `amount: 1500`

---

## 🎚️ 4. Bassline Synth Architecture Standard

Each of the 8 bass presets in `basses` must provide punchy foundation parameters:

| Field | Type | Range / Allowed Values | Description |
| :--- | :---: | :---: | :--- |
| `name` | string | 1 - 32 chars | Full descriptive bass patch name |
| `label` | string | 1 - 12 chars | Uppercase faceplate button label |
| `oscType` | string | `sawtooth`, `square`, `triangle`, `sine` | Main bass oscillator waveform |
| `subType` | string | `sine`, `triangle`, `square`, `sawtooth` | Sub-oscillator waveform |
| `subOctave` | number | `-1`, `-2` | Sub-oscillator octave shift (default `-1`) |
| `subMix` | number | `0.1` - `1.0` | Sub-oscillator level ratio (default `0.5`) |
| `detune` | number | `1.001` - `1.03` | Unison detune spread for reese / fat basses |
| `cutoff` | number | `100` - `5000` Hz | Base filter cutoff |
| `reso` | number | `0.5` - `15.0` | Filter resonance / Q (high for acid 303 squelch) |
| `envMod` | number | `100` - `8000` Hz | Filter envelope mod depth |
| `decay` | number | `0.05` - `2.0` s | Filter envelope decay curve |
| `attack` | number | `0.001` - `0.1` s | Fast transient attack time |
| `pitchDrop` | boolean / num | `true`, `false`, or duration | 808-style pitch drop on key trigger |
| `volume` | number | `0.5` - `1.0` | Bass gain staging normalization |

---

## 🎸 5. Signature Pedalboard Standard

Every sound module **MUST** include a calibrated signature pedalboard for both Lead and Bass:
- **Chassis 0 (Slot 0)**: Drive / Fuzz / Preamp / Bitcrush (`ds1`, `proco-rat`, `big-muff`, `tube-screamer`, `french-preamp`, `decimator`).
- **Chassis 1 (Slot 1)**: Modulation (`small-stone`, `dimension-chorus`, `flanger`, `optical-tremolo`, `ring-mod`).
- **Chassis 2 (Slot 2)**: Filter / Pitch / Dynamics (`ps6`, `sidechain-pumper`, `mutron-wah`, `formant-filter`, `sid-resonator`).
- **Chassis 3 (Slot 3)**: Time & Delay (`space-echo`, `ping-pong`, `analog-delay`, `delay`, `glitch-delay`).
- **Chassis 4 (Slot 4)**: Space & Reverb (`cathedral-reverb`, `gated-plate`, `spring-reverb`, `reverb`, `cosmic-shimmer`).

### Signature Pairing Rules
1. **At least 1-2 pedals MUST be active by default** in both the Lead and Bass pedalboards to give the module an immediate genre identity.
2. Parameters must be musically tuned (e.g. mix levels between 25% - 60%, avoid 100% wet washes unless intended for drone ambient).
3. Cartridge IDs must strictly match known cartridges in `CARTRIDGE_CATALOG`.

---

## 🔍 6. Automated Validation & Quality Assurance

All modules are audited by the test suite:
```bash
node scripts/validate-modules.js
```

The validator verifies:
1. Valid JSON syntax & `ShallotWHAM-Module` header.
2. Exactly 8 leads and 8 basses.
3. LCD labels $\le 12$ uppercase characters.
4. Parameter sanity (cutoffs, Q values, envelope timing).
5. Volume gain staging within $[0.4, 1.0]$.
6. Valid pedalboard cartridges and parameters.
