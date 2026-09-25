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
- Web MIDI Controller input support.
- 1-Click WAV Recording & Audio Session Export.
- Step sequencer integration.

### [1.8.0] - 2026-09-24
#### Added
- **Flagship Sound Module: "WOLF" ("The Matter" by Faded Paper Figures)**:
  - Created official SWM v2.0 sound module `modules/wolf.swm` faithfully engineered from the sonic palette of the 2012 album *The Matter* by indietronica pioneers Faded Paper Figures.
  - **8 Expressive Lead Presets**:
    1. `SAN NARCISO` ("SAN NARCISO LEAD"): Anthemic dual-saw/square octave hook with cutting transient bite.
    2. `PILEDRIVE` ("PILEDRIVE BITE"): Sharp, aggressive resonant pulse lead with noise bite.
    3. `INFO RUNS` ("INFO RUNS PLUCK"): Ultra-snappy 16th-note bandpass digital pluck for fast arpeggiations.
    4. `HOLY SMOKE` ("HOLY SMOKE CHIME"): Luminous bell chime with gentle vibrato and sparkling overtones.
    5. `MAGELLAN` ("MY MAGELLAN SAW"): Singing dual-saw melodic lead with expressive vibrato and wide sustain.
    6. `FIRST SON` ("FIRST SON PROPHET"): Warm vintage analog brass-synth lead with rich sub-fundamental body.
    7. `AVIDA LEAD` ("AVIDA DISCO LEAD"): High-resonance squelchy art-pop hook with tight funk envelope.
    8. `PANTECHNE` ("PANTECHNE GLITCH"): Searing bandpass hyper-speed lead combining indie grit with digital bite.
  - **8 Punchy Bass Presets**:
    1. `NARCISO BASS` ("SAN NARCISO BASS"): Tight driving 16th-note staccato bass with punchy filter snap.
    2. `PILE PUNCH` ("PILEDRIVE PUNCH"): Heavy, aggressive forward-thrusting dance-rock bass with midrange bite.
    3. `CIRCUIT RUNS` ("CIRCUIT RUNS SUB"): Rounded sequencer sub-pulse that locks into high-speed arpeggios.
    4. `RELATIVELY` ("RELATIVELY GROOVE"): Rubbery, warm analog groove bass with singing melodic sustain.
    5. `MOON SUB` ("POINTING MOON SUB"): Cavernous, chest-rattling pure sub-bass weight.
    6. `AVIDA SQUELC` ("AVIDA DISCO SQUELCH"): Resonant 303-meets-Moroder squelch with sharp filter sweep.
    7. `SMOKE GROWL` ("HOLY SMOKE GROWL"): Dark, rumbling analog sub-octave growl with chorused spread.
    8. `DRIVER PULSE` ("DRIVER 16TH PULSE"): Relentless 16th-note square pulse for driving 128+ BPM indie-dance.
  - **Curated Signature Pedalboards**:
    - Lead Chain: French Preamp (warm analog drive) -> Dimension Chorus (spatial BBD width) -> Sidechain Pumper (rhythmic electro pump) -> Space Echo (tape delay flutter) -> Cosmic Shimmer (signature celestial shimmer-pop hall).
    - Bass Chain: Tube Screamer (midrange punch overdrive) -> Dimension Chorus -> Sidechain Pumper (4-on-the-floor glue) -> Analog Delay -> Room Reverb.
  - Promoted "WOLF" to flagship **Slot 1** default configuration.

#### Improved
- **Full Amplitude ADSR Envelope Synthesis Engine (`spawnLeadVoice` & `spawnBassVoice`)**:
  - Replaced former flat-sustain voice curves with true exponential ADSR amplitude envelopes.
  - Pluck, bell, and staccato patches now punch with realistic transient bite and decay down to their calibrated sustain levels (`sustainGain`) instead of droning indefinitely.
  - Bass voices now feature snappy, punchy amplitude and filter decay envelopes that eliminate low-end muddiness and lock into driving electro-pop rhythms.
  - Fixed detune oscillator pitch drop in `spawnBassVoice` so unison sub-oscillators stay phase-coherent.
