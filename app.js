// ShallotWHAM SYNTH STATION CORE
const NOTES = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];

// Key layouts
const ROW0_KEYS = ["Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Digit0", "Minus", "Equal"];
const ROW1_KEYS = ["KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP", "BracketLeft", "BracketRight"];
const ROW2_KEYS = ["KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon", "Quote"];
const ROW3_KEYS = ["KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Comma", "Period", "Slash"];

const ROW0_CHAR = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="];
const ROW1_CHAR = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]"];
const ROW2_CHAR = ["A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'"];
const ROW3_CHAR = ["Z", "X", "C", "V", "B", "N", "M", ",", ".", "/"];

// State Variables
let audioCtx = null;
let masterGain = null;
let analyser = null;
let masterLimiter = null;
let tremoloNode = null;
let leadVoiceBus = null;
let leadMasterGain = null;
let bassVoiceBus = null;
let bassMasterGain = null;

// Audio Taper Gain Staging Calculation (Logarithmic Perception Curve)
function getAudioTaperGain(val, maxGain = 1.0) {
    if (val === undefined || val === null) return maxGain;
    if (val <= 0) return 0.0;
    const norm = Math.max(0, Math.min(100, val)) / 100;
    return Math.pow(norm, 1.8) * maxGain;
}

// Modular 5-Slot Instrument Pedalboards
let leadPedalSlots = [
    { instrument: "lead", slotIdx: 0, chassis: 0, cartridgeId: "tube-screamer", active: false, params: { drive: 45, tone: 2000, level: 70 }, dsp: null, slotInput: null, slotOutput: null, dryGain: null, wetGain: null },
    { instrument: "lead", slotIdx: 1, chassis: 1, cartridgeId: "dimension-chorus", active: false, params: { mode: 3, width: 75, mix: 55 }, dsp: null, slotInput: null, slotOutput: null, dryGain: null, wetGain: null },
    { instrument: "lead", slotIdx: 2, chassis: 2, cartridgeId: "ps6", active: false, params: { interval: 0, mix: 50 }, dsp: null, slotInput: null, slotOutput: null, dryGain: null, wetGain: null },
    { instrument: "lead", slotIdx: 3, chassis: 3, cartridgeId: "space-echo", active: false, params: { time: 360, intensity: 45, flutter: 40, mix: 45 }, dsp: null, slotInput: null, slotOutput: null, dryGain: null, wetGain: null },
    { instrument: "lead", slotIdx: 4, chassis: 4, cartridgeId: "cathedral-reverb", active: false, params: { decay: 4.2, damping: 30, mix: 55 }, dsp: null, slotInput: null, slotOutput: null, dryGain: null, wetGain: null }
];

let bassPedalSlots = [
    { instrument: "bass", slotIdx: 0, chassis: 0, cartridgeId: "french-preamp", active: false, params: { drive: 60, warmth: 65, output: 75 }, dsp: null, slotInput: null, slotOutput: null, dryGain: null, wetGain: null },
    { instrument: "bass", slotIdx: 1, chassis: 1, cartridgeId: "small-stone", active: false, params: { rate: 0.6, depth: 75, feedback: 40 }, dsp: null, slotInput: null, slotOutput: null, dryGain: null, wetGain: null },
    { instrument: "bass", slotIdx: 2, chassis: 2, cartridgeId: "mutron-wah", active: false, params: { peak: 70, drive: 50, range: 1800 }, dsp: null, slotInput: null, slotOutput: null, dryGain: null, wetGain: null },
    { instrument: "bass", slotIdx: 3, chassis: 3, cartridgeId: "analog-delay", active: false, params: { time: 260, feedback: 35, mix: 35 }, dsp: null, slotInput: null, slotOutput: null, dryGain: null, wetGain: null },
    { instrument: "bass", slotIdx: 4, chassis: 4, cartridgeId: "reverb", active: false, params: { decay: 2.2, mix: 50 }, dsp: null, slotInput: null, slotOutput: null, dryGain: null, wetGain: null }
];

// Pitch bend range state (controlled by Xbox RT/RB and LT/LB)
let pitchBendOctavesUp = 1;
let pitchBendOctavesDown = 1;

// Global settings configuration object
let appSettings = {
    row0Root: "G",
    row0Octave: 3,
    row1Root: "D",
    row2Root: "G",
    row3Root: "D",
    row1Octave: 3,
    row2Octave: 2,
    row3Octave: 2,
    synthVolume: 75,
    // Dedicated Lead Synth Settings
    leadPreset: 0,
    leadCutoff: 3500,
    leadResonance: 1.5,
    leadAttack: 0.01,
    leadDecay: 0.25,
    leadRelease: 0.25,
    // Dedicated Bassline Instrument Settings
    bassPreset: 0,
    bassCutoff: 1200,
    bassResonance: 6.0,
    bassSubLevel: 50,
    bassAttack: 0.005,
    bassDecay: 0.25,
    bassVolume: 85,
    // Lead Mini Pedal FX Settings
    leadDS1Active: false,
    leadDS1Dist: 50,
    leadDS1Tone: 2500,
    leadDS1Level: 65,
    leadPS6Active: false,
    leadPS6Key: "C",
    leadPS6Scale: "major",
    leadPS6Interval: "3rd",
    leadPS6Mix: 50,
    leadDelayActive: false,
    leadDelayTime: 380,
    leadDelayFeedback: 40,
    leadDelayMix: 45,
    leadReverbActive: false,
    leadReverbMix: 55,
    // Bass Mini Pedal FX Settings
    bassDS1Active: false,
    bassDS1Dist: 45,
    bassDS1Tone: 900,
    bassDS1Level: 70,
    bassPS6Active: false,
    bassPS6Key: "C",
    bassPS6Scale: "minor",
    bassPS6Interval: "oct-down",
    bassPS6Mix: 60,
    bassDelayActive: false,
    bassDelayTime: 280,
    bassDelayFeedback: 30,
    bassDelayMix: 35,
    bassReverbActive: false,
    bassReverbMix: 40,
    // Polyphony settings (1-6 range)
    leadPolyphony: 4,
    bassPolyphony: 3
};