- **Hardware Console Tone Manipulation Controls**:
  - Added live **LEAD DECAY** slider (0.01s - 2.0s) to the Lead Synth matrix, allowing real-time morphing between tight staccato plucks and singing sustain leads.
  - Added live **BASS ATTACK** slider (0.001s - 0.1s) to the Bassline Engine matrix for dialing in soft vs punchy transient bite.
  - Activated and connected **BASS DECAY** slider with real-time Web Audio filter and amplitude modulation.
  - Preset switching in both Lead and Bass now instantly updates all physical sliders (Cutoff, Reso, Attack, Decay, Release, Sub Mix) so the hardware controls match the preset's actual parameters.
  - Restored loaded module slot configuration persistence from `shallotwham_settings` in localStorage.

### [1.7.0] - 2026-09-22
#### Added
- **Boutique Stompbox Overhaul & Modular Pedalboard Redesign**:
  - Transformed flat generic pedal racks into rugged boutique flight cases with die-cast metal enclosures, recessed hardware fader channels, and corner hex-head screws.
  - **Dynamic Anodized Metal Finishes**: Each pedal automatically tints its chassis faceplate dynamically using `var(--pedal-accent)` with soft metallic edge bevels and neon underglow.
  - **3D Domed Jewel Indicator LEDs**: Photorealistic jewel lenses with chrome bezel rings, specular multi-stop highlights, and reactive neon bloom when engaged.
  - **Tactile 3PDT Chrome Stomp Switches**: Authentic heavy-duty concentric foot plungers with knurled hex nuts, active depression feedback (`:active`), and micro status readouts (`ENGAGED` / `BYPASS`).
  - **Recessed OLED Cartridge Selectors**: Custom micro-contrast digital nameplates with border containment, native arrow suppression, and high readability.
  - **Hardware Channel Strip Faders**: Precision-grooved sliders with brushed metal knurled caps, accent indicators, and strict 100% chassis width containment (preventing browser native rail overflow).
  - **First-Boot & Persistence Restoration**: Added automated pedalboard UI rendering on app launch and settings restoration from `shallotwham_pedalboards` localStorage.