// Lead Preset Templates (Rows 0 & 1 Dedicated Pro Engine)
// ====================================================
// PROPRIETARY SOUND MODULE LIBRARY & 5-SLOT ARCHITECTURE
// ====================================================
const MODULE_LIBRARY = {
    "8bit-arcade": {
        "format": "ShallotWHAM-Module",
        "version": "2.0.0",
        "id": "8bit-arcade",
        "name": "8-BIT ARCADE",
        "subtitle": "NES, Game Boy & Commodore 64",
        "author": "Shallot",
        "category": "Chiptune",
        "description": "Classic retro video game synthesis featuring NES 25% pulse waves, Game Boy wavetable bass, SID 6581 ring mod leads, and high-speed chip chord arps.",
        "themeGlow": "#22c55e",
        "tags": [
            "8bit",
            "arcade",
            "nes",
            "gameboy",
            "c64",
            "sid6581"
        ],
        "leads": [
            {
                "name": "NES LEAD PULSE",
                "label": "NES PULSE",
                "osc1": "square",
                "osc2": "square",
                "osc2Octave": 0,
                "osc2Detune": 1.003,
                "oscMix": 0.5,
                "filterType": "lowpass",
                "cutoff": 9000,
                "reso": 1,
                "attack": 0.001,
                "release": 0.12,
                "volume": 0.8
            },
            {
                "name": "GAME BOY LEAD",
                "label": "GAMEBOY LEAD",
                "osc1": "square",
                "osc2": "triangle",
                "osc2Octave": 0,
                "osc2Detune": 1.005,
                "oscMix": 0.45,
                "filterType": "lowpass",
                "cutoff": 7000,
                "reso": 1.5,
                "attack": 0.001,
                "release": 0.14,
                "volume": 0.82
            },
            {
                "name": "SID 6581 LEAD",
                "label": "SID LEAD",
                "osc1": "sawtooth",
                "osc2": "triangle",
                "osc2Octave": 1,
                "osc2Detune": 1.01,
                "oscMix": 0.55,
                "filterType": "lowpass",
                "cutoff": 4800,
                "reso": 5.5,
                "filterEnv": {
                    "attack": 0.002,
                    "decay": 0.22,
                    "sustain": 0.35,
                    "amount": 3000
                },
                "attack": 0.002,
                "release": 0.22,
                "volume": 0.82
            },
            {
                "name": "CHIP CHORD ARP",
                "label": "CHIP ARP",
                "osc1": "square",
                "osc2": "square",
                "osc2Octave": 1,
                "osc2Detune": 1.001,
                "oscMix": 0.5,
                "filterType": "lowpass",
                "cutoff": 8500,
                "reso": 2,
                "attack": 0.001,
                "release": 0.08,
                "arp": "chip60",
                "volume": 0.78
            },
            {
                "name": "ARCADE JUMP BLIP",
                "label": "JUMP BLIP",
                "osc1": "triangle",
                "osc2": "square",
                "osc2Octave": 1,
                "osc2Detune": 1.002,
                "oscMix": 0.4,
                "filterType": "lowpass",
                "cutoff": 6000,
                "reso": 3.5,
                "filterEnv": {
                    "attack": 0.001,
                    "decay": 0.1,
                    "sustain": 0,
                    "amount": 4500
                },
                "attack": 0.001,
                "release": 0.1,
                "volume": 0.86
            },
            {
                "name": "MEGA MAN SHOT",
                "label": "MEGA SHOT",
                "osc1": "square",
                "osc2": "sawtooth",
                "osc2Octave": 0,
                "osc2Detune": 1.008,
                "oscMix": 0.6,
                "noiseMix": 0.08,
                "filterType": "lowpass",
                "cutoff": 7200,
                "reso": 4,
                "filterEnv": {
                    "attack": 0.001,
                    "decay": 0.12,
                    "sustain": 0.1,
                    "amount": 3500
                },
                "attack": 0.001,
                "release": 0.12,
                "volume": 0.8
            },
            {
                "name": "CASTLEVANIA SAW",
                "label": "CASTLEVANIA",
                "osc1": "sawtooth",
                "osc2": "sawtooth",
                "osc2Octave": 0,
                "osc2Detune": 1.006,
                "oscMix": 0.5,
                "filterType": "lowpass",
                "cutoff": 4500,
                "reso": 3.2,
                "filterEnv": {
                    "attack": 0.01,
                    "decay": 0.3,
                    "sustain": 0.4,
                    "amount": 2200
                },
                "attack": 0.01,
                "release": 0.3,
                "volume": 0.82
            },
            {
                "name": "1-UP FANFARE",
                "label": "1-UP FANFARE",
                "osc1": "square",
                "osc2": "triangle",
                "osc2Octave": 1,
                "osc2Detune": 1.002,
                "oscMix": 0.4,
                "filterType": "lowpass",
                "cutoff": 8000,
                "reso": 2.5,
                "attack": 0.002,
                "release": 0.18,
                "volume": 0.85
            }
        ],
        "basses": [
            {
                "name": "NES TRIANGLE SUB",
                "label": "NES TRI SUB",
                "oscType": "triangle",
                "subType": "sine",
                "subOctave": -1,
                "subMix": 0.5,
                "cutoff": 800,
                "reso": 1.5,
                "envMod": 600,
                "decay": 0.35,
                "attack": 0.005,
                "volume": 0.95
            },
            {
                "name": "SEGA FM BASS",
                "label": "SEGA FM",
                "oscType": "triangle",
                "subType": "square",
                "subOctave": -1,
                "subMix": 0.45,
                "cutoff": 2400,
                "reso": 5.5,
                "envMod": 3400,
                "decay": 0.2,
                "attack": 0.001,
                "volume": 0.88
            },
            {
                "name": "FAT 8-BIT REESE",
                "label": "8-BIT REESE",
                "oscType": "sawtooth",
                "subType": "sawtooth",
                "subOctave": -1,
                "subMix": 0.6,
                "detune": 1.02,
                "cutoff": 1500,
                "reso": 3.5,
                "envMod": 1400,
                "decay": 0.45,
                "attack": 0.01,
                "volume": 0.85
            },
            {
                "name": "PAC-MAN WOBBLE",
                "label": "PAC WOBBLE",
                "oscType": "square",
                "subType": "triangle",
                "subOctave": -1,
                "subMix": 0.7,
                "cutoff": 1200,
                "reso": 7.5,
                "envMod": 2200,
                "decay": 0.24,
                "attack": 0.005,
                "volume": 0.82
            },
            {
                "name": "GAME OVER DROP",
                "label": "GAME OVER",
                "oscType": "sine",
                "subType": "square",
                "subOctave": -1,
                "subMix": 0.9,
                "pitchDrop": true,
                "cutoff": 550,
                "reso": 2,
                "envMod": 900,
                "decay": 0.7,
                "attack": 0.01,
                "volume": 0.95
            },
            {
                "name": "C64 SID ACID",
                "label": "SID ACID",
                "oscType": "sawtooth",
                "subType": "square",
                "subOctave": -1,
                "subMix": 0.5,
                "cutoff": 1600,
                "reso": 7.5,
                "envMod": 2900,
                "decay": 0.26,
                "attack": 0.002,
                "volume": 0.85
            },
            {
                "name": "MARIO UNDERGROUND",
                "label": "UNDERGROUND",
                "oscType": "triangle",
                "subType": "triangle",
                "subOctave": -1,
                "subMix": 0.6,
                "cutoff": 900,
                "reso": 2.5,
                "envMod": 1000,
                "decay": 0.3,
                "attack": 0.005,
                "volume": 0.92
            },
            {
                "name": "BOSS BATTLE DROP",
                "label": "BOSS DROP",
                "oscType": "sine",
                "subType": "sawtooth",
                "subOctave": -1,
                "subMix": 0.75,
                "pitchDrop": true,
                "cutoff": 650,
                "reso": 3,
                "envMod": 1100,
                "decay": 0.55,
                "attack": 0.005,
                "volume": 0.95
            }
        ],
        "pedalboard": {
            "lead": [
                {
                    "slot": 0,
                    "cartridge": "decimator",
                    "active": true,
                    "params": {
                        "bits": 6,
                        "rate": 35,
                        "mix": 65
                    }
                },
                {
                    "slot": 1,
                    "cartridge": "flanger",
                    "active": false,
                    "params": {
                        "speed": 1,
                        "depth": 60,
                        "regen": 45
                    }
                },
                {
                    "slot": 2,
                    "cartridge": "sid-resonator",
                    "active": true,
                    "params": {
                        "cutoff": 3500,
                        "squelch": 65,
                        "decay": 0.2
                    }
                },
                {
                    "slot": 3,
                    "cartridge": "glitch-delay",
                    "active": false,
                    "params": {
                        "size": 100,
                        "feedback": 40,
                        "jitter": 50,
                        "mix": 40
                    }
                },
                {
                    "slot": 4,
                    "cartridge": "spring-reverb",
                    "active": true,
                    "params": {
                        "tension": 60,
                        "decay": 1.8,
                        "mix": 40
                    }
                }
            ],
            "bass": [
                {
                    "slot": 0,
                    "cartridge": "decimator",
                    "active": true,
                    "params": {
                        "bits": 8,
                        "rate": 28,
                        "mix": 55
                    }
                },
                {
                    "slot": 1,
                    "cartridge": "optical-tremolo",
                    "active": false,
                    "params": {
                        "rate": 5,
                        "depth": 50,
                        "shape": "square"
                    }
                },
                {
                    "slot": 2,
                    "cartridge": "sid-resonator",
                    "active": true,
                    "params": {
                        "cutoff": 1600,
                        "squelch": 75,
                        "decay": 0.22
                    }
                },
                {
                    "slot": 3,
                    "cartridge": "analog-delay",
                    "active": false,
                    "params": {
                        "time": 200,
                        "feedback": 25,
                        "mix": 25
                    }
                },
                {
                    "slot": 4,
                    "cartridge": "spring-reverb",
                    "active": false,
                    "params": {
                        "tension": 45,
                        "decay": 1.4,
                        "mix": 30
                    }
                }
            ]
        }
    },
    "crystal-castles": {
        "format": "ShallotWHAM-Module",
        "version": "2.0.0",
        "id": "crystal-castles",
        "name": "CRYSTAL CASTLES",
        "subtitle": "Authentic Glitch & Chiptune Noise",
        "author": "Shallot",
        "category": "Chiptune",
        "description": "Raw Game Boy glitch saws, pierced square screams, lo-fi noise bursts, and heavy trash subs modeled after Crystal Castles (Alice Practice, Crimewave, Untrust Us).",
        "themeGlow": "#a855f7",
        "tags": [
            "crystal-castles",
            "chiptune",
            "glitch",
            "lo-fi",
            "noise",
            "witch-house"
        ],
        "leads": [
            {
                "name": "ALICE PRACTICE SAW",
                "label": "ALICE SAW",
                "osc1": "sawtooth",
                "osc2": "square",
                "osc2Octave": 0,
                "osc2Detune": 1.025,
                "oscMix": 0.6,
                "noiseMix": 0.12,
                "filterType": "lowpass",
                "cutoff": 5200,
                "reso": 6.5,
                "filterEnv": {
                    "attack": 0.001,
                    "decay": 0.22,
                    "sustain": 0.3,
                    "amount": 4000
                },
                "attack": 0.001,
                "release": 0.2,
                "volume": 0.8
            },
            {
                "name": "CRIMEWAVE PULSE",
                "label": "CRIMEWAVE",
                "osc1": "square",
                "osc2": "square",
                "osc2Octave": 1,
                "osc2Detune": 1.008,
                "oscMix": 0.5,
                "filterType": "lowpass",
                "cutoff": 6500,
                "reso": 3.5,
                "filterEnv": {
                    "attack": 0.002,
                    "decay": 0.25,
                    "sustain": 0.5,
                    "amount": 3500
                },
                "attack": 0.002,
                "release": 0.22,
                "volume": 0.82
            },
            {
                "name": "UNTRUST US CHORD",
                "label": "UNTRUST US",
                "osc1": "sawtooth",
                "osc2": "triangle",
                "osc2Octave": 0,
                "osc2Detune": 1.015,
                "oscMix": 0.55,
                "filterType": "bandpass",
                "cutoff": 2400,
                "reso": 7,
                "filterEnv": {
                    "attack": 0.005,
                    "decay": 0.35,
                    "sustain": 0.2,
                    "amount": 2000
                },
                "attack": 0.005,
                "release": 0.3,
                "volume": 0.82
            },
            {
                "name": "DOE DEER SCREAM",
                "label": "DOE DEER",
                "osc1": "square",
                "osc2": "sawtooth",
                "osc2Octave": 1,
                "osc2Detune": 1.03,
                "oscMix": 0.7,
                "noiseMix": 0.2,
                "filterType": "lowpass",
                "cutoff": 8000,
                "reso": 8.5,
                "filterEnv": {
                    "attack": 0.001,
                    "decay": 0.15,
                    "sustain": 0.4,
                    "amount": 5000
                },
                "attack": 0.001,
                "release": 0.15,
                "volume": 0.75
            },
            {
                "name": "VANISHED ARPEGGIO",
                "label": "VANISHED",
                "osc1": "triangle",
                "osc2": "square",
                "osc2Octave": 1,
                "osc2Detune": 1.004,
                "oscMix": 0.4,
                "filterType": "lowpass",
                "cutoff": 4500,
                "reso": 3,
                "filterEnv": {
                    "attack": 0.001,
                    "decay": 0.14,
                    "sustain": 0.1,
                    "amount": 3800
                },
                "attack": 0.001,
                "release": 0.16,
                "volume": 0.86
            },
            {
                "name": "AIR WAR GLITCH",
                "label": "AIR WAR",
                "osc1": "sawtooth",
                "osc2": "square",
                "osc2Octave": 0,
                "osc2Detune": 1.02,
                "oscMix": 0.5,
                "noiseMix": 0.15,
                "filterType": "bandpass",
                "cutoff": 3100,
                "reso": 8,
                "attack": 0.003,
                "release": 0.22,
                "volume": 0.78
            },
            {
                "name": "COURTSHIP PLUCK",
                "label": "COURTSHIP",
                "osc1": "square",
                "osc2": "sine",
                "osc2Octave": 1,
                "osc2Detune": 1.005,
                "oscMix": 0.5,
                "filterType": "lowpass",
                "cutoff": 5800,
                "reso": 4.5,
                "filterEnv": {
                    "attack": 0.001,
                    "decay": 0.12,
                    "sustain": 0.05,
                    "amount": 4500
                },
                "attack": 0.001,
                "release": 0.15,
                "volume": 0.85
            },
            {
                "name": "BAPTISM NOISE LEAD",
                "label": "BAPTISM",
                "osc1": "sawtooth",
                "osc2": "sawtooth",
                "osc2Octave": 0,
                "osc2Detune": 1.02,
                "oscMix": 0.5,
                "noiseMix": 0.25,
                "filterType": "lowpass",
                "cutoff": 6200,
                "reso": 5,
                "filterEnv": {
                    "attack": 0.008,
                    "decay": 0.35,
                    "sustain": 0.4,
                    "amount": 3000
                },
                "attack": 0.008,
                "release": 0.3,
                "volume": 0.78
            }
        ],
        "basses": [
            {
                "name": "TRASH SUB BASS",
                "label": "TRASH SUB",
                "oscType": "sine",
                "subType": "square",
                "subOctave": -1,
                "subMix": 0.6,
                "cutoff": 650,
                "reso": 3.5,
                "envMod": 900,
                "decay": 0.45,
                "attack": 0.005,
                "volume": 0.95
            },
            {
                "name": "ALICE FUZZ BASS",
                "label": "ALICE BASS",
                "oscType": "sawtooth",
                "subType": "square",
                "subOctave": -1,
                "subMix": 0.7,
                "detune": 1.02,
                "cutoff": 1800,
                "reso": 6.5,
                "envMod": 2800,
                "decay": 0.28,
                "attack": 0.002,
                "volume": 0.85
            },
            {
                "name": "CRIMEWAVE GROOVE",
                "label": "CRIME BASS",
                "oscType": "square",
                "subType": "triangle",
                "subOctave": -1,
                "subMix": 0.5,
                "cutoff": 1400,
                "reso": 5,
                "envMod": 2200,
                "decay": 0.22,
                "attack": 0.003,
                "volume": 0.85
            },
            {
                "name": "DOE DEER GRINDER",
                "label": "DOE GRINDER",
                "oscType": "sawtooth",
                "subType": "sawtooth",
                "subOctave": -1,
                "subMix": 0.65,
                "detune": 1.025,
                "cutoff": 2100,
                "reso": 7.5,
                "envMod": 3400,
                "decay": 0.3,
                "attack": 0.001,
                "volume": 0.82
            },
            {
                "name": "UNTRUST ACID",
                "label": "UNTRUST BASS",
                "oscType": "sawtooth",
                "subType": "sine",
                "subOctave": -1,
                "subMix": 0.5,
                "cutoff": 1300,
                "reso": 8,
                "envMod": 3000,
                "decay": 0.24,
                "attack": 0.002,
                "volume": 0.85
            },
            {
                "name": "8-BIT BITCRUSH BASS",
                "label": "8-BIT CRUSH",
                "oscType": "square",
                "subType": "square",
                "subOctave": -1,
                "subMix": 0.6,
                "cutoff": 2000,
                "reso": 4.5,
                "envMod": 2400,
                "decay": 0.2,
                "attack": 0.002,
                "volume": 0.82
            },
            {
                "name": "PLASTIC ACID",
                "label": "PLASTIC ACID",
                "oscType": "triangle",
                "subType": "square",
                "subOctave": -1,
                "subMix": 0.5,
                "cutoff": 1500,
                "reso": 6.8,
                "envMod": 2600,
                "decay": 0.25,
                "attack": 0.004,
                "volume": 0.86
            },
            {
                "name": "LO-FI CRASH DROP",
                "label": "CRASH DROP",
                "oscType": "sine",
                "subType": "square",
                "subOctave": -1,
                "subMix": 0.85,
                "pitchDrop": true,
                "cutoff": 550,
                "reso": 2.2,
                "envMod": 850,
                "decay": 0.6,
                "attack": 0.01,
                "volume": 0.95
            }
        ],
        "pedalboard": {
            "lead": [
                {
                    "slot": 0,
                    "cartridge": "decimator",
                    "active": true,
                    "params": {
                        "bits": 6,
                        "rate": 45,
                        "mix": 60
                    }
                },
                {
                    "slot": 1,
                    "cartridge": "flanger",
                    "active": false,
                    "params": {
                        "speed": 1.2,
                        "depth": 65,
                        "regen": 50
                    }
                },
                {
                    "slot": 2,
                    "cartridge": "sid-resonator",
                    "active": true,
                    "params": {
                        "cutoff": 3200,
                        "squelch": 65,
                        "decay": 0.22
                    }
                },
                {
                    "slot": 3,
                    "cartridge": "glitch-delay",
                    "active": true,
                    "params": {
                        "size": 90,
                        "feedback": 45,
                        "jitter": 60,
                        "mix": 45
                    }
                },
                {
                    "slot": 4,
                    "cartridge": "cathedral-reverb",
                    "active": false,
                    "params": {
                        "decay": 3.8,
                        "damping": 30,
                        "mix": 40
                    }
                }
            ],
            "bass": [
                {
                    "slot": 0,
                    "cartridge": "decimator",
                    "active": true,
                    "params": {
                        "bits": 8,
                        "rate": 30,
                        "mix": 50
                    }
                },
                {
                    "slot": 1,
                    "cartridge": "optical-tremolo",
                    "active": false,
                    "params": {
                        "rate": 6,
                        "depth": 55,
                        "shape": "square"
                    }
                },
                {
                    "slot": 2,
                    "cartridge": "sid-resonator",
                    "active": true,
                    "params": {
                        "cutoff": 1800,
                        "squelch": 70,
                        "decay": 0.25
                    }
                },
                {
                    "slot": 3,
                    "cartridge": "analog-delay",
                    "active": false,
                    "params": {
                        "time": 220,
                        "feedback": 30,
                        "mix": 30
                    }
                },
                {
                    "slot": 4,
                    "cartridge": "reverb",
                    "active": false,
                    "params": {
                        "decay": 1.8,
                        "mix": 35
                    }
                }
            ]
        }
    },
    "daft-punk": {
        "format": "ShallotWHAM-Module",
        "version": "2.0.0",
        "id": "daft-punk",
        "name": "DAFT PUNK",
        "subtitle": "French Touch, Talkbox & Disco House",
        "author": "Shallot",
        "category": "Electronic",
        "description": "Filtered French house, talkbox saws, Aerodynamic guitar leads, and thick Around The World / Da Funk compressed basslines.",
        "themeGlow": "#f59e0b",
        "tags": [
            "daft-punk",
            "french-touch",
            "house",
            "electro",
            "discovery"
        ],
        "leads": [
            {
                "name": "AERODYNAMIC LEAD",
                "label": "AERODYNAMIC",
                "osc1": "sawtooth",
                "osc2": "square",
                "osc2Octave": 0,
                "osc2Detune": 1.01,
                "oscMix": 0.55,
                "filterType": "lowpass",
                "cutoff": 6500,
                "reso": 4.5,
                "filterEnv": {
                    "attack": 0.005,
                    "decay": 0.25,
                    "sustain": 0.45,
                    "amount": 3500
                },
                "attack": 0.005,
                "release": 0.25,
                "volume": 0.85
            },
            {
                "name": "TALKBOX VOCAL SAW",
                "label": "TALKBOX SAW",
                "osc1": "sawtooth",
                "osc2": "sawtooth",
                "osc2Octave": 0,
                "osc2Detune": 1.005,
                "oscMix": 0.5,
                "filterType": "bandpass",
                "cutoff": 2400,
                "reso": 6.5,
                "filterEnv": {
                    "attack": 0.02,
                    "decay": 0.35,
                    "sustain": 0.5,
                    "amount": 1800
                },
                "attack": 0.02,
                "release": 0.28,
                "vibrato": {
                    "rate": 5.8,
                    "depth": 6
                },
                "volume": 0.82
            },
            {
                "name": "HARDER BETTER STRUM",
                "label": "HARDER STRUM",
                "osc1": "sawtooth",
                "osc2": "triangle",
                "osc2Octave": 0,
                "osc2Detune": 1.008,
                "oscMix": 0.45,
                "filterType": "lowpass",
                "cutoff": 4500,
                "reso": 3.5,
                "filterEnv": {
                    "attack": 0.008,
                    "decay": 0.2,
                    "sustain": 0.2,
                    "amount": 3200
                },
                "attack": 0.008,
                "release": 0.2,
                "volume": 0.85
            },
            {
                "name": "CRESCENDOLLS BRASS",
                "label": "CRESCENDO",
                "osc1": "sawtooth",
                "osc2": "sawtooth",
                "osc2Octave": 0,
                "osc2Detune": 0.992,
                "oscMix": 0.5,
                "filterType": "lowpass",
                "cutoff": 3800,
                "reso": 3.2,
                "filterEnv": {
                    "attack": 0.04,
                    "decay": 0.4,
                    "sustain": 0.5,
                    "amount": 2600
                },
                "attack": 0.04,
                "release": 0.45,
                "volume": 0.82
            },
            {
                "name": "DIGITAL LOVE BELL",
                "label": "DIGITAL BELL",
                "osc1": "sine",
                "osc2": "triangle",
                "osc2Octave": 1,
                "osc2Detune": 1.002,
                "oscMix": 0.5,
                "filterType": "lowpass",
                "cutoff": 7000,
                "reso": 1.8,
                "filterEnv": {
                    "attack": 0.002,
                    "decay": 0.3,
                    "sustain": 0.15,
                    "amount": 4000
                },
                "attack": 0.002,
                "release": 0.35,
                "volume": 0.9
            },
            {
                "name": "SHORT CIRCUIT SINE",
                "label": "SHORT CIRCT",
                "osc1": "sine",
                "osc2": "square",
                "osc2Octave": 1,
                "osc2Detune": 1.005,
                "oscMix": 0.3,
                "filterType": "lowpass",
                "cutoff": 5000,
                "reso": 2.2,
                "attack": 0.01,
                "release": 0.22,
                "volume": 0.92
            },
            {
                "name": "SUPERHEROES SWEEP",
                "label": "SUPERHEROES",
                "osc1": "sawtooth",
                "osc2": "sawtooth",
                "osc2Octave": 0,
                "osc2Detune": 1.015,
                "oscMix": 0.5,
                "filterType": "lowpass",
                "cutoff": 2800,
                "reso": 5.5,
                "filterEnv": {
                    "attack": 0.08,
                    "decay": 0.6,
                    "sustain": 0.6,
                    "amount": 4500
                },
                "attack": 0.08,
                "release": 0.5,
                "volume": 0.8
            },
            {
                "name": "VOYAGER FUNK LEAD",
                "label": "VOYAGER LEAD",
                "osc1": "sawtooth",
                "osc2": "square",
                "osc2Octave": 0,
                "osc2Detune": 1.006,
                "oscMix": 0.5,
                "filterType": "lowpass",
                "cutoff": 4800,
                "reso": 4,
                "filterEnv": {
                    "attack": 0.01,
                    "decay": 0.24,
                    "sustain": 0.3,
                    "amount": 2800
                },
                "attack": 0.01,
                "release": 0.22,
                "volume": 0.85
            }
        ],
        "basses": [
            {
                "name": "AROUND THE WORLD BASS",
                "label": "AROUND WORLD",
                "oscType": "sawtooth",
                "subType": "triangle",
                "subOctave": -1,
                "subMix": 0.55,
                "cutoff": 1600,
                "reso": 4.8,
                "envMod": 2400,
                "decay": 0.28,
                "attack": 0.004,
                "volume": 0.88
            },
            {
                "name": "DA FUNK HEAVY 303",
                "label": "DA FUNK 303",
                "oscType": "sawtooth",
                "subType": "square",
                "subOctave": -1,
                "subMix": 0.5,
                "cutoff": 1900,
                "reso": 8.5,
                "envMod": 3800,
                "decay": 0.32,
                "attack": 0.002,
                "volume": 0.85
            },
            {
                "name": "ROBOT ROCK PUNCH",
                "label": "ROBOT ROCK",
                "oscType": "sawtooth",
                "subType": "sawtooth",
                "subOctave": -1,
                "subMix": 0.65,
                "detune": 1.015,
                "cutoff": 1400,
                "reso": 3.8,
                "envMod": 1600,
                "decay": 0.35,
                "attack": 0.005,
                "volume": 0.88
            },
            {
                "name": "BURNIN' ACID DISTORT",
                "label": "BURNIN ACID",
                "oscType": "sawtooth",
                "subType": "square",
                "subOctave": -1,
                "subMix": 0.45,
                "cutoff": 2100,
                "reso": 9,
                "envMod": 3500,
                "decay": 0.25,
                "attack": 0.002,
                "volume": 0.82
            },
            {
                "name": "ONE MORE TIME SUB",
                "label": "ONE MORE SUB",
                "oscType": "sine",
                "subType": "triangle",
                "subOctave": -1,
                "subMix": 0.75,
                "cutoff": 750,
                "reso": 2,
                "envMod": 800,
                "decay": 0.4,
                "attack": 0.008,
                "volume": 0.95
            },
            {
                "name": "VERIDIS QUO TENDER",
                "label": "VERIDIS BASS",
                "oscType": "triangle",
                "subType": "sine",
                "subOctave": -1,
                "subMix": 0.6,
                "cutoff": 900,
                "reso": 2.2,
                "envMod": 900,
                "decay": 0.45,
                "attack": 0.01,
                "volume": 0.92
            },
            {
                "name": "HIGH LIFE DISCO",
                "label": "HIGH LIFE",
                "oscType": "square",
                "subType": "triangle",
                "subOctave": -1,
                "subMix": 0.4,
                "cutoff": 1700,
                "reso": 4.5,
                "envMod": 2200,
                "decay": 0.2,
                "attack": 0.003,
                "volume": 0.85
            },
            {
                "name": "FRENCH TOUCH PUMPER",
                "label": "FRENCH PUMP",
                "oscType": "sawtooth",
                "subType": "square",
                "subOctave": -1,
                "subMix": 0.55,
                "cutoff": 1500,
                "reso": 6,
                "envMod": 2800,
                "decay": 0.3,
                "attack": 0.003,
                "volume": 0.86
            }
        ],
        "pedalboard": {
            "lead": [
                {
                    "slot": 0,
                    "cartridge": "french-preamp",
                    "active": true,
                    "params": {
                        "drive": 35,
                        "warmth": 75,
                        "output": 75
                    }
                },
                {
                    "slot": 1,
                    "cartridge": "dimension-chorus",
                    "active": true,
                    "params": {
                        "mode": 4,
                        "width": 85,
                        "mix": 60
                    }
                },
                {
                    "slot": 2,
                    "cartridge": "formant-filter",
                    "active": false,
                    "params": {
                        "vowel": 2,
                        "reso": 65,
                        "glide": 30
                    }
                },
                {
                    "slot": 3,
                    "cartridge": "space-echo",
                    "active": false,
                    "params": {
                        "time": 320,
                        "intensity": 35,
                        "flutter": 25,
                        "mix": 35
                    }
                },
                {
                    "slot": 4,
                    "cartridge": "gated-plate",
                    "active": true,
                    "params": {
                        "size": 65,
                        "gate": 60,
                        "mix": 45
                    }
                }
            ],
            "bass": [
                {
                    "slot": 0,
                    "cartridge": "french-preamp",
                    "active": true,
                    "params": {
                        "drive": 45,
                        "warmth": 80,
                        "output": 70
                    }
                },
                {
                    "slot": 1,
                    "cartridge": "dimension-chorus",
                    "active": false,
                    "params": {
                        "mode": 2,
                        "width": 50,
                        "mix": 30
                    }
                },
                {
                    "slot": 2,
                    "cartridge": "sidechain-pumper",
                    "active": true,
                    "params": {
                        "depth": 85,
                        "rate": 4,
                        "release": 0.25
                    }
                },
                {
                    "slot": 3,
                    "cartridge": "analog-delay",
                    "active": false,
                    "params": {
                        "time": 200,
                        "feedback": 20,
                        "mix": 20
                    }
                },
                {
                    "slot": 4,
                    "cartridge": "reverb",
                    "active": false,
                    "params": {
                        "decay": 1.4,
                        "mix": 25
                    }
                }
            ]
        }
    },
    "depeche-mode": {
        "format": "ShallotWHAM-Module",
        "version": "2.0.0",
        "id": "depeche-mode",
        "name": "DEPECHE MODE",
        "subtitle": "Dark 80s Synthpop & Industrial Saws",
        "author": "Shallot",
        "category": "Darkwave",
        "description": "Punchy dark synthpop, Enjoy the Silence choir saws, Personal Jesus gritty stabs, Strangelove bell leads, and driving Violator acid basslines.",
        "themeGlow": "#6366f1",
        "tags": [
            "depeche-mode",
            "synthpop",
            "darkwave",
            "80s",
            "violator"
        ],
        "leads": [
            {
                "name": "ENJOY THE SILENCE SAW",
                "label": "SILENCE SAW",
                "osc1": "sawtooth",
                "osc2": "sawtooth",
                "osc2Octave": 0,
                "osc2Detune": 1.008,
                "oscMix": 0.5,
                "filterType": "lowpass",
                "cutoff": 4600,
                "reso": 2.5,
                "filterEnv": {
                    "attack": 0.01,
                    "decay": 0.35,
                    "sustain": 0.45,
                    "amount": 2600
                },
                "attack": 0.01,
                "release": 0.4,
                "volume": 0.85
            },
            {
                "name": "PERSONAL JESUS LEAD",
                "label": "PERS JESUS",
                "osc1": "sawtooth",
                "osc2": "square",
                "osc2Octave": 0,
                "osc2Detune": 1.012,
                "oscMix": 0.55,
                "filterType": "lowpass",
                "cutoff": 3800,
                "reso": 3.8,
                "filterEnv": {
                    "attack": 0.005,
                    "decay": 0.22,
                    "sustain": 0.3,
                    "amount": 3200
                },
                "attack": 0.005,
                "release": 0.25,
                "volume": 0.82
            },
            {
                "name": "STRANGELOVE BELL",
                "label": "STRANGELOVE",
                "osc1": "sine",
                "osc2": "triangle",
                "osc2Octave": 1,
                "osc2Detune": 1.004,
                "oscMix": 0.5,
                "filterType": "lowpass",
                "cutoff": 7000,
                "reso": 2.8,
                "filterEnv": {
                    "attack": 0.001,
                    "decay": 0.35,
                    "sustain": 0.15,
                    "amount": 4200
                },
                "attack": 0.001,
                "release": 0.5,
                "volume": 0.88
            },
            {
                "name": "BLACK CELEBRATION",
                "label": "BLACK CELEB",
                "osc1": "sawtooth",
                "osc2": "sawtooth",
                "osc2Octave": 0,
                "osc2Detune": 1.018,
                "oscMix": 0.5,
                "filterType": "bandpass",
                "cutoff": 2200,
                "reso": 6,
                "attack": 0.04,
                "release": 0.6,
                "volume": 0.8
            },
            {
                "name": "POLICY OF TRUTH",
                "label": "POLICY LEAD",
                "osc1": "square",
                "osc2": "sawtooth",
                "osc2Octave": 0,
                "osc2Detune": 0.994,
                "oscMix": 0.5,
                "filterType": "lowpass",
                "cutoff": 4200,
                "reso": 3.2,
                "filterEnv": {
                    "attack": 0.015,
                    "decay": 0.28,
                    "sustain": 0.35,
                    "amount": 2500
                },
                "attack": 0.015,
                "release": 0.3,
                "volume": 0.85
            },
            {
                "name": "NEVER LET ME DOWN",
                "label": "NEVER DOWN",
                "osc1": "sawtooth",
                "osc2": "sawtooth",
                "osc2Octave": 0,
                "osc2Detune": 1.009,
                "oscMix": 0.5,
                "filterType": "lowpass",
                "cutoff": 5200,
                "reso": 3,
                "filterEnv": {
                    "attack": 0.008,
                    "decay": 0.3,
                    "sustain": 0.4,
                    "amount": 2800
                },
                "attack": 0.008,
                "release": 0.35,
                "volume": 0.85
            },
            {
                "name": "HALO CHOIR SAW",
                "label": "HALO CHOIR",
                "osc1": "sawtooth",
                "osc2": "sine",
                "osc2Octave": 0,
                "osc2Detune": 1.003,
                "oscMix": 0.45,
                "filterType": "bandpass",
                "cutoff": 2800,
                "reso": 5,
                "attack": 0.05,
                "release": 0.7,
                "volume": 0.82
            },
            {
                "name": "MASTER & SERVANT",
                "label": "MASTER SRV",
                "osc1": "square",
                "osc2": "square",
                "osc2Octave": 1,
                "osc2Detune": 1.015,
                "oscMix": 0.55,
                "filterType": "lowpass",
                "cutoff": 6500,
                "reso": 4.5,
                "filterEnv": {
                    "attack": 0.002,
                    "decay": 0.18,
                    "sustain": 0.2,
                    "amount": 3500
                },
                "attack": 0.002,
                "release": 0.2,
                "volume": 0.8
            }
        ],
        "basses": [
            {
                "name": "POLICY TRUTH BASS",
                "label": "POLICY BASS",
                "oscType": "sawtooth",
                "subType": "sine",
                "subOctave": -1,
                "subMix": 0.7,
                "cutoff": 1400,
                "reso": 5,
                "envMod": 2200,
                "decay": 0.3,
                "attack": 0.004,
                "volume": 0.88
            },
            {
                "name": "WALKING SUB",
                "label": "WALKING SUB",
                "oscType": "sine",
                "subType": "sine",
                "subOctave": -1,
                "subMix": 0.9,
                "cutoff": 450,
                "reso": 1,
                "envMod": 350,
                "decay": 0.48,
                "attack": 0.01,
                "volume": 0.95
            },
            {
                "name": "VIOLATOR ACID",
                "label": "VIOLATOR",
                "oscType": "sawtooth",
                "subType": "square",
                "subOctave": -1,
                "subMix": 0.5,
                "cutoff": 1900,
                "reso": 7.5,
                "envMod": 3200,
                "decay": 0.25,
                "attack": 0.002,
                "volume": 0.85
            },
            {
                "name": "BLASPHEMOUS SUB",
                "label": "BLASPHEMOUS",
                "oscType": "triangle",
                "subType": "sine",
                "subOctave": -1,
                "subMix": 0.8,
                "cutoff": 850,
                "reso": 3,
                "envMod": 1100,
                "decay": 0.4,
                "attack": 0.008,
                "volume": 0.92
            },
            {
                "name": "WORLD IN MY EYES",
                "label": "WORLD EYES",
                "oscType": "square",
                "subType": "sawtooth",
                "subOctave": -1,
                "subMix": 0.6,
                "cutoff": 1700,
                "reso": 4.8,
                "envMod": 2000,
                "decay": 0.28,
                "attack": 0.003,
                "volume": 0.86
            },
            {
                "name": "QUESTION OF TIME",
                "label": "QUEST TIME",
                "oscType": "square",
                "subType": "square",
                "subOctave": -1,
                "subMix": 0.65,
                "cutoff": 2200,
                "reso": 5.5,
                "envMod": 2600,
                "decay": 0.2,
                "attack": 0.002,
                "volume": 0.84
            },
            {
                "name": "STRIPPED HEAVY SAW",
                "label": "STRIPPED",
                "oscType": "sawtooth",
                "subType": "sawtooth",
                "subOctave": -1,
                "subMix": 0.55,
                "detune": 1.012,
                "cutoff": 1300,
                "reso": 4.2,
                "envMod": 1700,
                "decay": 0.36,
                "attack": 0.006,
                "volume": 0.88
            },
            {
                "name": "BEHIND THE WHEEL",
                "label": "BEHIND WHL",
                "oscType": "sawtooth",
                "subType": "triangle",
                "subOctave": -1,
                "subMix": 0.7,
                "pitchDrop": true,
                "cutoff": 1100,
                "reso": 6,
                "envMod": 2400,
                "decay": 0.38,
                "attack": 0.004,
                "volume": 0.9
            }
        ],
        "pedalboard": {
            "lead": [
                {
                    "slot": 0,
                    "cartridge": "proco-rat",
                    "active": true,
                    "params": {
                        "dist": 45,
                        "filter": 2400,
                        "level": 70
                    }
                },
                {
                    "slot": 1,
                    "cartridge": "flanger",
                    "active": true,
                    "params": {
                        "speed": 0.8,
                        "depth": 70,
                        "regen": 55
                    }
                },
                {
                    "slot": 2,
                    "cartridge": "ps6",
                    "active": false,
                    "params": {
                        "key": "D",
                        "scale": "minor",
                        "interval": "3rd",
                        "mix": 50
                    }
                },
                {
                    "slot": 3,
                    "cartridge": "analog-delay",
                    "active": true,
                    "params": {
                        "time": 340,
                        "feedback": 40,
                        "mix": 40
                    }
                },
                {
                    "slot": 4,
                    "cartridge": "gated-plate",
                    "active": false,
                    "params": {
                        "size": 60,
                        "gate": 55,
                        "mix": 45
                    }
                }
            ],
            "bass": [
                {
                    "slot": 0,
                    "cartridge": "proco-rat",
                    "active": true,
                    "params": {
                        "dist": 40,
                        "filter": 1600,
                        "level": 75
                    }
                },
                {
                    "slot": 1,
                    "cartridge": "dimension-chorus",
                    "active": false,
                    "params": {
                        "mode": 2,
                        "width": 55,
                        "mix": 35
                    }
                },
                {
                    "slot": 2,
                    "cartridge": "sidechain-pumper",
                    "active": true,
                    "params": {
                        "depth": 75,
                        "rate": 4,
                        "release": 0.3
                    }
                },
                {
                    "slot": 3,
                    "cartridge": "analog-delay",
                    "active": false,
                    "params": {
                        "time": 220,
                        "feedback": 25,
                        "mix": 25
                    }
                },
                {
                    "slot": 4,
                    "cartridge": "reverb",
                    "active": false,
                    "params": {
                        "decay": 1.6,
                        "mix": 25
                    }
                }
            ]
        }
    },
    "dungeon-synth": {
        "format": "ShallotWHAM-Module",
        "version": "2.0.0",
        "id": "dungeon-synth",
        "name": "DUNGEON SYNTH",
        "subtitle": "Medieval Lo-Fi Fantasy Atmosphere",
        "author": "Shallot",
        "category": "Fantasy",
        "description": "Atmospheric mossy hall organs, Castlevania gothic organs, ancient wood flutes, sorcerer chimes, and deep cavern crypt basslines.",
        "themeGlow": "#10b981",
        "tags": [
            "dungeon-synth",
            "fantasy",
            "medieval",
            "ambient",
            "atmospheric",
            "lo-fi"
        ],
        "leads": [
            {
                "name": "CASTLEVANIA PIPE ORGAN",
                "label": "CASTLE ORGAN",
                "osc1": "sawtooth",
                "osc2": "square",
                "osc2Octave": 1,
                "osc2Detune": 1.006,
                "oscMix": 0.5,
                "filterType": "lowpass",
                "cutoff": 3800,
                "reso": 2.5,
                "filterEnv": {
                    "attack": 0.03,
                    "decay": 0.5,
                    "sustain": 0.6,
                    "amount": 2000
                },
                "attack": 0.03,
                "release": 0.6,
                "volume": 0.85
            },
            {
                "name": "ANCIENT WOOD FLUTE",
                "label": "WOOD FLUTE",
                "osc1": "triangle",
                "osc2": "sine",
                "osc2Octave": 1,
                "osc2Detune": 1.002,
                "oscMix": 0.45,
                "noiseMix": 0.05,
                "filterType": "lowpass",
                "cutoff": 4500,
                "reso": 1.8,
                "attack": 0.04,
                "release": 0.35,
                "vibrato": {
                    "rate": 4.8,
                    "depth": 5.5
                },
                "volume": 0.9
            },
            {
                "name": "SORCERER CHIME",
                "label": "SORCER CHIME",
                "osc1": "sine",
                "osc2": "triangle",
                "osc2Octave": 2,
                "osc2Detune": 1.004,
                "oscMix": 0.4,
                "filterType": "lowpass",
                "cutoff": 6500,
                "reso": 3.5,
                "filterEnv": {
                    "attack": 0.002,
                    "decay": 0.4,
                    "sustain": 0.1,
                    "amount": 3500
                },
                "attack": 0.002,
                "release": 0.5,
                "volume": 0.88
            },
            {
                "name": "MOSS-COVERED HARP",
                "label": "MOSSY HARP",
                "osc1": "triangle",
                "osc2": "triangle",
                "osc2Octave": 1,
                "osc2Detune": 1.003,
                "oscMix": 0.5,
                "filterType": "lowpass",
                "cutoff": 5000,
                "reso": 2,
                "filterEnv": {
                    "attack": 0.002,
                    "decay": 0.22,
                    "sustain": 0.05,
                    "amount": 3000
                },
                "attack": 0.002,
                "release": 0.25,
                "volume": 0.92
            },
            {
                "name": "CATHEDRAL BRASS CHOIR",
                "label": "CATHEDRAL",
                "osc1": "sawtooth",
                "osc2": "sawtooth",
                "osc2Octave": 0,
                "osc2Detune": 0.992,
                "oscMix": 0.5,
                "filterType": "lowpass",
                "cutoff": 3200,
                "reso": 2.8,
                "filterEnv": {
                    "attack": 0.08,
                    "decay": 0.6,
                    "sustain": 0.55,
                    "amount": 2200
                },
                "attack": 0.08,
                "release": 0.7,
                "volume": 0.82
            },
            {
                "name": "TAVERN LUTE",
                "label": "TAVERN LUTE",
                "osc1": "triangle",
                "osc2": "square",
                "osc2Octave": 0,
                "osc2Detune": 1.004,
                "oscMix": 0.4,
                "filterType": "lowpass",
                "cutoff": 4000,
                "reso": 3,
                "filterEnv": {
                    "attack": 0.003,
                    "decay": 0.18,
                    "sustain": 0.08,
                    "amount": 2800
                },
                "attack": 0.003,
                "release": 0.2,
                "volume": 0.88
            },
            {
                "name": "DARK MONASTERY BELL",
                "label": "DARK BELL",
                "osc1": "sine",
                "osc2": "square",
                "osc2Octave": 1,
                "osc2Detune": 1.008,
                "oscMix": 0.35,
                "filterType": "lowpass",
                "cutoff": 5800,
                "reso": 4,
                "filterEnv": {
                    "attack": 0.002,
                    "decay": 0.5,
                    "sustain": 0.1,
                    "amount": 4000
                },
                "attack": 0.002,
                "release": 0.6,
                "volume": 0.88
            },
            {
                "name": "SPELLCASTER STRING",
                "label": "SPELLCASTER",
                "osc1": "sawtooth",
                "osc2": "triangle",
                "osc2Octave": 0,
                "osc2Detune": 1.008,
                "oscMix": 0.5,
                "filterType": "lowpass",
                "cutoff": 3600,
                "reso": 2.2,
                "filterEnv": {
                    "attack": 0.06,
                    "decay": 0.5,
                    "sustain": 0.5,
                    "amount": 2000
                },
                "attack": 0.06,
                "release": 0.55,
                "vibrato": {
                    "rate": 5,
                    "depth": 5
                },
                "volume": 0.85
            }
        ],
        "basses": [
            {
                "name": "CRYPT ORGAN PEDAL",
                "label": "CRYPT PEDAL",
                "oscType": "sawtooth",
                "subType": "triangle",
                "subOctave": -1,
                "subMix": 0.7,
                "cutoff": 900,
                "reso": 2.8,
                "envMod": 1100,
                "decay": 0.5,
                "attack": 0.015,
                "volume": 0.92
            },
            {
                "name": "DUNGEON CAVERN SUB",
                "label": "CAVERN SUB",
                "oscType": "sine",
                "subType": "sine",
                "subOctave": -1,
                "subMix": 0.85,
                "cutoff": 420,
                "reso": 1,
                "envMod": 350,
                "decay": 0.6,
                "attack": 0.02,
                "volume": 0.95
            },
            {
                "name": "FOREST SHADOW REESE",
                "label": "FOREST REESE",
                "oscType": "sawtooth",
                "subType": "sawtooth",
                "subOctave": -1,
                "subMix": 0.55,
                "detune": 1.012,
                "cutoff": 1200,
                "reso": 3.2,
                "envMod": 1400,
                "decay": 0.45,
                "attack": 0.01,
                "volume": 0.86
            },
            {
                "name": "WAR DRUM IMPACT",
                "label": "WAR DRUM",
                "oscType": "triangle",
                "subType": "sine",
                "subOctave": -1,
                "subMix": 0.8,
                "pitchDrop": true,
                "cutoff": 600,
                "reso": 3.5,
                "envMod": 1200,
                "decay": 0.45,
                "attack": 0.005,
                "volume": 0.95
            },
            {
                "name": "MEDIEVAL SAW BASS",
                "label": "MEDIEVAL SAW",
                "oscType": "sawtooth",
                "subType": "square",
                "subOctave": -1,
                "subMix": 0.45,
                "cutoff": 1400,
                "reso": 4.5,
                "envMod": 2000,
                "decay": 0.3,
                "attack": 0.006,
                "volume": 0.86
            },
            {
                "name": "CASTLE GATE DROP",
                "label": "GATE DROP",
                "oscType": "sine",
                "subType": "square",
                "subOctave": -1,
                "subMix": 0.85,
                "pitchDrop": true,
                "cutoff": 550,
                "reso": 2,
                "envMod": 900,
                "decay": 0.7,
                "attack": 0.01,
                "volume": 0.95
            },
            {
                "name": "GOBLIN ACID",
                "label": "GOBLIN ACID",
                "oscType": "sawtooth",
                "subType": "sawtooth",
                "subOctave": -1,
                "subMix": 0.5,
                "cutoff": 1500,
                "reso": 6.8,
                "envMod": 2600,
                "decay": 0.26,
                "attack": 0.003,
                "volume": 0.85
            },
            {
                "name": "SORCERER DEEP DRONE",
                "label": "SORCER DRONE",
                "oscType": "triangle",
                "subType": "sine",
                "subOctave": -2,
                "subMix": 0.75,
                "cutoff": 700,
                "reso": 2,
                "envMod": 750,
                "decay": 0.65,
                "attack": 0.02,
                "volume": 0.95
            }
        ],
        "pedalboard": {
            "lead": [
                {
                    "slot": 0,
                    "cartridge": "tube-screamer",
                    "active": false,
                    "params": {
                        "drive": 25,
                        "tone": 1600,
                        "level": 70
                    }
                },
                {
                    "slot": 1,
                    "cartridge": "small-stone",
                    "active": false,
                    "params": {
                        "rate": 0.5,
                        "depth": 60,
                        "color": 1
                    }
                },
                {
                    "slot": 2,
                    "cartridge": "ps6",
                    "active": false,
                    "params": {
                        "key": "A",
                        "scale": "minor",
                        "interval": "5th",
                        "mix": 45
                    }
                },
                {
                    "slot": 3,
                    "cartridge": "space-echo",
                    "active": true,
                    "params": {
                        "time": 420,
                        "intensity": 48,
                        "flutter": 40,
                        "mix": 45
                    }
                },
                {
                    "slot": 4,
                    "cartridge": "cathedral-reverb",
                    "active": true,
                    "params": {
                        "decay": 4.8,
                        "damping": 25,
                        "mix": 55
                    }
                }
            ],
            "bass": [
                {
                    "slot": 0,
                    "cartridge": "big-muff",
                    "active": false,
                    "params": {
                        "sustain": 40,
                        "tone": 800,
                        "volume": 70
                    }
                },
                {
                    "slot": 1,
                    "cartridge": "small-stone",
                    "active": false,
                    "params": {
                        "rate": 0.4,
                        "depth": 45,
                        "color": 0
                    }
                },
                {
                    "slot": 2,
                    "cartridge": "ps6",
                    "active": false,
                    "params": {
                        "key": "A",
                        "scale": "minor",
                        "interval": "oct-down",
                        "mix": 50
                    }
                },
                {
                    "slot": 3,
                    "cartridge": "analog-delay",
                    "active": false,
                    "params": {
                        "time": 300,
                        "feedback": 30,
                        "mix": 30
                    }
                },
                {
                    "slot": 4,
                    "cartridge": "cathedral-reverb",
                    "active": true,
                    "params": {
                        "decay": 3.5,
                        "damping": 35,
                        "mix": 40
                    }
                }
            ]
        }
    },
    "kraftwerk": {
        "format": "ShallotWHAM-Module",
        "version": "2.0.0",
        "id": "kraftwerk",
        "name": "KRAFTWERK",
        "subtitle": "Minimalist Kling Klang Robotics",
        "author": "Shallot",
        "category": "Electronic",
        "description": "Pure minimalist electronic precision, Kling Klang laboratory sines, Pocket Calculator blips, and Trans-Europe Express pulse lines.",
        "themeGlow": "#ef4444",
        "tags": [
            "kraftwerk",
            "kling-klang",
            "minimal",
            "krautrock",
            "vocoder"
        ],
        "leads": [
            {
                "name": "KLING KLANG SINE",
                "label": "KLING KLANG",
                "osc1": "sine",
                "osc2": "sine",
                "osc2Octave": 1,
                "osc2Detune": 1.001,
                "oscMix": 0.35,
                "filterType": "lowpass",
                "cutoff": 7500,
                "reso": 1,
                "attack": 0.005,
                "release": 0.25,
                "volume": 0.95
            },
            {
                "name": "POCKET CALCULATOR",
                "label": "POCKET CALC",
                "osc1": "square",
                "osc2": "sine",
                "osc2Octave": 1,
                "osc2Detune": 1.002,
                "oscMix": 0.4,
                "filterType": "lowpass",
                "cutoff": 8000,
                "reso": 2,
                "attack": 0.001,
                "release": 0.1,
                "volume": 0.85
            },
            {
                "name": "COMPUTER WORLD BLIP",
                "label": "COMP WORLD",
                "osc1": "triangle",
                "osc2": "square",
                "osc2Octave": 1,
                "osc2Detune": 1.003,
                "oscMix": 0.35,
                "filterType": "lowpass",
                "cutoff": 6500,
                "reso": 3.5,
                "filterEnv": {
                    "attack": 0.001,
                    "decay": 0.12,
                    "sustain": 0,
                    "amount": 4000
                },
                "attack": 0.001,
                "release": 0.12,
                "volume": 0.88
            },
            {
                "name": "ROBOT VOCODER SAW",
                "label": "ROBOT VOX",
                "osc1": "sawtooth",
                "osc2": "sawtooth",
                "osc2Octave": 0,
                "osc2Detune": 1.004,
                "oscMix": 0.5,
                "filterType": "bandpass",
                "cutoff": 1900,
                "reso": 6,
                "attack": 0.01,
                "release": 0.2,
                "volume": 0.82
            },
            {
                "name": "TRANS-EUROPE FLUTE",
                "label": "TRANS EUROPE",
                "osc1": "sine",
                "osc2": "triangle",
                "osc2Octave": 1,
                "osc2Detune": 1.002,
                "oscMix": 0.45,
                "filterType": "lowpass",
                "cutoff": 5500,
                "reso": 1.5,
                "attack": 0.03,
                "release": 0.3,
                "vibrato": {
                    "rate": 5.2,
                    "depth": 4.5
                },
                "volume": 0.92
            },
            {
                "name": "THE MODEL SAW",
                "label": "THE MODEL",
                "osc1": "sawtooth",
                "osc2": "square",
                "osc2Octave": 0,
                "osc2Detune": 1.006,
                "oscMix": 0.5,
                "filterType": "lowpass",
                "cutoff": 4200,
                "reso": 2.5,
                "filterEnv": {
                    "attack": 0.01,
                    "decay": 0.3,
                    "sustain": 0.4,
                    "amount": 2000
                },
                "attack": 0.01,
                "release": 0.28,
                "volume": 0.85
            },
            {
                "name": "RADIOACTIVITY TONE",
                "label": "RADIO TONE",
                "osc1": "sine",
                "osc2": "sine",
                "osc2Octave": 2,
                "osc2Detune": 1.001,
                "oscMix": 0.3,
                "filterType": "lowpass",
                "cutoff": 6800,
                "reso": 1.2,
                "attack": 0.05,
                "release": 0.5,
                "volume": 0.95
            },
            {
                "name": "AUTOBAHN BLIP LEAD",
                "label": "AUTOBAHN BLP",
                "osc1": "square",
                "osc2": "triangle",
                "osc2Octave": 1,
                "osc2Detune": 1.003,
                "oscMix": 0.4,
                "filterType": "lowpass",
                "cutoff": 7000,
                "reso": 3,
                "attack": 0.002,
                "release": 0.15,
                "volume": 0.85
            }
        ],
        "basses": [
            {
                "name": "AUTOBAHN PULSE BASS",
                "label": "AUTOBAHN BAS",
                "oscType": "sawtooth",
                "subType": "square",
                "subOctave": -1,
                "subMix": 0.5,
                "cutoff": 1400,
                "reso": 4.5,
                "envMod": 1800,
                "decay": 0.25,
                "attack": 0.005,
                "volume": 0.88
            },
            {
                "name": "TRANS-EUROPE BEAT",
                "label": "TRANS BEAT",
                "oscType": "square",
                "subType": "triangle",
                "subOctave": -1,
                "subMix": 0.45,
                "cutoff": 1600,
                "reso": 5,
                "envMod": 2200,
                "decay": 0.2,
                "attack": 0.002,
                "volume": 0.85
            },
            {
                "name": "RADIOACTIVITY SUB",
                "label": "RADIO SUB",
                "oscType": "sine",
                "subType": "sine",
                "subOctave": -1,
                "subMix": 0.8,
                "cutoff": 450,
                "reso": 1,
                "envMod": 400,
                "decay": 0.5,
                "attack": 0.01,
                "volume": 0.95
            },
            {
                "name": "NUMBERS COMPUTER BASS",
                "label": "NUMBERS BASS",
                "oscType": "triangle",
                "subType": "square",
                "subOctave": -1,
                "subMix": 0.55,
                "cutoff": 1800,
                "reso": 6,
                "envMod": 2600,
                "decay": 0.18,
                "attack": 0.002,
                "volume": 0.88
            },
            {
                "name": "MAN MACHINE ANALOG",
                "label": "MAN MACHINE",
                "oscType": "sawtooth",
                "subType": "sawtooth",
                "subOctave": -1,
                "subMix": 0.5,
                "detune": 1.006,
                "cutoff": 1300,
                "reso": 3.5,
                "envMod": 1600,
                "decay": 0.35,
                "attack": 0.006,
                "volume": 0.86
            },
            {
                "name": "POCKET ACID CLICK",
                "label": "POCKET CLICK",
                "oscType": "square",
                "subType": "sine",
                "subOctave": -1,
                "subMix": 0.6,
                "cutoff": 1900,
                "reso": 7,
                "envMod": 2800,
                "decay": 0.15,
                "attack": 0.001,
                "volume": 0.82
            },
            {
                "name": "TOUR DE FRANCE PUMP",
                "label": "TOUR DE FRNC",
                "oscType": "sawtooth",
                "subType": "triangle",
                "subOctave": -1,
                "subMix": 0.5,
                "cutoff": 1500,
                "reso": 5.2,
                "envMod": 2400,
                "decay": 0.28,
                "attack": 0.004,
                "volume": 0.88
            },
            {
                "name": "KLING KLANG SUB DROP",
                "label": "KLING DROP",
                "oscType": "sine",
                "subType": "sine",
                "subOctave": -1,
                "subMix": 0.9,
                "pitchDrop": true,
                "cutoff": 500,
                "reso": 1.8,
                "envMod": 800,
                "decay": 0.6,
                "attack": 0.01,
                "volume": 0.95
            }
        ],
        "pedalboard": {
            "lead": [
                {
                    "slot": 0,
                    "cartridge": "french-preamp",
                    "active": false,
                    "params": {
                        "drive": 20,
                        "warmth": 60,
                        "output": 70
                    }
                },
                {
                    "slot": 1,
                    "cartridge": "optical-tremolo",
                    "active": false,
                    "params": {
                        "rate": 6,
                        "depth": 50,
                        "shape": "square"
                    }
                },
                {
                    "slot": 2,
                    "cartridge": "formant-filter",
                    "active": false,
                    "params": {
                        "vowel": 1,
                        "reso": 60,
                        "glide": 25
                    }
                },
                {
                    "slot": 3,
                    "cartridge": "analog-delay",
                    "active": true,
                    "params": {
                        "time": 260,
                        "feedback": 35,
                        "mix": 40
                    }
                },
                {
                    "slot": 4,
                    "cartridge": "reverb",
                    "active": false,
                    "params": {
                        "decay": 1.8,
                        "mix": 35
                    }
                }
            ],
            "bass": [
                {
                    "slot": 0,
                    "cartridge": "tube-screamer",
                    "active": false,
                    "params": {
                        "drive": 25,
                        "tone": 1400,
                        "level": 75
                    }
                },
                {
                    "slot": 1,
                    "cartridge": "optical-tremolo",
                    "active": false,
                    "params": {
                        "rate": 4,
                        "depth": 35,
                        "shape": "triangle"
                    }
                },
                {
                    "slot": 2,
                    "cartridge": "sidechain-pumper",
                    "active": true,
                    "params": {
                        "depth": 65,
                        "rate": 4,
                        "release": 0.25
                    }
                },
                {
                    "slot": 3,
                    "cartridge": "delay",
                    "active": false,
                    "params": {
                        "time": 240,
                        "feedback": 25,
                        "mix": 25
                    }
                },
                {
                    "slot": 4,
                    "cartridge": "reverb",
                    "active": false,
                    "params": {
                        "decay": 1.2,
                        "mix": 20
                    }
                }
            ]
        }
    },
    "pornophonique-sad-robot": {
        "format": "ShallotWHAM-Module",
        "version": "2.0.0",
        "id": "pornophonique-sad-robot",
        "name": "SAD ROBOT",
        "subtitle": "Pornophonique Bitpop & Melancholy",
        "author": "Shallot",
        "category": "Chiptune",
        "description": "Faithfully modeled on the German bitpop duo Pornophonique and their anthem 'Sad Robot' from '8-bit lagerfeuer'. Authentic Commodore 64 SID 6581 and Game Boy LSDJ sound design.",
        "themeGlow": "#ec4899",
        "tags": [
            "pornophonique",
            "sad-robot",
            "bitpop",
            "c64",
            "sid6581",
            "lsdj"
        ],
        "leads": [
            {
                "name": "SAD ROBOT SOLO",
                "label": "SAD ROBOT",
                "osc1": "square",
                "osc2": "sawtooth",
                "osc2Octave": 0,
                "osc2Detune": 1.004,
                "oscMix": 0.5,
                "filterType": "lowpass",
                "cutoff": 3600,
                "reso": 3.8,
                "filterEnv": {
                    "attack": 0.015,
                    "decay": 0.32,
                    "sustain": 0.4,
                    "amount": 2400
                },
                "attack": 0.01,
                "release": 0.28,
                "vibrato": {
                    "rate": 5.5,
                    "depth": 6.5
                },
                "volume": 0.82
            },
            {
                "name": "LSDJ CRYING ARP",
                "label": "CRYING ARP",
                "osc1": "square",
                "osc2": "square",
                "osc2Octave": 1,
                "osc2Detune": 1.002,
                "oscMix": 0.45,
                "filterType": "lowpass",
                "cutoff": 7200,
                "reso": 2,
                "attack": 0.001,
                "release": 0.12,
                "arp": "chip60",
                "volume": 0.78
            },
            {
                "name": "LAGERFEUER PLUCK",
                "label": "LAGER PLUCK",
                "osc1": "triangle",
                "osc2": "sawtooth",
                "osc2Octave": 0,
                "osc2Detune": 1.006,
                "oscMix": 0.4,
                "filterType": "lowpass",
                "cutoff": 4600,
                "reso": 2.8,
                "filterEnv": {
                    "attack": 0.002,
                    "decay": 0.18,
                    "sustain": 0.1,
                    "amount": 3500
                },
                "attack": 0.002,
                "release": 0.2,
                "volume": 0.88
            },
            {
                "name": "ROBOT FORMANT SAW",
                "label": "ROBOT VOCAL",
                "osc1": "sawtooth",
                "osc2": "square",
                "osc2Octave": 0,
                "osc2Detune": 1.008,
                "oscMix": 0.55,
                "filterType": "bandpass",
                "cutoff": 2100,
                "reso": 6.5,
                "filterEnv": {
                    "attack": 0.02,
                    "decay": 0.3,
                    "sustain": 0.3,
                    "amount": 1800
                },
                "attack": 0.02,
                "release": 0.25,
                "volume": 0.8
            },
            {
                "name": "LONELY PULSE 12.5%",
                "label": "LONELY PULSE",
                "osc1": "square",
                "osc2": "sine",
                "osc2Octave": 1,
                "osc2Detune": 1.003,
                "oscMix": 0.5,
                "filterType": "lowpass",
                "cutoff": 5800,
                "reso": 2.2,
                "attack": 0.005,
                "release": 0.22,
                "volume": 0.85
            },
            {
                "name": "C64 DIRTY CRUNCH",
                "label": "C64 CRUNCH",
                "osc1": "sawtooth",
                "osc2": "sawtooth",
                "osc2Octave": 0,
                "osc2Detune": 1.015,
                "oscMix": 0.6,
                "noiseMix": 0.1,
                "filterType": "lowpass",
                "cutoff": 4200,
                "reso": 5,
                "filterEnv": {
                    "attack": 0.005,
                    "decay": 0.28,
                    "sustain": 0.35,
                    "amount": 3000
                },
                "attack": 0.005,
                "release": 0.25,
                "volume": 0.8
            },
            {
                "name": "SAD BENT CHIRP",
                "label": "BENT CHIRP",
                "osc1": "triangle",
                "osc2": "sine",
                "osc2Octave": 1,
                "osc2Detune": 1.004,
                "oscMix": 0.45,
                "filterType": "lowpass",
                "cutoff": 5200,
                "reso": 3.5,
                "filterEnv": {
                    "attack": 0.001,
                    "decay": 0.14,
                    "sustain": 0.05,
                    "amount": 4000
                },
                "attack": 0.001,
                "release": 0.16,
                "volume": 0.88
            },
            {
                "name": "SID OCTAVE HOP",
                "label": "OCTAVE HOP",
                "osc1": "square",
                "osc2": "sawtooth",
                "osc2Octave": 1,
                "osc2Detune": 1.004,
                "oscMix": 0.5,
                "filterType": "lowpass",
                "cutoff": 6500,
                "reso": 3,
                "attack": 0.002,
                "release": 0.15,
                "arp": "octhop",
                "volume": 0.82
            }
        ],
        "basses": [
            {
                "name": "GAME BOY WAVE SUB",
                "label": "GB WAVE SUB",
                "oscType": "triangle",
                "subType": "sine",
                "subOctave": -1,
                "subMix": 0.6,
                "cutoff": 850,
                "reso": 2.5,
                "envMod": 700,
                "decay": 0.4,
                "attack": 0.006,
                "volume": 0.95
            },
            {
                "name": "CAMPFIRE ACOUSTIC BASS",
                "label": "CAMPFIRE",
                "oscType": "triangle",
                "subType": "triangle",
                "subOctave": -1,
                "subMix": 0.5,
                "cutoff": 1100,
                "reso": 3.2,
                "envMod": 1200,
                "decay": 0.35,
                "attack": 0.008,
                "volume": 0.9
            },
            {
                "name": "SID ACID 6581",
                "label": "SID ACID",
                "oscType": "sawtooth",
                "subType": "square",
                "subOctave": -1,
                "subMix": 0.45,
                "cutoff": 1400,
                "reso": 8,
                "envMod": 3200,
                "decay": 0.25,
                "attack": 0.003,
                "volume": 0.85
            },
            {
                "name": "ROBOT HEARTBEAT",
                "label": "HEARTBEAT",
                "oscType": "sine",
                "subType": "square",
                "subOctave": -1,
                "subMix": 0.75,
                "pitchDrop": true,
                "cutoff": 600,
                "reso": 2.2,
                "envMod": 950,
                "decay": 0.5,
                "attack": 0.008,
                "volume": 0.95
            },
            {
                "name": "NOISE CHIP PERC",
                "label": "CHIP PERC",
                "oscType": "square",
                "subType": "triangle",
                "subOctave": -1,
                "subMix": 0.4,
                "cutoff": 2600,
                "reso": 6,
                "envMod": 3800,
                "decay": 0.16,
                "attack": 0.001,
                "volume": 0.8
            },
            {
                "name": "8-BIT BITPOP REESE",
                "label": "BITPOP REESE",
                "oscType": "sawtooth",
                "subType": "sawtooth",
                "subOctave": -1,
                "subMix": 0.55,
                "detune": 1.018,
                "cutoff": 1500,
                "reso": 3.5,
                "envMod": 1500,
                "decay": 0.45,
                "attack": 0.01,
                "volume": 0.85
            },
            {
                "name": "MELANCHOLY ACID",
                "label": "MELAN ACID",
                "oscType": "sawtooth",
                "subType": "sine",
                "subOctave": -1,
                "subMix": 0.5,
                "cutoff": 1250,
                "reso": 7,
                "envMod": 2600,
                "decay": 0.28,
                "attack": 0.004,
                "volume": 0.86
            },
            {
                "name": "POWER DOWN DROP",
                "label": "POWER DOWN",
                "oscType": "sine",
                "subType": "sine",
                "subOctave": -1,
                "subMix": 0.9,
                "pitchDrop": true,
                "cutoff": 500,
                "reso": 1.5,
                "envMod": 750,
                "decay": 0.75,
                "attack": 0.01,
                "volume": 0.95
            }
        ],
        "pedalboard": {
            "lead": [
                {
                    "slot": 0,
                    "cartridge": "decimator",
                    "active": true,
                    "params": {
                        "bits": 8,
                        "rate": 38,
                        "mix": 50
                    }
                },
                {
                    "slot": 1,
                    "cartridge": "dimension-chorus",
                    "active": false,
                    "params": {
                        "mode": 2,
                        "width": 65,
                        "mix": 40
                    }
                },
                {
                    "slot": 2,
                    "cartridge": "sid-resonator",
                    "active": true,
                    "params": {
                        "cutoff": 2600,
                        "squelch": 60,
                        "decay": 0.25
                    }
                },
                {
                    "slot": 3,
                    "cartridge": "analog-delay",
                    "active": true,
                    "params": {
                        "time": 320,
                        "feedback": 35,
                        "mix": 40
                    }
                },
                {
                    "slot": 4,
                    "cartridge": "spring-reverb",
                    "active": true,
                    "params": {
                        "tension": 55,
                        "decay": 1.8,
                        "mix": 45
                    }
                }
            ],
            "bass": [
                {
                    "slot": 0,
                    "cartridge": "decimator",
                    "active": false,
                    "params": {
                        "bits": 8,
                        "rate": 30,
                        "mix": 45
                    }
                },
                {
                    "slot": 1,
                    "cartridge": "optical-tremolo",
                    "active": false,
                    "params": {
                        "rate": 4,
                        "depth": 40,
                        "shape": "triangle"
                    }
                },
                {
                    "slot": 2,
                    "cartridge": "sid-resonator",
                    "active": true,
                    "params": {
                        "cutoff": 1400,
                        "squelch": 70,
                        "decay": 0.22
                    }
                },
                {
                    "slot": 3,
                    "cartridge": "analog-delay",
                    "active": false,
                    "params": {
                        "time": 240,
                        "feedback": 25,
                        "mix": 30
                    }
                },
                {
                    "slot": 4,
                    "cartridge": "spring-reverb",
                    "active": true,
                    "params": {
                        "tension": 45,
                        "decay": 1.5,
                        "mix": 35
                    }
                }
            ]
        }
    },
    "synthwave": {
        "format": "ShallotWHAM-Module",
        "version": "2.0.0",
        "id": "synthwave",
        "name": "SYNTHWAVE",
        "subtitle": "Classic 80s Analog Leads & Basslines",
        "author": "Shallot",
        "category": "Synthwave",
        "description": "Warm retro synthwave sounds with dual detuned sawtooth leads, lush brass, G-Funk sines, and punchy 303/Moog basslines.",
        "themeGlow": "#00e5ff",
        "tags": [
            "synthwave",
            "retrowave",
            "80s",
            "analog",
            "outrun"
        ],
        "leads": [
            {
                "name": "TRANCE SAW LEAD",
                "label": "TRANCE SAW",
                "osc1": "sawtooth",
                "osc2": "sawtooth",
                "osc2Octave": 0,
                "osc2Detune": 1.007,
                "oscMix": 0.5,
                "filterType": "lowpass",
                "cutoff": 4200,
                "reso": 2.2,
                "filterEnv": {
                    "attack": 0.005,
                    "decay": 0.32,
                    "sustain": 0.4,
                    "amount": 2800
                },
                "attack": 0.005,
                "release": 0.35,
                "volume": 0.85
            },
            {
                "name": "CHIPTUNE PULSE",
                "label": "CHIPTUNE",
                "osc1": "square",
                "osc2": "square",
                "osc2Octave": 1,
                "osc2Detune": 1.002,
                "oscMix": 0.45,
                "filterType": "lowpass",
                "cutoff": 7500,
                "reso": 1.2,
                "filterEnv": {
                    "attack": 0.001,
                    "decay": 0.18,
                    "sustain": 0.6,
                    "amount": 3500
                },
                "attack": 0.001,
                "release": 0.18,
                "volume": 0.78
            },
            {
                "name": "80s SYNTH BRASS",
                "label": "80s BRASS",
                "osc1": "sawtooth",
                "osc2": "sawtooth",
                "osc2Octave": 0,
                "osc2Detune": 0.993,
                "oscMix": 0.5,
                "filterType": "lowpass",
                "cutoff": 3000,
                "reso": 3.5,
                "filterEnv": {
                    "attack": 0.045,
                    "decay": 0.38,
                    "sustain": 0.45,
                    "amount": 2600
                },
                "attack": 0.04,
                "release": 0.45,
                "vibrato": {
                    "rate": 5.6,
                    "depth": 5
                },
                "volume": 0.82
            },
            {
                "name": "CYBERPUNK SAW",
                "label": "CYBERPUNK",
                "osc1": "sawtooth",
                "osc2": "square",
                "osc2Octave": 0,
                "osc2Detune": 1.012,
                "oscMix": 0.6,
                "filterType": "lowpass",
                "cutoff": 3600,
                "reso": 4.2,
                "filterEnv": {
                    "attack": 0.008,
                    "decay": 0.28,
                    "sustain": 0.35,
                    "amount": 3200
                },
                "attack": 0.01,
                "release": 0.28,
                "volume": 0.8
            },
            {
                "name": "G-FUNK SINE",
                "label": "G-FUNK",
                "osc1": "sine",
                "osc2": "sine",
                "osc2Octave": 1,
                "osc2Detune": 1.002,
                "oscMix": 0.4,
                "filterType": "lowpass",
                "cutoff": 6200,
                "reso": 0.8,
                "attack": 0.02,
                "release": 0.3,
                "vibrato": {
                    "rate": 6,
                    "depth": 8
                },
                "volume": 0.92
            },
            {
                "name": "HYPER PLUCK",
                "label": "HYPER PLUCK",
                "osc1": "triangle",
                "osc2": "sine",
                "osc2Octave": 1,
                "osc2Detune": 1.005,
                "oscMix": 0.5,
                "filterType": "lowpass",
                "cutoff": 4800,
                "reso": 2.8,
                "filterEnv": {
                    "attack": 0.002,
                    "decay": 0.15,
                    "sustain": 0.1,
                    "amount": 4200
                },
                "attack": 0.002,
                "release": 0.18,
                "volume": 0.88
            },
            {
                "name": "VOCO VOICE",
                "label": "VOCO LEAD",
                "osc1": "sawtooth",
                "osc2": "sawtooth",
                "osc2Octave": 0,
                "osc2Detune": 1.004,
                "oscMix": 0.5,
                "filterType": "bandpass",
                "cutoff": 2200,
                "reso": 5.5,
                "filterEnv": {
                    "attack": 0.015,
                    "decay": 0.3,
                    "sustain": 0.4,
                    "amount": 1500
                },
                "attack": 0.015,
                "release": 0.25,
                "volume": 0.8
            },
            {
                "name": "RAVE HOOVER",
                "label": "RAVE HOOVER",
                "osc1": "sawtooth",
                "osc2": "sawtooth",
                "osc2Octave": 0,
                "osc2Detune": 1.018,
                "oscMix": 0.5,
                "filterType": "lowpass",
                "cutoff": 4000,
                "reso": 3.8,
                "filterEnv": {
                    "attack": 0.02,
                    "decay": 0.45,
                    "sustain": 0.5,
                    "amount": 2800
                },
                "attack": 0.02,
                "release": 0.4,
                "volume": 0.82
            }
        ],
        "basses": [
            {
                "name": "ACID 303 SAW",
                "label": "303 ACID",
                "oscType": "sawtooth",
                "subType": "square",
                "subOctave": -1,
                "subMix": 0.4,
                "cutoff": 1200,
                "reso": 7.5,
                "envMod": 2800,
                "decay": 0.26,
                "attack": 0.004,
                "volume": 0.85
            },
            {
                "name": "DEEP SUB SINE",
                "label": "DEEP SUB",
                "oscType": "sine",
                "subType": "sine",
                "subOctave": -1,
                "subMix": 0.75,
                "cutoff": 480,
                "reso": 1.2,
                "envMod": 450,
                "decay": 0.45,
                "attack": 0.01,
                "volume": 0.95
            },
            {
                "name": "FAT REESE BASS",
                "label": "FAT REESE",
                "oscType": "sawtooth",
                "subType": "sine",
                "subOctave": -1,
                "subMix": 0.55,
                "detune": 1.018,
                "cutoff": 1600,
                "reso": 3.5,
                "envMod": 1600,
                "decay": 0.5,
                "attack": 0.01,
                "volume": 0.85
            },
            {
                "name": "FM PUNCH BASS",
                "label": "FM PUNCH",
                "oscType": "triangle",
                "subType": "square",
                "subOctave": -1,
                "subMix": 0.45,
                "cutoff": 2200,
                "reso": 4.5,
                "envMod": 3000,
                "decay": 0.2,
                "attack": 0.002,
                "volume": 0.88
            },
            {
                "name": "SLAP SQUARE",
                "label": "SLAP SQR",
                "oscType": "square",
                "subType": "triangle",
                "subOctave": -1,
                "subMix": 0.4,
                "cutoff": 1800,
                "reso": 5.2,
                "envMod": 2600,
                "decay": 0.18,
                "attack": 0.003,
                "volume": 0.82
            },
            {
                "name": "80s ANALOG BASS",
                "label": "80s ANALOG",
                "oscType": "sawtooth",
                "subType": "sawtooth",
                "subOctave": -1,
                "subMix": 0.5,
                "detune": 1.008,
                "cutoff": 1500,
                "reso": 2.8,
                "envMod": 1800,
                "decay": 0.35,
                "attack": 0.008,
                "volume": 0.86
            },
            {
                "name": "WARM MOOG BASS",
                "label": "WARM MOOG",
                "oscType": "sawtooth",
                "subType": "triangle",
                "subOctave": -1,
                "subMix": 0.6,
                "cutoff": 950,
                "reso": 3.2,
                "envMod": 1200,
                "decay": 0.4,
                "attack": 0.01,
                "volume": 0.88
            },
            {
                "name": "SUB DROPPER",
                "label": "SUB DROP",
                "oscType": "sine",
                "subType": "sine",
                "subOctave": -1,
                "subMix": 0.85,
                "pitchDrop": true,
                "cutoff": 600,
                "reso": 1.8,
                "envMod": 900,
                "decay": 0.65,
                "attack": 0.01,
                "volume": 0.95
            }
        ],
        "pedalboard": {
            "lead": [
                {
                    "slot": 0,
                    "cartridge": "french-preamp",
                    "active": false,
                    "params": {
                        "drive": 30,
                        "warmth": 70,
                        "output": 70
                    }
                },
                {
                    "slot": 1,
                    "cartridge": "dimension-chorus",
                    "active": true,
                    "params": {
                        "mode": 3,
                        "width": 80,
                        "mix": 55
                    }
                },
                {
                    "slot": 2,
                    "cartridge": "ps6",
                    "active": false,
                    "params": {
                        "key": "C",
                        "scale": "major",
                        "interval": "3rd",
                        "mix": 50
                    }
                },
                {
                    "slot": 3,
                    "cartridge": "space-echo",
                    "active": true,
                    "params": {
                        "time": 380,
                        "intensity": 45,
                        "flutter": 35,
                        "mix": 45
                    }
                },
                {
                    "slot": 4,
                    "cartridge": "reverb",
                    "active": false,
                    "params": {
                        "decay": 2.4,
                        "mix": 45
                    }
                }
            ],
            "bass": [
                {
                    "slot": 0,
                    "cartridge": "ds1",
                    "active": true,
                    "params": {
                        "dist": 40,
                        "tone": 1100,
                        "level": 70
                    }
                },
                {
                    "slot": 1,
                    "cartridge": "dimension-chorus",
                    "active": false,
                    "params": {
                        "mode": 1,
                        "width": 50,
                        "mix": 35
                    }
                },
                {
                    "slot": 2,
                    "cartridge": "sidechain-pumper",
                    "active": true,
                    "params": {
                        "depth": 70,
                        "rate": 4,
                        "release": 0.3
                    }
                },
                {
                    "slot": 3,
                    "cartridge": "analog-delay",
                    "active": false,
                    "params": {
                        "time": 240,
                        "feedback": 25,
                        "mix": 30
                    }
                },
                {
                    "slot": 4,
                    "cartridge": "reverb",
                    "active": false,
                    "params": {
                        "decay": 1.5,
                        "mix": 30
                    }
                }
            ]
        }
    },
    "user-custom": {
        "format": "ShallotWHAM-Module",
        "version": "2.0.0",
        "id": "user-custom",
        "name": "USER PATCHES",
        "subtitle": "Custom User Sound Bank",
        "author": "User",
        "category": "Custom",
        "description": "Balanced custom sound template ready for user sound design experimentation, live tweaking, and patch saving.",
        "themeGlow": "#f59e0b",
        "tags": [
            "custom",
            "user",
            "template"
        ],
        "leads": [
            {
                "name": "INIT LEAD SAW",
                "label": "INIT SAW",
                "osc1": "sawtooth",
                "osc2": "sawtooth",
                "osc2Octave": 0,
                "osc2Detune": 1.006,
                "oscMix": 0.5,
                "filterType": "lowpass",
                "cutoff": 3800,
                "reso": 2,
                "filterEnv": {
                    "attack": 0.01,
                    "decay": 0.28,
                    "sustain": 0.4,
                    "amount": 2500
                },
                "attack": 0.01,
                "release": 0.28,
                "volume": 0.85
            },
            {
                "name": "CUSTOM SQUARE",
                "label": "USER SQUARE",
                "osc1": "square",
                "osc2": "triangle",
                "osc2Octave": 0,
                "osc2Detune": 1.004,
                "oscMix": 0.5,
                "filterType": "lowpass",
                "cutoff": 5500,
                "reso": 2.5,
                "attack": 0.005,
                "release": 0.2,
                "volume": 0.82
            },
            {
                "name": "CUSTOM BRASS",
                "label": "USER BRASS",
                "osc1": "sawtooth",
                "osc2": "sawtooth",
                "osc2Octave": 0,
                "osc2Detune": 0.993,
                "oscMix": 0.5,
                "filterType": "lowpass",
                "cutoff": 3200,
                "reso": 3.5,
                "filterEnv": {
                    "attack": 0.04,
                    "decay": 0.38,
                    "sustain": 0.45,
                    "amount": 2400
                },
                "attack": 0.04,
                "release": 0.4,
                "volume": 0.82
            },
            {
                "name": "CUSTOM PLUCK",
                "label": "USER PLUCK",
                "osc1": "triangle",
                "osc2": "sine",
                "osc2Octave": 1,
                "osc2Detune": 1.005,
                "oscMix": 0.5,
                "filterType": "lowpass",
                "cutoff": 5000,
                "reso": 3,
                "filterEnv": {
                    "attack": 0.002,
                    "decay": 0.15,
                    "sustain": 0.05,
                    "amount": 4000
                },
                "attack": 0.002,
                "release": 0.18,
                "volume": 0.88
            },
            {
                "name": "CUSTOM VOCO",
                "label": "USER VOCO",
                "osc1": "sawtooth",
                "osc2": "sawtooth",
                "osc2Octave": 0,
                "osc2Detune": 1.003,
                "oscMix": 0.5,
                "filterType": "bandpass",
                "cutoff": 2200,
                "reso": 6,
                "attack": 0.015,
                "release": 0.25,
                "volume": 0.8
            },
            {
                "name": "CUSTOM SINE",
                "label": "USER SINE",
                "osc1": "sine",
                "osc2": "sine",
                "osc2Octave": 1,
                "osc2Detune": 1.002,
                "oscMix": 0.4,
                "filterType": "lowpass",
                "cutoff": 6500,
                "reso": 1,
                "attack": 0.02,
                "release": 0.35,
                "vibrato": {
                    "rate": 5.5,
                    "depth": 6
                },
                "volume": 0.92
            },
            {
                "name": "CUSTOM CHIP",
                "label": "USER CHIP",
                "osc1": "square",
                "osc2": "square",
                "osc2Octave": 1,
                "osc2Detune": 1.001,
                "oscMix": 0.5,
                "filterType": "lowpass",
                "cutoff": 8000,
                "reso": 2,
                "attack": 0.001,
                "release": 0.12,
                "volume": 0.8
            },
            {
                "name": "CUSTOM HOOVER",
                "label": "USER HOOVER",
                "osc1": "sawtooth",
                "osc2": "sawtooth",
                "osc2Octave": 0,
                "osc2Detune": 1.018,
                "oscMix": 0.5,
                "filterType": "lowpass",
                "cutoff": 4000,
                "reso": 4,
                "filterEnv": {
                    "attack": 0.02,
                    "decay": 0.4,
                    "sustain": 0.5,
                    "amount": 2600
                },
                "attack": 0.02,
                "release": 0.35,
                "volume": 0.82
            }
        ],
        "basses": [
            {
                "name": "INIT ACID BASS",
                "label": "INIT ACID",
                "oscType": "sawtooth",
                "subType": "square",
                "subOctave": -1,
                "subMix": 0.45,
                "cutoff": 1300,
                "reso": 7,
                "envMod": 2800,
                "decay": 0.26,
                "attack": 0.004,
                "volume": 0.85
            },
            {
                "name": "INIT SUB BASS",
                "label": "INIT SUB",
                "oscType": "sine",
                "subType": "sine",
                "subOctave": -1,
                "subMix": 0.85,
                "cutoff": 480,
                "reso": 1.2,
                "envMod": 400,
                "decay": 0.5,
                "attack": 0.01,
                "volume": 0.95
            },
            {
                "name": "CUSTOM REESE",
                "label": "USER REESE",
                "oscType": "sawtooth",
                "subType": "sawtooth",
                "subOctave": -1,
                "subMix": 0.55,
                "detune": 1.016,
                "cutoff": 1600,
                "reso": 3.5,
                "envMod": 1600,
                "decay": 0.45,
                "attack": 0.01,
                "volume": 0.85
            },
            {
                "name": "CUSTOM FM PUNCH",
                "label": "USER FM",
                "oscType": "triangle",
                "subType": "square",
                "subOctave": -1,
                "subMix": 0.45,
                "cutoff": 2200,
                "reso": 4.5,
                "envMod": 3000,
                "decay": 0.2,
                "attack": 0.002,
                "volume": 0.88
            },
            {
                "name": "CUSTOM SLAP",
                "label": "USER SLAP",
                "oscType": "square",
                "subType": "triangle",
                "subOctave": -1,
                "subMix": 0.4,
                "cutoff": 1800,
                "reso": 5,
                "envMod": 2500,
                "decay": 0.18,
                "attack": 0.003,
                "volume": 0.82
            },
            {
                "name": "CUSTOM MOOG",
                "label": "USER MOOG",
                "oscType": "sawtooth",
                "subType": "triangle",
                "subOctave": -1,
                "subMix": 0.6,
                "cutoff": 950,
                "reso": 3.2,
                "envMod": 1200,
                "decay": 0.4,
                "attack": 0.01,
                "volume": 0.88
            },
            {
                "name": "CUSTOM 80s",
                "label": "USER 80s",
                "oscType": "sawtooth",
                "subType": "sawtooth",
                "subOctave": -1,
                "subMix": 0.5,
                "detune": 1.008,
                "cutoff": 1500,
                "reso": 2.8,
                "envMod": 1800,
                "decay": 0.35,
                "attack": 0.008,
                "volume": 0.86
            },
            {
                "name": "CUSTOM DROP",
                "label": "USER DROP",
                "oscType": "sine",
                "subType": "sine",
                "subOctave": -1,
                "subMix": 0.85,
                "pitchDrop": true,
                "cutoff": 600,
                "reso": 2,
                "envMod": 900,
                "decay": 0.65,
                "attack": 0.01,
                "volume": 0.95
            }
        ],
        "pedalboard": {
            "lead": [
                {
                    "slot": 0,
                    "cartridge": "ds1",
                    "active": true,
                    "params": {
                        "dist": 45,
                        "tone": 2400,
                        "level": 65
                    }
                },
                {
                    "slot": 1,
                    "cartridge": "dimension-chorus",
                    "active": true,
                    "params": {
                        "mode": 3,
                        "width": 75,
                        "mix": 50
                    }
                },
                {
                    "slot": 2,
                    "cartridge": "ps6",
                    "active": false,
                    "params": {
                        "key": "C",
                        "scale": "major",
                        "interval": "3rd",
                        "mix": 50
                    }
                },
                {
                    "slot": 3,
                    "cartridge": "delay",
                    "active": false,
                    "params": {
                        "time": 360,
                        "feedback": 35,
                        "mix": 40
                    }
                },
                {
                    "slot": 4,
                    "cartridge": "reverb",
                    "active": true,
                    "params": {
                        "decay": 2.2,
                        "mix": 45
                    }
                }
            ],
            "bass": [
                {
                    "slot": 0,
                    "cartridge": "ds1",
                    "active": true,
                    "params": {
                        "dist": 40,
                        "tone": 1000,
                        "level": 70
                    }
                },
                {
                    "slot": 1,
                    "cartridge": "dimension-chorus",
                    "active": false,
                    "params": {
                        "mode": 2,
                        "width": 50,
                        "mix": 35
                    }
                },
                {
                    "slot": 2,
                    "cartridge": "sidechain-pumper",
                    "active": true,
                    "params": {
                        "depth": 70,
                        "rate": 4,
                        "release": 0.3
                    }
                },
                {
                    "slot": 3,
                    "cartridge": "analog-delay",
                    "active": false,
                    "params": {
                        "time": 240,
                        "feedback": 25,
                        "mix": 30
                    }
                },
                {
                    "slot": 4,
                    "cartridge": "reverb",
                    "active": false,
                    "params": {
                        "decay": 1.6,
                        "mix": 35
                    }
                }
            ]
        }
    },
    "vaporwave-dreams": {
        "format": "ShallotWHAM-Module",
        "version": "2.0.0",
        "id": "vaporwave-dreams",
        "name": "VAPORWAVE DREAMS",
        "subtitle": "Late-Night Mallsoft & DX7 Nostalgia",
        "author": "Shallot",
        "category": "Ambient",
        "description": "Late-night empty mall corridors, iconic Yamaha DX7 e-pianos, Macintosh flutes, Windows 95 startup chimes, and slushwave sub basslines.",
        "themeGlow": "#06b6d4",
        "tags": [
            "vaporwave",
            "mallsoft",
            "dx7",
            "slushwave",
            "nostalgia",
            "vhs"
        ],
        "leads": [
            {
                "name": "DX7 ELECTRIC PIANO",
                "label": "DX7 PIANO",
                "osc1": "sine",
                "osc2": "triangle",
                "osc2Octave": 1,
                "osc2Detune": 1.004,
                "oscMix": 0.5,
                "filterType": "lowpass",
                "cutoff": 6200,
                "reso": 2,
                "filterEnv": {
                    "attack": 0.005,
                    "decay": 0.45,
                    "sustain": 0.3,
                    "amount": 3500
                },
                "attack": 0.005,
                "release": 0.45,
                "volume": 0.92
            },
            {
                "name": "MALL CHIME 1995",
                "label": "MALL CHIME",
                "osc1": "sine",
                "osc2": "sine",
                "osc2Octave": 2,
                "osc2Detune": 1.002,
                "oscMix": 0.4,
                "filterType": "lowpass",
                "cutoff": 7500,
                "reso": 2.5,
                "filterEnv": {
                    "attack": 0.001,
                    "decay": 0.5,
                    "sustain": 0.1,
                    "amount": 4000
                },
                "attack": 0.001,
                "release": 0.6,
                "volume": 0.9
            },
            {
                "name": "MACINTOSH FLUTE",
                "label": "MAC FLUTE",
                "osc1": "triangle",
                "osc2": "sine",
                "osc2Octave": 1,
                "osc2Detune": 1.003,
                "oscMix": 0.45,
                "filterType": "lowpass",
                "cutoff": 4800,
                "reso": 1.6,
                "attack": 0.03,
                "release": 0.35,
                "vibrato": {
                    "rate": 5,
                    "depth": 5
                },
                "volume": 0.92
            },
            {
                "name": "CASSETTE TAPE DRIFT",
                "label": "TAPE DRIFT",
                "osc1": "sawtooth",
                "osc2": "sawtooth",
                "osc2Octave": 0,
                "osc2Detune": 1.014,
                "oscMix": 0.5,
                "filterType": "lowpass",
                "cutoff": 3400,
                "reso": 2,
                "filterEnv": {
                    "attack": 0.02,
                    "decay": 0.4,
                    "sustain": 0.5,
                    "amount": 1800
                },
                "attack": 0.02,
                "release": 0.4,
                "vibrato": {
                    "rate": 3.8,
                    "depth": 6.5
                },
                "volume": 0.85
            },
            {
                "name": "PLAZA FOUNTAIN WATER",
                "label": "PLAZA WATER",
                "osc1": "sine",
                "osc2": "triangle",
                "osc2Octave": 1,
                "osc2Detune": 1.006,
                "oscMix": 0.5,
                "noiseMix": 0.06,
                "filterType": "bandpass",
                "cutoff": 3200,
                "reso": 4.5,
                "attack": 0.04,
                "release": 0.45,
                "volume": 0.88
            },
            {
                "name": "WINDOWS 95 GLOW",
                "label": "WIN95 GLOW",
                "osc1": "sine",
                "osc2": "sawtooth",
                "osc2Octave": 1,
                "osc2Detune": 1.002,
                "oscMix": 0.35,
                "filterType": "lowpass",
                "cutoff": 6800,
                "reso": 2.2,
                "filterEnv": {
                    "attack": 0.01,
                    "decay": 0.6,
                    "sustain": 0.4,
                    "amount": 3000
                },
                "attack": 0.01,
                "release": 0.7,
                "volume": 0.9
            },
            {
                "name": "ESPRIT SMOOTH PAD",
                "label": "ESPRIT PAD",
                "osc1": "sawtooth",
                "osc2": "triangle",
                "osc2Octave": 0,
                "osc2Detune": 1.008,
                "oscMix": 0.5,
                "filterType": "lowpass",
                "cutoff": 3000,
                "reso": 1.8,
                "filterEnv": {
                    "attack": 0.15,
                    "decay": 0.6,
                    "sustain": 0.7,
                    "amount": 1800
                },
                "attack": 0.15,
                "release": 0.65,
                "volume": 0.85
            },
            {
                "name": "PALM TREE MARIMBA",
                "label": "PALM MARIMBA",
                "osc1": "triangle",
                "osc2": "sine",
                "osc2Octave": 1,
                "osc2Detune": 1.003,
                "oscMix": 0.5,
                "filterType": "lowpass",
                "cutoff": 4500,
                "reso": 3.5,
                "filterEnv": {
                    "attack": 0.002,
                    "decay": 0.18,
                    "sustain": 0.05,
                    "amount": 3500
                },
                "attack": 0.002,
                "release": 0.2,
                "volume": 0.9
            }
        ],
        "basses": [
            {
                "name": "SLUSHWAVE DEEP SUB",
                "label": "SLUSH SUB",
                "oscType": "sine",
                "subType": "sine",
                "subOctave": -1,
                "subMix": 0.85,
                "cutoff": 400,
                "reso": 1,
                "envMod": 300,
                "decay": 0.55,
                "attack": 0.015,
                "volume": 0.95
            },
            {
                "name": "DX BASS 1986",
                "label": "DX BASS 1986",
                "oscType": "triangle",
                "subType": "square",
                "subOctave": -1,
                "subMix": 0.5,
                "cutoff": 1900,
                "reso": 4.8,
                "envMod": 2600,
                "decay": 0.24,
                "attack": 0.003,
                "volume": 0.88
            },
            {
                "name": "MALL ELEVATOR BASS",
                "label": "MALL BASS",
                "oscType": "triangle",
                "subType": "triangle",
                "subOctave": -1,
                "subMix": 0.6,
                "cutoff": 1000,
                "reso": 2.5,
                "envMod": 1200,
                "decay": 0.35,
                "attack": 0.008,
                "volume": 0.92
            },
            {
                "name": "VHS WARPED WARM BASS",
                "label": "VHS WARM",
                "oscType": "sawtooth",
                "subType": "sine",
                "subOctave": -1,
                "subMix": 0.6,
                "detune": 1.008,
                "cutoff": 1300,
                "reso": 3,
                "envMod": 1600,
                "decay": 0.4,
                "attack": 0.01,
                "volume": 0.88
            },
            {
                "name": "RESONANCE SUB 90s",
                "label": "RESO SUB",
                "oscType": "square",
                "subType": "sine",
                "subOctave": -1,
                "subMix": 0.75,
                "cutoff": 900,
                "reso": 5,
                "envMod": 1200,
                "decay": 0.38,
                "attack": 0.005,
                "volume": 0.88
            },
            {
                "name": "1992 ACID SQUELCH",
                "label": "1992 ACID",
                "oscType": "sawtooth",
                "subType": "sawtooth",
                "subOctave": -1,
                "subMix": 0.45,
                "cutoff": 2100,
                "reso": 8,
                "envMod": 3200,
                "decay": 0.22,
                "attack": 0.002,
                "volume": 0.85
            },
            {
                "name": "CASSETTE TAPE DROP",
                "label": "TAPE DROP",
                "oscType": "sine",
                "subType": "square",
                "subOctave": -1,
                "subMix": 0.85,
                "pitchDrop": true,
                "cutoff": 600,
                "reso": 2.5,
                "envMod": 1000,
                "decay": 0.55,
                "attack": 0.008,
                "volume": 0.95
            },
            {
                "name": "PLAZA HEARTBEAT BASS",
                "label": "PLAZA BEAT",
                "oscType": "triangle",
                "subType": "triangle",
                "subOctave": -1,
                "subMix": 0.7,
                "pitchDrop": true,
                "cutoff": 700,
                "reso": 3,
                "envMod": 1100,
                "decay": 0.48,
                "attack": 0.006,
                "volume": 0.92
            }
        ],
        "pedalboard": {
            "lead": [
                {
                    "slot": 0,
                    "cartridge": "french-preamp",
                    "active": false,
                    "params": {
                        "drive": 30,
                        "warmth": 70,
                        "output": 65
                    }
                },
                {
                    "slot": 1,
                    "cartridge": "dimension-chorus",
                    "active": true,
                    "params": {
                        "mode": 4,
                        "width": 90,
                        "mix": 65
                    }
                },
                {
                    "slot": 2,
                    "cartridge": "formant-filter",
                    "active": false,
                    "params": {
                        "vowel": 1,
                        "reso": 45,
                        "glide": 40
                    }
                },
                {
                    "slot": 3,
                    "cartridge": "space-echo",
                    "active": true,
                    "params": {
                        "time": 440,
                        "intensity": 48,
                        "flutter": 55,
                        "mix": 50
                    }
                },
                {
                    "slot": 4,
                    "cartridge": "cosmic-shimmer",
                    "active": true,
                    "params": {
                        "shimmer": 65,
                        "decay": 3.5,
                        "mix": 55
                    }
                }
            ],
            "bass": [
                {
                    "slot": 0,
                    "cartridge": "french-preamp",
                    "active": false,
                    "params": {
                        "drive": 35,
                        "warmth": 75,
                        "output": 70
                    }
                },
                {
                    "slot": 1,
                    "cartridge": "dimension-chorus",
                    "active": true,
                    "params": {
                        "mode": 2,
                        "width": 65,
                        "mix": 45
                    }
                },
                {
                    "slot": 2,
                    "cartridge": "sidechain-pumper",
                    "active": true,
                    "params": {
                        "depth": 75,
                        "rate": 4,
                        "release": 0.3
                    }
                },
                {
                    "slot": 3,
                    "cartridge": "space-echo",
                    "active": false,
                    "params": {
                        "time": 320,
                        "intensity": 30,
                        "flutter": 35,
                        "mix": 30
                    }
                },
                {
                    "slot": 4,
                    "cartridge": "cosmic-shimmer",
                    "active": false,
                    "params": {
                        "shimmer": 40,
                        "decay": 2.5,
                        "mix": 35
                    }
                }
            ]
        }
    },
    "wolf": {
        "format": "ShallotWHAM-Module",
        "version": "2.0.0",
        "id": "wolf",
        "name": "WOLF",
        "subtitle": "The Matter • Faded Paper Figures",
        "author": "Shallot",
        "category": "Electronic",
        "description": "Studio-grade indie-electronic sound bank faithfully inspired by the sonic palette of 'The Matter' (2012) by Faded Paper Figures. Features anthemic dual-saw hooks, razor-sharp 16th-note plucks, crystalline shimmer chimes, aggressive biting pulse leads, driving staccato basslines, and rich analog sub grooves.",
        "themeGlow": "#38bdf8",
        "tags": [
            "wolf",
            "the-matter",
            "faded-paper-figures",
            "indietronica",
            "synth-pop",
            "electro-pop",
            "shimmer-pop",
            "indie-dance"
        ],
        "leads": [
            {
                "name": "SAN NARCISO LEAD",
                "label": "SAN NARCISO",
                "osc1": "sawtooth",
                "osc2": "square",
                "osc2Octave": 1,
                "osc2Detune": 1.008,
                "oscMix": 0.55,
                "filterType": "lowpass",
                "cutoff": 4800,
                "reso": 3.8,
                "filterEnv": {
                    "attack": 0.002,
                    "decay": 0.22,
                    "sustain": 0.45,
                    "amount": 3200
                },
                "attack": 0.003,
                "decay": 0.35,
                "sustain": 0.65,
                "release": 0.28,
                "volume": 0.82
            },
            {
                "name": "PILEDRIVE BITE",
                "label": "PILEDRIVE",
                "osc1": "square",
                "osc2": "sawtooth",
                "osc2Octave": 0,
                "osc2Detune": 1.018,
                "oscMix": 0.65,
                "noiseMix": 0.06,
                "filterType": "lowpass",
                "cutoff": 5800,
                "reso": 5.5,
                "filterEnv": {
                    "attack": 0.001,
                    "decay": 0.18,
                    "sustain": 0.3,
                    "amount": 4200
                },
                "attack": 0.001,
                "decay": 0.22,
                "sustain": 0.5,
                "release": 0.18,
                "volume": 0.78
            },
            {
                "name": "INFO RUNS PLUCK",
                "label": "INFO RUNS",
                "osc1": "square",
                "osc2": "triangle",
                "osc2Octave": 1,
                "osc2Detune": 1.004,
                "oscMix": 0.5,
                "filterType": "bandpass",
                "cutoff": 3600,
                "reso": 4.8,
                "filterEnv": {
                    "attack": 0.001,
                    "decay": 0.14,
                    "sustain": 0.15,
                    "amount": 3000
                },
                "attack": 0.001,
                "decay": 0.16,
                "sustain": 0.2,
                "release": 0.15,
                "volume": 0.85
            },
            {
                "name": "HOLY SMOKE CHIME",
                "label": "HOLY SMOKE",
                "osc1": "sine",
                "osc2": "triangle",
                "osc2Octave": 2,
                "osc2Detune": 1.002,
                "oscMix": 0.45,
                "filterType": "lowpass",
                "cutoff": 6200,
                "reso": 2.2,
                "filterEnv": {
                    "attack": 0.004,
                    "decay": 0.65,
                    "sustain": 0.35,
                    "amount": 2400
                },
                "attack": 0.004,
                "decay": 0.7,
                "sustain": 0.3,
                "release": 0.6,
                "vibrato": {
                    "rate": 5.2,
                    "depth": 3.5
                },
                "volume": 0.88
            },
            {
                "name": "MY MAGELLAN SAW",
                "label": "MAGELLAN",
                "osc1": "sawtooth",
                "osc2": "sawtooth",
                "osc2Octave": 0,
                "osc2Detune": 1.012,
                "oscMix": 0.5,
                "filterType": "lowpass",
                "cutoff": 3800,
                "reso": 2.8,
                "filterEnv": {
                    "attack": 0.02,
                    "decay": 0.45,
                    "sustain": 0.6,
                    "amount": 2600
                },
                "attack": 0.02,
                "decay": 0.5,
                "sustain": 0.75,
                "release": 0.45,
                "vibrato": {
                    "rate": 5.6,
                    "depth": 4.8
                },
                "volume": 0.8
            },
            {
                "name": "FIRST SON PROPHET",
                "label": "FIRST SON",
                "osc1": "sawtooth",
                "osc2": "triangle",
                "osc2Octave": -1,
                "osc2Detune": 1.006,
                "oscMix": 0.45,
                "filterType": "lowpass",
                "cutoff": 3200,
                "reso": 3.2,
                "filterEnv": {
                    "attack": 0.035,
                    "decay": 0.38,
                    "sustain": 0.55,
                    "amount": 2500
                },
                "attack": 0.03,
                "decay": 0.4,
                "sustain": 0.7,
                "release": 0.35,
                "vibrato": {
                    "rate": 4.8,
                    "depth": 3
                },
                "volume": 0.82
            },
            {
                "name": "AVIDA DISCO LEAD",
                "label": "AVIDA LEAD",
                "osc1": "square",
                "osc2": "square",
                "osc2Octave": 1,
                "osc2Detune": 1.014,
                "oscMix": 0.5,
                "filterType": "lowpass",
                "cutoff": 5100,
                "reso": 6.2,
                "filterEnv": {
                    "attack": 0.002,
                    "decay": 0.2,
                    "sustain": 0.35,
                    "amount": 3800
                },
                "attack": 0.002,
                "decay": 0.25,
                "sustain": 0.45,
                "release": 0.22,
                "volume": 0.78
            },
            {
                "name": "PANTECHNE GLITCH",
                "label": "PANTECHNE",
                "osc1": "sawtooth",
                "osc2": "square",
                "osc2Octave": 1,
                "osc2Detune": 1.025,
                "oscMix": 0.55,
                "noiseMix": 0.1,
                "filterType": "bandpass",
                "cutoff": 4200,
                "reso": 6.8,
                "filterEnv": {
                    "attack": 0.001,
                    "decay": 0.15,
                    "sustain": 0.25,
                    "amount": 4500
                },
                "attack": 0.001,
                "decay": 0.2,
                "sustain": 0.4,
                "release": 0.2,
                "volume": 0.8
            }
        ],
        "basses": [
            {
                "name": "SAN NARCISO BASS",
                "label": "NARCISO BASS",
                "oscType": "sawtooth",
                "subType": "square",
                "subOctave": -1,
                "subMix": 0.65,
                "detune": 1.012,
                "cutoff": 1400,
                "reso": 5.2,
                "envMod": 2600,
                "decay": 0.24,
                "attack": 0.002,
                "volume": 0.88
            },
            {
                "name": "PILEDRIVE PUNCH",
                "label": "PILE PUNCH",
                "oscType": "square",
                "subType": "sawtooth",
                "subOctave": -1,
                "subMix": 0.7,
                "detune": 1.018,
                "cutoff": 1850,
                "reso": 6.5,
                "envMod": 3200,
                "decay": 0.26,
                "attack": 0.001,
                "volume": 0.85
            },
            {
                "name": "CIRCUIT RUNS SUB",
                "label": "CIRCUIT RUNS",
                "oscType": "triangle",
                "subType": "square",
                "subOctave": -1,
                "subMix": 0.75,
                "cutoff": 950,
                "reso": 4,
                "envMod": 1800,
                "decay": 0.2,
                "attack": 0.003,
                "volume": 0.92
            },
            {
                "name": "RELATIVELY GROOVE",
                "label": "RELATIVELY",
                "oscType": "sawtooth",
                "subType": "sine",
                "subOctave": -1,
                "subMix": 0.55,
                "detune": 1.008,
                "cutoff": 1250,
                "reso": 4.8,
                "envMod": 2200,
                "decay": 0.32,
                "attack": 0.004,
                "volume": 0.88
            },
            {
                "name": "POINTING MOON SUB",
                "label": "MOON SUB",
                "oscType": "sine",
                "subType": "sine",
                "subOctave": -1,
                "subMix": 0.85,
                "cutoff": 450,
                "reso": 2,
                "envMod": 650,
                "decay": 0.55,
                "attack": 0.008,
                "volume": 0.96
            },
            {
                "name": "AVIDA DISCO SQUELCH",
                "label": "AVIDA SQUELC",
                "oscType": "sawtooth",
                "subType": "square",
                "subOctave": -1,
                "subMix": 0.6,
                "cutoff": 1600,
                "reso": 8.5,
                "envMod": 3800,
                "decay": 0.22,
                "attack": 0.002,
                "volume": 0.84
            },
            {
                "name": "HOLY SMOKE GROWL",
                "label": "SMOKE GROWL",
                "oscType": "sawtooth",
                "subType": "triangle",
                "subOctave": -2,
                "subMix": 0.6,
                "detune": 1.022,
                "cutoff": 1100,
                "reso": 5.5,
                "envMod": 2400,
                "decay": 0.38,
                "attack": 0.003,
                "volume": 0.86
            },
            {
                "name": "DRIVER 16TH PULSE",
                "label": "DRIVER PULSE",
                "oscType": "square",
                "subType": "square",
                "subOctave": -1,
                "subMix": 0.65,
                "cutoff": 1500,
                "reso": 5,
                "envMod": 2800,
                "decay": 0.18,
                "attack": 0.002,
                "volume": 0.86
            }
        ],
        "pedalboard": {
            "lead": [
                {
                    "slot": 0,
                    "cartridge": "french-preamp",
                    "active": true,
                    "params": {
                        "drive": 40,
                        "warmth": 70,
                        "output": 75
                    }
                },
                {
                    "slot": 1,
                    "cartridge": "dimension-chorus",
                    "active": true,
                    "params": {
                        "mode": 3,
                        "width": 75,
                        "mix": 50
                    }
                },
                {
                    "slot": 2,
                    "cartridge": "sidechain-pumper",
                    "active": true,
                    "params": {
                        "depth": 65,
                        "rate": 4,
                        "release": 0.22
                    }
                },
                {
                    "slot": 3,
                    "cartridge": "space-echo",
                    "active": true,
                    "params": {
                        "time": 340,
                        "intensity": 45,
                        "flutter": 35,
                        "mix": 40
                    }
                },
                {
                    "slot": 4,
                    "cartridge": "cosmic-shimmer",
                    "active": true,
                    "params": {
                        "shimmer": 50,
                        "decay": 3.2,
                        "mix": 42
                    }
                }
            ],
            "bass": [
                {
                    "slot": 0,
                    "cartridge": "tube-screamer",
                    "active": true,
                    "params": {
                        "drive": 35,
                        "tone": 1800,
                        "level": 75
                    }
                },
                {
                    "slot": 1,
                    "cartridge": "dimension-chorus",
                    "active": false,
                    "params": {
                        "mode": 2,
                        "width": 60,
                        "mix": 35
                    }
                },
                {
                    "slot": 2,
                    "cartridge": "sidechain-pumper",
                    "active": true,
                    "params": {
                        "depth": 75,
                        "rate": 4,
                        "release": 0.25
                    }
                },
                {
                    "slot": 3,
                    "cartridge": "analog-delay",
                    "active": false,
                    "params": {
                        "time": 240,
                        "feedback": 30,
                        "mix": 25
                    }
                },
                {
                    "slot": 4,
                    "cartridge": "reverb",
                    "active": false,
                    "params": {
                        "decay": 1.5,
                        "mix": 25
                    }
                }
            ]
        }
    }
};

// Runtime Custom Modules Registry (populated from localStorage and imported .swm files)
const CUSTOM_MODULE_VAULT = {};

function registerModule(mod, persist = false) {
    if (!mod || !mod.id) return;
    MODULE_LIBRARY[mod.id] = mod;
    if (persist) {
        try {
            CUSTOM_MODULE_VAULT[mod.id] = mod;
            localStorage.setItem("shallotwham_custom_library", JSON.stringify(CUSTOM_MODULE_VAULT));
        } catch (e) {
            console.warn("Failed to persist module to custom vault", e);
        }
    }
}

function loadCustomLibraryFromStorage() {
    try {
        const raw = localStorage.getItem("shallotwham_custom_library");
        if (raw) {
            const parsed = JSON.parse(raw);
            Object.keys(parsed).forEach(id => {
                CUSTOM_MODULE_VAULT[id] = parsed[id];
                MODULE_LIBRARY[id] = parsed[id];
            });
        }
    } catch (e) {
        console.warn("Failed to load custom vault from storage", e);
    }
}

const DEFAULT_SLOT_MODULE_KEYS = ["wolf", "synthwave", "crystal-castles", "8bit-arcade", "user-custom"];

function cloneModule(mod) {
    return JSON.parse(JSON.stringify(mod));
}