#### Fixed
- **Synthesizer Instrument Keyboard Engine Triggering**:
  - Restored full polyphonic voice triggering for Lead (Rows 0 & 1, keys `1`–`=` and `Q`–`\`) and Bassline (Rows 2 & 3, keys `A`–`'` and `Z`–`/`).
  - Re-routed active oscillator signals through dynamic ADSR envelopes, filter modulation nodes, and voice bus summers.
  - Added real-time visual polyphony indicators across active notes and visualizer canvas.

### [1.6.0] - 2026-09-22
#### Added
- **Official Sound Module Standards Specification (SWM v2.0)**:
  - Formally specified in `MODULE_STANDARDS.md`.
  - Standardized schema for metadata, dual 8-patch matrices (8 Leads + 8 Basses), gain staging normalization, and curated signature pedalboards.
  - **Dynamic Filter ADSR Envelopes**: Added `filterEnv` (attack, decay, sustain, modulation depth) providing punchy brass, snappy plucks, acid squelches, and ambient sweeps.
  - **Enhanced Oscillator Capabilities**: Added `osc2Octave` (-2 to +2), `oscMix` balance, and `noiseMix` per voice for analog breath, vintage hiss, and percussive 8-bit transients.
  - **Perceptual Loudness Normalization**: Every preset specifies a calibrated `volume` coefficient (0.4 to 1.0) to eliminate volume jumps and digital clipping between patches.
  - **Faceplate Label Constraints**: Strict $\le 12$ uppercase character requirement for crisp, unclipped LCD button readouts.
  - **Signature Pedalboard Standard**: Every module includes tailored, active signature stompboxes (e.g. Dimension Chorus, Tape Delay, Sidechain Pumper, SID Acid) that load automatically with the sound bank.
- **Automated Module Validator (`scripts/validate-modules.js`)**:
  - Comprehensive CLI verification tool that audits all `.swm` files for JSON structure, audio frequency boundaries (20Hz-20kHz), filter resonance safety, envelope timings, gain normalization, and pedalboard cartridge validity.
  - Integrated into `npm test` and `scripts/create-module.js`.
- **Full Remaster of All 10 Official Sound Banks (160 Presets Total)**:
  - Remastered `synthwave.swm`, `crystal-castles.swm`, `8bit-arcade.swm`, `pornophonique-sad-robot.swm`, `daft-punk.swm`, `kraftwerk.swm`, `dungeon-synth.swm`, `depeche-mode.swm`, `vaporwave-dreams.swm`, and `user-custom.swm` to 100% SWM v2.0 compliance with zero errors and zero warnings.

#### Fixed
- **Restored Voice Generation & Note Handlers in `app.js`**:
  - Resolved missing `spawnLeadVoice`, `spawnBassVoice`, `handleKeyDown`, `handleKeyUp`, `releaseVoice`, and `getHarmonizedFrequencies` functions.
  - Fixed pedalboard slot mismatch in `crystal-castles`, `synthwave`, and `user-custom` where `decimator` was assigned to the modulation chassis instead of the drive chassis.
  - Restored real-time polyphony counter updates (`[VOICES: X/4]`).

---

### [1.5.0] - 2026-09-20
#### Added
- **Modular Pedal System ("Modules Within Modules")**:
  - Replaced fixed, hardcoded 5-pedal stompboxes with **10 hot-swappable modular chassis** (5 for Lead, 5 for Bass).
  - **26 Swappable DSP Cartridges** categorized into 5 chassis slots:
    - **Chassis 0 (Drive / Fuzz / Preamp / Crunch)**: `DS-1 DIST` (orange hard clip), `PROCO RAT` (silicon squelch), `BIG MUFF` (scooped mid fuzz), `TUBE SCREAM` (analog mid hump), `FRENCH PRE` (warm console saturation), `DECIMATOR` (bitcrusher / downsampler).
    - **Chassis 1 (Modulation)**: `SMALL STONE` (4-stage vintage phaser), `DIMENSION D` (spatial BBD chorus), `BBD FLANGER` (metallic comb jet sweep), `OPTIC TREM` (photocell tremolo), `RING MOD` (carrier bell multiplier).
    - **Chassis 2 (Filter / Pitch / Dynamics)**: `PS-6 HARM` (intelligent diatonic harmonizer), `SC PUMPER` (rhythmic French touch ducking compressor), `MUTRON WAH` (envelope follower funk filter), `TALKBOX` (dual formant vowel resonator), `SID ACID` (C64 acid ladder filter).
    - **Chassis 3 (Time / Delay)**: `SPACE ECHO` (analog tape saturation & flutter delay), `PING PONG` (stereo cross-bounce delay), `BBD DELAY` (dark bucket-brigade delay), `STD DELAY` (crisp digital stereo delay), `GLITCH DLY` (granular buffer stutter).
    - **Chassis 4 (Space / Reverb)**: `CATHEDRAL` (4.5s massive ambient hall), `GATED PLATE` (80s punchy gated plate), `SPRING REV` (metallic tension tank), `ROOM REV` (studio room convolver), `SHIMMER` (octave-up celestial shimmer).
  - **Dynamic Faceplate Morpher**: Selecting a cartridge dynamically updates the chassis faceplate border glow to the pedal's signature color and instantiates tailored knob sliders with real-time numeric readouts.
  - **Automatic Sound Bank Pedalboard Sync**: All 10 sound modules (`.swm`) ship with tailored signature pedalboards that auto-load on sound bank selection.
  - **Individual Footswitch Bypass**: Every chassis includes an authentic stomper button with real-time LED glow.
  - **Master FX Bypass**: Global `[FX: MASTER]` / `[FX: BYPASS]` toggle allows instantaneous A/B comparison.
  - **Permanent Pedalboard Persistence**: User customized pedal selections and knob settings serialize into `shallotwham_pedalboards` in `localStorage`.
  - **100% Clean Audio Architecture**: Zero console errors, automated node cleanup on hot-swap, and full dual-theme support (Shallot Plum & Cyber Neon).

---

### [1.4.0] - 2026-09-20
#### Added
- **5-Slot Loadable Sound Module Architecture**:
  - Replaced fixed, hardcoded sound banks with an expandable 5-slot modular system (`[1: SYNTHWAVE]`, `[2: CRYSTAL CASTLES]`, `[3: 8-BIT ARCADE]`, `[4: SAD ROBOT]`, `[5: USER PATCHES]`).
  - Hotkeys `Alt+1` through `Alt+5` for instantaneous switching between module slots during live performance.
  - Dedicated `[📂 MODULES]` Sound Module Manager modal allowing users to map any module to any slot, drag-and-drop `.swm` files, inspect module details, and export customized sound banks.
  - Module presets and active slot configurations fully persist across app restarts via `localStorage`.
- **Proprietary Sound Module File Format (`.swm`)**:
  - Standardized JSON specification with `shallotwham_module_v1` format identifier, metadata (author, version, description, category, tags), and complete definitions for 8 leads and 8 basslines.
  - Includes `[EXPORT .SWM]` and `[IMPORT .SWM]` buttons directly in the top sound bank bar for frictionless patch exchange.
  - Packaged default `.swm` files in `modules/`: `synthwave.swm`, `crystal-castles.swm`, `8bit-arcade.swm`, `pornophonique-sad-robot.swm`, and `user-custom.swm`.
- **New Official Sound Module: Pornophonique "Sad Robot"**:
  - Inspired by the iconic German bitpop duo Pornophonique and their melancholic anthem *"Sad Robot"* from *8-bit lagerfeuer*.
  - Authentic Commodore 64 (SID 6581) and Nintendo Game Boy (LSDJ) sound design:
    - **8 Leads**: `Sad Robot Solo`, `LSDJ Crying Arp`, `Lagerfeuer Pluck`, `Robot Formant`, `Lonely Pulse`, `C64 Dirty Crunch`, `Sad Bent Chirp`, `SID Octave Hop`.
    - **8 Basses**: `Game Boy Wave Sub`, `Campfire Bass`, `SID Acid 6581`, `Robot Heartbeat`, `Noise Chip Perc`, `8-Bit Reese`, `Melancholy Acid`, `Power Down Drop`.
- **Sound Bank Vault (Library Browser & 1-Click Slotting)**:
  - Added an interactive **Sound Bank Vault** browser inside the Module Manager featuring real-time keyword search, author/category badges, and quick-slot buttons `[1]`, `[2]`, `[3]`, `[4]`, `[5]`.
  - 1-click instant slot assignment: click any number on a sound bank card to immediately map it to that slot and update the workstation.
  - Active slot stars indicate which slots currently hold that module.
  - Automatic permanent persistence: any `.swm` module file dropped or imported is permanently added to the user's local Library Vault (`shallotwham_custom_library` in `localStorage`).
- **5 New Official Sound Bank Modules (10 Modules / 160 Presets Total)**:
  - **Daft Punk** (`modules/daft-punk.swm`): French house, talkbox saws, Aerodynamic leads, and Around The World / Da Funk basslines.
  - **Kraftwerk** (`modules/kraftwerk.swm`): Minimalist electronic, Kling Klang sine leads, Pocket Calculator, Computer World blips, and Trans-Europe pulse.
  - **Dungeon Synth** (`modules/dungeon-synth.swm`): Medieval lo-fi fantasy, Castlevania cathedral organs, forest flutes, sorcerer chimes, and crypt bass.
  - **Depeche Mode** (`modules/depeche-mode.swm`): Dark 80s synthpop, Enjoy the Silence saws, Personal Jesus leads, Strangelove bells, and Policy of Truth bass.
  - **Vaporwave Dreams** (`modules/vaporwave-dreams.swm`): Late-night mallsoft, DX7 e-pianos, Macintosh flutes, Windows 95 glow, and slushwave sub bass.
- **IDE Sound Module Tooling**:
  - `scripts/create-module.js`: Automated schema validator and generator for rapid sound module authoring directly within the IDE.
  - `scripts/sync-modules.js`: Instant synchronization tool compiling all `.swm` files into the core engine library.
- **Quality of Life & Emergency Controls**:
  - **Panic Killswitch (`[🚨 PANIC]` / `ESC`)**: Instant one-touch cutoff that terminates all active oscillators, cleans up orphan voices, stops the arpeggiator, and wipes keyboard highlights.
  - **Live Polyphony Voice Counter**: Real-time `[VOICES: 0/4]` readout tracking active hardware oscillator allocation.
  - **Audio Pre-Warming**: Pre-emptively initializes and resumes the Web Audio context on the first `touchstart`, `keydown`, or `click` event, eliminating initial audio delay.

#### Changed & Performance Optimizations
- **Latency Overhaul**:
  - Slashed bitcrusher ScriptProcessor buffer size from `2048` (~46.4ms) down to `256` (~5.8ms), reducing DSP processing latency by over **87%**.
  - Replaced DOM-querying keyboard Lookups (`document.getElementById`) with pre-computed $O(1)$ key element maps (`KEY_CACHE`, `KEY_ELEMENTS`), completely eliminating layout thrashing and DOM reflows during rapid polyphonic chord playing.
  - Added `AudioContext({ latencyHint: "interactive" })` for lowest possible buffer latency supported by the underlying OS audio driver.
  - Spawning voice functions now read cached runtime settings directly from memory rather than querying form elements on every note attack.
- **Safety & Audio Dynamics**:
  - Added brickwall `DynamicsCompressorNode` (`masterLimiter`) right before the hardware DAC destination to ensure zero digital clipping and artifact-free high-polyphony playback.
- **Dual Theme Polishing**:
  - Full module manager, panic button, polyphony counter, and slot UI styled in both flagship **Shallot Plum & Warm Copper Glow** and **Cyber Neon**.

---

### [1.3.0] - 2026-09-02
#### Added
- **Individual Instrument Volume Controls (`LEAD VOL` & `BASS VOL`)**:
  - Dedicated `LEAD VOL` slider added to the Lead Synth matrix with live percentage readout.
  - Interactive quick-mute button `[M]` on both Lead and Bass instruments for instant soloing and A/B balance testing.
  - Dedicated `BASS DECAY` slider added to the Bassline Engine matrix for precise acid squelch vs. booming tail shaping.
  - Preserved `MASTER VOL:` in the top header with live numerical badge and global audio bus authority.
- **Broad-Spectrum Perceptual Audio Taper**:
  - Replaced flat linear volume scaling with true exponential/logarithmic perceptual tapers ($gain = (vol/100)^2 \times headroom$).
  - Delivers a massive, expressive dynamic range from subtle ambient whispers (10-20%) to punchy, full-frequency drive (80-100%).
- **Filter Envelope & Timbre De-Muffling**:
  - Replaced hardcoded uniform 0.18s filter decay with intelligent, patch-aware envelope dynamics.
  - Sustained saw, brass, chiptune, and voco patches now retain their open harmonic brilliance and user-selected cutoff frequency without being forced into an identical dull decay.
  - Plucks and acid patches retain snappy, crisp transient attacks.
#### Changed
- **Removed Pedal Keyboard Hotkeys**:
  - Eliminated keyboard hotkey shortcuts and cluttered binding badges (`F1`-`F4`, `F9`-`F11`, `\`, `` ` ``) from all 10 Lead and Bass effect pedals.
  - Resolved key collision where key `8` (`Digit8`, note D4) was intercepted by the Bass Harmonizer.
  - Restored clean, centered `ON/OFF` physical stompbox styling to all pedal footswitches with reliable click toggle and glowing LED state feedback.
  - Preserved octave shift hotkeys (`F5`-`F8`) on keyboard headers.

---

### [1.2.0] - 2026-09-02
#### Added
- **Multi-Bank Sound Architecture (4 Sound Banks)**:
  - **Bank 1 (Synthwave)**: The classic 8 Lead & 8 Bass synth presets.
  - **Bank 2 (Crystal Castles)**: 16 chiptune/glitch presets accurately modeled after Crystal Castles tracks:
    - *Leads*: `ALICE PRACTICE`, `CRIMEWAVE LEAD`, `UNTRUST US ARP`, `COURTSHIP DATING`, `BAPTISM SAW`, `SUFFOCATION CHIP`, `CELESTICA CHIME`, `AIR WAR VOCO`.
    - *Basses*: `TRASH 8-BIT SUB`, `DOE DEER GLITCH`, `VANISHED C64`, `BLACK PANTHER`, `EMPATHY SUB`, `PAP SMEAR ACID`, `PLAGUE SLAP`, `BENT PITCH DROP`.
  - **Bank 3 (8-Bit Arcade & LSDJ)**: Retro NES, Game Boy, and SID 6581 sound generator presets.
  - **Bank 4 (User Custom Patches)**: 8 custom patch slots with `SAVE PATCH` support.
  - Full **Export / Import** functionality to backup and restore sound banks as `.json` or `.shallotpatch` files.
- **Decimator / Bitcrusher Mini-Pedal**:
  - Added dedicated 5th stompbox pedal to both Lead and Bass pedalboards.
  - Variable bit depth quantization (2-bit to 16-bit), decimation downsampling (2kHz to 44.1kHz), and dry/wet mix controls.
  - Interactive footswitch with glowing LED status indicator and keybind support (`F11` for Lead Decimator, `F2` for Bass Crush).
- **Hardware Chiptune Arpeggiator**:
  - Ultra-fast **60Hz Chip Chord** mode cycling root, minor/major 3rd, 5th, and octave every 16.6ms to emulate SID 6581 and NES hardware arpeggios.
  - Multiple musical divisions: `1/16th`, `1/32nd`, `Octave-Hop`, and `Random Glitch`.
  - Dedicated **HOLD / LATCH** button for continuous performance.
- **Master FX Bypass Switch**:
  - Global `FX: MASTER` / `FX: BYPASS` toggle with instantaneous audio routing bypass and visual alert styling.
- **Dual-Theme Fidelity**:
  - Fully styled the Sound Bank bar, Decimator stompboxes, and Arpeggiator controls across both **Shallot Plum & Warm Copper Glow** and **Cyber Neon** themes.

---

### [1.1.0] - 2026-09-02
#### Added
- **Shallot Plum & Warm Copper Glow Theme System**:
  - Brought in the signature **Shallot Plum** design tokens (`shallot-theme.css`, `shallot-theme.json`, and `THEME.md`) from the Shallot Money app.
  - Deep Velvet Plum background (`#180d21`), elevated card & console surfaces (`#261533`), warm copper glows (`#d48244`), and golden core highlights (`#f39c12`).
  - Added royal plum wooden side cheeks (`#5a2e76`) to the dual-instrument synthesizer chassis.
  - Adapted the keyboard interface with velvet plum key caps, copper lead key activations, and gold bass key activations.
  - Dynamic oscilloscope visualizer that automatically renders in warm glowing copper over deep plum when Shallot Plum theme is active.
- **Interactive Theme Switcher**:
  - Added header theme switcher toggling between **Shallot Plum & Copper Glow** (`shallot-plum`) and **Cyber Neon** (`cyber`).
  - Integrated theme preference persistence in `appSettings` and `localStorage` (`shallotwham_settings`).
  - Included `Outfit` typography from the Shallot ecosystem.

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