// 5 Active Top-Bar Module Slots
const LOADED_MODULE_SLOTS = DEFAULT_SLOT_MODULE_KEYS.map(key => cloneModule(MODULE_LIBRARY[key]));
const SOUND_BANKS = LOADED_MODULE_SLOTS;

let LEAD_PRESETS = SOUND_BANKS[0].leads;
let BASS_PRESETS = SOUND_BANKS[0].basses;

function saveSettings() {
    try {
        const row0RootEl = document.getElementById("row0-root");
        if (row0RootEl) appSettings.row0Root = row0RootEl.value;
        const row0OctaveEl = document.getElementById("row0-octave");
        if (row0OctaveEl) appSettings.row0Octave = parseInt(row0OctaveEl.value);
        if (document.getElementById("row1-root")) appSettings.row1Root = document.getElementById("row1-root").value;
        if (document.getElementById("row2-root")) appSettings.row2Root = document.getElementById("row2-root").value;
        if (document.getElementById("row3-root")) appSettings.row3Root = document.getElementById("row3-root").value;
        if (document.getElementById("row1-octave")) appSettings.row1Octave = parseInt(document.getElementById("row1-octave").value);
        if (document.getElementById("row2-octave")) appSettings.row2Octave = parseInt(document.getElementById("row2-octave").value);
        if (document.getElementById("row3-octave")) appSettings.row3Octave = parseInt(document.getElementById("row3-octave").value);
        if (document.getElementById("synth-volume")) appSettings.synthVolume = parseInt(document.getElementById("synth-volume").value);

        // Lead Mini FX Parameters
        if (document.getElementById("lead-ds1-dist")) appSettings.leadDS1Dist = parseFloat(document.getElementById("lead-ds1-dist").value);
        if (document.getElementById("lead-ds1-tone")) appSettings.leadDS1Tone = parseFloat(document.getElementById("lead-ds1-tone").value);
        if (document.getElementById("lead-ds1-level")) appSettings.leadDS1Level = parseFloat(document.getElementById("lead-ds1-level").value);
        if (document.getElementById("lead-ps6-key")) appSettings.leadPS6Key = document.getElementById("lead-ps6-key").value;
        if (document.getElementById("lead-ps6-scale")) appSettings.leadPS6Scale = document.getElementById("lead-ps6-scale").value;
        if (document.getElementById("lead-ps6-interval")) appSettings.leadPS6Interval = document.getElementById("lead-ps6-interval").value;
        if (document.getElementById("lead-ps6-mix")) appSettings.leadPS6Mix = parseFloat(document.getElementById("lead-ps6-mix").value);
        if (document.getElementById("lead-delay-time")) appSettings.leadDelayTime = parseFloat(document.getElementById("lead-delay-time").value);
        if (document.getElementById("lead-delay-fdbk")) appSettings.leadDelayFeedback = parseFloat(document.getElementById("lead-delay-fdbk").value);
        if (document.getElementById("lead-delay-mix")) appSettings.leadDelayMix = parseFloat(document.getElementById("lead-delay-mix").value);
        if (document.getElementById("lead-reverb-mix")) appSettings.leadReverbMix = parseFloat(document.getElementById("lead-reverb-mix").value);

        // Bass Mini FX Parameters
        if (document.getElementById("bass-ds1-dist")) appSettings.bassDS1Dist = parseFloat(document.getElementById("bass-ds1-dist").value);
        if (document.getElementById("bass-ds1-tone")) appSettings.bassDS1Tone = parseFloat(document.getElementById("bass-ds1-tone").value);
        if (document.getElementById("bass-ds1-level")) appSettings.bassDS1Level = parseFloat(document.getElementById("bass-ds1-level").value);
        if (document.getElementById("bass-ps6-key")) appSettings.bassPS6Key = document.getElementById("bass-ps6-key").value;
        if (document.getElementById("bass-ps6-scale")) appSettings.bassPS6Scale = document.getElementById("bass-ps6-scale").value;
        if (document.getElementById("bass-ps6-interval")) appSettings.bassPS6Interval = document.getElementById("bass-ps6-interval").value;
        if (document.getElementById("bass-ps6-mix")) appSettings.bassPS6Mix = parseFloat(document.getElementById("bass-ps6-mix").value);
        if (document.getElementById("bass-delay-time")) appSettings.bassDelayTime = parseFloat(document.getElementById("bass-delay-time").value);
        if (document.getElementById("bass-delay-fdbk")) appSettings.bassDelayFeedback = parseFloat(document.getElementById("bass-delay-fdbk").value);
        if (document.getElementById("bass-delay-mix")) appSettings.bassDelayMix = parseFloat(document.getElementById("bass-delay-mix").value);
        if (document.getElementById("bass-reverb-mix")) appSettings.bassReverbMix = parseFloat(document.getElementById("bass-reverb-mix").value);

        // Lead settings persistence
        if (document.getElementById("lead-cutoff")) {
            appSettings.leadCutoff = parseFloat(document.getElementById("lead-cutoff").value);
        }
        if (document.getElementById("lead-reso")) {
            appSettings.leadResonance = parseFloat(document.getElementById("lead-reso").value);
        }
        if (document.getElementById("lead-attack")) {
            appSettings.leadAttack = parseFloat(document.getElementById("lead-attack").value);
        }
        if (document.getElementById("lead-decay")) {
            appSettings.leadDecay = parseFloat(document.getElementById("lead-decay").value);
        }
        if (document.getElementById("lead-release")) {
            appSettings.leadRelease = parseFloat(document.getElementById("lead-release").value);
        }
        if (document.getElementById("lead-volume")) {
            appSettings.leadVolume = parseFloat(document.getElementById("lead-volume").value);
        }

        // Bass settings persistence
        if (document.getElementById("bass-cutoff")) {
            appSettings.bassCutoff = parseFloat(document.getElementById("bass-cutoff").value);
        }
        if (document.getElementById("bass-reso")) {
            appSettings.bassResonance = parseFloat(document.getElementById("bass-reso").value);
        }
        if (document.getElementById("bass-sub-mix")) {
            appSettings.bassSubLevel = parseFloat(document.getElementById("bass-sub-mix").value);
        }
        if (document.getElementById("bass-attack")) {
            appSettings.bassAttack = parseFloat(document.getElementById("bass-attack").value);
        }
        if (document.getElementById("bass-decay")) {
            appSettings.bassDecay = parseFloat(document.getElementById("bass-decay").value);
        }
        if (document.getElementById("bass-volume")) {
            appSettings.bassVolume = parseFloat(document.getElementById("bass-volume").value);
        }

        // Polyphony settings
        if (document.getElementById("lead-polyphony")) {
            appSettings.leadPolyphony = parseInt(document.getElementById("lead-polyphony").value);
        }
        if (document.getElementById("bass-polyphony")) {
            appSettings.bassPolyphony = parseInt(document.getElementById("bass-polyphony").value);
        }

        // 5-Slot Module Architecture Persistence
        appSettings.loadedModuleSlots = LOADED_MODULE_SLOTS.map(m => m.id);
        appSettings.shallotwham_pedalboards = {
            lead: leadPedalSlots.map(s => ({ slot: s.slotIdx, cartridge: s.cartridgeId, active: s.active, params: s.params })),
            bass: bassPedalSlots.map(s => ({ slot: s.slotIdx, cartridge: s.cartridgeId, active: s.active, params: s.params }))
        };
        localStorage.setItem("shallotwham_settings", JSON.stringify(appSettings));
    } catch (e) {
        console.warn("Failed to save settings", e);
    }
}

function loadSettings() {
    try {
        const saved = localStorage.getItem("shallotwham_settings") || localStorage.getItem("microwham_settings");
        if (saved) {
            Object.assign(appSettings, JSON.parse(saved));
        }
    } catch (e) {
        console.warn("Failed to load settings", e);
    }

    // Restore Loaded Module Slots if configured
    if (Array.isArray(appSettings.loadedModuleSlots) && appSettings.loadedModuleSlots.length === 5) {
        appSettings.loadedModuleSlots.forEach((modId, sIdx) => {
            if (sIdx >= 0 && sIdx < 5 && MODULE_LIBRARY[modId]) {
                LOADED_MODULE_SLOTS[sIdx] = cloneModule(MODULE_LIBRARY[modId]);
            }
        });
        const currentBankIdx = appSettings.soundBank || 0;
        if (LOADED_MODULE_SLOTS[currentBankIdx]) {
            LEAD_PRESETS = LOADED_MODULE_SLOTS[currentBankIdx].leads;
            BASS_PRESETS = LOADED_MODULE_SLOTS[currentBankIdx].basses;
        }
        updateModuleSlotTabs();
    }

    const row0RootEl = document.getElementById("row0-root");
    if (row0RootEl) row0RootEl.value = appSettings.row0Root || "G";
    const row0OctaveEl = document.getElementById("row0-octave");
    if (row0OctaveEl) row0OctaveEl.value = appSettings.row0Octave || 3;

    if (document.getElementById("row1-root")) document.getElementById("row1-root").value = appSettings.row1Root || "D";
    if (document.getElementById("row2-root")) document.getElementById("row2-root").value = appSettings.row2Root || "G";
    if (document.getElementById("row3-root")) document.getElementById("row3-root").value = appSettings.row3Root || "D";
    if (document.getElementById("row1-octave")) document.getElementById("row1-octave").value = appSettings.row1Octave || 3;
    if (document.getElementById("row2-octave")) document.getElementById("row2-octave").value = appSettings.row2Octave || 2;
    if (document.getElementById("row3-octave")) document.getElementById("row3-octave").value = appSettings.row3Octave || 2;
    if (document.getElementById("synth-volume")) document.getElementById("synth-volume").value = appSettings.synthVolume || 75;

    updateLeadUI();
    updateBassUI();

    // Restore Modular Pedalboards
    if (appSettings.shallotwham_pedalboards) {
        if (Array.isArray(appSettings.shallotwham_pedalboards.lead)) {
            appSettings.shallotwham_pedalboards.lead.forEach(p => {
                if (p.slot >= 0 && p.slot < 5) {
                    leadPedalSlots[p.slot].active = !!p.active;
                    loadPedalCartridge("lead", p.slot, p.cartridge, p.params || {}, false);
                }
            });
        }
        if (Array.isArray(appSettings.shallotwham_pedalboards.bass)) {
            appSettings.shallotwham_pedalboards.bass.forEach(p => {
                if (p.slot >= 0 && p.slot < 5) {
                    bassPedalSlots[p.slot].active = !!p.active;
                    loadPedalCartridge("bass", p.slot, p.cartridge, p.params || {}, false);
                }
            });
        }
    } else {
        const activeMod = LOADED_MODULE_SLOTS[appSettings.soundBank || 0];
        if (activeMod) syncPedalboardsFromModule(activeMod);
    }
}

function updateLeadUI() {
    const presetIdx = appSettings.leadPreset !== undefined ? appSettings.leadPreset : 0;
    const preset = LEAD_PRESETS[presetIdx] || LEAD_PRESETS[0];

    const displayNum = document.getElementById("lead-display-num");
    const displayName = document.getElementById("lead-display-name");
    if (displayNum && displayName) {
        displayNum.textContent = `LEAD ${presetIdx + 1}`;
        displayName.textContent = preset.name;
    }

    document.querySelectorAll(".lead-preset-btn").forEach(btn => {
        const pIdx = parseInt(btn.getAttribute("data-lead-preset"));
        if (pIdx === presetIdx) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    const cutoffEl = document.getElementById("lead-cutoff");
    const cutoffValEl = document.getElementById("lead-val-cutoff");
    if (cutoffEl) {
        cutoffEl.value = appSettings.leadCutoff !== undefined ? appSettings.leadCutoff : preset.cutoff;
        if (cutoffValEl) cutoffValEl.textContent = `${Math.round(cutoffEl.value)}Hz`;
    }

    const resoEl = document.getElementById("lead-reso");
    const resoValEl = document.getElementById("lead-val-reso");
    if (resoEl) {
        resoEl.value = appSettings.leadResonance !== undefined ? appSettings.leadResonance : preset.reso;
        if (resoValEl) resoValEl.textContent = Number(resoEl.value).toFixed(1);
    }

    const attackEl = document.getElementById("lead-attack");
    const attackValEl = document.getElementById("lead-val-attack");
    if (attackEl) {
        attackEl.value = appSettings.leadAttack !== undefined ? appSettings.leadAttack : preset.attack;
        if (attackValEl) attackValEl.textContent = `${Number(attackEl.value).toFixed(2)}s`;
    }

    const decayEl = document.getElementById("lead-decay");
    const decayValEl = document.getElementById("lead-val-decay");
    if (decayEl) {
        decayEl.value = appSettings.leadDecay !== undefined ? appSettings.leadDecay : (preset.decay || 0.25);
        if (decayValEl) decayValEl.textContent = `${Number(decayEl.value).toFixed(2)}s`;
    }

    const releaseEl = document.getElementById("lead-release");
    const releaseValEl = document.getElementById("lead-val-release");
    if (releaseEl) {
        releaseEl.value = appSettings.leadRelease !== undefined ? appSettings.leadRelease : preset.release;
        if (releaseValEl) releaseValEl.textContent = `${Number(releaseEl.value).toFixed(2)}s`;
    }

    const leadPolyEl = document.getElementById("lead-polyphony");
    const leadPolyValEl = document.getElementById("lead-val-polyphony");
    if (leadPolyEl) {
        leadPolyEl.value = appSettings.leadPolyphony !== undefined ? appSettings.leadPolyphony : 4;
        if (leadPolyValEl) leadPolyValEl.textContent = leadPolyEl.value;
    }

    const volEl = document.getElementById("lead-volume");
    const volValEl = document.getElementById("lead-val-vol");
    if (volEl) {
        volEl.value = appSettings.leadVolume !== undefined ? appSettings.leadVolume : 85;
        if (volValEl) volValEl.textContent = `${Math.round(volEl.value)}%`;
    }
}

function updateBassUI() {
    const presetIdx = appSettings.bassPreset !== undefined ? appSettings.bassPreset : 0;
    const preset = BASS_PRESETS[presetIdx] || BASS_PRESETS[0];

    const displayNum = document.getElementById("bass-display-num");
    const displayName = document.getElementById("bass-display-name");
    if (displayNum && displayName) {
        displayNum.textContent = `BASS ${presetIdx + 1}`;
        displayName.textContent = preset.name;
    }

    document.querySelectorAll(".bass-preset-btn").forEach(btn => {
        const pIdx = parseInt(btn.getAttribute("data-bass-preset"));
        if (pIdx === presetIdx) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    const cutoffEl = document.getElementById("bass-cutoff");
    const cutoffValEl = document.getElementById("bass-val-cutoff");
    if (cutoffEl) {
        cutoffEl.value = appSettings.bassCutoff !== undefined ? appSettings.bassCutoff : preset.cutoff;
        if (cutoffValEl) cutoffValEl.textContent = `${Math.round(cutoffEl.value)}Hz`;
    }

    const resoEl = document.getElementById("bass-reso");
    const resoValEl = document.getElementById("bass-val-reso");
    if (resoEl) {
        resoEl.value = appSettings.bassResonance !== undefined ? appSettings.bassResonance : preset.reso;
        if (resoValEl) resoValEl.textContent = Number(resoEl.value).toFixed(1);
    }

    const subEl = document.getElementById("bass-sub-mix");
    const subValEl = document.getElementById("bass-val-sub");
    if (subEl) {
        subEl.value = appSettings.bassSubLevel !== undefined ? appSettings.bassSubLevel : 50;
        if (subValEl) subValEl.textContent = `${Math.round(subEl.value)}%`;
    }

    const attackEl = document.getElementById("bass-attack");
    const attackValEl = document.getElementById("bass-val-attack");
    if (attackEl) {
        attackEl.value = appSettings.bassAttack !== undefined ? appSettings.bassAttack : (preset.attack || 0.005);
        if (attackValEl) attackValEl.textContent = `${Number(attackEl.value).toFixed(3)}s`;
    }

    const decayEl = document.getElementById("bass-decay");
    const decayValEl = document.getElementById("bass-val-decay");
    if (decayEl) {
        decayEl.value = appSettings.bassDecay !== undefined ? appSettings.bassDecay : (preset.decay || 0.25);
        if (decayValEl) decayValEl.textContent = `${Number(decayEl.value).toFixed(2)}s`;
    }

    const volEl = document.getElementById("bass-volume");
    const volValEl = document.getElementById("bass-val-vol");
    if (volEl) {
        volEl.value = appSettings.bassVolume !== undefined ? appSettings.bassVolume : 85;
        if (volValEl) volValEl.textContent = `${Math.round(volEl.value)}%`;
    }

    const bassPolyEl = document.getElementById("bass-polyphony");
    const bassPolyValEl = document.getElementById("bass-val-polyphony");
    if (bassPolyEl) {
        bassPolyEl.value = appSettings.bassPolyphony !== undefined ? appSettings.bassPolyphony : 3;
        if (bassPolyValEl) bassPolyValEl.textContent = bassPolyEl.value;
    }
}

function syncUIFromSettings() {
    // 1. Lead Mini Pedals Sync
    const leadDs1Led = document.getElementById("lead-ds1-led");
    const leadDs1Toggle = document.getElementById("lead-ds1-toggle");
    if (leadDs1Led && leadDs1Toggle) {
        if (appSettings.leadDS1Active) { leadDs1Led.classList.add("active"); leadDs1Toggle.classList.add("active"); }
        else { leadDs1Led.classList.remove("active"); leadDs1Toggle.classList.remove("active"); }
    }
    const leadPs6Led = document.getElementById("lead-ps6-led");
    const leadPs6Toggle = document.getElementById("lead-ps6-toggle");
    if (leadPs6Led && leadPs6Toggle) {
        if (appSettings.leadPS6Active) { leadPs6Led.classList.add("active"); leadPs6Toggle.classList.add("active"); }
        else { leadPs6Led.classList.remove("active"); leadPs6Toggle.classList.remove("active"); }
    }
    const leadDelayLed = document.getElementById("lead-delay-led");
    const leadDelayToggle = document.getElementById("lead-delay-toggle");
    if (leadDelayLed && leadDelayToggle) {
        if (appSettings.leadDelayActive) { leadDelayLed.classList.add("active"); leadDelayToggle.classList.add("active"); }
        else { leadDelayLed.classList.remove("active"); leadDelayToggle.classList.remove("active"); }
    }
    const leadReverbLed = document.getElementById("lead-reverb-led");
    const leadReverbToggle = document.getElementById("lead-reverb-toggle");
    if (leadReverbLed && leadReverbToggle) {
        if (appSettings.leadReverbActive) { leadReverbLed.classList.add("active"); leadReverbToggle.classList.add("active"); }
        else { leadReverbLed.classList.remove("active"); leadReverbToggle.classList.remove("active"); }
    }

    // Lead Sliders / Selects Sync
    if (document.getElementById("lead-ds1-dist")) document.getElementById("lead-ds1-dist").value = appSettings.leadDS1Dist || 50;
    if (document.getElementById("lead-ds1-tone")) document.getElementById("lead-ds1-tone").value = appSettings.leadDS1Tone || 2500;
    if (document.getElementById("lead-ds1-level")) document.getElementById("lead-ds1-level").value = appSettings.leadDS1Level || 65;
    if (document.getElementById("lead-ps6-key")) document.getElementById("lead-ps6-key").value = appSettings.leadPS6Key || "C";
    if (document.getElementById("lead-ps6-scale")) document.getElementById("lead-ps6-scale").value = appSettings.leadPS6Scale || "major";
    if (document.getElementById("lead-ps6-interval")) document.getElementById("lead-ps6-interval").value = appSettings.leadPS6Interval || "3rd";
    if (document.getElementById("lead-ps6-mix")) document.getElementById("lead-ps6-mix").value = appSettings.leadPS6Mix || 50;
    if (document.getElementById("lead-delay-time")) document.getElementById("lead-delay-time").value = appSettings.leadDelayTime || 380;
    if (document.getElementById("lead-delay-fdbk")) document.getElementById("lead-delay-fdbk").value = appSettings.leadDelayFeedback || 40;
    if (document.getElementById("lead-delay-mix")) document.getElementById("lead-delay-mix").value = appSettings.leadDelayMix || 45;
    if (document.getElementById("lead-reverb-mix")) document.getElementById("lead-reverb-mix").value = appSettings.leadReverbMix || 55;

    // 2. Bass Mini Pedals Sync
    const bassDs1Led = document.getElementById("bass-ds1-led");
    const bassDs1Toggle = document.getElementById("bass-ds1-toggle");
    if (bassDs1Led && bassDs1Toggle) {
        if (appSettings.bassDS1Active) { bassDs1Led.classList.add("active"); bassDs1Toggle.classList.add("active"); }
        else { bassDs1Led.classList.remove("active"); bassDs1Toggle.classList.remove("active"); }
    }
    const bassPs6Led = document.getElementById("bass-ps6-led");
    const bassPs6Toggle = document.getElementById("bass-ps6-toggle");
    if (bassPs6Led && bassPs6Toggle) {
        if (appSettings.bassPS6Active) { bassPs6Led.classList.add("active"); bassPs6Toggle.classList.add("active"); }
        else { bassPs6Led.classList.remove("active"); bassPs6Toggle.classList.remove("active"); }
    }
    const bassDelayLed = document.getElementById("bass-delay-led");
    const bassDelayToggle = document.getElementById("bass-delay-toggle");
    if (bassDelayLed && bassDelayToggle) {
        if (appSettings.bassDelayActive) { bassDelayLed.classList.add("active"); bassDelayToggle.classList.add("active"); }
        else { bassDelayLed.classList.remove("active"); bassDelayToggle.classList.remove("active"); }
    }
    const bassReverbLed = document.getElementById("bass-reverb-led");
    const bassReverbToggle = document.getElementById("bass-reverb-toggle");
    if (bassReverbLed && bassReverbToggle) {
        if (appSettings.bassReverbActive) { bassReverbLed.classList.add("active"); bassReverbToggle.classList.add("active"); }
        else { bassReverbLed.classList.remove("active"); bassReverbToggle.classList.remove("active"); }
    }

    // Bass Sliders / Selects Sync
    if (document.getElementById("bass-ds1-dist")) document.getElementById("bass-ds1-dist").value = appSettings.bassDS1Dist || 45;
    if (document.getElementById("bass-ds1-tone")) document.getElementById("bass-ds1-tone").value = appSettings.bassDS1Tone || 900;
    if (document.getElementById("bass-ds1-level")) document.getElementById("bass-ds1-level").value = appSettings.bassDS1Level || 70;
    if (document.getElementById("bass-ps6-key")) document.getElementById("bass-ps6-key").value = appSettings.bassPS6Key || "C";
    if (document.getElementById("bass-ps6-scale")) document.getElementById("bass-ps6-scale").value = appSettings.bassPS6Scale || "minor";
    if (document.getElementById("bass-ps6-interval")) document.getElementById("bass-ps6-interval").value = appSettings.bassPS6Interval || "oct-down";
    if (document.getElementById("bass-ps6-mix")) document.getElementById("bass-ps6-mix").value = appSettings.bassPS6Mix || 60;
    if (document.getElementById("bass-delay-time")) document.getElementById("bass-delay-time").value = appSettings.bassDelayTime || 280;
    if (document.getElementById("bass-delay-fdbk")) document.getElementById("bass-delay-fdbk").value = appSettings.bassDelayFeedback || 30;
    if (document.getElementById("bass-delay-mix")) document.getElementById("bass-delay-mix").value = appSettings.bassDelayMix || 35;
    if (document.getElementById("bass-reverb-mix")) document.getElementById("bass-reverb-mix").value = appSettings.bassReverbMix || 40;

    // Bottom Effect status indicators
    const reverbEl = document.getElementById("fx-reverb");
    if (reverbEl) {
        if (appSettings.leadReverbActive || appSettings.bassReverbActive) reverbEl.classList.add("active");
        else reverbEl.classList.remove("active");
    }
    const delayEl = document.getElementById("fx-delay");
    if (delayEl) {
        if (appSettings.leadDelayActive || appSettings.bassDelayActive) delayEl.classList.add("active");
        else delayEl.classList.remove("active");
    }
}

// Customizable Keybinds state
let keybinds = {
    leadOctDown: "F7",
    leadOctUp: "F8",
    leadDist: "Backquote",
    leadHarm: "Backslash",
    leadDelay: "F10",
    leadReverb: "F9",
    bassOctDown: "F5",
    bassOctUp: "F6",
    bassDist: "F1",
    bassHarm: "F2",
    bassDelay: "F3",
    bassReverb: "F4"
};
try {
    const saved = localStorage.getItem("shallotwham_keybinds") || localStorage.getItem("microwham_keybinds");
    if (saved) {
        Object.assign(keybinds, JSON.parse(saved));
    }
} catch (e) {
    console.warn("Failed to load keybinds", e);
}
let activeRebindTarget = null;

// Global bend variables
let mouseBendSemitones = 0;
let controllerBendSemitones = 0;

// Independent Instrument Octave Shifts (-2 to +2)
let leadOctaveShift = 0;
let bassOctaveShift = 0;

function shiftLeadOctave(delta) {
    leadOctaveShift = Math.max(-2, Math.min(2, leadOctaveShift + delta));
    updateLeadOctaveIndicators();
    buildVirtualKeyboard();
}

function shiftBassOctave(delta) {
    bassOctaveShift = Math.max(-2, Math.min(2, bassOctaveShift + delta));
    updateBassOctaveIndicators();
    buildVirtualKeyboard();
}

function updateLeadOctaveIndicators() {
    const ids = ["lead-oct-down-2", "lead-oct-down-1", "lead-oct-normal", "lead-oct-up-1", "lead-oct-up-2"];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove("active");
    });
    const map = {
        "-2": "lead-oct-down-2",
        "-1": "lead-oct-down-1",
        "0": "lead-oct-normal",
        "1": "lead-oct-up-1",
        "2": "lead-oct-up-2"
    };
    const activeEl = document.getElementById(map[leadOctaveShift]);
    if (activeEl) activeEl.classList.add("active");
}

function updateBassOctaveIndicators() {
    const ids = ["bass-oct-down-2", "bass-oct-down-1", "bass-oct-normal", "bass-oct-up-1", "bass-oct-up-2"];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove("active");
    });
    const map = {
        "-2": "bass-oct-down-2",
        "-1": "bass-oct-down-1",
        "0": "bass-oct-normal",
        "1": "bass-oct-up-1",
        "2": "bass-oct-up-2"
    };
    const activeEl = document.getElementById(map[bassOctaveShift]);
    if (activeEl) activeEl.classList.add("active");
}

// Effects states
let reverbActive = false;
let delayActive = false;
let tremoloSpeed = 0;
let tremoloDepth = 0;

// Nodes
let delayNode = null;
let delayFeedbackNode = null;
let delayGain = null;
let reverbNode = null;
let reverbGain = null;

// Active Synthesizer Voices Pools (Independent Polyphony)
// Polyphony limits are now read from appSettings.leadPolyphony / appSettings.bassPolyphony
let activeLeadVoices = [];
let activeBassVoices = [];

// Gamepad polling state
let gamepadConnected = false;
let gamepadIndex = null;
let lastGamepadButtons = [];

// Tap tempo for Delay
let lastDelayTapTime = 0;
let delayTapTimes = [];

// Helper to determine instrument from key
function isLeadKey(key) {
    return ROW0_KEYS.includes(key) || ROW1_KEYS.includes(key);
}

function isBassKey(key) {
    return ROW2_KEYS.includes(key) || ROW3_KEYS.includes(key);
}

// Pre-computed O(1) Lookup Cache for Zero-Latency Note Triggering
let KEY_CACHE = {};
let KEY_ELEMENTS = {};

// Virtual Keyboard layout builder with Dual Instrument Separation
function buildVirtualKeyboard() {
    const r0Root = document.getElementById("row0-root") ? document.getElementById("row0-root").value : (appSettings.row0Root || "G");
    const r1Root = document.getElementById("row1-root") ? document.getElementById("row1-root").value : (appSettings.row1Root || "D");
    const r2Root = document.getElementById("row2-root") ? document.getElementById("row2-root").value : (appSettings.row2Root || "G");
    const r3Root = document.getElementById("row3-root") ? document.getElementById("row3-root").value : (appSettings.row3Root || "D");

    const r0Octave = parseInt(document.getElementById("row0-octave") ? document.getElementById("row0-octave").value : (appSettings.row0Octave || 3));
    const r1Octave = parseInt(document.getElementById("row1-octave") ? document.getElementById("row1-octave").value : (appSettings.row1Octave || 3));
    const r2Octave = parseInt(document.getElementById("row2-octave") ? document.getElementById("row2-octave").value : (appSettings.row2Octave || 2));
    const r3Octave = parseInt(document.getElementById("row3-octave") ? document.getElementById("row3-octave").value : (appSettings.row3Octave || 2));

    const r0RootIndex = NOTES.indexOf(r0Root);
    const r1RootIndex = NOTES.indexOf(r1Root);
    const r2RootIndex = NOTES.indexOf(r2Root);
    const r3RootIndex = NOTES.indexOf(r3Root);

    KEY_CACHE = {};
    KEY_ELEMENTS = {};

    setupRowHTML("kb-row-0", ROW0_KEYS, ROW0_CHAR, r0RootIndex, r0Octave + leadOctaveShift, "lead");
    setupRowHTML("kb-row-1", ROW1_KEYS, ROW1_CHAR, r1RootIndex, r1Octave + leadOctaveShift, "lead");
    setupRowHTML("kb-row-2", ROW2_KEYS, ROW2_CHAR, r2RootIndex, r2Octave + bassOctaveShift, "bass");
    setupRowHTML("kb-row-3", ROW3_KEYS, ROW3_CHAR, r3RootIndex, r3Octave + bassOctaveShift, "bass");
}

function setupRowHTML(rowId, keys, chars, rootNoteIndex, baseOctave, instrumentType) {
    const rowEl = document.getElementById(rowId);
    if (!rowEl) return;
    rowEl.innerHTML = "";
    keys.forEach((key, i) => {
        const noteIndex = (rootNoteIndex + i) % 12;
        const noteName = NOTES[noteIndex];
        const octOffset = Math.floor((rootNoteIndex + i) / 12);
        const finalOctave = baseOctave + octOffset;
        const frequency = getNoteFrequency(noteName, finalOctave);

        // Pre-compute O(1) cache entry
        KEY_CACHE[key] = {
            noteName: `${noteName}${finalOctave}`,
            frequency: frequency,
            instrument: instrumentType
        };

        const keyCap = document.createElement("div");
        keyCap.className = `key-cap ${instrumentType}-key`;
        keyCap.id = `key-${key}`;
        keyCap.innerHTML = `
            <span class="char">${chars[i]}</span>
            <span class="note">${noteName}${finalOctave}</span>
        `;

        keyCap.addEventListener("mousedown", (e) => {
            e.preventDefault();
            handleKeyDown(key);
        });
        keyCap.addEventListener("mouseup", (e) => {
            e.preventDefault();
            handleKeyUp(key);
        });
        keyCap.addEventListener("mouseleave", () => handleKeyUp(key));
        keyCap.addEventListener("touchstart", (e) => {
            e.preventDefault();
            handleKeyDown(key);
        }, { passive: false });
        keyCap.addEventListener("touchend", (e) => {
            e.preventDefault();
            handleKeyUp(key);
        }, { passive: false });
        keyCap.addEventListener("touchcancel", (e) => {
            e.preventDefault();
            handleKeyUp(key);
        }, { passive: false });

        KEY_ELEMENTS[key] = keyCap;
        rowEl.appendChild(keyCap);
    });
}

function getNoteFrequency(noteName, octave) {
    const noteIndex = NOTES.indexOf(noteName);
    const stepsFromA4 = noteIndex + (octave - 4) * 12;
    return 440 * Math.pow(2, stepsFromA4 / 12);
}

// Instant O(1) frequency lookup without layout thrashing
function getKeyNoteAndFrequency(keyCode) {
    return KEY_CACHE[keyCode] || null;
}

function updatePolyphonyCounter() {
    const el = document.getElementById("polyphony-counter");
    if (!el) return;
    const totalActive = activeLeadVoices.length + activeBassVoices.length;
    const maxLead = appSettings.leadPolyphony !== undefined ? appSettings.leadPolyphony : 4;
    el.textContent = `VOICES: ${totalActive}/${maxLead}`;
}

// Intelligent Harmonizer Interval Generator (PS-6)
function getHarmonizedFrequencies(baseFreq, noteNameWithOctave, instrument = "lead") {
    const isLead = instrument === "lead";
    const active = isLead ? appSettings.leadPS6Active : appSettings.bassPS6Active;
    if (!active) return [];

    const match = noteNameWithOctave.match(/^([A-G]#?)(-?\d+)$/);
    if (!match) return [];
    const noteName = match[1];

    const scaleRoot = isLead ? (appSettings.leadPS6Key || "C") : (appSettings.bassPS6Key || "C");
    const scaleType = isLead ? (appSettings.leadPS6Scale || "major") : (appSettings.bassPS6Scale || "minor");
    const interval = isLead ? (appSettings.leadPS6Interval || "3rd") : (appSettings.bassPS6Interval || "oct-down");

    const chromNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const majorSteps = [0, 2, 4, 5, 7, 9, 11];
    const minorSteps = [0, 2, 3, 5, 7, 8, 10];
    const scaleSteps = scaleType === 'major' ? majorSteps : minorSteps;

    const rootChromIdx = chromNotes.indexOf(scaleRoot);
    const noteChromIdx = chromNotes.indexOf(noteName);
    let semitonesFromRoot = (noteChromIdx - rootChromIdx + 12) % 12;

    let currentDegree = 0;
    let minDiff = 12;
    for (let d = 0; d < 7; d++) {
        const diff = Math.min((semitonesFromRoot - scaleSteps[d] + 12) % 12, (scaleSteps[d] - semitonesFromRoot + 12) % 12);
        if (diff < minDiff) {
            minDiff = diff;
            currentDegree = d;
        }
    }

    let harmonies = [];
    if (interval === '3rd') {
        const harmonyDegree = (currentDegree + 2) % 7;
        const octWrap = Math.floor((currentDegree + 2) / 7);
        const harmonySemitones = scaleSteps[harmonyDegree] + (octWrap * 12);
        const semitoneOffset = harmonySemitones - semitonesFromRoot;
        harmonies.push(baseFreq * Math.pow(2, semitoneOffset / 12));
    } else if (interval === '5th') {
        const harmonyDegree = (currentDegree + 4) % 7;
        const octWrap = Math.floor((currentDegree + 4) / 7);
        const harmonySemitones = scaleSteps[harmonyDegree] + (octWrap * 12);
        const semitoneOffset = harmonySemitones - semitonesFromRoot;
        harmonies.push(baseFreq * Math.pow(2, semitoneOffset / 12));
    } else if (interval === 'oct') {
        harmonies.push(baseFreq * 2.0);
    } else if (interval === 'oct-down') {
        harmonies.push(baseFreq * 0.5);
    }
    return harmonies;
}

// SWM v2.0 Upgraded Lead Voice Generator
function spawnLeadVoice(key, frequency, isHarmony) {
    if (!audioCtx) return;
    const presetIdx = appSettings.leadPreset !== undefined ? appSettings.leadPreset : 0;
    const patch = LEAD_PRESETS[presetIdx] || LEAD_PRESETS[0];

    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const osc1Gain = audioCtx.createGain();
    const osc2Gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    const voiceGain = audioCtx.createGain();
    let vibratoNode = null;
    let vibratoGain = null;
    let noiseNode = null;
    let noiseGain = null;

    voiceGain.gain.setValueAtTime(0, audioCtx.currentTime);

    // 1. Dual Oscillators with Octave & Detune
    osc1.type = patch.osc1 || "sawtooth";
    osc1.frequency.setValueAtTime(frequency, audioCtx.currentTime);

    const osc2Oct = patch.osc2Octave || 0;
    const osc2DetuneRatio = patch.osc2Detune || 1.004;
    osc2.type = patch.osc2 || "sawtooth";
    osc2.frequency.setValueAtTime(frequency * Math.pow(2, osc2Oct) * osc2DetuneRatio, audioCtx.currentTime);

    // Oscillator Balance Mix
    const oscMix = patch.oscMix !== undefined ? patch.oscMix : 0.5;
    osc1Gain.gain.setValueAtTime(Math.max(0.2, 1.0 - (oscMix * 0.5)), audioCtx.currentTime);
    osc2Gain.gain.setValueAtTime(Math.max(0.1, oscMix * 1.1), audioCtx.currentTime);
    osc1.connect(osc1Gain);
    osc2.connect(osc2Gain);

    // Optional Noise Generator for percussive / air / 8-bit texture
    if (patch.noiseMix && patch.noiseMix > 0.01) {
        const bufLen = Math.floor(audioCtx.sampleRate * 1.5);
        const noiseBuf = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
        const out = noiseBuf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) {
            out[i] = Math.random() * 2 - 1;
        }
        noiseNode = audioCtx.createBufferSource();
        noiseNode.buffer = noiseBuf;
        noiseNode.loop = true;
        noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(patch.noiseMix * 0.3, audioCtx.currentTime);
        noiseNode.connect(noiseGain);
        noiseGain.connect(filter);
        noiseNode.start();
    }

    // 2. Dynamic Filter ADSR Envelope
    filter.type = patch.filterType || "lowpass";
    const baseCutoff = document.getElementById("lead-cutoff") ?
        parseFloat(document.getElementById("lead-cutoff").value) : (appSettings.leadCutoff || patch.cutoff || 3500);
    const resonanceVal = document.getElementById("lead-reso") ?
        parseFloat(document.getElementById("lead-reso").value) : (appSettings.leadResonance || patch.reso || 1.5);

    filter.Q.setValueAtTime(resonanceVal, audioCtx.currentTime);

    const fEnv = patch.filterEnv || { attack: 0.01, decay: 0.25, sustain: 0.35, amount: 2200 };
    const fAttack = fEnv.attack !== undefined ? fEnv.attack : 0.01;
    const fDecay = fEnv.decay !== undefined ? fEnv.decay : 0.25;
    const fSustain = fEnv.sustain !== undefined ? fEnv.sustain : 0.35;
    const fAmount = fEnv.amount !== undefined ? fEnv.amount : (filter.type === "lowpass" ? 2000 : 0);

    const peakFreq = Math.min(18000, Math.max(60, baseCutoff + fAmount));
    const sustainFreq = Math.min(18000, Math.max(60, baseCutoff + (fAmount * fSustain)));

    filter.frequency.setValueAtTime(baseCutoff, audioCtx.currentTime);
    if (fAttack > 0.003) {
        filter.frequency.linearRampToValueAtTime(peakFreq, audioCtx.currentTime + fAttack);
    } else {
        filter.frequency.setValueAtTime(peakFreq, audioCtx.currentTime);
    }
    filter.frequency.exponentialRampToValueAtTime(Math.max(50, sustainFreq), audioCtx.currentTime + fAttack + fDecay);

    // 3. Amplitude ADSR Envelope & Volume Gain Staging
    const attackVal = document.getElementById("lead-attack") ?
        parseFloat(document.getElementById("lead-attack").value) : (appSettings.leadAttack !== undefined ? appSettings.leadAttack : (patch.attack || 0.01));
    const decayVal = document.getElementById("lead-decay") ?
        parseFloat(document.getElementById("lead-decay").value) : (appSettings.leadDecay !== undefined ? appSettings.leadDecay : (patch.decay || 0.25));
    const sustainVal = patch.sustain !== undefined ? patch.sustain : 0.7;
    const patchVol = patch.volume !== undefined ? patch.volume : 0.8;
    const harmonyScale = isHarmony ? (((appSettings.leadPS6Mix || 50) / 100) * 0.75) : 1.0;
    const targetGain = 0.28 * patchVol * harmonyScale;
    const sustainGain = Math.max(0.0001, targetGain * sustainVal);

    const leadNow = audioCtx.currentTime;
    voiceGain.gain.setValueAtTime(0.0001, leadNow);
    voiceGain.gain.linearRampToValueAtTime(targetGain, leadNow + Math.max(0.002, attackVal));
    voiceGain.gain.exponentialRampToValueAtTime(sustainGain, leadNow + Math.max(0.002, attackVal) + Math.max(0.01, decayVal));

    // 4. Vibrato LFO
    const vibConfig = patch.vibrato || (
        (presetIdx === 6 || presetIdx === 2 || patch.name.includes("VOICE") || patch.name.includes("BRASS") || patch.name.includes("SINE"))
        ? { rate: 5.8, depth: 6.0 }
        : null
    );
    if (vibConfig && vibConfig.depth > 0) {
        vibratoNode = audioCtx.createOscillator();
        vibratoGain = audioCtx.createGain();
        vibratoNode.frequency.setValueAtTime(vibConfig.rate || 5.5, audioCtx.currentTime);
        vibratoGain.gain.setValueAtTime(vibConfig.depth || 5.0, audioCtx.currentTime);
        vibratoNode.connect(vibratoGain);
        vibratoGain.connect(osc1.frequency);
        vibratoGain.connect(osc2.frequency);
        vibratoNode.start();
    }

    // 5. Routing
    osc1Gain.connect(filter);
    osc2Gain.connect(filter);
    filter.connect(voiceGain);
    voiceGain.connect(leadVoiceBus || masterGain);

    osc1.start();
    osc2.start();

    const voiceObj = {
        instrument: "lead",
        key: key,
        isHarmony: isHarmony,
        osc1: osc1,
        osc2: osc2,
        osc2DetuneRatio: osc2DetuneRatio,
        noise: noiseNode,
        vibrato: vibratoNode,
        filter: filter,
        gainNode: voiceGain,
        baseFreq: frequency
    };

    activeLeadVoices.push(voiceObj);
    updatePolyphonyCounter();
}

// SWM v2.0 Upgraded Bass Voice Generator
function spawnBassVoice(key, frequency, isHarmony = false) {
    if (!audioCtx) return;
    const presetIdx = appSettings.bassPreset !== undefined ? appSettings.bassPreset : 0;
    const preset = BASS_PRESETS[presetIdx] || BASS_PRESETS[0];

    const oscMain = audioCtx.createOscillator();
    let oscMain2 = null;
    const oscSub = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const mainGain = audioCtx.createGain();
    const subGain = audioCtx.createGain();
    const voiceGain = audioCtx.createGain();

    voiceGain.gain.setValueAtTime(0, audioCtx.currentTime);

    // 1. Main Bass Oscillator
    oscMain.type = preset.oscType || "sawtooth";
    oscMain.frequency.setValueAtTime(frequency, audioCtx.currentTime);

    if (preset.detune) {
        oscMain2 = audioCtx.createOscillator();
        oscMain2.type = preset.oscType || "sawtooth";
        oscMain2.frequency.setValueAtTime(frequency * preset.detune, audioCtx.currentTime);
        oscMain2.connect(mainGain);
        oscMain2.start();
    }

    if (preset.pitchDrop) {
        oscMain.frequency.exponentialRampToValueAtTime(Math.max(20, frequency * 0.45), audioCtx.currentTime + 0.35);
        if (oscMain2) {
            oscMain2.frequency.exponentialRampToValueAtTime(Math.max(20, (frequency * (preset.detune || 1.01)) * 0.45), audioCtx.currentTime + 0.35);
        }
    }

    // 2. Sub-Oscillator (Octave Down)
    const subOctMultiplier = preset.subOctave === -2 ? 0.25 : 0.5;
    oscSub.type = preset.subType || "sine";
    oscSub.frequency.setValueAtTime(frequency * subOctMultiplier, audioCtx.currentTime);

    const subMixRatio = (appSettings.bassSubLevel !== undefined ? appSettings.bassSubLevel : (preset.subMix ? preset.subMix * 100 : 50)) / 100;
    mainGain.gain.setValueAtTime(0.7, audioCtx.currentTime);
    subGain.gain.setValueAtTime(subMixRatio * 0.75, audioCtx.currentTime);

    // 3. Bass Filter Envelope (Acid 303 / Punchy Moog)
    filter.type = "lowpass";
    const customCutoff = document.getElementById("bass-cutoff") ?
        parseFloat(document.getElementById("bass-cutoff").value) : (appSettings.bassCutoff !== undefined ? appSettings.bassCutoff : preset.cutoff);
    const customReso = document.getElementById("bass-reso") ?
        parseFloat(document.getElementById("bass-reso").value) : (appSettings.bassResonance !== undefined ? appSettings.bassResonance : preset.reso);

    filter.Q.setValueAtTime(customReso, audioCtx.currentTime);

    const envPeakCutoff = Math.min(13000, customCutoff + (preset.envMod || 2200));
    filter.frequency.setValueAtTime(envPeakCutoff, audioCtx.currentTime);
    const bDecay = document.getElementById("bass-decay") ?
        parseFloat(document.getElementById("bass-decay").value) : (appSettings.bassDecay !== undefined ? appSettings.bassDecay : (preset.decay || 0.25));
    filter.frequency.exponentialRampToValueAtTime(Math.max(50, customCutoff), audioCtx.currentTime + Math.max(0.02, bDecay));

    // 4. Amplitude ADSR Envelope & Volume Gain Staging
    const attackTime = document.getElementById("bass-attack") ?
        parseFloat(document.getElementById("bass-attack").value) : (appSettings.bassAttack !== undefined ? appSettings.bassAttack : (preset.attack || 0.005));
    const bSustain = preset.sustain !== undefined ? preset.sustain : 0.45;
    const patchVol = preset.volume !== undefined ? preset.volume : 0.85;
    const harmonyScale = isHarmony ? (((appSettings.bassPS6Mix || 60) / 100) * 0.8) : 1.0;
    const targetGain = 0.35 * patchVol * harmonyScale;
    const sustainGain = Math.max(0.0001, targetGain * bSustain);

    const bassNow = audioCtx.currentTime;
    voiceGain.gain.setValueAtTime(0.0001, bassNow);
    voiceGain.gain.linearRampToValueAtTime(targetGain, bassNow + Math.max(0.001, attackTime));
    voiceGain.gain.exponentialRampToValueAtTime(sustainGain, bassNow + Math.max(0.001, attackTime) + Math.max(0.02, bDecay));

    // 5. Routing
    oscMain.connect(mainGain);
    oscSub.connect(subGain);
    mainGain.connect(filter);
    subGain.connect(filter);
    filter.connect(voiceGain);
    voiceGain.connect(bassVoiceBus || masterGain);

    oscMain.start();
    oscSub.start();

    const voiceObj = {
        instrument: "bass",
        key: key,
        isHarmony: isHarmony,
        osc1: oscMain,
        osc2: oscMain2,
        oscSub: oscSub,
        filter: filter,
        gainNode: voiceGain,
        baseFreq: frequency
    };

    activeBassVoices.push(voiceObj);
    updatePolyphonyCounter();
}

function releaseVoice(voice, releaseTime) {
    if (!voice || !voice.gainNode || !audioCtx) return;
    try {
        const now = audioCtx.currentTime;
        voice.gainNode.gain.cancelScheduledValues(now);
        const curGain = Math.max(0.0001, voice.gainNode.gain.value || 0.0001);
        voice.gainNode.gain.setValueAtTime(curGain, now);
        voice.gainNode.gain.linearRampToValueAtTime(0.0, now + Math.max(0.02, releaseTime));

        setTimeout(() => {
            try {
                if (voice.osc1) voice.osc1.stop();
                if (voice.osc2) voice.osc2.stop();
                if (voice.oscSub) voice.oscSub.stop();
                if (voice.noise) voice.noise.stop();
                if (voice.vibrato) {
                    voice.vibrato.stop();
                    voice.vibrato.disconnect();
                }
                if (voice.osc1) voice.osc1.disconnect();
                if (voice.osc2) voice.osc2.disconnect();
                if (voice.oscSub) voice.oscSub.disconnect();
                voice.gainNode.disconnect();
            } catch (e) { }
            updatePolyphonyCounter();
        }, (releaseTime * 1000) + 120);
    } catch (e) { }
}

function handleKeyDown(key) {
    initAudio();
    if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume();
    }
    playNote(key);
}

function handleKeyUp(key) {
    if (isLeadKey(key)) {
        const voicesToStop = activeLeadVoices.filter(v => v.key === key || v.key.startsWith(`${key}_harm_`));
        const releaseTime = appSettings.leadRelease !== undefined ? appSettings.leadRelease : 0.25;

        voicesToStop.forEach(voice => {
            const idx = activeLeadVoices.indexOf(voice);
            if (idx !== -1) activeLeadVoices.splice(idx, 1);
            releaseVoice(voice, releaseTime);
        });
    } else if (isBassKey(key)) {
        const voicesToStop = activeBassVoices.filter(v => v.key === key || v.key.startsWith(`${key}_harm_`));
        const bassReleaseTime = 0.2;

        voicesToStop.forEach(voice => {
            const idx = activeBassVoices.indexOf(voice);
            if (idx !== -1) activeBassVoices.splice(idx, 1);
            releaseVoice(voice, bassReleaseTime);
        });
    }

    const keyCap = KEY_ELEMENTS[key] || document.getElementById(`key-${key}`);
    if (keyCap) keyCap.classList.remove("active");
    updatePolyphonyCounter();
}

// Modular Pedal Keybind Shortcut Wrappers
function toggleLeadDistortion() { if (typeof togglePedalSlot === "function") togglePedalSlot("lead", 0); }
function toggleLeadHarmonizer() { if (typeof togglePedalSlot === "function") togglePedalSlot("lead", 2); }
function toggleLeadDelay() { if (typeof togglePedalSlot === "function") togglePedalSlot("lead", 3); }
function toggleLeadReverb() { if (typeof togglePedalSlot === "function") togglePedalSlot("lead", 4); }
function toggleBassDistortion() { if (typeof togglePedalSlot === "function") togglePedalSlot("bass", 0); }
function toggleBassHarmonizer() { if (typeof togglePedalSlot === "function") togglePedalSlot("bass", 2); }
function toggleBassDelay() { if (typeof togglePedalSlot === "function") togglePedalSlot("bass", 3); }
function toggleBassReverb() { if (typeof togglePedalSlot === "function") togglePedalSlot("bass", 4); }

function playNote(key) {
    initAudio();

    if (isLeadKey(key)) {
        if (activeLeadVoices.some(voice => voice.key === key && !voice.isHarmony)) return;

        const noteInfo = getKeyNoteAndFrequency(key);
        if (!noteInfo) return;

        const baseVoices = activeLeadVoices.filter(v => !v.isHarmony);
        const maxLead = appSettings.leadPolyphony !== undefined ? appSettings.leadPolyphony : 4;
        if (baseVoices.length >= maxLead) {
            const oldestBase = baseVoices[0];
            const voicesToKill = activeLeadVoices.filter(v => v.key === oldestBase.key);
            voicesToKill.forEach(v => {
                const idx = activeLeadVoices.indexOf(v);
                if (idx !== -1) activeLeadVoices.splice(idx, 1);
                stopVoice(v);
            });
        }

        spawnLeadVoice(key, noteInfo.frequency, false);

        if (appSettings.leadPS6Active) {
            const harmonyFreqs = getHarmonizedFrequencies(noteInfo.frequency, noteInfo.noteName, "lead");
            harmonyFreqs.forEach((hFreq, idx) => {
                spawnLeadVoice(`${key}_harm_${idx}`, hFreq, true);
            });
        }
    } else if (isBassKey(key)) {
        if (activeBassVoices.some(voice => voice.key === key && !voice.isHarmony)) return;

        const noteInfo = getKeyNoteAndFrequency(key);
        if (!noteInfo) return;

        const baseVoices = activeBassVoices.filter(v => !v.isHarmony);
        const maxBass = appSettings.bassPolyphony !== undefined ? appSettings.bassPolyphony : 3;
        if (baseVoices.length >= maxBass) {
            const oldestBase = baseVoices[0];
            const voicesToKill = activeBassVoices.filter(v => v.key === oldestBase.key);
            voicesToKill.forEach(v => {
                const idx = activeBassVoices.indexOf(v);
                if (idx !== -1) activeBassVoices.splice(idx, 1);
                stopVoice(v);
            });
        }

        spawnBassVoice(key, noteInfo.frequency, false);

        if (appSettings.bassPS6Active) {
            const harmonyFreqs = getHarmonizedFrequencies(noteInfo.frequency, noteInfo.noteName, "bass");
            harmonyFreqs.forEach((hFreq, idx) => {
                spawnBassVoice(`${key}_harm_${idx}`, hFreq, true);
            });
        }
    } else {
        return;
    }

    const keyCap = KEY_ELEMENTS[key] || document.getElementById(`key-${key}`);
    if (keyCap) keyCap.classList.add("active");

    applyPitchBend();
}

function stopVoice(voice) {
    try {
        if (voice.gainNode) voice.gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        if (voice.osc1) voice.osc1.stop();
        if (voice.osc2) voice.osc2.stop();
        if (voice.oscSub) voice.oscSub.stop();
        if (voice.noise) voice.noise.stop();
        if (voice.vibrato) {
            voice.vibrato.stop();
            voice.vibrato.disconnect();
        }
        if (voice.osc1) voice.osc1.disconnect();
        if (voice.osc2) voice.osc2.disconnect();
        if (voice.oscSub) voice.oscSub.disconnect();
        if (voice.gainNode) voice.gainNode.disconnect();
    } catch (e) { }

    const keyCap = document.getElementById(`key-${voice.key}`);
    if (keyCap) keyCap.classList.remove("active");
    updatePolyphonyCounter();
}

function applyPitchBend() {
    if (!audioCtx) return;

    const totalBendSemitones = mouseBendSemitones + controllerBendSemitones;

    [...activeLeadVoices, ...activeBassVoices].forEach(voice => {
        const targetFreq = voice.baseFreq * Math.pow(2, totalBendSemitones / 12);
        if (voice.osc1) voice.osc1.frequency.setTargetAtTime(targetFreq, audioCtx.currentTime, 0.03);
        if (voice.osc2) voice.osc2.frequency.setTargetAtTime(targetFreq * (voice.osc2DetuneRatio || 1), audioCtx.currentTime, 0.03);
        if (voice.oscSub) voice.oscSub.frequency.setTargetAtTime(targetFreq * 0.5, audioCtx.currentTime, 0.03);
    });
}

// KEYBOARD SHORTCUTS AND EVENT HANDLERS
window.addEventListener("keydown", (e) => {
    if (e.repeat) return;

    // Panic Killswitch: Escape key silences all ringing audio immediately
    if (e.code === "Escape") {
        panicAllNotes();
        return;
    }

    // Quick Slot Switching: Alt + 1..5 switches between the 5 active sound modules
    if (e.altKey && !e.ctrlKey && !e.metaKey) {
        if (e.code === "Digit1") { e.preventDefault(); setSoundBank(0); return; }
        if (e.code === "Digit2") { e.preventDefault(); setSoundBank(1); return; }
        if (e.code === "Digit3") { e.preventDefault(); setSoundBank(2); return; }
        if (e.code === "Digit4") { e.preventDefault(); setSoundBank(3); return; }
        if (e.code === "Digit5") { e.preventDefault(); setSoundBank(4); return; }
    }

    // Panic Killswitch: Escape key silences all ringing audio immediately
    if (e.code === "Escape") {
        panicAllNotes();
        return;
    }

    // Quick Slot Switching: Alt + 1..5 switches between the 5 active sound modules
    if (e.altKey && !e.ctrlKey && !e.metaKey) {
        if (e.code === "Digit1") { e.preventDefault(); setSoundBank(0); return; }
        if (e.code === "Digit2") { e.preventDefault(); setSoundBank(1); return; }
        if (e.code === "Digit3") { e.preventDefault(); setSoundBank(2); return; }
        if (e.code === "Digit4") { e.preventDefault(); setSoundBank(3); return; }
        if (e.code === "Digit5") { e.preventDefault(); setSoundBank(4); return; }
    }

    if (activeRebindTarget) {
        e.preventDefault();
        const target = activeRebindTarget;
        const keyCode = e.code;

        activeRebindTarget = null;

        if (target === "leadOctDown") keybinds.leadOctDown = keyCode;
        else if (target === "leadOctUp") keybinds.leadOctUp = keyCode;
        else if (target === "leadDist") keybinds.leadDist = keyCode;
        else if (target === "leadHarm") keybinds.leadHarm = keyCode;
        else if (target === "leadDelay") keybinds.leadDelay = keyCode;
        else if (target === "leadReverb") keybinds.leadReverb = keyCode;
        else if (target === "bassOctDown") keybinds.bassOctDown = keyCode;
        else if (target === "bassOctUp") keybinds.bassOctUp = keyCode;
        else if (target === "bassDist") keybinds.bassDist = keyCode;
        else if (target === "bassHarm") keybinds.bassHarm = keyCode;
        else if (target === "bassDelay") keybinds.bassDelay = keyCode;
        else if (target === "bassReverb") keybinds.bassReverb = keyCode;

        document.querySelectorAll(".listening").forEach(el => el.classList.remove("listening"));
        updateKeybindLabels();

        try {
            localStorage.setItem("shallotwham_keybinds", JSON.stringify(keybinds));
        } catch (e) { }
        return;
    }

    if (e.code === keybinds.leadOctDown) {
        e.preventDefault();
        shiftLeadOctave(-1);
    } else if (e.code === keybinds.leadOctUp) {
        e.preventDefault();
        shiftLeadOctave(1);
    } else if (e.code === keybinds.leadDist) {
        e.preventDefault();
        toggleLeadDistortion();
    } else if (e.code === keybinds.leadHarm) {
        e.preventDefault();
        toggleLeadHarmonizer();
    } else if (e.code === keybinds.leadDelay) {
        e.preventDefault();
        toggleLeadDelay();
    } else if (e.code === keybinds.leadReverb) {
        e.preventDefault();
        toggleLeadReverb();
    } else if (e.code === keybinds.bassOctDown) {
        e.preventDefault();
        shiftBassOctave(-1);
    } else if (e.code === keybinds.bassOctUp) {
        e.preventDefault();
        shiftBassOctave(1);
    } else if (e.code === keybinds.bassDist) {
        e.preventDefault();
        toggleBassDistortion();
    } else if (e.code === keybinds.bassHarm) {
        e.preventDefault();
        toggleBassHarmonizer();
    } else if (e.code === keybinds.bassDelay) {
        e.preventDefault();
        toggleBassDelay();
    } else if (e.code === keybinds.bassReverb) {
        e.preventDefault();
        toggleBassReverb();
    } else {
        handleKeyDown(e.code);
    }
});

window.addEventListener("keyup", (e) => {
    const isControlKey = (
        e.code === keybinds.leadOctDown ||
        e.code === keybinds.leadOctUp ||
        e.code === keybinds.leadDist ||
        e.code === keybinds.leadHarm ||
        e.code === keybinds.leadDelay ||
        e.code === keybinds.leadReverb ||
        e.code === keybinds.bassOctDown ||
        e.code === keybinds.bassOctUp ||
        e.code === keybinds.bassDist ||
        e.code === keybinds.bassHarm ||
        e.code === keybinds.bassDelay ||
        e.code === keybinds.bassReverb
    );
    if (!isControlKey) {
        handleKeyUp(e.code);
    }
});

// MOUSE DRAG BEND
const mousePad = document.getElementById("mouse-pad");
const mousePointer = document.getElementById("mouse-pointer");
const mouseBendVal = document.getElementById("mouse-bend-val");
let isMouseDragging = false;
let startY = 0;

if (mousePad) {
    mousePad.addEventListener("mousedown", (e) => {
        isMouseDragging = true;
        startY = e.clientY;
        if (mousePointer) mousePointer.style.display = "block";
        updateMousePosition(e);
    });

    window.addEventListener("mousemove", (e) => {
        if (!isMouseDragging) return;
        updateMousePosition(e);
    });

    window.addEventListener("mouseup", () => {
        if (isMouseDragging) {
            isMouseDragging = false;
            if (mousePointer) mousePointer.style.display = "none";
            mouseBendSemitones = 0;
            if (mouseBendVal) mouseBendVal.textContent = "+0.00 Octaves";
            applyPitchBend();
        }
    });
}

function updateMousePosition(e) {
    if (!mousePad) return;
    const padRect = mousePad.getBoundingClientRect();
    let x = e.clientX - padRect.left;
    let y = e.clientY - padRect.top;

    x = Math.max(0, Math.min(padRect.width, x));
    y = Math.max(0, Math.min(padRect.height, y));

    if (mousePointer) {
        mousePointer.style.left = `${x}px`;
        mousePointer.style.top = `${y}px`;
    }

    const deltaY = startY - e.clientY;
    const maxDeltaPixels = 120;
    const slideRatio = Math.max(0, Math.min(1, deltaY / maxDeltaPixels));
    const maxOctaves = Math.max(1, Math.abs(pitchBendOctavesUp));
    const activeOctaveBend = slideRatio * maxOctaves;

    mouseBendSemitones = activeOctaveBend * 12;
    if (mouseBendVal) mouseBendVal.textContent = `+${activeOctaveBend.toFixed(2)} Octaves`;

    applyPitchBend();
}

// GAMEPAD LOGIC (Xbox Controller Bridge)
function scanGamepads() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (let i = 0; i < gamepads.length; i++) {
        const gp = gamepads[i];
        if (gp && gp.connected) {
            if (!gamepadConnected || gamepadIndex !== i) {
                gamepadConnected = true;
                gamepadIndex = i;
                const statusEl = document.getElementById("controller-status");
                if (statusEl) {
                    statusEl.textContent = "CONNECTED";
                    statusEl.classList.add("connected");
                }
                pollGamepad();
            }
            return;
        }
    }
}

setInterval(scanGamepads, 1000);

window.addEventListener("gamepadconnected", (e) => {
    scanGamepads();
});

window.addEventListener("gamepaddisconnected", (e) => {
    gamepadConnected = false;
    gamepadIndex = null;
    const statusEl = document.getElementById("controller-status");
    if (statusEl) {
        statusEl.textContent = "DISCONNECTED";
        statusEl.classList.remove("connected");
    }
});

function pollGamepad() {
    if (!gamepadConnected) return;

    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gamepad = gamepads[gamepadIndex];
    if (gamepad && gamepad.connected) {
        handleGamepadInputs(gamepad);
        requestAnimationFrame(pollGamepad);
    } else {
        gamepadConnected = false;
        gamepadIndex = null;
        const statusEl = document.getElementById("controller-status");
        if (statusEl) {
            statusEl.textContent = "DISCONNECTED";
            statusEl.classList.remove("connected");
        }
    }
}

function handleGamepadInputs(gamepad) {
    // 1. Right Joystick Y: Pitch Bend Up/Down
    const rightJoyY = gamepad.axes[3];
    const rJoyValElement = document.getElementById("r-joy-val");
    const rJoyDot = document.getElementById("r-joy-dot");

    const dotX = 50 + (gamepad.axes[2] * 35);
    const dotY = 50 + (rightJoyY * 35);
    rJoyDot.style.left = `${Math.max(0, Math.min(100, dotX))}%`;
    rJoyDot.style.top = `${Math.max(0, Math.min(100, dotY))}%`;

    if (rightJoyY < -0.05) {
        const pushAmount = Math.abs(rightJoyY);
        const maxRange = pitchBendOctavesUp * 12;
        controllerBendSemitones = pushAmount * maxRange;
        rJoyValElement.textContent = `BEND: +${(controllerBendSemitones / 12).toFixed(2)} Oct`;
        applyPitchBend();
    } else if (rightJoyY > 0.05) {
        const pullAmount = rightJoyY;
        const maxRange = pitchBendOctavesDown * 12;
        controllerBendSemitones = -pullAmount * maxRange;
        rJoyValElement.textContent = `BEND: ${(controllerBendSemitones / 12).toFixed(2)} Oct`;
        applyPitchBend();
    } else {
        if (controllerBendSemitones !== 0) {
            controllerBendSemitones = 0;
            rJoyValElement.textContent = `Y: 0.00`;
            applyPitchBend();
        }
    }

    // 2. Left Joystick X: Tremolo
    const leftJoyX = gamepad.axes[0];
    const tremoloBar = document.getElementById("tremolo-bar");
    const lJoyValElement = document.getElementById("l-joy-val");

    tremoloBar.style.left = `${50 + (leftJoyX * 50)}%`;

    if (Math.abs(leftJoyX) > 0.05) {
        tremoloSpeed = Math.abs(leftJoyX) * 12;
        tremoloDepth = Math.abs(leftJoyX) * 0.8;
        lJoyValElement.textContent = `SPEED: ${tremoloSpeed.toFixed(1)}Hz`;
        applyTremolo();
    } else {
        if (tremoloSpeed !== 0) {
            tremoloSpeed = 0;
            tremoloDepth = 0;
            lJoyValElement.textContent = `X: 0.00`;
            applyTremolo();
        }
    }

    // 3. Trigger & Bumper Settings
    const rtPressed = gamepad.buttons[7].pressed;
    const rbPressed = gamepad.buttons[5].pressed;
    const ltPressed = gamepad.buttons[6].pressed;
    const lbPressed = gamepad.buttons[4].pressed;

    if (rtPressed && !lastGamepadButtons[7]) {
        pitchBendOctavesUp = Math.min(2, pitchBendOctavesUp + 1);
        updateBendRangeDisplay();
    }
    if (rbPressed && !lastGamepadButtons[5]) {
        pitchBendOctavesUp = Math.max(1, pitchBendOctavesUp - 1);
        updateBendRangeDisplay();
    }

    if (ltPressed && !lastGamepadButtons[6]) {
        pitchBendOctavesDown = Math.min(2, pitchBendOctavesDown + 1);
        updateBendRangeDisplay();
    }
    if (lbPressed && !lastGamepadButtons[4]) {
        pitchBendOctavesDown = Math.max(1, pitchBendOctavesDown - 1);
        updateBendRangeDisplay();
    }

    // 4. Buttons
    const btnY = gamepad.buttons[3].pressed;
    const btnX = gamepad.buttons[2].pressed;
    const btnA = gamepad.buttons[0].pressed;
    const btnB = gamepad.buttons[1].pressed;

    if (btnY && !lastGamepadButtons[3]) {
        toggleReverb();
    }
    if (btnX && !lastGamepadButtons[2]) {
        toggleDelay();
    }
    if (btnA && !lastGamepadButtons[0]) {
        triggerDelayTapTempo();
        pulseButtonElement("btn-a-tap");
    }
    if (btnB && !lastGamepadButtons[1]) {
        disableAllEffects();
        pulseButtonElement("btn-b-cancel");
    }

    lastGamepadButtons = gamepad.buttons.map(b => b.pressed);
}

function updateBendRangeDisplay() {
    const rangeDisplay = document.getElementById("bend-range-display");
    if (rangeDisplay) {
        rangeDisplay.textContent = `UP: +${pitchBendOctavesUp} Oct (RT/RB) | DOWN: -${pitchBendOctavesDown} Oct (LT/LB)`;
    }
}

function pulseButtonElement(id) {
    const el = document.getElementById(id);
    el.classList.add("pulse");
    setTimeout(() => el.classList.remove("pulse"), 400);
}

// FX CONTROLLERS
function toggleReverb() {
    initAudio();
    reverbActive = !reverbActive;

    const reverbEl = document.getElementById("fx-reverb");
    if (reverbActive) {
        reverbGain.gain.setTargetAtTime(0.7, audioCtx.currentTime, 0.1);
        reverbEl.classList.add("active");
    } else {
        reverbGain.gain.setTargetAtTime(0.0, audioCtx.currentTime, 0.1);
        reverbEl.classList.remove("active");
    }
    saveSettings();
}

function toggleDelay() {
    initAudio();
    delayActive = !delayActive;

    const delayEl = document.getElementById("fx-delay");
    if (delayActive) {
        delayFeedbackNode.gain.setTargetAtTime(0.5, audioCtx.currentTime, 0.1);
        delayGain.gain.setTargetAtTime(0.4, audioCtx.currentTime, 0.1);
        delayEl.classList.add("active");
    } else {
        delayFeedbackNode.gain.setTargetAtTime(0.0, audioCtx.currentTime, 0.1);
        delayGain.gain.setTargetAtTime(0.0, audioCtx.currentTime, 0.1);
        delayEl.classList.remove("active");
    }
    saveSettings();
}

function disableAllEffects() {
    if (reverbActive) toggleReverb();
    if (delayActive) toggleDelay();
}

function triggerDelayTapTempo() {
    initAudio();
    const now = audioCtx.currentTime;

    if (lastDelayTapTime > 0) {
        const diff = now - lastDelayTapTime;
        if (diff > 0.15 && diff < 3.0) {
            delayTapTimes.push(diff);
            if (delayTapTimes.length > 4) delayTapTimes.shift();

            const avgInterval = delayTapTimes.reduce((a, b) => a + b, 0) / delayTapTimes.length;
            delayNode.delayTime.setTargetAtTime(avgInterval, audioCtx.currentTime, 0.2);
        }
    }
    lastDelayTapTime = now;
}

let tremoloInterval = null;
function applyTremolo() {
    if (!audioCtx) return;

    if (tremoloSpeed === 0) {
        if (tremoloInterval) {
            clearInterval(tremoloInterval);
            tremoloInterval = null;
        }
        tremoloNode.gain.setValueAtTime(1.0, audioCtx.currentTime);
        return;
    }

    if (!tremoloInterval) {
        let phase = 0;
        tremoloInterval = setInterval(() => {
            if (!audioCtx) return;
            phase += (2 * Math.PI * tremoloSpeed) / 100;
            const lfoVal = 1 - (tremoloDepth * (0.5 + 0.5 * Math.sin(phase)));
            tremoloNode.gain.setValueAtTime(lfoVal, audioCtx.currentTime);
        }, 10);
    }
}


function makeDistortionCurve(amount) {
    const k = typeof amount === 'number' ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
        const x = (i * 2) / n_samples - 1;
        curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
}

function createReverbImpulse(context, duration = 2.5, decay = 2.0) {
    const sampleRate = context.sampleRate || 44100;
    const length = Math.floor(sampleRate * duration);
    const impulse = context.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
        const noise = Math.random() * 2 - 1;
        const val = noise * Math.pow(1 - i / length, decay);
        left[i] = val;
        right[i] = val;
    }
    return impulse;
}

function createBitcrusherNode(context) {
    const bufferSize = 256; // Ultra-low latency ~5.8ms
    let bits = 8;
    let normfreq = 0.4;
    let phaser = 0;
    let last = 0;

    const node = context.createScriptProcessor(bufferSize, 1, 1);
    node.onaudioprocess = function(e) {
        const input = e.inputBuffer.getChannelData(0);
        const output = e.outputBuffer.getChannelData(0);
        const step = Math.pow(0.5, bits);

        for (let i = 0; i < bufferSize; i++) {
            phaser += normfreq;
            if (phaser >= 1.0) {
                phaser -= 1.0;
                last = step * Math.floor(input[i] / step + 0.5);
            }
            output[i] = last;
        }
    };

    node.setBits = function(b) { bits = Math.max(2, Math.min(16, b)); };
    node.setCrush = function(pct) {
        normfreq = Math.max(0.02, Math.min(1.0, (pct || 40) / 100));
    };

    return node;
}

function initAudio() {
    if (audioCtx) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext({ latencyHint: 'interactive' });

    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(getAudioTaperGain(appSettings.synthVolume !== undefined ? appSettings.synthVolume : 75, 1.0), audioCtx.currentTime);

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;

    // Master safety dynamics compressor (brickwall limiter) to prevent harsh clipping
    masterLimiter = audioCtx.createDynamicsCompressor();
    masterLimiter.threshold.setValueAtTime(-1.0, audioCtx.currentTime);
    masterLimiter.knee.setValueAtTime(0.0, audioCtx.currentTime);
    masterLimiter.ratio.setValueAtTime(20.0, audioCtx.currentTime);
    masterLimiter.attack.setValueAtTime(0.001, audioCtx.currentTime);
    masterLimiter.release.setValueAtTime(0.05, audioCtx.currentTime);

    tremoloNode = audioCtx.createGain();
    tremoloNode.gain.setValueAtTime(1.0, audioCtx.currentTime);
    tremoloNode.connect(masterGain);

    masterGain.connect(analyser);
    analyser.connect(masterLimiter);
    masterLimiter.connect(audioCtx.destination);

    // 1. MODULAR LEAD FX CHAIN SETUP
    leadVoiceBus = audioCtx.createGain();
    leadMasterGain = audioCtx.createGain();
    const leadInitGain = appSettings.leadMute ? 0.0 : getAudioTaperGain(appSettings.leadVolume !== undefined ? appSettings.leadVolume : 85, 1.2);
    leadMasterGain.gain.setValueAtTime(leadInitGain, audioCtx.currentTime);

    initInstrumentPedalChain("lead", audioCtx, leadVoiceBus, leadMasterGain);
    leadMasterGain.connect(tremoloNode);

    // 2. MODULAR BASS FX CHAIN SETUP
    bassVoiceBus = audioCtx.createGain();
    bassMasterGain = audioCtx.createGain();
    const bassInitGain = appSettings.bassMute ? 0.0 : getAudioTaperGain(appSettings.bassVolume !== undefined ? appSettings.bassVolume : 85, 1.2);
    bassMasterGain.gain.setValueAtTime(bassInitGain, audioCtx.currentTime);

    initInstrumentPedalChain("bass", audioCtx, bassVoiceBus, bassMasterGain);
    bassMasterGain.connect(tremoloNode);

    startArpClock();
    startVisualizer();
}


// OSCILLOSCOPE GRAPHICS
function startVisualizer() {
    const canvas = document.getElementById("audio-visualizer");
    const ctx = canvas.getContext("2d");

    function resize() {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
    }
    window.addEventListener("resize", resize);
    resize();

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
        requestAnimationFrame(draw);
        if (!analyser) return;

        analyser.getByteTimeDomainData(dataArray);

        ctx.fillStyle = "#041216";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = "rgba(20, 53, 61, 0.25)";
        ctx.lineWidth = 1;

        for (let i = 0; i < canvas.width; i += 40) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();
        }
        for (let i = 0; i < canvas.height; i += 40) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(canvas.width, i);
            ctx.stroke();
        }

        ctx.lineWidth = 3;
        ctx.strokeStyle = "#0ea5e9";
        ctx.shadowBlur = 4;
        ctx.shadowColor = "rgba(14, 165, 233, 0.4)";
        ctx.beginPath();

        const sliceWidth = canvas.width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * canvas.height) / 2;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    draw();
}

// SETUP LISTENERS
document.getElementById("row0-root").addEventListener("change", (e) => { buildVirtualKeyboard(); e.target.blur(); saveSettings(); });
document.getElementById("row1-root").addEventListener("change", (e) => { buildVirtualKeyboard(); e.target.blur(); saveSettings(); });
document.getElementById("row2-root").addEventListener("change", (e) => { buildVirtualKeyboard(); e.target.blur(); saveSettings(); });
document.getElementById("row3-root").addEventListener("change", (e) => { buildVirtualKeyboard(); e.target.blur(); saveSettings(); });
document.getElementById("row0-octave").addEventListener("change", (e) => { buildVirtualKeyboard(); e.target.blur(); saveSettings(); });
document.getElementById("row1-octave").addEventListener("change", (e) => { buildVirtualKeyboard(); e.target.blur(); saveSettings(); });
document.getElementById("row2-octave").addEventListener("change", (e) => { buildVirtualKeyboard(); e.target.blur(); saveSettings(); });
document.getElementById("row3-octave").addEventListener("change", (e) => { buildVirtualKeyboard(); e.target.blur(); saveSettings(); });

function initLeadControls() {
    // Lead Preset Buttons
    document.querySelectorAll(".lead-preset-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const pIdx = parseInt(btn.getAttribute("data-lead-preset"));
            appSettings.leadPreset = pIdx;

            // Stop any active lead voices when changing patch
            activeLeadVoices.forEach(voice => stopVoice(voice));
            activeLeadVoices = [];

            // Load preset defaults into settings
            const preset = LEAD_PRESETS[pIdx];
            if (preset) {
                appSettings.leadCutoff = preset.cutoff;
                appSettings.leadResonance = preset.reso;
                appSettings.leadAttack = preset.attack;
                appSettings.leadDecay = preset.decay !== undefined ? preset.decay : 0.25;
                appSettings.leadRelease = preset.release;
            }

            updateLeadUI();
            saveSettings();
        });
    });

    // Lead Cutoff Slider
    const cutoffEl = document.getElementById("lead-cutoff");
    if (cutoffEl) {
        cutoffEl.addEventListener("input", (e) => {
            const val = parseFloat(e.target.value);
            appSettings.leadCutoff = val;
            const valEl = document.getElementById("lead-val-cutoff");
            if (valEl) valEl.textContent = `${Math.round(val)}Hz`;

            activeLeadVoices.forEach(voice => {
                if (voice.filter) voice.filter.frequency.setTargetAtTime(val, audioCtx.currentTime, 0.03);
            });
            saveSettings();
        });
    }

    // Lead Resonance Slider
    const resoEl = document.getElementById("lead-reso");
    if (resoEl) {
        resoEl.addEventListener("input", (e) => {
            const val = parseFloat(e.target.value);
            appSettings.leadResonance = val;
            const valEl = document.getElementById("lead-val-reso");
            if (valEl) valEl.textContent = val.toFixed(1);

            activeLeadVoices.forEach(voice => {
                if (voice.filter) voice.filter.Q.setTargetAtTime(val, audioCtx.currentTime, 0.03);
            });
            saveSettings();
        });
    }

    // Lead Attack Slider
    const attackEl = document.getElementById("lead-attack");
    if (attackEl) {
        attackEl.addEventListener("input", (e) => {
            const val = parseFloat(e.target.value);
            appSettings.leadAttack = val;
            const valEl = document.getElementById("lead-val-attack");
            if (valEl) valEl.textContent = `${val.toFixed(2)}s`;
            saveSettings();
        });
    }

    // Lead Decay Slider
    const decayEl = document.getElementById("lead-decay");
    if (decayEl) {
        decayEl.addEventListener("input", (e) => {
            const val = parseFloat(e.target.value);
            appSettings.leadDecay = val;
            const valEl = document.getElementById("lead-val-decay");
            if (valEl) valEl.textContent = `${val.toFixed(2)}s`;
            saveSettings();
        });
    }

    // Lead Release Slider
    const releaseEl = document.getElementById("lead-release");
    if (releaseEl) {
        releaseEl.addEventListener("input", (e) => {
            const val = parseFloat(e.target.value);
            appSettings.leadRelease = val;
            const valEl = document.getElementById("lead-val-release");
            if (valEl) valEl.textContent = `${val.toFixed(2)}s`;
            saveSettings();
        });
    }

    // Lead Polyphony Slider
    const leadPolyEl = document.getElementById("lead-polyphony");
    if (leadPolyEl) {
        leadPolyEl.addEventListener("input", (e) => {
            const val = parseInt(e.target.value);
            appSettings.leadPolyphony = val;
            const valEl = document.getElementById("lead-val-polyphony");
            if (valEl) valEl.textContent = val;
            saveSettings();
        });
    }

    // Lead Volume Slider
    const leadVolEl = document.getElementById("lead-volume");
    if (leadVolEl) {
        leadVolEl.addEventListener("input", (e) => {
            const val = parseFloat(e.target.value);
            appSettings.leadVolume = val;
            const valEl = document.getElementById("lead-val-vol");
            if (valEl) valEl.textContent = `${Math.round(val)}%`;
            if (leadMasterGain && audioCtx) {
                leadMasterGain.gain.setTargetAtTime(getAudioTaperGain(val, 1.2), audioCtx.currentTime, 0.03);
            }
            saveSettings();
        });
    }

    initBassControls();
}

function initBassControls() {
    // Preset Buttons
    document.querySelectorAll(".bass-preset-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const pIdx = parseInt(btn.getAttribute("data-bass-preset"));
            appSettings.bassPreset = pIdx;

            // Stop any active bass voices when changing patch
            activeBassVoices.forEach(voice => stopVoice(voice));
            activeBassVoices = [];

            // Load preset defaults into settings if matching
            const preset = BASS_PRESETS[pIdx];
            if (preset) {
                appSettings.bassCutoff = preset.cutoff;
                appSettings.bassResonance = preset.reso;
                appSettings.bassSubLevel = (preset.subMix !== undefined ? preset.subMix : 0.5) * 100;
                appSettings.bassAttack = preset.attack !== undefined ? preset.attack : 0.005;
                appSettings.bassDecay = preset.decay !== undefined ? preset.decay : 0.25;
            }

            updateBassUI();
            saveSettings();
        });
    });

    // Bass Cutoff Slider
    const cutoffEl = document.getElementById("bass-cutoff");
    if (cutoffEl) {
        cutoffEl.addEventListener("input", (e) => {
            const val = parseFloat(e.target.value);
            appSettings.bassCutoff = val;
            const valEl = document.getElementById("bass-val-cutoff");
            if (valEl) valEl.textContent = `${Math.round(val)}Hz`;

            activeBassVoices.forEach(voice => {
                if (voice.filter) voice.filter.frequency.setTargetAtTime(val, audioCtx.currentTime, 0.03);
            });
            saveSettings();
        });
    }

    // Bass Resonance Slider
    const resoEl = document.getElementById("bass-reso");
    if (resoEl) {
        resoEl.addEventListener("input", (e) => {
            const val = parseFloat(e.target.value);
            appSettings.bassResonance = val;
            const valEl = document.getElementById("bass-val-reso");
            if (valEl) valEl.textContent = val.toFixed(1);

            activeBassVoices.forEach(voice => {
                if (voice.filter) voice.filter.Q.setTargetAtTime(val, audioCtx.currentTime, 0.03);
            });
            saveSettings();
        });
    }

    // Bass Sub Mix Slider
    const subEl = document.getElementById("bass-sub-mix");
    if (subEl) {
        subEl.addEventListener("input", (e) => {
            const val = parseFloat(e.target.value);
            appSettings.bassSubLevel = val;
            const valEl = document.getElementById("bass-val-sub");
            if (valEl) valEl.textContent = `${Math.round(val)}%`;
            saveSettings();
        });
    }

    // Bass Attack Slider
    const attackEl = document.getElementById("bass-attack");
    if (attackEl) {
        attackEl.addEventListener("input", (e) => {
            const val = parseFloat(e.target.value);
            appSettings.bassAttack = val;
            const valEl = document.getElementById("bass-val-attack");
            if (valEl) valEl.textContent = `${val.toFixed(3)}s`;
            saveSettings();
        });
    }

    // Bass Decay Slider
    const decayEl = document.getElementById("bass-decay");
    if (decayEl) {
        decayEl.addEventListener("input", (e) => {
            const val = parseFloat(e.target.value);
            appSettings.bassDecay = val;
            const valEl = document.getElementById("bass-val-decay");
            if (valEl) valEl.textContent = `${val.toFixed(2)}s`;
            saveSettings();
        });
    }

    // Bass Volume Slider
    const volEl = document.getElementById("bass-volume");
    if (volEl) {
        volEl.addEventListener("input", (e) => {
            const val = parseFloat(e.target.value);
            appSettings.bassVolume = val;
            const valEl = document.getElementById("bass-val-vol");
            if (valEl) valEl.textContent = `${Math.round(val)}%`;

            if (bassMasterGain) {
                bassMasterGain.gain.setTargetAtTime(val / 100, audioCtx.currentTime, 0.03);
            }
            saveSettings();
        });
    }

    // Bass Polyphony Slider
    const bassPolyEl = document.getElementById("bass-polyphony");
    if (bassPolyEl) {
        bassPolyEl.addEventListener("input", (e) => {
            const val = parseInt(e.target.value);
            appSettings.bassPolyphony = val;
            const valEl = document.getElementById("bass-val-polyphony");
            if (valEl) valEl.textContent = val;
            saveSettings();
        });
    }
}

document.getElementById("fx-reverb").addEventListener("click", () => {
    toggleReverb();
});
document.getElementById("fx-delay").addEventListener("click", () => {
    toggleDelay();
});
document.getElementById("btn-a-tap").addEventListener("click", () => {
    triggerDelayTapTempo();
    pulseButtonElement("btn-a-tap");
});
document.getElementById("btn-b-cancel").addEventListener("click", () => {
    disableAllEffects();
    pulseButtonElement("btn-b-cancel");
});

const synthVolSlider = document.getElementById("synth-volume");
if (synthVolSlider) {
    synthVolSlider.addEventListener("input", (e) => {
        const val = parseFloat(e.target.value) / 100;
        if (masterGain) {
            masterGain.gain.setTargetAtTime(val * 1.0, audioCtx.currentTime, 0.05);
        }
        saveSettings();
    });
}


// ====================================================
// MODULAR PEDAL ENGINE: SLOTS, DSP & EVENT ROUTING
// ====================================================
/**
 * ShallotWHAM Modular Pedal Engine & DSP Factory
 * 26 High-Fidelity Swappable DSP Cartridges across 5 Pedal Chassis
 */

const CARTRIDGE_CATALOG = {
    // CHASSIS 0: DRIVE / FUZZ / PREAMP / CRUNCH
    "ds1": {
        id: "ds1", chassis: 0, name: "DS-1 DIST", color: "#f97316",
        desc: "Classic orange hard-clip distortion with tone shaping",
        knobs: [
            { id: "dist", label: "DIST", min: 1, max: 100, default: 50, step: 1, unit: "%" },
            { id: "tone", label: "TONE", min: 400, max: 8000, default: 2500, step: 50, unit: "Hz" },
            { id: "level", label: "LVL", min: 0, max: 100, default: 65, step: 1, unit: "%" }
        ]
    },
    "proco-rat": {
        id: "proco-rat", chassis: 0, name: "PROCO RAT", color: "#e2e8f0",
        desc: "Squelchy silicon clipping with inverted lowpass filter",
        knobs: [
            { id: "dist", label: "DIST", min: 1, max: 100, default: 55, step: 1, unit: "%" },
            { id: "filter", label: "FILTER", min: 500, max: 7000, default: 2200, step: 50, unit: "Hz" },
            { id: "level", label: "VOL", min: 0, max: 100, default: 70, step: 1, unit: "%" }
        ]
    },
    "big-muff": {
        id: "big-muff", chassis: 0, name: "BIG MUFF", color: "#a855f7",
        desc: "Massive sustained fuzz with scooped midrange",
        knobs: [
            { id: "sustain", label: "SUSTAIN", min: 1, max: 100, default: 70, step: 1, unit: "%" },
            { id: "tone", label: "TONE", min: 300, max: 6000, default: 1800, step: 50, unit: "Hz" },
            { id: "volume", label: "VOL", min: 0, max: 100, default: 75, step: 1, unit: "%" }
        ]
    },
    "tube-screamer": {
        id: "tube-screamer", chassis: 0, name: "TUBE SCREAM", color: "#22c55e",
        desc: "Mid-boost analog overdrive with asymmetrical clipping",
        knobs: [
            { id: "drive", label: "DRIVE", min: 1, max: 100, default: 45, step: 1, unit: "%" },
            { id: "tone", label: "TONE", min: 500, max: 5000, default: 2000, step: 50, unit: "Hz" },
            { id: "level", label: "LVL", min: 0, max: 100, default: 70, step: 1, unit: "%" }
        ]
    },
    "french-preamp": {
        id: "french-preamp", chassis: 0, name: "FRENCH PRE", color: "#eab308",
        desc: "French touch analog console pre-amp saturation",
        knobs: [
            { id: "drive", label: "DRIVE", min: 1, max: 100, default: 60, step: 1, unit: "%" },
            { id: "warmth", label: "WARMTH", min: 1, max: 100, default: 65, step: 1, unit: "%" },
            { id: "output", label: "OUT", min: 0, max: 100, default: 75, step: 1, unit: "%" }
        ]
    },
    "decimator": {
        id: "decimator", chassis: 0, name: "DECIMATOR", color: "#06b6d4",
        desc: "Sample-rate decimation downsampler and bit quantizer",
        knobs: [
            { id: "bits", label: "BITS", min: 2, max: 16, default: 8, step: 1, unit: "b" },
            { id: "rate", label: "CRUSH", min: 2, max: 100, default: 40, step: 1, unit: "%" },
            { id: "mix", label: "MIX", min: 0, max: 100, default: 60, step: 1, unit: "%" }
        ]
    },

    // CHASSIS 1: MODULATION
    "small-stone": {
        id: "small-stone", chassis: 1, name: "SMALL STONE", color: "#ec4899",
        desc: "4-stage all-pass vintage analog phaser",
        knobs: [
            { id: "rate", label: "RATE", min: 0.1, max: 8.0, default: 0.6, step: 0.1, unit: "Hz" },
            { id: "depth", label: "DEPTH", min: 1, max: 100, default: 75, step: 1, unit: "%" },
            { id: "feedback", label: "COLOR", min: 0, max: 90, default: 40, step: 1, unit: "%" }
        ]
    },
    "dimension-chorus": {
        id: "dimension-chorus", chassis: 1, name: "DIMENSION D", color: "#3b82f6",
        desc: "Lush 80s BBD spatial widening chorus",
        knobs: [
            { id: "mode", label: "MODE", min: 1, max: 4, default: 3, step: 1, unit: "" },
            { id: "width", label: "WIDTH", min: 10, max: 100, default: 75, step: 1, unit: "%" },
            { id: "mix", label: "MIX", min: 0, max: 100, default: 55, step: 1, unit: "%" }
        ]
    },
    "flanger": {
        id: "flanger", chassis: 1, name: "BBD FLANGER", color: "#14b8a6",
        desc: "Metallic comb-filtering jet-plane sweeps",
        knobs: [
            { id: "speed", label: "SPEED", min: 0.1, max: 5.0, default: 0.6, step: 0.1, unit: "Hz" },
            { id: "depth", label: "DEPTH", min: 1, max: 100, default: 70, step: 1, unit: "%" },
            { id: "regen", label: "REGEN", min: 0, max: 95, default: 50, step: 1, unit: "%" }
        ]
    },
    "optical-tremolo": {
        id: "optical-tremolo", chassis: 1, name: "OPTIC TREM", color: "#f59e0b",
        desc: "Vintage optical photocell amplitude tremolo",
        knobs: [
            { id: "rate", label: "RATE", min: 0.5, max: 12.0, default: 4.0, step: 0.2, unit: "Hz" },
            { id: "depth", label: "DEPTH", min: 0, max: 100, default: 60, step: 1, unit: "%" },
            { id: "shape", label: "SQUARE", min: 0, max: 1, default: 0, step: 1, unit: "" }
        ]
    },
    "ring-mod": {
        id: "ring-mod", chassis: 1, name: "RING MOD", color: "#ef4444",
        desc: "High-frequency carrier bell multiplier",
        knobs: [
            { id: "carrier", label: "FREQ", min: 40, max: 2000, default: 440, step: 10, unit: "Hz" },
            { id: "lfo", label: "LFO", min: 0.1, max: 10.0, default: 2.5, step: 0.1, unit: "Hz" },
            { id: "mix", label: "MIX", min: 0, max: 100, default: 45, step: 1, unit: "%" }
        ]
    },

    // CHASSIS 2: FILTER & DYNAMICS & HARMONIZER
    "ps6": {
        id: "ps6", chassis: 2, name: "PS-6 HARM", color: "#6366f1",
        desc: "Intelligent diatonic harmonizer & pitch shifter",
        knobs: [
            { id: "interval", label: "INTERVAL", min: 0, max: 4, default: 0, step: 1, unit: "int" },
            { id: "mix", label: "MIX", min: 0, max: 100, default: 50, step: 1, unit: "%" }
        ]
    },
    "sidechain-pumper": {
        id: "sidechain-pumper", chassis: 2, name: "SC PUMPER", color: "#f43f5e",
        desc: "Rhythmic French touch ducking sidechain compressor",
        knobs: [
            { id: "depth", label: "PUMP", min: 0, max: 100, default: 80, step: 1, unit: "%" },
            { id: "rate", label: "SYNC", min: 1, max: 8, default: 4, step: 1, unit: "div" },
            { id: "release", label: "REL", min: 0.05, max: 0.8, default: 0.25, step: 0.01, unit: "s" }
        ]
    },
    "mutron-wah": {
        id: "mutron-wah", chassis: 2, name: "MUTRON WAH", color: "#84cc16",
        desc: "Dynamic envelope-follower funk filter",
        knobs: [
            { id: "peak", label: "PEAK", min: 1, max: 100, default: 70, step: 1, unit: "%" },
            { id: "drive", label: "DRIVE", min: 1, max: 100, default: 50, step: 1, unit: "%" },
            { id: "range", label: "RANGE", min: 200, max: 5000, default: 1800, step: 50, unit: "Hz" }
        ]
    },
    "formant-filter": {
        id: "formant-filter", chassis: 2, name: "TALKBOX", color: "#d946ef",
        desc: "Vowel formant vocal tract resonator",
        knobs: [
            { id: "vowel", label: "VOWEL", min: 1, max: 5, default: 2, step: 1, unit: "" },
            { id: "reso", label: "RESO", min: 1, max: 100, default: 65, step: 1, unit: "%" },
            { id: "glide", label: "GLIDE", min: 0, max: 100, default: 30, step: 1, unit: "%" }
        ]
    },
    "sid-resonator": {
        id: "sid-resonator", chassis: 2, name: "SID ACID", color: "#10b981",
        desc: "Aggressive C64 SID 6581 acid ladder filter",
        knobs: [
            { id: "cutoff", label: "CUTOFF", min: 200, max: 6000, default: 2200, step: 50, unit: "Hz" },
            { id: "squelch", label: "SQUELCH", min: 1, max: 100, default: 75, step: 1, unit: "%" },
            { id: "decay", label: "DECAY", min: 0.05, max: 1.0, default: 0.25, step: 0.01, unit: "s" }
        ]
    },

    // CHASSIS 3: TIME & DELAY
    "space-echo": {
        id: "space-echo", chassis: 3, name: "SPACE ECHO", color: "#0ea5e9",
        desc: "Tape delay with tape saturation, flutter & warm damping",
        knobs: [
            { id: "time", label: "TIME", min: 50, max: 900, default: 360, step: 10, unit: "ms" },
            { id: "intensity", label: "FDBK", min: 0, max: 90, default: 45, step: 1, unit: "%" },
            { id: "flutter", label: "FLUTTER", min: 0, max: 100, default: 40, step: 1, unit: "%" },
            { id: "mix", label: "MIX", min: 0, max: 100, default: 45, step: 1, unit: "%" }
        ]
    },
    "ping-pong": {
        id: "ping-pong", chassis: 3, name: "PING PONG", color: "#8b5cf6",
        desc: "Alternating stereo bounce ping-pong echoes",
        knobs: [
            { id: "time", label: "TIME", min: 60, max: 800, default: 320, step: 10, unit: "ms" },
            { id: "feedback", label: "FDBK", min: 0, max: 85, default: 45, step: 1, unit: "%" },
            { id: "width", label: "WIDTH", min: 10, max: 100, default: 80, step: 1, unit: "%" },
            { id: "mix", label: "MIX", min: 0, max: 100, default: 40, step: 1, unit: "%" }
        ]
    },
    "analog-delay": {
        id: "analog-delay", chassis: 3, name: "BBD DELAY", color: "#f97316",
        desc: "Warm dark bucket-brigade analog delay",
        knobs: [
            { id: "time", label: "TIME", min: 40, max: 700, default: 260, step: 10, unit: "ms" },
            { id: "feedback", label: "FDBK", min: 0, max: 85, default: 35, step: 1, unit: "%" },
            { id: "mix", label: "MIX", min: 0, max: 100, default: 35, step: 1, unit: "%" }
        ]
    },
    "delay": {
        id: "delay", chassis: 3, name: "STD DELAY", color: "#00e5ff",
        desc: "Standard digital stereo delay",
        knobs: [
            { id: "time", label: "TIME", min: 50, max: 1000, default: 380, step: 10, unit: "ms" },
            { id: "feedback", label: "FDBK", min: 0, max: 80, default: 40, step: 1, unit: "%" },
            { id: "mix", label: "MIX", min: 0, max: 100, default: 45, step: 1, unit: "%" }
        ]
    },
    "glitch-delay": {
        id: "glitch-delay", chassis: 3, name: "GLITCH DLY", color: "#ef4444",
        desc: "Granular buffer stutter and fragment loop repeats",
        knobs: [
            { id: "size", label: "SIZE", min: 20, max: 400, default: 120, step: 5, unit: "ms" },
            { id: "feedback", label: "FDBK", min: 0, max: 90, default: 50, step: 1, unit: "%" },
            { id: "jitter", label: "JITTER", min: 0, max: 100, default: 55, step: 1, unit: "%" },
            { id: "mix", label: "MIX", min: 0, max: 100, default: 45, step: 1, unit: "%" }
        ]
    },

    // CHASSIS 4: SPACE & REVERB
    "cathedral-reverb": {
        id: "cathedral-reverb", chassis: 4, name: "CATHEDRAL", color: "#a855f7",
        desc: "Massive 4.5 second cathedral ambient hall",
        knobs: [
            { id: "decay", label: "DECAY", min: 1.0, max: 8.0, default: 4.2, step: 0.1, unit: "s" },
            { id: "damping", label: "DAMP", min: 10, max: 90, default: 30, step: 1, unit: "%" },
            { id: "mix", label: "MIX", min: 0, max: 100, default: 55, step: 1, unit: "%" }
        ]
    },
    "gated-plate": {
        id: "gated-plate", chassis: 4, name: "GATED PLATE", color: "#ec4899",
        desc: "80s punchy gated plate reverb for synths",
        knobs: [
            { id: "size", label: "SIZE", min: 10, max: 100, default: 60, step: 1, unit: "%" },
            { id: "gate", label: "GATE", min: 10, max: 100, default: 55, step: 1, unit: "%" },
            { id: "mix", label: "MIX", min: 0, max: 100, default: 45, step: 1, unit: "%" }
        ]
    },
    "spring-reverb": {
        id: "spring-reverb", chassis: 4, name: "SPRING REV", color: "#eab308",
        desc: "Vintage dual-spring mechanical reverb tank",
        knobs: [
            { id: "tension", label: "BOING", min: 10, max: 100, default: 55, step: 1, unit: "%" },
            { id: "decay", label: "DECAY", min: 0.5, max: 4.0, default: 1.8, step: 0.1, unit: "s" },
            { id: "mix", label: "MIX", min: 0, max: 100, default: 40, step: 1, unit: "%" }
        ]
    },
    "reverb": {
        id: "reverb", chassis: 4, name: "ROOM REV", color: "#00e5ff",
        desc: "Standard studio room convolver reverb",
        knobs: [
            { id: "decay", label: "DECAY", min: 0.5, max: 5.0, default: 2.2, step: 0.1, unit: "s" },
            { id: "mix", label: "MIX", min: 0, max: 100, default: 50, step: 1, unit: "%" }
        ]
    },
    "cosmic-shimmer": {
        id: "cosmic-shimmer", chassis: 4, name: "SHIMMER", color: "#06b6d4",
        desc: "Pitch-shifted octave-up celestial shimmer hall",
        knobs: [
            { id: "shimmer", label: "SHIMMER", min: 10, max: 100, default: 60, step: 1, unit: "%" },
            { id: "decay", label: "DECAY", min: 1.0, max: 7.0, default: 3.5, step: 0.1, unit: "s" },
            { id: "mix", label: "MIX", min: 0, max: 100, default: 50, step: 1, unit: "%" }
        ]
    }
};

/**
 * DSP Factory: Instantiates Web Audio DSP graph for any cartridge
 */
function createPedalDSP(cartridgeId, p = {}, actx = audioCtx) {
    if (!actx) return null;
    const cat = CARTRIDGE_CATALOG[cartridgeId];
    if (!cat) return null;

    // Merge default params
    const params = {};
    cat.knobs.forEach(k => {
        params[k.id] = (p[k.id] !== undefined) ? p[k.id] : k.default;
    });

    const activeNodes = [];
    const timers = [];

    switch (cartridgeId) {
        // ==========================================
        // CHASSIS 0: DRIVE / FUZZ / PREAMP / CRUNCH
        // ==========================================
        case "ds1": {
            const shaper = actx.createWaveShaper();
            shaper.curve = makeDistortionCurve(params.dist || 50);
            shaper.oversample = '4x';

            const filter = actx.createBiquadFilter();
            filter.type = 'peaking';
            filter.frequency.setValueAtTime(params.tone || 2500, actx.currentTime);
            filter.gain.setValueAtTime(2.0, actx.currentTime);

            const lvl = actx.createGain();
            lvl.gain.setValueAtTime(((params.level || 65) / 100) * 0.85, actx.currentTime);

            shaper.connect(filter);
            filter.connect(lvl);
            activeNodes.push(shaper, filter, lvl);

            return {
                inputNode: shaper,
                outputNode: lvl,
                updateParam: (id, val) => {
                    params[id] = val;
                    if (id === 'dist') shaper.curve = makeDistortionCurve(val);
                    if (id === 'tone') filter.frequency.setTargetAtTime(val, actx.currentTime, 0.05);
                    if (id === 'level') lvl.gain.setTargetAtTime((val / 100) * 0.85, actx.currentTime, 0.05);
                },
                cleanup: () => { activeNodes.forEach(n => { try { n.disconnect(); } catch(e){} }); }
            };
        }

        case "proco-rat": {
            const preGain = actx.createGain();
            preGain.gain.setValueAtTime(1.5, actx.currentTime);

            const shaper = actx.createWaveShaper();
            shaper.curve = makeDistortionCurve((params.dist || 55) * 1.4);
            shaper.oversample = '4x';

            const filter = actx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(params.filter || 2200, actx.currentTime);
            filter.Q.setValueAtTime(1.8, actx.currentTime);

            const lvl = actx.createGain();
            lvl.gain.setValueAtTime(((params.level || 70) / 100) * 0.9, actx.currentTime);

            preGain.connect(shaper);
            shaper.connect(filter);
            filter.connect(lvl);
            activeNodes.push(preGain, shaper, filter, lvl);

            return {
                inputNode: preGain,
                outputNode: lvl,
                updateParam: (id, val) => {
                    params[id] = val;
                    if (id === 'dist') shaper.curve = makeDistortionCurve(val * 1.4);
                    if (id === 'filter') filter.frequency.setTargetAtTime(val, actx.currentTime, 0.05);
                    if (id === 'level') lvl.gain.setTargetAtTime((val / 100) * 0.9, actx.currentTime, 0.05);
                },
                cleanup: () => { activeNodes.forEach(n => { try { n.disconnect(); } catch(e){} }); }
            };
        }

        case "big-muff": {
            const shaper = actx.createWaveShaper();
            shaper.curve = makeDistortionCurve((params.sustain || 70) * 2.0);
            shaper.oversample = '4x';

            const scoop = actx.createBiquadFilter();
            scoop.type = 'peaking';
            scoop.frequency.setValueAtTime(1000, actx.currentTime);
            scoop.gain.setValueAtTime(-7.0, actx.currentTime);
            scoop.Q.setValueAtTime(1.2, actx.currentTime);

            const toneFilter = actx.createBiquadFilter();
            toneFilter.type = 'lowpass';
            toneFilter.frequency.setValueAtTime(params.tone || 1800, actx.currentTime);

            const vol = actx.createGain();
            vol.gain.setValueAtTime(((params.volume || 75) / 100) * 0.85, actx.currentTime);

            shaper.connect(scoop);
            scoop.connect(toneFilter);
            toneFilter.connect(vol);
            activeNodes.push(shaper, scoop, toneFilter, vol);

            return {
                inputNode: shaper,
                outputNode: vol,
                updateParam: (id, val) => {
                    params[id] = val;
                    if (id === 'sustain') shaper.curve = makeDistortionCurve(val * 2.0);
                    if (id === 'tone') toneFilter.frequency.setTargetAtTime(val, actx.currentTime, 0.05);
                    if (id === 'volume') vol.gain.setTargetAtTime((val / 100) * 0.85, actx.currentTime, 0.05);
                },
                cleanup: () => { activeNodes.forEach(n => { try { n.disconnect(); } catch(e){} }); }
            };
        }

        case "tube-screamer": {
            const midHump = actx.createBiquadFilter();
            midHump.type = 'peaking';
            midHump.frequency.setValueAtTime(720, actx.currentTime);
            midHump.gain.setValueAtTime(5.5, actx.currentTime);
            midHump.Q.setValueAtTime(1.4, actx.currentTime);

            const shaper = actx.createWaveShaper();
            shaper.curve = makeDistortionCurve((params.drive || 45) * 0.9);
            shaper.oversample = '4x';

            const tone = actx.createBiquadFilter();
            tone.type = 'lowpass';
            tone.frequency.setValueAtTime(params.tone || 2000, actx.currentTime);

            const lvl = actx.createGain();
            lvl.gain.setValueAtTime(((params.level || 70) / 100) * 0.85, actx.currentTime);

            midHump.connect(shaper);
            shaper.connect(tone);
            tone.connect(lvl);
            activeNodes.push(midHump, shaper, tone, lvl);

            return {
                inputNode: midHump,
                outputNode: lvl,
                updateParam: (id, val) => {
                    params[id] = val;
                    if (id === 'drive') shaper.curve = makeDistortionCurve(val * 0.9);
                    if (id === 'tone') tone.frequency.setTargetAtTime(val, actx.currentTime, 0.05);
                    if (id === 'level') lvl.gain.setTargetAtTime((val / 100) * 0.85, actx.currentTime, 0.05);
                },
                cleanup: () => { activeNodes.forEach(n => { try { n.disconnect(); } catch(e){} }); }
            };
        }

        case "french-preamp": {
            const warmth = actx.createBiquadFilter();
            warmth.type = 'lowshelf';
            warmth.frequency.setValueAtTime(320, actx.currentTime);
            warmth.gain.setValueAtTime(((params.warmth || 65) / 100) * 8.0, actx.currentTime);

            const shaper = actx.createWaveShaper();
            shaper.curve = makeDistortionCurve((params.drive || 60) * 0.7);
            shaper.oversample = '4x';

            const outGain = actx.createGain();
            outGain.gain.setValueAtTime(((params.output || 75) / 100) * 0.9, actx.currentTime);

            warmth.connect(shaper);
            shaper.connect(outGain);
            activeNodes.push(warmth, shaper, outGain);

            return {
                inputNode: warmth,
                outputNode: outGain,
                updateParam: (id, val) => {
                    params[id] = val;
                    if (id === 'warmth') warmth.gain.setTargetAtTime((val / 100) * 8.0, actx.currentTime, 0.05);
                    if (id === 'drive') shaper.curve = makeDistortionCurve(val * 0.7);
                    if (id === 'output') outGain.gain.setTargetAtTime((val / 100) * 0.9, actx.currentTime, 0.05);
                },
                cleanup: () => { activeNodes.forEach(n => { try { n.disconnect(); } catch(e){} }); }
            };
        }

        case "decimator": {
            const crusher = createBitcrusherNode(actx);
            crusher.setBits(params.bits || 8);
            crusher.setCrush(params.rate || 40);

            const dry = actx.createGain();
            const wet = actx.createGain();
            const inNode = actx.createGain();
            const outNode = actx.createGain();

            const mixVal = (params.mix || 60) / 100;
            dry.gain.setValueAtTime(1.0 - mixVal * 0.4, actx.currentTime);
            wet.gain.setValueAtTime(mixVal, actx.currentTime);

            inNode.connect(dry);
            dry.connect(outNode);

            inNode.connect(crusher);
            crusher.connect(wet);
            wet.connect(outNode);
            activeNodes.push(inNode, crusher, dry, wet, outNode);

            return {
                inputNode: inNode,
                outputNode: outNode,
                updateParam: (id, val) => {
                    params[id] = val;
                    if (id === 'bits') crusher.setBits(parseInt(val));
                    if (id === 'rate') crusher.setCrush(parseFloat(val));
                    if (id === 'mix') {
                        const m = val / 100;
                        wet.gain.setTargetAtTime(m, actx.currentTime, 0.05);
                        dry.gain.setTargetAtTime(1.0 - m * 0.4, actx.currentTime, 0.05);
                    }
                },
                cleanup: () => { activeNodes.forEach(n => { try { n.disconnect(); } catch(e){} }); }
            };
        }

        // ==========================================
        // CHASSIS 1: MODULATION
        // ==========================================
        case "small-stone": {
            // 4-stage allpass phaser cascade
            const inNode = actx.createGain();
            const outNode = actx.createGain();
            const ap1 = actx.createBiquadFilter(); ap1.type = 'allpass';
            const ap2 = actx.createBiquadFilter(); ap2.type = 'allpass';
            const ap3 = actx.createBiquadFilter(); ap3.type = 'allpass';
            const ap4 = actx.createBiquadFilter(); ap4.type = 'allpass';

            const fdbk = actx.createGain();
            fdbk.gain.setValueAtTime(((params.feedback || 40) / 100) * 0.8, actx.currentTime);

            const lfo = actx.createOscillator();
            lfo.type = 'sine';
            lfo.frequency.setValueAtTime(params.rate || 0.6, actx.currentTime);

            const lfoGain = actx.createGain();
            lfoGain.gain.setValueAtTime(((params.depth || 75) / 100) * 1200, actx.currentTime);

            [ap1, ap2, ap3, ap4].forEach(ap => {
                ap.frequency.setValueAtTime(1200, actx.currentTime);
                lfoGain.connect(ap.frequency);
            });

            lfo.connect(lfoGain);
            lfo.start();

            inNode.connect(ap1);
            ap1.connect(ap2);
            ap2.connect(ap3);
            ap3.connect(ap4);
            ap4.connect(fdbk);
            fdbk.connect(ap1);

            // Phaser wet + dry sum creates comb notches
            const dry = actx.createGain(); dry.gain.setValueAtTime(0.7, actx.currentTime);
            const wet = actx.createGain(); wet.gain.setValueAtTime(0.7, actx.currentTime);
            inNode.connect(dry);
            dry.connect(outNode);
            ap4.connect(wet);
            wet.connect(outNode);

            activeNodes.push(inNode, outNode, ap1, ap2, ap3, ap4, fdbk, lfo, lfoGain, dry, wet);

            return {
                inputNode: inNode,
                outputNode: outNode,
                updateParam: (id, val) => {
                    params[id] = val;
                    if (id === 'rate') lfo.frequency.setTargetAtTime(val, actx.currentTime, 0.05);
                    if (id === 'depth') lfoGain.gain.setTargetAtTime((val / 100) * 1200, actx.currentTime, 0.05);
                    if (id === 'feedback') fdbk.gain.setTargetAtTime((val / 100) * 0.8, actx.currentTime, 0.05);
                },
                cleanup: () => {
                    try { lfo.stop(); } catch(e){}
                    activeNodes.forEach(n => { try { n.disconnect(); } catch(e){} });
                }
            };
        }

        case "dimension-chorus": {
            const inNode = actx.createGain();
            const outNode = actx.createGain();
            const delayL = actx.createDelay(0.1);
            const delayR = actx.createDelay(0.1);
            delayL.delayTime.setValueAtTime(0.025, actx.currentTime);
            delayR.delayTime.setValueAtTime(0.032, actx.currentTime);

            const lfo1 = actx.createOscillator();
            lfo1.type = 'sine';
            const rateHz = 0.4 + (params.mode || 3) * 0.35;
            lfo1.frequency.setValueAtTime(rateHz, actx.currentTime);

            const lfo2 = actx.createOscillator();
            lfo2.type = 'triangle';
            lfo2.frequency.setValueAtTime(rateHz * 1.15, actx.currentTime);

            const modL = actx.createGain();
            const modR = actx.createGain();
            const depthVal = ((params.width || 75) / 100) * 0.0035;
            modL.gain.setValueAtTime(depthVal, actx.currentTime);
            modR.gain.setValueAtTime(-depthVal, actx.currentTime);

            lfo1.connect(modL);
            modL.connect(delayL.delayTime);
            lfo2.connect(modR);
            modR.connect(delayR.delayTime);

            lfo1.start();
            lfo2.start();

            const dry = actx.createGain();
            const wet = actx.createGain();
            const m = (params.mix || 55) / 100;
            dry.gain.setValueAtTime(1.0 - m * 0.3, actx.currentTime);
            wet.gain.setValueAtTime(m * 0.85, actx.currentTime);

            inNode.connect(dry);
            dry.connect(outNode);
            inNode.connect(delayL);
            inNode.connect(delayR);
            delayL.connect(wet);
            delayR.connect(wet);
            wet.connect(outNode);

            activeNodes.push(inNode, outNode, delayL, delayR, lfo1, lfo2, modL, modR, dry, wet);

            return {
                inputNode: inNode,
                outputNode: outNode,
                updateParam: (id, val) => {
                    params[id] = val;
                    if (id === 'mode') {
                        const newRate = 0.4 + val * 0.35;
                        lfo1.frequency.setTargetAtTime(newRate, actx.currentTime, 0.05);
                        lfo2.frequency.setTargetAtTime(newRate * 1.15, actx.currentTime, 0.05);
                    }
                    if (id === 'width') {
                        const d = (val / 100) * 0.0035;
                        modL.gain.setTargetAtTime(d, actx.currentTime, 0.05);
                        modR.gain.setTargetAtTime(-d, actx.currentTime, 0.05);
                    }
                    if (id === 'mix') {
                        const mix = val / 100;
                        wet.gain.setTargetAtTime(mix * 0.85, actx.currentTime, 0.05);
                        dry.gain.setTargetAtTime(1.0 - mix * 0.3, actx.currentTime, 0.05);
                    }
                },
                cleanup: () => {
                    try { lfo1.stop(); lfo2.stop(); } catch(e){}
                    activeNodes.forEach(n => { try { n.disconnect(); } catch(e){} });
                }
            };
        }

        case "flanger": {
            const inNode = actx.createGain();
            const outNode = actx.createGain();
            const delay = actx.createDelay(0.05);
            delay.delayTime.setValueAtTime(0.005, actx.currentTime);

            const fdbk = actx.createGain();
            fdbk.gain.setValueAtTime(((params.regen || 50) / 100) * 0.9, actx.currentTime);

            const lfo = actx.createOscillator();
            lfo.type = 'sine';
            lfo.frequency.setValueAtTime(params.speed || 0.6, actx.currentTime);

            const lfoDepth = actx.createGain();
            lfoDepth.gain.setValueAtTime(((params.depth || 70) / 100) * 0.0038, actx.currentTime);

            lfo.connect(lfoDepth);
            lfoDepth.connect(delay.delayTime);
            lfo.start();

            inNode.connect(delay);
            delay.connect(fdbk);
            fdbk.connect(delay);

            const dry = actx.createGain(); dry.gain.setValueAtTime(0.7, actx.currentTime);
            const wet = actx.createGain(); wet.gain.setValueAtTime(0.7, actx.currentTime);
            inNode.connect(dry);
            dry.connect(outNode);
            delay.connect(wet);
            wet.connect(outNode);

            activeNodes.push(inNode, outNode, delay, fdbk, lfo, lfoDepth, dry, wet);

            return {
                inputNode: inNode,
                outputNode: outNode,
                updateParam: (id, val) => {
                    params[id] = val;
                    if (id === 'speed') lfo.frequency.setTargetAtTime(val, actx.currentTime, 0.05);
                    if (id === 'depth') lfoDepth.gain.setTargetAtTime((val / 100) * 0.0038, actx.currentTime, 0.05);
                    if (id === 'regen') fdbk.gain.setTargetAtTime((val / 100) * 0.9, actx.currentTime, 0.05);
                },
                cleanup: () => {
                    try { lfo.stop(); } catch(e){}
                    activeNodes.forEach(n => { try { n.disconnect(); } catch(e){} });
                }
            };
        }

        case "optical-tremolo": {
            const inNode = actx.createGain();
            const tremoloGain = actx.createGain();
            tremoloGain.gain.setValueAtTime(1.0, actx.currentTime);

            const lfo = actx.createOscillator();
            lfo.type = (params.shape === 1) ? 'square' : 'sine';
            lfo.frequency.setValueAtTime(params.rate || 4.0, actx.currentTime);

            const lfoGain = actx.createGain();
            const depthFraction = ((params.depth || 60) / 100) * 0.48;
            lfoGain.gain.setValueAtTime(depthFraction, actx.currentTime);

            lfo.connect(lfoGain);
            lfoGain.connect(tremoloGain.gain);
            lfo.start();

            inNode.connect(tremoloGain);
            activeNodes.push(inNode, tremoloGain, lfo, lfoGain);

            return {
                inputNode: inNode,
                outputNode: tremoloGain,
                updateParam: (id, val) => {
                    params[id] = val;
                    if (id === 'rate') lfo.frequency.setTargetAtTime(val, actx.currentTime, 0.05);
                    if (id === 'depth') lfoGain.gain.setTargetAtTime((val / 100) * 0.48, actx.currentTime, 0.05);
                    if (id === 'shape') lfo.type = (val === 1 || val === "1") ? 'square' : 'sine';
                },
                cleanup: () => {
                    try { lfo.stop(); } catch(e){}
                    activeNodes.forEach(n => { try { n.disconnect(); } catch(e){} });
                }
            };
        }

        case "ring-mod": {
            const inNode = actx.createGain();
            const outNode = actx.createGain();
            const multGain = actx.createGain();
            multGain.gain.setValueAtTime(0.0, actx.currentTime);

            const carrier = actx.createOscillator();
            carrier.type = 'sine';
            carrier.frequency.setValueAtTime(params.carrier || 440, actx.currentTime);

            const lfo = actx.createOscillator();
            lfo.type = 'sine';
            lfo.frequency.setValueAtTime(params.lfo || 2.5, actx.currentTime);

            const lfoDepth = actx.createGain();
            lfoDepth.gain.setValueAtTime(25, actx.currentTime);

            lfo.connect(lfoDepth);
            lfoDepth.connect(carrier.frequency);

            carrier.connect(multGain.gain);
            carrier.start();
            lfo.start();

            const dry = actx.createGain();
            const wet = actx.createGain();
            const m = (params.mix || 45) / 100;
            dry.gain.setValueAtTime(1.0 - m * 0.4, actx.currentTime);
            wet.gain.setValueAtTime(m * 0.9, actx.currentTime);

            inNode.connect(dry);
            dry.connect(outNode);
            inNode.connect(multGain);
            multGain.connect(wet);
            wet.connect(outNode);

            activeNodes.push(inNode, outNode, multGain, carrier, lfo, lfoDepth, dry, wet);

            return {
                inputNode: inNode,
                outputNode: outNode,
                updateParam: (id, val) => {
                    params[id] = val;
                    if (id === 'carrier') carrier.frequency.setTargetAtTime(val, actx.currentTime, 0.05);
                    if (id === 'lfo') lfo.frequency.setTargetAtTime(val, actx.currentTime, 0.05);
                    if (id === 'mix') {
                        const mix = val / 100;
                        wet.gain.setTargetAtTime(mix * 0.9, actx.currentTime, 0.05);
                        dry.gain.setTargetAtTime(1.0 - mix * 0.4, actx.currentTime, 0.05);
                    }
                },
                cleanup: () => {
                    try { carrier.stop(); lfo.stop(); } catch(e){}
                    activeNodes.forEach(n => { try { n.disconnect(); } catch(e){} });
                }
            };
        }

        // ==========================================
        // CHASSIS 2: FILTER / DYNAMICS / HARMONIZER
        // ==========================================
        case "ps6": {
            // PS-6 Harmonizer pass-through node (harmonies are spawned in the synth voice engine)
            const inNode = actx.createGain();
            const outNode = actx.createGain();
            const filter = actx.createBiquadFilter();
            filter.type = 'highshelf';
            filter.frequency.setValueAtTime(3000, actx.currentTime);
            filter.gain.setValueAtTime(1.5, actx.currentTime);

            inNode.connect(filter);
            filter.connect(outNode);
            activeNodes.push(inNode, filter, outNode);

            return {
                inputNode: inNode,
                outputNode: outNode,
                updateParam: (id, val) => {
                    params[id] = val;
                },
                cleanup: () => { activeNodes.forEach(n => { try { n.disconnect(); } catch(e){} }); }
            };
        }

        case "sidechain-pumper": {
            const inNode = actx.createGain();
            const pumpGain = actx.createGain();
            pumpGain.gain.setValueAtTime(1.0, actx.currentTime);

            const lfo = actx.createOscillator();
            lfo.type = 'sawtooth'; // ramp down & release
            const bpmSyncHz = 2.0 * ((params.rate || 4) / 4); // quarter notes
            lfo.frequency.setValueAtTime(bpmSyncHz, actx.currentTime);

            const lfoGain = actx.createGain();
            const pumpDepth = ((params.depth || 80) / 100) * 0.45;
            lfoGain.gain.setValueAtTime(pumpDepth, actx.currentTime);

            lfo.connect(lfoGain);
            lfoGain.connect(pumpGain.gain);
            lfo.start();

            inNode.connect(pumpGain);
            activeNodes.push(inNode, pumpGain, lfo, lfoGain);

            return {
                inputNode: inNode,
                outputNode: pumpGain,
                updateParam: (id, val) => {
                    params[id] = val;
                    if (id === 'depth') lfoGain.gain.setTargetAtTime((val / 100) * 0.45, actx.currentTime, 0.05);
                    if (id === 'rate') lfo.frequency.setTargetAtTime(2.0 * (val / 4), actx.currentTime, 0.05);
                },
                cleanup: () => {
                    try { lfo.stop(); } catch(e){}
                    activeNodes.forEach(n => { try { n.disconnect(); } catch(e){} });
                }
            };
        }

        case "mutron-wah": {
            const inNode = actx.createGain();
            const filter = actx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(params.range || 1800, actx.currentTime);
            filter.Q.setValueAtTime(((params.peak || 70) / 100) * 12.0 + 1.0, actx.currentTime);

            const lfo = actx.createOscillator();
            lfo.type = 'sine';
            lfo.frequency.setValueAtTime(1.8, actx.currentTime);

            const lfoGain = actx.createGain();
            lfoGain.gain.setValueAtTime(((params.drive || 50) / 100) * 900, actx.currentTime);

            lfo.connect(lfoGain);
            lfoGain.connect(filter.frequency);
            lfo.start();

            const dry = actx.createGain(); dry.gain.setValueAtTime(0.4, actx.currentTime);
            const wet = actx.createGain(); wet.gain.setValueAtTime(0.85, actx.currentTime);
            const outNode = actx.createGain();

            inNode.connect(dry);
            dry.connect(outNode);
            inNode.connect(filter);
            filter.connect(wet);
            wet.connect(outNode);

            activeNodes.push(inNode, filter, lfo, lfoGain, dry, wet, outNode);

            return {
                inputNode: inNode,
                outputNode: outNode,
                updateParam: (id, val) => {
                    params[id] = val;
                    if (id === 'range') filter.frequency.setTargetAtTime(val, actx.currentTime, 0.05);
                    if (id === 'peak') filter.Q.setTargetAtTime((val / 100) * 12.0 + 1.0, actx.currentTime, 0.05);
                    if (id === 'drive') lfoGain.gain.setTargetAtTime((val / 100) * 900, actx.currentTime, 0.05);
                },
                cleanup: () => {
                    try { lfo.stop(); } catch(e){}
                    activeNodes.forEach(n => { try { n.disconnect(); } catch(e){} });
                }
            };
        }

        case "formant-filter": {
            const inNode = actx.createGain();
            const outNode = actx.createGain();

            // Vowels: 1: A (800, 1200), 2: E (400, 2000), 3: I (250, 2400), 4: O (450, 800), 5: U (300, 600)
            const VOWEL_PAIRS = [
                [800, 1200],
                [400, 2000],
                [250, 2400],
                [450, 800],
                [300, 600]
            ];
            const vIdx = Math.min(4, Math.max(0, (params.vowel || 2) - 1));
            const [f1Freq, f2Freq] = VOWEL_PAIRS[vIdx];

            const bp1 = actx.createBiquadFilter(); bp1.type = 'bandpass';
            bp1.frequency.setValueAtTime(f1Freq, actx.currentTime);
            bp1.Q.setValueAtTime(((params.reso || 65) / 100) * 8.0 + 2.0, actx.currentTime);

            const bp2 = actx.createBiquadFilter(); bp2.type = 'bandpass';
            bp2.frequency.setValueAtTime(f2Freq, actx.currentTime);
            bp2.Q.setValueAtTime(((params.reso || 65) / 100) * 8.0 + 2.0, actx.currentTime);

            inNode.connect(bp1);
            inNode.connect(bp2);
            bp1.connect(outNode);
            bp2.connect(outNode);

            activeNodes.push(inNode, bp1, bp2, outNode);

            return {
                inputNode: inNode,
                outputNode: outNode,
                updateParam: (id, val) => {
                    params[id] = val;
                    if (id === 'vowel') {
                        const pair = VOWEL_PAIRS[Math.min(4, Math.max(0, parseInt(val) - 1))];
                        bp1.frequency.setTargetAtTime(pair[0], actx.currentTime, 0.08);
                        bp2.frequency.setTargetAtTime(pair[1], actx.currentTime, 0.08);
                    }
                    if (id === 'reso') {
                        const q = (val / 100) * 8.0 + 2.0;
                        bp1.Q.setTargetAtTime(q, actx.currentTime, 0.05);
                        bp2.Q.setTargetAtTime(q, actx.currentTime, 0.05);
                    }
                },
                cleanup: () => { activeNodes.forEach(n => { try { n.disconnect(); } catch(e){} }); }
            };
        }

        case "sid-resonator": {
            const inNode = actx.createGain();
            const filter = actx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(params.cutoff || 2200, actx.currentTime);
            filter.Q.setValueAtTime(((params.squelch || 75) / 100) * 16.0 + 1.0, actx.currentTime);

            const drive = actx.createWaveShaper();
            drive.curve = makeDistortionCurve(30);
            drive.oversample = '2x';

            inNode.connect(filter);
            filter.connect(drive);
            activeNodes.push(inNode, filter, drive);

            return {
                inputNode: inNode,
                outputNode: drive,
                updateParam: (id, val) => {
                    params[id] = val;
                    if (id === 'cutoff') filter.frequency.setTargetAtTime(val, actx.currentTime, 0.05);
                    if (id === 'squelch') filter.Q.setTargetAtTime((val / 100) * 16.0 + 1.0, actx.currentTime, 0.05);
                },
                cleanup: () => { activeNodes.forEach(n => { try { n.disconnect(); } catch(e){} }); }
            };
        }

        // ==========================================
        // CHASSIS 3: TIME & DELAY
        // ==========================================
        case "space-echo": {
            const inNode = actx.createGain();
            const outNode = actx.createGain();
            const delay = actx.createDelay(2.0);
            delay.delayTime.setValueAtTime((params.time || 360) / 1000, actx.currentTime);

            const tapeDamp = actx.createBiquadFilter();
            tapeDamp.type = 'lowpass';
            tapeDamp.frequency.setValueAtTime(3200, actx.currentTime);

            const tapeSat = actx.createWaveShaper();
            tapeSat.curve = makeDistortionCurve(18);

            const fdbk = actx.createGain();
            fdbk.gain.setValueAtTime(((params.intensity || 45) / 100) * 0.88, actx.currentTime);

            // Flutter LFO
            const flutterLfo = actx.createOscillator();
            flutterLfo.type = 'sine';
            flutterLfo.frequency.setValueAtTime(3.8, actx.currentTime);
            const flutterGain = actx.createGain();
            flutterGain.gain.setValueAtTime(((params.flutter || 40) / 100) * 0.0018, actx.currentTime);

            flutterLfo.connect(flutterGain);
            flutterGain.connect(delay.delayTime);
            flutterLfo.start();

            inNode.connect(delay);
            delay.connect(tapeDamp);
            tapeDamp.connect(tapeSat);
            tapeSat.connect(fdbk);
            fdbk.connect(delay);

            const dry = actx.createGain();
            const wet = actx.createGain();
            const m = (params.mix || 45) / 100;
            dry.gain.setValueAtTime(1.0 - m * 0.3, actx.currentTime);
            wet.gain.setValueAtTime(m * 0.85, actx.currentTime);

            inNode.connect(dry);
            dry.connect(outNode);
            tapeSat.connect(wet);
            wet.connect(outNode);

            activeNodes.push(inNode, outNode, delay, tapeDamp, tapeSat, fdbk, flutterLfo, flutterGain, dry, wet);

            return {
                inputNode: inNode,
                outputNode: outNode,
                updateParam: (id, val) => {
                    params[id] = val;
                    if (id === 'time') delay.delayTime.setTargetAtTime(val / 1000, actx.currentTime, 0.1);
                    if (id === 'intensity') fdbk.gain.setTargetAtTime((val / 100) * 0.88, actx.currentTime, 0.05);
                    if (id === 'flutter') flutterGain.gain.setTargetAtTime((val / 100) * 0.0018, actx.currentTime, 0.05);
                    if (id === 'mix') {
                        const mix = val / 100;
                        wet.gain.setTargetAtTime(mix * 0.85, actx.currentTime, 0.05);
                        dry.gain.setTargetAtTime(1.0 - mix * 0.3, actx.currentTime, 0.05);
                    }
                },
                cleanup: () => {
                    try { flutterLfo.stop(); } catch(e){}
                    activeNodes.forEach(n => { try { n.disconnect(); } catch(e){} });
                }
            };
        }

        case "ping-pong": {
            const inNode = actx.createGain();
            const outNode = actx.createGain();
            const delayL = actx.createDelay(2.0);
            const delayR = actx.createDelay(2.0);
            const t = (params.time || 320) / 1000;
            delayL.delayTime.setValueAtTime(t, actx.currentTime);
            delayR.delayTime.setValueAtTime(t * 1.5, actx.currentTime);

            const fdbkL = actx.createGain();
            const fdbkR = actx.createGain();
            const fdbkVal = ((params.feedback || 45) / 100) * 0.82;
            fdbkL.gain.setValueAtTime(fdbkVal, actx.currentTime);
            fdbkR.gain.setValueAtTime(fdbkVal, actx.currentTime);

            // Cross ping-pong bounce
            inNode.connect(delayL);
            delayL.connect(fdbkL);
            fdbkL.connect(delayR);

            delayR.connect(fdbkR);
            fdbkR.connect(delayL);

            const dry = actx.createGain();
            const wet = actx.createGain();
            const m = (params.mix || 40) / 100;
            dry.gain.setValueAtTime(1.0 - m * 0.3, actx.currentTime);
            wet.gain.setValueAtTime(m * 0.85, actx.currentTime);

            inNode.connect(dry);
            dry.connect(outNode);
            delayL.connect(wet);
            delayR.connect(wet);
            wet.connect(outNode);

            activeNodes.push(inNode, outNode, delayL, delayR, fdbkL, fdbkR, dry, wet);

            return {
                inputNode: inNode,
                outputNode: outNode,
                updateParam: (id, val) => {
                    params[id] = val;
                    if (id === 'time') {
                        const sec = val / 1000;
                        delayL.delayTime.setTargetAtTime(sec, actx.currentTime, 0.1);
                        delayR.delayTime.setTargetAtTime(sec * 1.5, actx.currentTime, 0.1);
                    }
                    if (id === 'feedback') {
                        const f = (val / 100) * 0.82;
                        fdbkL.gain.setTargetAtTime(f, actx.currentTime, 0.05);
                        fdbkR.gain.setTargetAtTime(f, actx.currentTime, 0.05);
                    }
                    if (id === 'mix') {
                        const mix = val / 100;
                        wet.gain.setTargetAtTime(mix * 0.85, actx.currentTime, 0.05);
                        dry.gain.setTargetAtTime(1.0 - mix * 0.3, actx.currentTime, 0.05);
                    }
                },
                cleanup: () => { activeNodes.forEach(n => { try { n.disconnect(); } catch(e){} }); }
            };
        }

        case "analog-delay": {
            const inNode = actx.createGain();
            const outNode = actx.createGain();
            const delay = actx.createDelay(2.0);
            delay.delayTime.setValueAtTime((params.time || 260) / 1000, actx.currentTime);

            // BBD High roll-off filter
            const bbdFilter = actx.createBiquadFilter();
            bbdFilter.type = 'lowpass';
            bbdFilter.frequency.setValueAtTime(2200, actx.currentTime);

            const fdbk = actx.createGain();
            fdbk.gain.setValueAtTime(((params.feedback || 35) / 100) * 0.85, actx.currentTime);

            inNode.connect(delay);
            delay.connect(bbdFilter);
            bbdFilter.connect(fdbk);
            fdbk.connect(delay);

            const dry = actx.createGain();
            const wet = actx.createGain();
            const m = (params.mix || 35) / 100;
            dry.gain.setValueAtTime(1.0 - m * 0.3, actx.currentTime);
            wet.gain.setValueAtTime(m * 0.85, actx.currentTime);

            inNode.connect(dry);
            dry.connect(outNode);
            bbdFilter.connect(wet);
            wet.connect(outNode);

            activeNodes.push(inNode, outNode, delay, bbdFilter, fdbk, dry, wet);

            return {
                inputNode: inNode,
                outputNode: outNode,
                updateParam: (id, val) => {
                    params[id] = val;
                    if (id === 'time') delay.delayTime.setTargetAtTime(val / 1000, actx.currentTime, 0.1);
                    if (id === 'feedback') fdbk.gain.setTargetAtTime((val / 100) * 0.85, actx.currentTime, 0.05);
                    if (id === 'mix') {
                        const mix = val / 100;
                        wet.gain.setTargetAtTime(mix * 0.85, actx.currentTime, 0.05);
                        dry.gain.setTargetAtTime(1.0 - mix * 0.3, actx.currentTime, 0.05);
                    }
                },
                cleanup: () => { activeNodes.forEach(n => { try { n.disconnect(); } catch(e){} }); }
            };
        }

        case "delay": {
            const inNode = actx.createGain();
            const outNode = actx.createGain();
            const delay = actx.createDelay(2.0);
            delay.delayTime.setValueAtTime((params.time || 380) / 1000, actx.currentTime);

            const fdbk = actx.createGain();
            fdbk.gain.setValueAtTime(((params.feedback || 40) / 100) * 0.82, actx.currentTime);

            inNode.connect(delay);
            delay.connect(fdbk);
            fdbk.connect(delay);

            const dry = actx.createGain();
            const wet = actx.createGain();
            const m = (params.mix || 45) / 100;
            dry.gain.setValueAtTime(1.0 - m * 0.3, actx.currentTime);
            wet.gain.setValueAtTime(m * 0.85, actx.currentTime);

            inNode.connect(dry);
            dry.connect(outNode);
            delay.connect(wet);
            wet.connect(outNode);

            activeNodes.push(inNode, outNode, delay, fdbk, dry, wet);

            return {
                inputNode: inNode,
                outputNode: outNode,
                updateParam: (id, val) => {
                    params[id] = val;
                    if (id === 'time') delay.delayTime.setTargetAtTime(val / 1000, actx.currentTime, 0.1);
                    if (id === 'feedback') fdbk.gain.setTargetAtTime((val / 100) * 0.82, actx.currentTime, 0.05);
                    if (id === 'mix') {
                        const mix = val / 100;
                        wet.gain.setTargetAtTime(mix * 0.85, actx.currentTime, 0.05);
                        dry.gain.setTargetAtTime(1.0 - mix * 0.3, actx.currentTime, 0.05);
                    }
                },
                cleanup: () => { activeNodes.forEach(n => { try { n.disconnect(); } catch(e){} }); }
            };
        }

        case "glitch-delay": {
            const inNode = actx.createGain();
            const outNode = actx.createGain();
            const delay = actx.createDelay(1.0);
            delay.delayTime.setValueAtTime((params.size || 120) / 1000, actx.currentTime);

            const fdbk = actx.createGain();
            fdbk.gain.setValueAtTime(((params.feedback || 50) / 100) * 0.88, actx.currentTime);

            const jitterLfo = actx.createOscillator();
            jitterLfo.type = 'square';
            jitterLfo.frequency.setValueAtTime(8.0, actx.currentTime);

            const jitterDepth = actx.createGain();
            jitterDepth.gain.setValueAtTime(((params.jitter || 55) / 100) * 0.02, actx.currentTime);

            jitterLfo.connect(jitterDepth);
            jitterDepth.connect(delay.delayTime);
            jitterLfo.start();

            inNode.connect(delay);
            delay.connect(fdbk);
            fdbk.connect(delay);

            const dry = actx.createGain();
            const wet = actx.createGain();
            const m = (params.mix || 45) / 100;
            dry.gain.setValueAtTime(1.0 - m * 0.3, actx.currentTime);
            wet.gain.setValueAtTime(m * 0.85, actx.currentTime);

            inNode.connect(dry);
            dry.connect(outNode);
            delay.connect(wet);
            wet.connect(outNode);

            activeNodes.push(inNode, outNode, delay, fdbk, jitterLfo, jitterDepth, dry, wet);

            return {
                inputNode: inNode,
                outputNode: outNode,
                updateParam: (id, val) => {
                    params[id] = val;
                    if (id === 'size') delay.delayTime.setTargetAtTime(val / 1000, actx.currentTime, 0.05);
                    if (id === 'feedback') fdbk.gain.setTargetAtTime((val / 100) * 0.88, actx.currentTime, 0.05);
                    if (id === 'jitter') jitterDepth.gain.setTargetAtTime((val / 100) * 0.02, actx.currentTime, 0.05);
                    if (id === 'mix') {
                        const mix = val / 100;
                        wet.gain.setTargetAtTime(mix * 0.85, actx.currentTime, 0.05);
                        dry.gain.setTargetAtTime(1.0 - mix * 0.3, actx.currentTime, 0.05);
                    }
                },
                cleanup: () => {
                    try { jitterLfo.stop(); } catch(e){}
                    activeNodes.forEach(n => { try { n.disconnect(); } catch(e){} });
                }
            };
        }

        // ==========================================
        // CHASSIS 4: SPACE & REVERB
        // ==========================================
        case "cathedral-reverb": {
            const inNode = actx.createGain();
            const outNode = actx.createGain();
            const conv = actx.createConvolver();
            conv.buffer = createReverbImpulse(actx, params.decay || 4.2, 1.8);

            const damp = actx.createBiquadFilter();
            damp.type = 'lowpass';
            const dampFreq = 9000 - ((params.damping || 30) / 100) * 6000;
            damp.frequency.setValueAtTime(dampFreq, actx.currentTime);

            const dry = actx.createGain();
            const wet = actx.createGain();
            const m = (params.mix || 55) / 100;
            dry.gain.setValueAtTime(1.0 - m * 0.4, actx.currentTime);
            wet.gain.setValueAtTime(m * 0.8, actx.currentTime);

            inNode.connect(dry);
            dry.connect(outNode);
            inNode.connect(conv);
            conv.connect(damp);
            damp.connect(wet);
            wet.connect(outNode);

            activeNodes.push(inNode, outNode, conv, damp, dry, wet);

            return {
                inputNode: inNode,
                outputNode: outNode,
                updateParam: (id, val) => {
                    params[id] = val;
                    if (id === 'decay') conv.buffer = createReverbImpulse(actx, val, 1.8);
                    if (id === 'damping') damp.frequency.setTargetAtTime(9000 - (val / 100) * 6000, actx.currentTime, 0.05);
                    if (id === 'mix') {
                        const mix = val / 100;
                        wet.gain.setTargetAtTime(mix * 0.8, actx.currentTime, 0.05);
                        dry.gain.setTargetAtTime(1.0 - mix * 0.4, actx.currentTime, 0.05);
                    }
                },
                cleanup: () => { activeNodes.forEach(n => { try { n.disconnect(); } catch(e){} }); }
            };
        }

        case "gated-plate": {
            const inNode = actx.createGain();
            const outNode = actx.createGain();
            const conv = actx.createConvolver();
            conv.buffer = createReverbImpulse(actx, 1.2, 3.5);

            const gateFilter = actx.createBiquadFilter();
            gateFilter.type = 'highpass';
            gateFilter.frequency.setValueAtTime(180, actx.currentTime);

            const dry = actx.createGain();
            const wet = actx.createGain();
            const m = (params.mix || 45) / 100;
            dry.gain.setValueAtTime(1.0 - m * 0.3, actx.currentTime);
            wet.gain.setValueAtTime(m * 0.8, actx.currentTime);

            inNode.connect(dry);
            dry.connect(outNode);
            inNode.connect(conv);
            conv.connect(gateFilter);
            gateFilter.connect(wet);
            wet.connect(outNode);

            activeNodes.push(inNode, outNode, conv, gateFilter, dry, wet);

            return {
                inputNode: inNode,
                outputNode: outNode,
                updateParam: (id, val) => {
                    params[id] = val;
                    if (id === 'mix') {
                        const mix = val / 100;
                        wet.gain.setTargetAtTime(mix * 0.8, actx.currentTime, 0.05);
                        dry.gain.setTargetAtTime(1.0 - mix * 0.3, actx.currentTime, 0.05);
                    }
                },
                cleanup: () => { activeNodes.forEach(n => { try { n.disconnect(); } catch(e){} }); }
            };
        }

        case "spring-reverb": {
            const inNode = actx.createGain();
            const outNode = actx.createGain();
            const conv = actx.createConvolver();
            conv.buffer = createSpringReverbImpulse(actx, params.decay || 1.8, 2.5, (params.tension || 55) / 100);

            const tone = actx.createBiquadFilter();
            tone.type = 'peaking';
            tone.frequency.setValueAtTime(2800, actx.currentTime);
            tone.gain.setValueAtTime(3.5, actx.currentTime);

            const dry = actx.createGain();
            const wet = actx.createGain();
            const m = (params.mix || 40) / 100;
            dry.gain.setValueAtTime(1.0 - m * 0.3, actx.currentTime);
            wet.gain.setValueAtTime(m * 0.8, actx.currentTime);

            inNode.connect(dry);
            dry.connect(outNode);
            inNode.connect(conv);
            conv.connect(tone);
            tone.connect(wet);
            wet.connect(outNode);

            activeNodes.push(inNode, outNode, conv, tone, dry, wet);

            return {
                inputNode: inNode,
                outputNode: outNode,
                updateParam: (id, val) => {
                    params[id] = val;
                    if (id === 'decay' || id === 'tension') {
                        conv.buffer = createSpringReverbImpulse(actx, params.decay || 1.8, 2.5, (params.tension || 55) / 100);
                    }
                    if (id === 'mix') {
                        const mix = val / 100;
                        wet.gain.setTargetAtTime(mix * 0.8, actx.currentTime, 0.05);
                        dry.gain.setTargetAtTime(1.0 - mix * 0.3, actx.currentTime, 0.05);
                    }
                },
                cleanup: () => { activeNodes.forEach(n => { try { n.disconnect(); } catch(e){} }); }
            };
        }

        case "reverb": {
            const inNode = actx.createGain();
            const outNode = actx.createGain();
            const conv = actx.createConvolver();
            conv.buffer = createReverbImpulse(actx, params.decay || 2.2, 2.0);

            const dry = actx.createGain();
            const wet = actx.createGain();
            const m = (params.mix || 50) / 100;
            dry.gain.setValueAtTime(1.0 - m * 0.3, actx.currentTime);
            wet.gain.setValueAtTime(m * 0.75, actx.currentTime);

            inNode.connect(dry);
            dry.connect(outNode);
            inNode.connect(conv);
            conv.connect(wet);
            wet.connect(outNode);

            activeNodes.push(inNode, outNode, conv, dry, wet);

            return {
                inputNode: inNode,
                outputNode: outNode,
                updateParam: (id, val) => {
                    params[id] = val;
                    if (id === 'decay') conv.buffer = createReverbImpulse(actx, val, 2.0);
                    if (id === 'mix') {
                        const mix = val / 100;
                        wet.gain.setTargetAtTime(mix * 0.75, actx.currentTime, 0.05);
                        dry.gain.setTargetAtTime(1.0 - mix * 0.3, actx.currentTime, 0.05);
                    }
                },
                cleanup: () => { activeNodes.forEach(n => { try { n.disconnect(); } catch(e){} }); }
            };
        }

        case "cosmic-shimmer": {
            const inNode = actx.createGain();
            const outNode = actx.createGain();
            const conv = actx.createConvolver();
            conv.buffer = createReverbImpulse(actx, params.decay || 3.5, 1.6);

            const shimmerFilter = actx.createBiquadFilter();
            shimmerFilter.type = 'highshelf';
            shimmerFilter.frequency.setValueAtTime(3500, actx.currentTime);
            shimmerFilter.gain.setValueAtTime(((params.shimmer || 60) / 100) * 9.0, actx.currentTime);

            const dry = actx.createGain();
            const wet = actx.createGain();
            const m = (params.mix || 50) / 100;
            dry.gain.setValueAtTime(1.0 - m * 0.3, actx.currentTime);
            wet.gain.setValueAtTime(m * 0.8, actx.currentTime);

            inNode.connect(dry);
            dry.connect(outNode);
            inNode.connect(conv);
            conv.connect(shimmerFilter);
            shimmerFilter.connect(wet);
            wet.connect(outNode);

            activeNodes.push(inNode, outNode, conv, shimmerFilter, dry, wet);

            return {
                inputNode: inNode,
                outputNode: outNode,
                updateParam: (id, val) => {
                    params[id] = val;
                    if (id === 'decay') conv.buffer = createReverbImpulse(actx, val, 1.6);
                    if (id === 'shimmer') shimmerFilter.gain.setTargetAtTime((val / 100) * 9.0, actx.currentTime, 0.05);
                    if (id === 'mix') {
                        const mix = val / 100;
                        wet.gain.setTargetAtTime(mix * 0.8, actx.currentTime, 0.05);
                        dry.gain.setTargetAtTime(1.0 - mix * 0.3, actx.currentTime, 0.05);
                    }
                },
                cleanup: () => { activeNodes.forEach(n => { try { n.disconnect(); } catch(e){} }); }
            };
        }

        default:
            return null;
    }
}

/**
 * Creates metallic spring dispersion impulse
 */
function createSpringReverbImpulse(context, duration = 1.8, decay = 2.5, tension = 0.5) {
    const sampleRate = context.sampleRate || 44100;
    const length = Math.floor(sampleRate * duration);
    const impulse = context.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    const chirpFreq = 80 + tension * 120;
    for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        const env = Math.pow(1 - i / length, decay);
        // Multi-reflection chirp for spring "boing"
        const chirp = Math.sin(2 * Math.PI * chirpFreq * Math.sqrt(t + 0.001) * 30);
        const noise = Math.random() * 2 - 1;
        const val = (noise * 0.6 + chirp * 0.4) * env;
        left[i] = val;
        right[i] = (noise * 0.6 - chirp * 0.4) * env;
    }
    return impulse;
}


function isMixBasedCartridge(cartId) {
    const cat = CARTRIDGE_CATALOG[cartId];
    if (!cat) return false;
    return cat.knobs.some(k => k.id === 'mix');
}

function initInstrumentPedalChain(instrument, actx, voiceBus, masterBus) {
    const slots = (instrument === "lead") ? leadPedalSlots : bassPedalSlots;

    slots.forEach((slot, idx) => {
        // Create slot input & output isolation nodes
        slot.slotInput = actx.createGain();
        slot.slotOutput = actx.createGain();
        slot.dryGain = actx.createGain();
        slot.wetGain = actx.createGain();

        const isBypassed = !!appSettings.masterFXBypass;
        const active = !isBypassed && slot.active;
        const mixBased = isMixBasedCartridge(slot.cartridgeId);

        slot.dryGain.gain.setValueAtTime(active ? (mixBased ? 1.0 : 0.0) : 1.0, actx.currentTime);
        slot.wetGain.gain.setValueAtTime(active ? 1.0 : 0.0, actx.currentTime);

        slot.slotInput.connect(slot.dryGain);
        slot.dryGain.connect(slot.slotOutput);

        // Instantiate DSP
        if (slot.dsp) {
            try { slot.dsp.cleanup(); } catch(e){}
        }
        slot.dsp = createPedalDSP(slot.cartridgeId, slot.params, actx);
        if (slot.dsp) {
            slot.slotInput.connect(slot.dsp.inputNode);
            slot.dsp.outputNode.connect(slot.wetGain);
            slot.wetGain.connect(slot.slotOutput);
        }

        // Chain connection
        if (idx === 0) {
            voiceBus.connect(slot.slotInput);
        } else {
            slots[idx - 1].slotOutput.connect(slot.slotInput);
        }
    });

    // Connect final slot output to master gain
    slots[4].slotOutput.connect(masterBus);
}

function loadPedalCartridge(instrument, slotIdx, cartridgeId, initialParams = {}, shouldSave = true) {
    const slots = (instrument === "lead") ? leadPedalSlots : bassPedalSlots;
    const slot = slots[slotIdx];
    if (!slot) return;

    const cat = CARTRIDGE_CATALOG[cartridgeId];
    if (!cat) return;

    // Cleanup current DSP
    if (slot.dsp) {
        try {
            if (slot.slotInput && slot.dsp.inputNode) slot.slotInput.disconnect(slot.dsp.inputNode);
            if (slot.wetGain && slot.dsp.outputNode) slot.dsp.outputNode.disconnect(slot.wetGain);
            slot.dsp.cleanup();
        } catch(e) {}
        slot.dsp = null;
    }

    slot.cartridgeId = cartridgeId;
    slot.params = {};
    cat.knobs.forEach(k => {
        slot.params[k.id] = (initialParams[k.id] !== undefined) ? initialParams[k.id] : k.default;
    });

    if (audioCtx && slot.slotInput && slot.wetGain) {
        slot.dsp = createPedalDSP(cartridgeId, slot.params, audioCtx);
        if (slot.dsp) {
            slot.slotInput.connect(slot.dsp.inputNode);
            slot.dsp.outputNode.connect(slot.wetGain);
        }
    }

    renderPedalSlotUI(instrument, slotIdx);

    // Sync legacy settings flags for harmonizer
    if (slotIdx === 2) {
        if (instrument === "lead") appSettings.leadPS6Active = (slot.cartridgeId === "ps6" && slot.active);
        else appSettings.bassPS6Active = (slot.cartridgeId === "ps6" && slot.active);
    }

    if (shouldSave) saveSettings();
}

function togglePedalSlot(instrument, slotIdx) {
    initAudio();
    const slots = (instrument === "lead") ? leadPedalSlots : bassPedalSlots;
    const slot = slots[slotIdx];
    if (!slot) return;

    slot.active = !slot.active;
    const isBypassed = !!appSettings.masterFXBypass;
    const active = !isBypassed && slot.active;
    const mixBased = isMixBasedCartridge(slot.cartridgeId);

    if (slot.wetGain && slot.dryGain && audioCtx) {
        slot.dryGain.gain.setTargetAtTime(active ? (mixBased ? 1.0 : 0.0) : 1.0, audioCtx.currentTime, 0.01);
        slot.wetGain.gain.setTargetAtTime(active ? 1.0 : 0.0, audioCtx.currentTime, 0.01);
    }

    // Sync legacy settings flags
    if (slotIdx === 0 && slot.cartridgeId === "ds1") {
        if (instrument === "lead") appSettings.leadDS1Active = slot.active;
        else appSettings.bassDS1Active = slot.active;
    } else if (slotIdx === 2 && slot.cartridgeId === "ps6") {
        if (instrument === "lead") appSettings.leadPS6Active = slot.active;
        else appSettings.bassPS6Active = slot.active;
    }

    updatePedalSlotStateUI(instrument, slotIdx);
    saveSettings();
}

function updatePedalParam(instrument, slotIdx, paramId, value) {
    initAudio();
    const slots = (instrument === "lead") ? leadPedalSlots : bassPedalSlots;
    const slot = slots[slotIdx];
    if (!slot) return;

    const num = parseFloat(value);
    slot.params[paramId] = num;

    if (slot.dsp && typeof slot.dsp.updateParam === "function") {
        slot.dsp.updateParam(paramId, num);
    }

    const valEl = document.getElementById(`${instrument}-val-${slotIdx}-${paramId}`);
    if (valEl) {
        const cat = CARTRIDGE_CATALOG[slot.cartridgeId];
        const knob = cat ? cat.knobs.find(k => k.id === paramId) : null;
        valEl.textContent = `${num}${(knob && knob.unit) ? knob.unit : ''}`;
    }

    saveSettings();
}

function onCartridgeSelectChange(instrument, slotIdx, newCartridgeId) {
    loadPedalCartridge(instrument, slotIdx, newCartridgeId, {}, true);
}

function renderPedalSlotUI(instrument, slotIdx) {
    const slots = (instrument === "lead") ? leadPedalSlots : bassPedalSlots;
    const slot = slots[slotIdx];
    if (!slot) return;

    const cat = CARTRIDGE_CATALOG[slot.cartridgeId] || CARTRIDGE_CATALOG["ds1"];

    // 1. Dropdown select
    const selectEl = document.getElementById(`${instrument}-cartridge-select-${slotIdx}`);
    if (selectEl) {
        let optsHtml = "";
        Object.keys(CARTRIDGE_CATALOG).forEach(k => {
            const c = CARTRIDGE_CATALOG[k];
            if (c.chassis === slotIdx) {
                optsHtml += `<option value="${c.id}" ${c.id === slot.cartridgeId ? 'selected' : ''}>${c.name}</option>`;
            }
        });
        selectEl.innerHTML = optsHtml;
    }

    // 2. Faceplate color & glow
    const pedalEl = document.getElementById(`${instrument}-pedal-${slotIdx}`);
    if (pedalEl && pedalEl.style && pedalEl.style.setProperty && cat.color) {
        pedalEl.style.setProperty('--pedal-accent', cat.color);
    }

    // 3. Knobs / Hardware Faders
    const bodyEl = document.getElementById(`${instrument}-pedal-body-${slotIdx}`);
    if (bodyEl) {
        let knobsHtml = "";
        cat.knobs.forEach(knob => {
            const currentVal = (slot.params[knob.id] !== undefined) ? slot.params[knob.id] : knob.default;
            knobsHtml += `
                <div class="mini-knob-group">
                    <div class="mini-knob-header">
                        <span class="mini-label">${knob.label}</span>
                        <span class="mini-val" id="${instrument}-val-${slotIdx}-${knob.id}">${currentVal}${knob.unit || ''}</span>
                    </div>
                    <input type="range" class="mini-slider" min="${knob.min}" max="${knob.max}" step="${knob.step}" value="${currentVal}"
                        oninput="updatePedalParam('${instrument}', ${slotIdx}, '${knob.id}', this.value)">
                </div>
            `;
        });
        bodyEl.innerHTML = knobsHtml;
    }

    // 4. Stomp Footswitch Assembly
    const footswitch = document.getElementById(`${instrument}-pedal-footswitch-${slotIdx}`);
    if (footswitch) {
        footswitch.innerHTML = `
            <div class="stomp-switch-assembly">
                <div class="stomp-nut-ring">
                    <div class="stomp-plunger"></div>
                </div>
            </div>
            <span class="stomp-status-label">${slot.active ? 'ENGAGED' : 'BYPASS'}</span>
        `;
    }

    updatePedalSlotStateUI(instrument, slotIdx);
}

function updatePedalSlotStateUI(instrument, slotIdx) {
    const slots = (instrument === "lead") ? leadPedalSlots : bassPedalSlots;
    const slot = slots[slotIdx];
    if (!slot) return;

    const led = document.getElementById(`${instrument}-pedal-led-${slotIdx}`);
    const footswitch = document.getElementById(`${instrument}-pedal-footswitch-${slotIdx}`);
    const pedal = document.getElementById(`${instrument}-pedal-${slotIdx}`);

    if (led && led.classList && led.classList.toggle) led.classList.toggle("active", slot.active);
    if (footswitch) {
        if (footswitch.classList && footswitch.classList.toggle) footswitch.classList.toggle("active", slot.active);
        const label = footswitch.querySelector ? footswitch.querySelector(".stomp-status-label") : null;
        if (label) label.textContent = slot.active ? "ENGAGED" : "BYPASS";
    }
    if (pedal && pedal.classList && pedal.classList.toggle) pedal.classList.toggle("pedal-active", slot.active);
}

function renderAllModularPedalsUI() {
    for (let i = 0; i < 5; i++) {
        renderPedalSlotUI("lead", i);
        renderPedalSlotUI("bass", i);
    }
}

function syncPedalboardsFromModule(modObj) {
    if (!modObj || !modObj.pedalboard) return;

    if (Array.isArray(modObj.pedalboard.lead)) {
        modObj.pedalboard.lead.forEach(p => {
            if (p.slot >= 0 && p.slot < 5) {
                const targetSlot = leadPedalSlots[p.slot];
                targetSlot.active = (p.active !== undefined) ? p.active : false;
                loadPedalCartridge("lead", p.slot, p.cartridge, p.params || {}, false);
            }
        });
    }

    if (Array.isArray(modObj.pedalboard.bass)) {
        modObj.pedalboard.bass.forEach(p => {
            if (p.slot >= 0 && p.slot < 5) {
                const targetSlot = bassPedalSlots[p.slot];
                targetSlot.active = (p.active !== undefined) ? p.active : false;
                loadPedalCartridge("bass", p.slot, p.cartridge, p.params || {}, false);
            }
        });
    }

    renderAllModularPedalsUI();
}

function toggleMasterFX() {
    initAudio();
    appSettings.masterFXBypass = !appSettings.masterFXBypass;
    const isBypassed = !!appSettings.masterFXBypass;

    [leadPedalSlots, bassPedalSlots].forEach(slots => {
        slots.forEach(slot => {
            const active = !isBypassed && slot.active;
            const mixBased = isMixBasedCartridge(slot.cartridgeId);
            if (slot.wetGain && slot.dryGain && audioCtx) {
                slot.dryGain.gain.setTargetAtTime(active ? (mixBased ? 1.0 : 0.0) : 1.0, audioCtx.currentTime, 0.01);
                slot.wetGain.gain.setTargetAtTime(active ? 1.0 : 0.0, audioCtx.currentTime, 0.01);
            }
        });
    });

    syncUIFromSettings();
    saveSettings();
}

function disableAllEffects() {
    [leadPedalSlots, bassPedalSlots].forEach(slots => {
        slots.forEach(slot => {
            slot.active = false;
            if (slot.wetGain && slot.dryGain && audioCtx) {
                slot.dryGain.gain.setTargetAtTime(1.0, audioCtx.currentTime, 0.01);
                slot.wetGain.gain.setTargetAtTime(0.0, audioCtx.currentTime, 0.01);
            }
        });
    });
    renderAllModularPedalsUI();
    saveSettings();
}

// Global window attachments
window.loadPedalCartridge = loadPedalCartridge;
window.togglePedalSlot = togglePedalSlot;
window.updatePedalParam = updatePedalParam;
window.onCartridgeSelectChange = onCartridgeSelectChange;
window.toggleMasterFX = toggleMasterFX;
window.disableAllEffects = disableAllEffects;


// Arpeggiator Selects & Latch Event Wiring
const leadArpMode = document.getElementById("lead-arp-mode");
if (leadArpMode) leadArpMode.addEventListener("change", (e) => {
    appSettings.leadArpMode = e.target.value;
    e.target.blur();
    saveSettings();
});

const leadArpLatch = document.getElementById("lead-arp-latch");
if (leadArpLatch) leadArpLatch.addEventListener("click", () => {
    appSettings.leadArpLatch = !appSettings.leadArpLatch;
    if (!appSettings.leadArpLatch) {
        activeLeadVoices.forEach(v => stopVoice(v));
        activeLeadVoices = [];
    }
    syncUIFromSettings();
    saveSettings();
});

const bassArpMode = document.getElementById("bass-arp-mode");
if (bassArpMode) bassArpMode.addEventListener("change", (e) => {
    appSettings.bassArpMode = e.target.value;
    e.target.blur();
    saveSettings();
});

const bassArpLatch = document.getElementById("bass-arp-latch");
if (bassArpLatch) bassArpLatch.addEventListener("click", () => {
    appSettings.bassArpLatch = !appSettings.bassArpLatch;
    if (!appSettings.bassArpLatch) {
        activeBassVoices.forEach(v => stopVoice(v));
        activeBassVoices = [];
    }
    syncUIFromSettings();
    saveSettings();
});

// Master FX Toggle
const btnMasterFx = document.getElementById("btn-master-fx-toggle");
if (btnMasterFx) btnMasterFx.addEventListener("click", () => toggleMasterFX());

// Arpeggiator Engine
let arpIntervalId = null;
let leadArpIndex = 0;
let bassArpIndex = 0;
let arpTickCount = 0;

const CHIP_60HZ_STEPS = [0, 3, 7, 12];
const ARPEGGIO_16TH_STEPS = [0, 3, 7, 12, 7, 3];
const ARPEGGIO_32ND_STEPS = [0, 4, 7, 12, 7, 4];
const OCT_HOP_STEPS = [0, 12, 24, 12];

function startArpClock() {
    if (arpIntervalId) return;
    arpIntervalId = setInterval(onArpTick, 16.66);
}

function onArpTick() {
    arpTickCount++;
    const leadMode = appSettings.leadArpMode || "off";
    const bassMode = appSettings.bassArpMode || "off";

    if (leadMode === "off" && bassMode === "off") return;
    if (!audioCtx || audioCtx.state !== "running") return;

    // Lead Arpeggiator
    if (leadMode !== "off" && activeLeadVoices.length > 0) {
        let shouldStep = false;
        let steps = CHIP_60HZ_STEPS;

        if (leadMode === "chip60") {
            shouldStep = true;
            steps = CHIP_60HZ_STEPS;
        } else if (leadMode === "32nd") {
            shouldStep = (arpTickCount % 4 === 0);
            steps = ARPEGGIO_32ND_STEPS;
        } else if (leadMode === "16th") {
            shouldStep = (arpTickCount % 8 === 0);
            steps = ARPEGGIO_16TH_STEPS;
        } else if (leadMode === "octhop") {
            shouldStep = (arpTickCount % 6 === 0);
            steps = OCT_HOP_STEPS;
        } else if (leadMode === "random") {
            shouldStep = (arpTickCount % 4 === 0);
        }

        if (shouldStep) {
            leadArpIndex = (leadArpIndex + 1) % steps.length;
            const semitoneOffset = leadMode === "random"
                ? [0, 3, 5, 7, 10, 12][Math.floor(Math.random() * 6)]
                : steps[leadArpIndex];
            const ratio = Math.pow(2, semitoneOffset / 12);

            activeLeadVoices.forEach(voice => {
                if (voice.osc1 && voice.baseFreq) {
                    voice.osc1.frequency.setValueAtTime(voice.baseFreq * ratio, audioCtx.currentTime);
                }
                if (voice.osc2 && voice.baseFreq) {
                    voice.osc2.frequency.setValueAtTime(voice.baseFreq * ratio * (voice.osc2DetuneRatio || 1.004), audioCtx.currentTime);
                }
            });
        }
    }

    // Bass Arpeggiator
    if (bassMode !== "off" && activeBassVoices.length > 0) {
        let shouldStep = false;
        let steps = CHIP_60HZ_STEPS;

        if (bassMode === "chip60") {
            shouldStep = true;
            steps = CHIP_60HZ_STEPS;
        } else if (bassMode === "16th") {
            shouldStep = (arpTickCount % 8 === 0);
            steps = [0, 7, 12, 7];
        } else if (bassMode === "32nd") {
            shouldStep = (arpTickCount % 4 === 0);
            steps = [0, 12, 0, 12];
        } else if (bassMode === "octhop") {
            shouldStep = (arpTickCount % 6 === 0);
            steps = [0, 12, 0, -12];
        }

        if (shouldStep) {
            bassArpIndex = (bassArpIndex + 1) % steps.length;
            const semitoneOffset = steps[bassArpIndex];
            const ratio = Math.pow(2, semitoneOffset / 12);

            activeBassVoices.forEach(voice => {
                if (voice.osc1 && voice.baseFreq) {
                    voice.osc1.frequency.setValueAtTime(voice.baseFreq * ratio, audioCtx.currentTime);
                }
                if (voice.oscSub && voice.baseFreq) {
                    voice.oscSub.frequency.setValueAtTime((voice.baseFreq / 2) * ratio, audioCtx.currentTime);
                }
            });
        }
    }
}

let activeImportTargetSlot = 0;

function updateModuleSlotTabs() {
    for (let i = 0; i < 5; i++) {
        const mod = LOADED_MODULE_SLOTS[i];
        if (!mod) continue;
        const labelEl = document.getElementById(`tab-label-${i}`);
        if (labelEl) {
            labelEl.textContent = mod.name;
        }
        const tabEl = document.getElementById(`slot-tab-${i}`);
        if (tabEl) {
            tabEl.title = `Slot ${i + 1}: ${mod.name} [Alt+${i + 1}]`;
        }
    }
}

function setSoundBank(bankIdx) {
    if (bankIdx < 0 || bankIdx >= LOADED_MODULE_SLOTS.length) bankIdx = 0;
    appSettings.soundBank = bankIdx;
    LEAD_PRESETS = LOADED_MODULE_SLOTS[bankIdx].leads;
    BASS_PRESETS = LOADED_MODULE_SLOTS[bankIdx].basses;

    appSettings.leadPreset = 0;
    appSettings.bassPreset = 0;

    updateModuleSlotTabs();

    // Update bank tabs UI
    document.querySelectorAll(".bank-tab").forEach(tab => {
        if (parseInt(tab.getAttribute("data-bank-idx")) === bankIdx) {
            tab.classList.add("active");
        } else {
            tab.classList.remove("active");
        }
    });

    // Refresh Lead preset button labels
    const leadBtns = document.querySelectorAll(".lead-preset-btn");
    LEAD_PRESETS.forEach((preset, idx) => {
        if (leadBtns[idx]) {
            leadBtns[idx].textContent = preset.label || preset.name.substring(0, 10);
            leadBtns[idx].title = preset.name;
        }
    });

    // Refresh Bass preset button labels
    const bassBtns = document.querySelectorAll(".bass-preset-btn");
    BASS_PRESETS.forEach((preset, idx) => {
        if (bassBtns[idx]) {
            bassBtns[idx].textContent = preset.label || preset.name.substring(0, 10);
            bassBtns[idx].title = preset.name;
        }
    });

    // Load preset 0 defaults into settings for both engines
    const activeLead = LEAD_PRESETS[0];
    if (activeLead) {
        appSettings.leadCutoff = activeLead.cutoff;
        appSettings.leadResonance = activeLead.reso;
        appSettings.leadAttack = activeLead.attack;
        appSettings.leadDecay = activeLead.decay !== undefined ? activeLead.decay : 0.25;
        appSettings.leadRelease = activeLead.release;
        if (activeLead.arp) {
            appSettings.leadArpMode = activeLead.arp;
        }
    }

    const activeBass = BASS_PRESETS[0];
    if (activeBass) {
        appSettings.bassCutoff = activeBass.cutoff;
        appSettings.bassResonance = activeBass.reso;
        appSettings.bassSubLevel = (activeBass.subMix !== undefined ? activeBass.subMix : 0.5) * 100;
        appSettings.bassAttack = activeBass.attack !== undefined ? activeBass.attack : 0.005;
        appSettings.bassDecay = activeBass.decay !== undefined ? activeBass.decay : 0.25;
    }

    updateLeadUI();
    updateBassUI();
    if (typeof syncPedalboardsFromModule === "function") {
        syncPedalboardsFromModule(LOADED_MODULE_SLOTS[bankIdx]);
    }
    syncUIFromSettings();
    saveSettings();
}

// Global Panic Killswitch: Instantly silences all ringing notes and resets voice pool
function panicAllNotes() {
    try {
        activeLeadVoices.forEach(v => {
            try {
                if (v.gainNode) {
                    v.gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
                    v.gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
                    v.gainNode.disconnect();
                }
                if (v.osc1) v.osc1.stop();
                if (v.osc2) v.osc2.stop();
                if (v.vibrato) v.vibrato.stop();
            } catch (e) {}
        });
        activeBassVoices.forEach(v => {
            try {
                if (v.gainNode) {
                    v.gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
                    v.gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
                    v.gainNode.disconnect();
                }
                if (v.osc1) v.osc1.stop();
                if (v.osc2) v.osc2.stop();
                if (v.oscSub) v.oscSub.stop();
            } catch (e) {}
        });
        activeLeadVoices = [];
        activeBassVoices = [];
        document.querySelectorAll(".key-cap").forEach(k => k.classList.remove("active"));
        updatePolyphonyCounter();
    } catch (e) {
        console.warn("Panic execution error", e);
    }
}

function saveUserPatch() {
    const activeSlot = appSettings.soundBank || 0;
    const targetIdx = appSettings.leadPreset || 0;
    const currentName = (LEAD_PRESETS[targetIdx] && LEAD_PRESETS[targetIdx].name) ? LEAD_PRESETS[targetIdx].name : `PATCH ${targetIdx + 1}`;
    const patchName = prompt(`Enter a name for this custom patch (Slot ${activeSlot + 1}):`, currentName);
    if (!patchName) return;

    LOADED_MODULE_SLOTS[activeSlot].leads[targetIdx] = {
        name: patchName.toUpperCase(),
        label: patchName.toUpperCase().substring(0, 10),
        osc1: "sawtooth",
        osc2: "square",
        osc2Detune: 1.01,
        filterType: "lowpass",
        cutoff: appSettings.leadCutoff || 3500,
        reso: appSettings.leadResonance || 1.5,
        attack: appSettings.leadAttack || 0.01,
        release: appSettings.leadRelease || 0.25,
        arp: appSettings.leadArpMode || "off"
    };

    saveSettings();
    setSoundBank(activeSlot);
    alert(`Patch "${patchName}" saved into Slot ${activeSlot + 1} Preset ${targetIdx + 1}!`);
}

function exportActiveModuleFile() {
    exportModuleSlot(appSettings.soundBank || 0);
}

function exportModuleSlot(slotIdx) {
    const mod = LOADED_MODULE_SLOTS[slotIdx];
    if (!mod) return;
    const exportData = {
        format: "ShallotWHAM-Module",
        version: "1.0.0",
        id: mod.id || `custom-module-${slotIdx + 1}`,
        name: mod.name || `MODULE ${slotIdx + 1}`,
        subtitle: mod.subtitle || "ShallotWHAM Sound Module",
        author: mod.author || "User",
        description: mod.description || "ShallotWHAM Synthesizer Sound Module",
        themeGlow: mod.themeGlow || "#00e5ff",
        leads: mod.leads,
        basses: mod.basses,
        exportedAt: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const safeName = (mod.name || "module").toLowerCase().replace(/[^a-z0-9]/g, "_");
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${safeName}.swm`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function exportSoundBanks() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
        app: "ShallotWHAM",
        version: "1.3.0",
        format: "ShallotWHAM-Module-Bundle",
        loadedSlots: LOADED_MODULE_SLOTS,
        appSettings: appSettings
    }, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "shallotwham_all_modules.swm");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function importSoundBanks(jsonData) {
    try {
        const parsed = JSON.parse(jsonData);
        if (parsed.loadedSlots && Array.isArray(parsed.loadedSlots)) {
            parsed.loadedSlots.forEach((slotData, idx) => {
                if (idx < 5 && slotData.leads && slotData.basses) {
                    LOADED_MODULE_SLOTS[idx] = slotData;
                }
            });
            updateModuleSlotTabs();
            setSoundBank(appSettings.soundBank || 0);
            saveSettings();
            return true;
        }
    } catch (e) {
        console.error("Import error", e);
    }
    return false;
}

function importModuleFile(file, targetSlot = 0) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (data.leads && data.basses) {
                const modId = data.id || ('custom-' + Date.now());
                const importedMod = {
                    format: "ShallotWHAM-Module",
                    version: data.version || "1.0.0",
                    id: modId,
                    name: data.name || "IMPORTED BANK",
                    subtitle: data.subtitle || data.description || "Custom Sound Module",
                    author: data.author || "User",
                    description: data.description || "",
                    themeGlow: data.themeGlow || "#00e5ff",
                    category: data.category || "Custom",
                    tags: data.tags || ["custom"],
                    leads: data.leads,
                    basses: data.basses
                };

                registerModule(importedMod, true);
                LOADED_MODULE_SLOTS[targetSlot] = cloneModule(importedMod);

                updateModuleSlotTabs();
                if (appSettings.soundBank === targetSlot) {
                    setSoundBank(targetSlot);
                }
                saveSettings();
                renderModuleManagerGrid();

                alert(`Successfully imported module "${importedMod.name}" into Slot ${targetSlot + 1} and saved to Vault!`);
            } else if (data.loadedSlots) {
                importSoundBanks(e.target.result);
                renderModuleManagerGrid();
                alert("Successfully imported complete module collection!");
            } else {
                alert("Invalid .swm module file. Required 'leads' and 'basses' preset arrays.");
            }
        } catch (err) {
            alert("Error parsing .swm module JSON file: " + err.message);
        }
    };
    reader.readAsText(file);
}

function triggerImportModule() {
    activeImportTargetSlot = appSettings.soundBank || 0;
    const input = document.getElementById("module-file-input");
    if (input) input.click();
}

function loadModuleFileForSlot(slotIdx) {
    activeImportTargetSlot = slotIdx;
    const input = document.getElementById("module-file-input");
    if (input) input.click();
}

function handleModalFileSelect(event) {
    if (event.target.files && event.target.files[0]) {
        importModuleFile(event.target.files[0], activeImportTargetSlot);
        event.target.value = "";
    }
}

function openModuleManager() {
    const modal = document.getElementById("module-manager-modal");
    if (modal) {
        modal.classList.add("active");
        renderModuleManagerGrid();
    }
}

function closeModuleManager() {
    const modal = document.getElementById("module-manager-modal");
    if (modal) modal.classList.remove("active");
}

let currentVaultFilter = "";

function filterVaultCards(query) {
    currentVaultFilter = (query || "").trim().toLowerCase();
    renderModuleVault();
}

function renderModuleManagerGrid() {
    const grid = document.getElementById("module-manager-grid");
    if (!grid) return;

    grid.innerHTML = "";
    const allModuleKeys = Object.keys(MODULE_LIBRARY);

    LOADED_MODULE_SLOTS.forEach((mod, idx) => {
        const row = document.createElement("div");
        row.className = "slot-config-card";
        const isCurrentSlot = (idx === (appSettings.soundBank || 0));

        let selectOptionsHtml = "";
        allModuleKeys.forEach(key => {
            const libMod = MODULE_LIBRARY[key];
            const isSelected = (mod.id === libMod.id);
            selectOptionsHtml += `<option value="${libMod.id}" ${isSelected ? 'selected' : ''}>${libMod.name} (${libMod.author || 'Library'})</option>`;
        });

        row.innerHTML = `
            <span class="slot-badge" style="color: ${mod.themeGlow || 'var(--accent-blue)'}">SLOT ${idx + 1}${isCurrentSlot ? ' ★' : ''}</span>
            <div class="slot-info">
                <span class="slot-loaded-name">${mod.name}</span>
                <span class="slot-loaded-desc">${mod.subtitle || mod.description || '8 Leads / 8 Basses'}</span>
            </div>
            <div class="slot-actions">
                <select class="slot-module-select cyber-select" onchange="changeSlotModule(${idx}, this.value)">
                    ${selectOptionsHtml}
                </select>
                <button class="cyber-btn-mini" onclick="loadModuleFileForSlot(${idx})" title="Load .swm file into Slot ${idx + 1}">📂 LOAD .SWM</button>
                <button class="cyber-btn-mini" onclick="exportModuleSlot(${idx})" title="Export Slot ${idx + 1} as .swm file">💾 EXPORT</button>
            </div>
        `;
        grid.appendChild(row);
    });

    renderModuleVault();
}

function renderModuleVault() {
    const vaultGrid = document.getElementById("module-vault-grid");
    const vaultCountEl = document.getElementById("vault-count");
    if (!vaultGrid) return;

    const allKeys = Object.keys(MODULE_LIBRARY);
    if (vaultCountEl) vaultCountEl.textContent = allKeys.length;

    vaultGrid.innerHTML = "";

    const filteredKeys = allKeys.filter(k => {
        if (!currentVaultFilter) return true;
        const m = MODULE_LIBRARY[k];
        const text = `${m.name} ${m.subtitle || ''} ${m.description || ''} ${m.author || ''} ${(m.tags || []).join(' ')}`.toLowerCase();
        return text.includes(currentVaultFilter);
    });

    if (filteredKeys.length === 0) {
        vaultGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 20px; font-size: 0.8rem;">No sound banks found matching "${currentVaultFilter}".</div>`;
        return;
    }

    filteredKeys.forEach(k => {
        const m = MODULE_LIBRARY[k];
        const card = document.createElement("div");
        card.className = "vault-card";

        // Check which active slots currently contain this module
        const activeSlotIndices = [];
        LOADED_MODULE_SLOTS.forEach((slotMod, sIdx) => {
            if (slotMod && slotMod.id === m.id) activeSlotIndices.push(sIdx);
        });

        let slotButtonsHtml = "";
        for (let s = 0; s < 5; s++) {
            const isSlotActive = activeSlotIndices.includes(s);
            slotButtonsHtml += `
                <button class="vault-slot-btn ${isSlotActive ? 'active-slot' : ''}" 
                        title="${isSlotActive ? `Currently active in Slot ${s + 1}` : `Slot into Slot ${s + 1}`}" 
                        onclick="quickAssignModuleToSlot('${m.id}', ${s})">
                    ${s + 1}${isSlotActive ? '★' : ''}
                </button>
            `;
        }

        const tagsHtml = (m.tags || []).slice(0, 4).map(t => `<span class="vault-tag">#${t}</span>`).join("");

        card.innerHTML = `
            <div class="vault-card-header">
                <span class="vault-card-title" style="color: ${m.themeGlow || 'var(--text-main)'}">
                    ${m.name}
                </span>
                <span class="vault-category-badge">${m.category || 'Sound Bank'}</span>
            </div>
            <div class="vault-card-desc">${m.subtitle || m.description || '8 Leads, 8 Basses'}</div>
            <div class="vault-card-tags">${tagsHtml}</div>
            <div class="vault-slot-actions">
                <span class="vault-slot-label">SLOT INTO:</span>
                <div class="vault-slot-btn-group">
                    ${slotButtonsHtml}
                </div>
                <button class="vault-card-export" title="Export .swm file" onclick="exportModuleById('${m.id}')">💾 .SWM</button>
            </div>
        `;
        vaultGrid.appendChild(card);
    });
}

function quickAssignModuleToSlot(moduleId, slotIdx) {
    if (MODULE_LIBRARY[moduleId]) {
        LOADED_MODULE_SLOTS[slotIdx] = cloneModule(MODULE_LIBRARY[moduleId]);
        updateModuleSlotTabs();
        if (appSettings.soundBank === slotIdx) {
            setSoundBank(slotIdx);
        }
        saveSettings();
        renderModuleManagerGrid();
    }
}

function exportModuleById(moduleId) {
    const mod = MODULE_LIBRARY[moduleId];
    if (!mod) return;
    const exportData = {
        format: "ShallotWHAM-Module",
        version: mod.version || "1.0.0",
        id: mod.id,
        name: mod.name,
        subtitle: mod.subtitle || "",
        author: mod.author || "Shallot",
        description: mod.description || "",
        themeGlow: mod.themeGlow || "#00e5ff",
        category: mod.category || "Sound Bank",
        tags: mod.tags || [],
        leads: mod.leads,
        basses: mod.basses,
        exportedAt: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const safeName = (mod.name || "module").toLowerCase().replace(/[^a-z0-9]/g, "_");
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${safeName}.swm`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function changeSlotModule(slotIdx, moduleId) {
    if (MODULE_LIBRARY[moduleId]) {
        LOADED_MODULE_SLOTS[slotIdx] = cloneModule(MODULE_LIBRARY[moduleId]);
    }
    updateModuleSlotTabs();
    if (appSettings.soundBank === slotIdx) {
        setSoundBank(slotIdx);
    }
    saveSettings();
    renderModuleManagerGrid();
}

function resetSlotsToDefault() {
    if (!confirm("Reset all 5 module slots to the factory default modules (WOLF, Synthwave, Crystal Castles, 8-Bit Arcade, User Patches)?")) return;
    DEFAULT_SLOT_MODULE_KEYS.forEach((modKey, idx) => {
        if (MODULE_LIBRARY[modKey]) {
            LOADED_MODULE_SLOTS[idx] = cloneModule(MODULE_LIBRARY[modKey]);
        }
    });
    updateModuleSlotTabs();
    setSoundBank(0);
    saveSettings();
    renderModuleManagerGrid();
}

function setupDragAndDrop() {
    const dropzone = document.getElementById("module-dropzone");
    if (dropzone) {
        dropzone.addEventListener("dragover", (e) => {
            e.preventDefault();
            dropzone.classList.add("drag-over");
        });
        dropzone.addEventListener("dragleave", () => {
            dropzone.classList.remove("drag-over");
        });
        dropzone.addEventListener("drop", (e) => {
            e.preventDefault();
            dropzone.classList.remove("drag-over");
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                importModuleFile(e.dataTransfer.files[0], activeImportTargetSlot || 0);
            }
        });
    }

    window.addEventListener("dragover", (e) => e.preventDefault());
    window.addEventListener("drop", (e) => {
        if (e.target.closest("#module-dropzone")) return;
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.name.endsWith(".swm") || file.name.endsWith(".json")) {
                e.preventDefault();
                importModuleFile(file, appSettings.soundBank || 0);
            }
        }
    });
}

function initSoundBankControls() {
    document.querySelectorAll(".bank-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            const bankIdx = parseInt(tab.getAttribute("data-bank-idx"));
            setSoundBank(bankIdx);
        });
    });

    const btnSavePatch = document.getElementById("btn-save-patch");
    if (btnSavePatch) btnSavePatch.addEventListener("click", () => saveUserPatch());

    const btnExportBank = document.getElementById("btn-export-bank");
    if (btnExportBank) btnExportBank.addEventListener("click", () => exportActiveModuleFile());

    const btnImportBank = document.getElementById("btn-import-bank");
    const fileImportInput = document.getElementById("import-bank-file");
    if (btnImportBank && fileImportInput) {
        btnImportBank.addEventListener("click", () => {
            activeImportTargetSlot = appSettings.soundBank || 0;
            fileImportInput.click();
        });
        fileImportInput.addEventListener("change", (e) => {
            if (e.target.files && e.target.files[0]) {
                importModuleFile(e.target.files[0], activeImportTargetSlot);
                e.target.value = "";
            }
        });
    }

    setupDragAndDrop();
}

// Attach global methods to window for direct HTML event access
window.setSoundBank = setSoundBank;
window.panicAllNotes = panicAllNotes;
window.saveUserPatch = saveUserPatch;
window.exportSoundBanks = exportSoundBanks;
window.importSoundBanks = importSoundBanks;
window.exportModuleSlot = exportModuleSlot;
window.exportActiveModuleFile = exportActiveModuleFile;
window.triggerImportModule = triggerImportModule;
window.loadModuleFileForSlot = loadModuleFileForSlot;
window.openModuleManager = openModuleManager;
window.closeModuleManager = closeModuleManager;
window.changeSlotModule = changeSlotModule;
window.handleModalFileSelect = handleModalFileSelect;
window.resetSlotsToDefault = resetSlotsToDefault;
window.quickAssignModuleToSlot = quickAssignModuleToSlot;
window.filterVaultCards = filterVaultCards;


// Global Click Listeners for Rebinding
function startRebinding(target, btnId) {
    document.querySelectorAll(".cyber-btn-mini, .oct-key-tag, .pedal-bind-tag, .fx-key-tag").forEach(btn => btn.classList.remove("listening"));
    activeRebindTarget = target;
    const btn = document.getElementById(btnId);
    if (btn) {
        btn.classList.add("listening");
        btn.textContent = "KEY...";
    }
}

// Rebind Tag Wiring
const bindPairs = [
    { id: "bind-lead-ds1", target: "leadDist" },
    { id: "bind-lead-ps6", target: "leadHarm" },
    { id: "bind-lead-delay", target: "leadDelay" },
    { id: "bind-lead-reverb", target: "leadReverb" },
    { id: "bind-bass-ds1", target: "bassDist" },
    { id: "bind-bass-ps6", target: "bassHarm" },
    { id: "bind-bass-delay", target: "bassDelay" },
    { id: "bind-bass-reverb", target: "bassReverb" },
    { id: "bind-lead-oct-down", target: "leadOctDown" },
    { id: "bind-lead-oct-up", target: "leadOctUp" },
    { id: "bind-bass-oct-down", target: "bassOctDown" },
    { id: "bind-bass-oct-up", target: "bassOctUp" },
    { id: "bind-fx-reverb", target: "leadReverb" },
    { id: "bind-fx-delay", target: "leadDelay" }
];

bindPairs.forEach(pair => {
    const el = document.getElementById(pair.id);
    if (el) {
        el.addEventListener("click", (e) => {
            e.stopPropagation();
            startRebinding(pair.target, pair.id);
        });
    }
});

// Octave Shift Button Direct Clicks
const leadOctDownBtn = document.getElementById("lead-btn-oct-down");
if (leadOctDownBtn) leadOctDownBtn.addEventListener("click", () => shiftLeadOctave(-1));
const leadOctUpBtn = document.getElementById("lead-btn-oct-up");
if (leadOctUpBtn) leadOctUpBtn.addEventListener("click", () => shiftLeadOctave(1));
const bassOctDownBtn = document.getElementById("bass-btn-oct-down");
if (bassOctDownBtn) bassOctDownBtn.addEventListener("click", () => shiftBassOctave(-1));
const bassOctUpBtn = document.getElementById("bass-btn-oct-up");
if (bassOctUpBtn) bassOctUpBtn.addEventListener("click", () => shiftBassOctave(1));

function updateKeybindLabels() {
    const cleanKey = (code) => {
        if (!code) return "";
        return code.replace("Key", "").replace("Digit", "");
    };

    // Lead Pedals
    const leadDs1El = document.getElementById("bind-lead-ds1");
    if (leadDs1El) leadDs1El.textContent = cleanKey(keybinds.leadDist);
    const leadPs6El = document.getElementById("bind-lead-ps6");
    if (leadPs6El) leadPs6El.textContent = cleanKey(keybinds.leadHarm);
    const leadDlyEl = document.getElementById("bind-lead-delay");
    if (leadDlyEl) leadDlyEl.textContent = cleanKey(keybinds.leadDelay);
    const leadRevEl = document.getElementById("bind-lead-reverb");
    if (leadRevEl) leadRevEl.textContent = cleanKey(keybinds.leadReverb);

    // Bass Pedals
    const bassDs1El = document.getElementById("bind-bass-ds1");
    if (bassDs1El) bassDs1El.textContent = cleanKey(keybinds.bassDist);
    const bassPs6El = document.getElementById("bind-bass-ps6");
    if (bassPs6El) bassPs6El.textContent = cleanKey(keybinds.bassHarm);
    const bassDlyEl = document.getElementById("bind-bass-delay");
    if (bassDlyEl) bassDlyEl.textContent = cleanKey(keybinds.bassDelay);
    const bassRevEl = document.getElementById("bind-bass-reverb");
    if (bassRevEl) bassRevEl.textContent = cleanKey(keybinds.bassReverb);

    // Octaves
    const leadOctDownEl = document.getElementById("bind-lead-oct-down");
    if (leadOctDownEl) leadOctDownEl.textContent = cleanKey(keybinds.leadOctDown);
    const leadOctUpEl = document.getElementById("bind-lead-oct-up");
    if (leadOctUpEl) leadOctUpEl.textContent = cleanKey(keybinds.leadOctUp);
    const bassOctDownEl = document.getElementById("bind-bass-oct-down");
    if (bassOctDownEl) bassOctDownEl.textContent = cleanKey(keybinds.bassOctDown);
    const bassOctUpEl = document.getElementById("bind-bass-oct-up");
    if (bassOctUpEl) bassOctUpEl.textContent = cleanKey(keybinds.bassOctUp);

    // Bottom FX Status
    const fxRevEl = document.getElementById("bind-fx-reverb");
    if (fxRevEl) fxRevEl.textContent = cleanKey(keybinds.leadReverb);
    const fxDlyEl = document.getElementById("bind-fx-delay");
    if (fxDlyEl) fxDlyEl.textContent = cleanKey(keybinds.leadDelay);
}

// Global audio pre-warming activator on any user interaction (click, touch, keydown)
const preWarmAudio = () => {
    initAudio();
    if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume();
    }
    scanGamepads();
};
window.addEventListener("click", preWarmAudio, { passive: true });
window.addEventListener("touchstart", preWarmAudio, { passive: true });
window.addEventListener("keydown", (e) => {
    // Only pre-warm if not in an input
    if (e.target.tagName !== "INPUT" && e.target.tagName !== "SELECT" && e.target.tagName !== "TEXTAREA") {
        preWarmAudio();
    }
}, { passive: true });

// Initialize on page load
loadSettings();
initLeadControls();
initSoundBankControls();
updateKeybindLabels();
updateLeadOctaveIndicators();
updateBassOctaveIndicators();
buildVirtualKeyboard();
syncUIFromSettings();
renderAllModularPedalsUI();

