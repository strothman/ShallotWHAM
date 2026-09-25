/**
 * ShallotWHAM Sound Bank Remaster Engine
 * Upgrades all 10 official sound banks to the SWM v2.0 Standard:
 * - Dynamic Filter ADSR Envelopes
 * - Octave transpositions and noise textures
 * - Perceptual Loudness Normalization (volume: 0.7 - 0.95)
 * - Concise, punchy LCD display labels (<= 12 chars)
 * - Curated signature pedalboards with genre-authentic active stompboxes
 */

const fs = require('fs');
const path = require('path');

const MODULES_DIR = path.join(__dirname, '..', 'modules');

const REMASTERED_MODULES = [
    // 1. SYNTHWAVE
    {
        format: "ShallotWHAM-Module",
        version: "2.0.0",
        id: "synthwave",
        name: "SYNTHWAVE",
        subtitle: "Classic 80s Analog Leads & Basslines",
        author: "Shallot",
        category: "Synthwave",
        description: "Warm retro synthwave sounds with dual detuned sawtooth leads, lush brass, G-Funk sines, and punchy 303/Moog basslines.",
        themeGlow: "#00e5ff",
        tags: ["synthwave", "retrowave", "80s", "analog", "outrun"],
        leads: [
            {
                name: "TRANCE SAW LEAD", label: "TRANCE SAW",
                osc1: "sawtooth", osc2: "sawtooth", osc2Octave: 0, osc2Detune: 1.007, oscMix: 0.5,
                filterType: "lowpass", cutoff: 4200, reso: 2.2,
                filterEnv: { attack: 0.005, decay: 0.32, sustain: 0.4, amount: 2800 },
                attack: 0.005, release: 0.35, volume: 0.85
            },
            {
                name: "CHIPTUNE PULSE", label: "CHIPTUNE",
                osc1: "square", osc2: "square", osc2Octave: 1, osc2Detune: 1.002, oscMix: 0.45,
                filterType: "lowpass", cutoff: 7500, reso: 1.2,
                filterEnv: { attack: 0.001, decay: 0.18, sustain: 0.6, amount: 3500 },
                attack: 0.001, release: 0.18, volume: 0.78
            },
            {
                name: "80s SYNTH BRASS", label: "80s BRASS",
                osc1: "sawtooth", osc2: "sawtooth", osc2Octave: 0, osc2Detune: 0.993, oscMix: 0.5,
                filterType: "lowpass", cutoff: 3000, reso: 3.5,
                filterEnv: { attack: 0.045, decay: 0.38, sustain: 0.45, amount: 2600 },
                attack: 0.04, release: 0.45, vibrato: { rate: 5.6, depth: 5.0 }, volume: 0.82
            },
            {
                name: "CYBERPUNK SAW", label: "CYBERPUNK",
                osc1: "sawtooth", osc2: "square", osc2Octave: 0, osc2Detune: 1.012, oscMix: 0.6,
                filterType: "lowpass", cutoff: 3600, reso: 4.2,
                filterEnv: { attack: 0.008, decay: 0.28, sustain: 0.35, amount: 3200 },
                attack: 0.01, release: 0.28, volume: 0.8
            },
            {
                name: "G-FUNK SINE", label: "G-FUNK",
                osc1: "sine", osc2: "sine", osc2Octave: 1, osc2Detune: 1.002, oscMix: 0.4,
                filterType: "lowpass", cutoff: 6200, reso: 0.8,
                attack: 0.02, release: 0.3, vibrato: { rate: 6.0, depth: 8.0 }, volume: 0.92
            },
            {
                name: "HYPER PLUCK", label: "HYPER PLUCK",
                osc1: "triangle", osc2: "sine", osc2Octave: 1, osc2Detune: 1.005, oscMix: 0.5,
                filterType: "lowpass", cutoff: 4800, reso: 2.8,
                filterEnv: { attack: 0.002, decay: 0.15, sustain: 0.1, amount: 4200 },
                attack: 0.002, release: 0.18, volume: 0.88
            },
            {
                name: "VOCO VOICE", label: "VOCO LEAD",
                osc1: "sawtooth", osc2: "sawtooth", osc2Octave: 0, osc2Detune: 1.004, oscMix: 0.5,
                filterType: "bandpass", cutoff: 2200, reso: 5.5,
                filterEnv: { attack: 0.015, decay: 0.3, sustain: 0.4, amount: 1500 },
                attack: 0.015, release: 0.25, volume: 0.8
            },
            {
                name: "RAVE HOOVER", label: "RAVE HOOVER",
                osc1: "sawtooth", osc2: "sawtooth", osc2Octave: 0, osc2Detune: 1.018, oscMix: 0.5,
                filterType: "lowpass", cutoff: 4000, reso: 3.8,
                filterEnv: { attack: 0.02, decay: 0.45, sustain: 0.5, amount: 2800 },
                attack: 0.02, release: 0.4, volume: 0.82
            }
        ],
        basses: [
            {
                name: "ACID 303 SAW", label: "303 ACID",
                oscType: "sawtooth", subType: "square", subOctave: -1, subMix: 0.4,
                cutoff: 1200, reso: 7.5, envMod: 2800, decay: 0.26, attack: 0.004, volume: 0.85
            },
            {
                name: "DEEP SUB SINE", label: "DEEP SUB",
                oscType: "sine", subType: "sine", subOctave: -1, subMix: 0.75,
                cutoff: 480, reso: 1.2, envMod: 450, decay: 0.45, attack: 0.01, volume: 0.95
            },
            {
                name: "FAT REESE BASS", label: "FAT REESE",
                oscType: "sawtooth", subType: "sine", subOctave: -1, subMix: 0.55, detune: 1.018,
                cutoff: 1600, reso: 3.5, envMod: 1600, decay: 0.5, attack: 0.01, volume: 0.85
            },
            {
                name: "FM PUNCH BASS", label: "FM PUNCH",
                oscType: "triangle", subType: "square", subOctave: -1, subMix: 0.45,
                cutoff: 2200, reso: 4.5, envMod: 3000, decay: 0.2, attack: 0.002, volume: 0.88
            },
            {
                name: "SLAP SQUARE", label: "SLAP SQR",
                oscType: "square", subType: "triangle", subOctave: -1, subMix: 0.4,
                cutoff: 1800, reso: 5.2, envMod: 2600, decay: 0.18, attack: 0.003, volume: 0.82
            },
            {
                name: "80s ANALOG BASS", label: "80s ANALOG",
                oscType: "sawtooth", subType: "sawtooth", subOctave: -1, subMix: 0.5, detune: 1.008,
                cutoff: 1500, reso: 2.8, envMod: 1800, decay: 0.35, attack: 0.008, volume: 0.86
            },
            {
                name: "WARM MOOG BASS", label: "WARM MOOG",
                oscType: "sawtooth", subType: "triangle", subOctave: -1, subMix: 0.6,
                cutoff: 950, reso: 3.2, envMod: 1200, decay: 0.4, attack: 0.01, volume: 0.88
            },
            {
                name: "SUB DROPPER", label: "SUB DROP",
                oscType: "sine", subType: "sine", subOctave: -1, subMix: 0.85, pitchDrop: true,
                cutoff: 600, reso: 1.8, envMod: 900, decay: 0.65, attack: 0.01, volume: 0.95
            }
        ],
        pedalboard: {
            lead: [
                { slot: 0, cartridge: "french-preamp", active: false, params: { drive: 30, warmth: 70, output: 70 } },
                { slot: 1, cartridge: "dimension-chorus", active: true, params: { mode: 3, width: 80, mix: 55 } },
                { slot: 2, cartridge: "ps6", active: false, params: { key: "C", scale: "major", interval: "3rd", mix: 50 } },
                { slot: 3, cartridge: "space-echo", active: true, params: { time: 380, intensity: 45, flutter: 35, mix: 45 } },
                { slot: 4, cartridge: "reverb", active: false, params: { decay: 2.4, mix: 45 } }
            ],
            bass: [
                { slot: 0, cartridge: "ds1", active: true, params: { dist: 40, tone: 1100, level: 70 } },
                { slot: 1, cartridge: "dimension-chorus", active: false, params: { mode: 1, width: 50, mix: 35 } },
                { slot: 2, cartridge: "sidechain-pumper", active: true, params: { depth: 70, rate: 4, release: 0.3 } },
                { slot: 3, cartridge: "analog-delay", active: false, params: { time: 240, feedback: 25, mix: 30 } },
                { slot: 4, cartridge: "reverb", active: false, params: { decay: 1.5, mix: 30 } }
            ]
        }
    },

    // 2. CRYSTAL CASTLES
    {
        format: "ShallotWHAM-Module",
        version: "2.0.0",
        id: "crystal-castles",
        name: "CRYSTAL CASTLES",
        subtitle: "Authentic Glitch & Chiptune Noise",
        author: "Shallot",
        category: "Chiptune",
        description: "Raw Game Boy glitch saws, pierced square screams, lo-fi noise bursts, and heavy trash subs modeled after Crystal Castles (Alice Practice, Crimewave, Untrust Us).",
        themeGlow: "#a855f7",
        tags: ["crystal-castles", "chiptune", "glitch", "lo-fi", "noise", "witch-house"],
        leads: [
            {
                name: "ALICE PRACTICE SAW", label: "ALICE SAW",
                osc1: "sawtooth", osc2: "square", osc2Octave: 0, osc2Detune: 1.025, oscMix: 0.6, noiseMix: 0.12,
                filterType: "lowpass", cutoff: 5200, reso: 6.5,
                filterEnv: { attack: 0.001, decay: 0.22, sustain: 0.3, amount: 4000 },
                attack: 0.001, release: 0.2, volume: 0.8
            },
            {
                name: "CRIMEWAVE PULSE", label: "CRIMEWAVE",
                osc1: "square", osc2: "square", osc2Octave: 1, osc2Detune: 1.008, oscMix: 0.5,
                filterType: "lowpass", cutoff: 6500, reso: 3.5,
                filterEnv: { attack: 0.002, decay: 0.25, sustain: 0.5, amount: 3500 },
                attack: 0.002, release: 0.22, volume: 0.82
            },
            {
                name: "UNTRUST US CHORD", label: "UNTRUST US",
                osc1: "sawtooth", osc2: "triangle", osc2Octave: 0, osc2Detune: 1.015, oscMix: 0.55,
                filterType: "bandpass", cutoff: 2400, reso: 7.0,
                filterEnv: { attack: 0.005, decay: 0.35, sustain: 0.2, amount: 2000 },
                attack: 0.005, release: 0.3, volume: 0.82
            },
            {
                name: "DOE DEER SCREAM", label: "DOE DEER",
                osc1: "square", osc2: "sawtooth", osc2Octave: 1, osc2Detune: 1.03, oscMix: 0.7, noiseMix: 0.2,
                filterType: "lowpass", cutoff: 8000, reso: 8.5,
                filterEnv: { attack: 0.001, decay: 0.15, sustain: 0.4, amount: 5000 },
                attack: 0.001, release: 0.15, volume: 0.75
            },
            {
                name: "VANISHED ARPEGGIO", label: "VANISHED",
                osc1: "triangle", osc2: "square", osc2Octave: 1, osc2Detune: 1.004, oscMix: 0.4,
                filterType: "lowpass", cutoff: 4500, reso: 3.0,
                filterEnv: { attack: 0.001, decay: 0.14, sustain: 0.1, amount: 3800 },
                attack: 0.001, release: 0.16, volume: 0.86
            },
            {
                name: "AIR WAR GLITCH", label: "AIR WAR",
                osc1: "sawtooth", osc2: "square", osc2Octave: 0, osc2Detune: 1.02, oscMix: 0.5, noiseMix: 0.15,
                filterType: "bandpass", cutoff: 3100, reso: 8.0,
                attack: 0.003, release: 0.22, volume: 0.78
            },
            {
                name: "COURTSHIP PLUCK", label: "COURTSHIP",
                osc1: "square", osc2: "sine", osc2Octave: 1, osc2Detune: 1.005, oscMix: 0.5,
                filterType: "lowpass", cutoff: 5800, reso: 4.5,
                filterEnv: { attack: 0.001, decay: 0.12, sustain: 0.05, amount: 4500 },
                attack: 0.001, release: 0.15, volume: 0.85
            },
            {
                name: "BAPTISM NOISE LEAD", label: "BAPTISM",
                osc1: "sawtooth", osc2: "sawtooth", osc2Octave: 0, osc2Detune: 1.02, oscMix: 0.5, noiseMix: 0.25,
                filterType: "lowpass", cutoff: 6200, reso: 5.0,
                filterEnv: { attack: 0.008, decay: 0.35, sustain: 0.4, amount: 3000 },
                attack: 0.008, release: 0.3, volume: 0.78
            }
        ],
        basses: [
            {
                name: "TRASH SUB BASS", label: "TRASH SUB",
                oscType: "sine", subType: "square", subOctave: -1, subMix: 0.6,
                cutoff: 650, reso: 3.5, envMod: 900, decay: 0.45, attack: 0.005, volume: 0.95
            },
            {
                name: "ALICE FUZZ BASS", label: "ALICE BASS",
                oscType: "sawtooth", subType: "square", subOctave: -1, subMix: 0.7, detune: 1.02,
                cutoff: 1800, reso: 6.5, envMod: 2800, decay: 0.28, attack: 0.002, volume: 0.85
            },
            {
                name: "CRIMEWAVE GROOVE", label: "CRIME BASS",
                oscType: "square", subType: "triangle", subOctave: -1, subMix: 0.5,
                cutoff: 1400, reso: 5.0, envMod: 2200, decay: 0.22, attack: 0.003, volume: 0.85
            },
            {
                name: "DOE DEER GRINDER", label: "DOE GRINDER",
                oscType: "sawtooth", subType: "sawtooth", subOctave: -1, subMix: 0.65, detune: 1.025,
                cutoff: 2100, reso: 7.5, envMod: 3400, decay: 0.3, attack: 0.001, volume: 0.82
            },
            {
                name: "UNTRUST ACID", label: "UNTRUST BASS",
                oscType: "sawtooth", subType: "sine", subOctave: -1, subMix: 0.5,
                cutoff: 1300, reso: 8.0, envMod: 3000, decay: 0.24, attack: 0.002, volume: 0.85
            },
            {
                name: "8-BIT BITCRUSH BASS", label: "8-BIT CRUSH",
                oscType: "square", subType: "square", subOctave: -1, subMix: 0.6,
                cutoff: 2000, reso: 4.5, envMod: 2400, decay: 0.2, attack: 0.002, volume: 0.82
            },
            {
                name: "PLASTIC ACID", label: "PLASTIC ACID",
                oscType: "triangle", subType: "square", subOctave: -1, subMix: 0.5,
                cutoff: 1500, reso: 6.8, envMod: 2600, decay: 0.25, attack: 0.004, volume: 0.86
            },
            {
                name: "LO-FI CRASH DROP", label: "CRASH DROP",
                oscType: "sine", subType: "square", subOctave: -1, subMix: 0.85, pitchDrop: true,
                cutoff: 550, reso: 2.2, envMod: 850, decay: 0.6, attack: 0.01, volume: 0.95
            }
        ],
        pedalboard: {
            lead: [
                { slot: 0, cartridge: "decimator", active: true, params: { bits: 6, rate: 45, mix: 60 } },
                { slot: 1, cartridge: "flanger", active: false, params: { speed: 1.2, depth: 65, regen: 50 } },
                { slot: 2, cartridge: "sid-resonator", active: true, params: { cutoff: 3200, squelch: 65, decay: 0.22 } },
                { slot: 3, cartridge: "glitch-delay", active: true, params: { size: 90, feedback: 45, jitter: 60, mix: 45 } },
                { slot: 4, cartridge: "cathedral-reverb", active: false, params: { decay: 3.8, damping: 30, mix: 40 } }
            ],
            bass: [
                { slot: 0, cartridge: "decimator", active: true, params: { bits: 8, rate: 30, mix: 50 } },
                { slot: 1, cartridge: "optical-tremolo", active: false, params: { rate: 6, depth: 55, shape: "square" } },
                { slot: 2, cartridge: "sid-resonator", active: true, params: { cutoff: 1800, squelch: 70, decay: 0.25 } },
                { slot: 3, cartridge: "analog-delay", active: false, params: { time: 220, feedback: 30, mix: 30 } },
                { slot: 4, cartridge: "reverb", active: false, params: { decay: 1.8, mix: 35 } }
            ]
        }
    },

    // 3. 8-BIT ARCADE
    {
        format: "ShallotWHAM-Module",
        version: "2.0.0",
        id: "8bit-arcade",
        name: "8-BIT ARCADE",
        subtitle: "NES, Game Boy & Commodore 64",
        author: "Shallot",
        category: "Chiptune",
        description: "Classic retro video game synthesis featuring NES 25% pulse waves, Game Boy wavetable bass, SID 6581 ring mod leads, and high-speed chip chord arps.",
        themeGlow: "#22c55e",
        tags: ["8bit", "arcade", "nes", "gameboy", "c64", "sid6581"],
        leads: [
            {
                name: "NES LEAD PULSE", label: "NES PULSE",
                osc1: "square", osc2: "square", osc2Octave: 0, osc2Detune: 1.003, oscMix: 0.5,
                filterType: "lowpass", cutoff: 9000, reso: 1.0,
                attack: 0.001, release: 0.12, volume: 0.8
            },
            {
                name: "GAME BOY LEAD", label: "GAMEBOY LEAD",
                osc1: "square", osc2: "triangle", osc2Octave: 0, osc2Detune: 1.005, oscMix: 0.45,
                filterType: "lowpass", cutoff: 7000, reso: 1.5,
                attack: 0.001, release: 0.14, volume: 0.82
            },
            {
                name: "SID 6581 LEAD", label: "SID LEAD",
                osc1: "sawtooth", osc2: "triangle", osc2Octave: 1, osc2Detune: 1.01, oscMix: 0.55,
                filterType: "lowpass", cutoff: 4800, reso: 5.5,
                filterEnv: { attack: 0.002, decay: 0.22, sustain: 0.35, amount: 3000 },
                attack: 0.002, release: 0.22, volume: 0.82
            },
            {
                name: "CHIP CHORD ARP", label: "CHIP ARP",
                osc1: "square", osc2: "square", osc2Octave: 1, osc2Detune: 1.001, oscMix: 0.5,
                filterType: "lowpass", cutoff: 8500, reso: 2.0,
                attack: 0.001, release: 0.08, arp: "chip60", volume: 0.78
            },
            {
                name: "ARCADE JUMP BLIP", label: "JUMP BLIP",
                osc1: "triangle", osc2: "square", osc2Octave: 1, osc2Detune: 1.002, oscMix: 0.4,
                filterType: "lowpass", cutoff: 6000, reso: 3.5,
                filterEnv: { attack: 0.001, decay: 0.1, sustain: 0.0, amount: 4500 },
                attack: 0.001, release: 0.1, volume: 0.86
            },
            {
                name: "MEGA MAN SHOT", label: "MEGA SHOT",
                osc1: "square", osc2: "sawtooth", osc2Octave: 0, osc2Detune: 1.008, oscMix: 0.6, noiseMix: 0.08,
                filterType: "lowpass", cutoff: 7200, reso: 4.0,
                filterEnv: { attack: 0.001, decay: 0.12, sustain: 0.1, amount: 3500 },
                attack: 0.001, release: 0.12, volume: 0.8
            },
            {
                name: "CASTLEVANIA SAW", label: "CASTLEVANIA",
                osc1: "sawtooth", osc2: "sawtooth", osc2Octave: 0, osc2Detune: 1.006, oscMix: 0.5,
                filterType: "lowpass", cutoff: 4500, reso: 3.2,
                filterEnv: { attack: 0.01, decay: 0.3, sustain: 0.4, amount: 2200 },
                attack: 0.01, release: 0.3, volume: 0.82
            },
            {
                name: "1-UP FANFARE", label: "1-UP FANFARE",
                osc1: "square", osc2: "triangle", osc2Octave: 1, osc2Detune: 1.002, oscMix: 0.4,
                filterType: "lowpass", cutoff: 8000, reso: 2.5,
                attack: 0.002, release: 0.18, volume: 0.85
            }
        ],
        basses: [
            {
                name: "NES TRIANGLE SUB", label: "NES TRI SUB",
                oscType: "triangle", subType: "sine", subOctave: -1, subMix: 0.5,
                cutoff: 800, reso: 1.5, envMod: 600, decay: 0.35, attack: 0.005, volume: 0.95
            },
            {
                name: "SEGA FM BASS", label: "SEGA FM",
                oscType: "triangle", subType: "square", subOctave: -1, subMix: 0.45,
                cutoff: 2400, reso: 5.5, envMod: 3400, decay: 0.2, attack: 0.001, volume: 0.88
            },
            {
                name: "FAT 8-BIT REESE", label: "8-BIT REESE",
                oscType: "sawtooth", subType: "sawtooth", subOctave: -1, subMix: 0.6, detune: 1.02,
                cutoff: 1500, reso: 3.5, envMod: 1400, decay: 0.45, attack: 0.01, volume: 0.85
            },
            {
                name: "PAC-MAN WOBBLE", label: "PAC WOBBLE",
                oscType: "square", subType: "triangle", subOctave: -1, subMix: 0.7,
                cutoff: 1200, reso: 7.5, envMod: 2200, decay: 0.24, attack: 0.005, volume: 0.82
            },
            {
                name: "GAME OVER DROP", label: "GAME OVER",
                oscType: "sine", subType: "square", subOctave: -1, subMix: 0.9, pitchDrop: true,
                cutoff: 550, reso: 2.0, envMod: 900, decay: 0.7, attack: 0.01, volume: 0.95
            },
            {
                name: "C64 SID ACID", label: "SID ACID",
                oscType: "sawtooth", subType: "square", subOctave: -1, subMix: 0.5,
                cutoff: 1600, reso: 7.5, envMod: 2900, decay: 0.26, attack: 0.002, volume: 0.85
            },
            {
                name: "MARIO UNDERGROUND", label: "UNDERGROUND",
                oscType: "triangle", subType: "triangle", subOctave: -1, subMix: 0.6,
                cutoff: 900, reso: 2.5, envMod: 1000, decay: 0.3, attack: 0.005, volume: 0.92
            },
            {
                name: "BOSS BATTLE DROP", label: "BOSS DROP",
                oscType: "sine", subType: "sawtooth", subOctave: -1, subMix: 0.75, pitchDrop: true,
                cutoff: 650, reso: 3.0, envMod: 1100, decay: 0.55, attack: 0.005, volume: 0.95
            }
        ],
        pedalboard: {
            lead: [
                { slot: 0, cartridge: "decimator", active: true, params: { bits: 6, rate: 35, mix: 65 } },
                { slot: 1, cartridge: "flanger", active: false, params: { speed: 1, depth: 60, regen: 45 } },
                { slot: 2, cartridge: "sid-resonator", active: true, params: { cutoff: 3500, squelch: 65, decay: 0.2 } },
                { slot: 3, cartridge: "glitch-delay", active: false, params: { size: 100, feedback: 40, jitter: 50, mix: 40 } },
                { slot: 4, cartridge: "spring-reverb", active: true, params: { tension: 60, decay: 1.8, mix: 40 } }
            ],
            bass: [
                { slot: 0, cartridge: "decimator", active: true, params: { bits: 8, rate: 28, mix: 55 } },
                { slot: 1, cartridge: "optical-tremolo", active: false, params: { rate: 5, depth: 50, shape: "square" } },
                { slot: 2, cartridge: "sid-resonator", active: true, params: { cutoff: 1600, squelch: 75, decay: 0.22 } },
                { slot: 3, cartridge: "analog-delay", active: false, params: { time: 200, feedback: 25, mix: 25 } },
                { slot: 4, cartridge: "spring-reverb", active: false, params: { tension: 45, decay: 1.4, mix: 30 } }
            ]
        }
    },

    // 4. PORNOPHONIQUE "SAD ROBOT"
    {
        format: "ShallotWHAM-Module",
        version: "2.0.0",
        id: "pornophonique-sad-robot",
        name: "SAD ROBOT",
        subtitle: "Pornophonique Bitpop & Melancholy",
        author: "Shallot",
        category: "Chiptune",
        description: "Faithfully modeled on the German bitpop duo Pornophonique and their anthem 'Sad Robot' from '8-bit lagerfeuer'. Authentic Commodore 64 SID 6581 and Game Boy LSDJ sound design.",
        themeGlow: "#ec4899",
        tags: ["pornophonique", "sad-robot", "bitpop", "c64", "sid6581", "lsdj"],
        leads: [
            {
                name: "SAD ROBOT SOLO", label: "SAD ROBOT",
                osc1: "square", osc2: "sawtooth", osc2Octave: 0, osc2Detune: 1.004, oscMix: 0.5,
                filterType: "lowpass", cutoff: 3600, reso: 3.8,
                filterEnv: { attack: 0.015, decay: 0.32, sustain: 0.4, amount: 2400 },
                attack: 0.01, release: 0.28, vibrato: { rate: 5.5, depth: 6.5 }, volume: 0.82
            },
            {
                name: "LSDJ CRYING ARP", label: "CRYING ARP",
                osc1: "square", osc2: "square", osc2Octave: 1, osc2Detune: 1.002, oscMix: 0.45,
                filterType: "lowpass", cutoff: 7200, reso: 2.0,
                attack: 0.001, release: 0.12, arp: "chip60", volume: 0.78
            },
            {
                name: "LAGERFEUER PLUCK", label: "LAGER PLUCK",
                osc1: "triangle", osc2: "sawtooth", osc2Octave: 0, osc2Detune: 1.006, oscMix: 0.4,
                filterType: "lowpass", cutoff: 4600, reso: 2.8,
                filterEnv: { attack: 0.002, decay: 0.18, sustain: 0.1, amount: 3500 },
                attack: 0.002, release: 0.2, volume: 0.88
            },
            {
                name: "ROBOT FORMANT SAW", label: "ROBOT VOCAL",
                osc1: "sawtooth", osc2: "square", osc2Octave: 0, osc2Detune: 1.008, oscMix: 0.55,
                filterType: "bandpass", cutoff: 2100, reso: 6.5,
                filterEnv: { attack: 0.02, decay: 0.3, sustain: 0.3, amount: 1800 },
                attack: 0.02, release: 0.25, volume: 0.8
            },
            {
                name: "LONELY PULSE 12.5%", label: "LONELY PULSE",
                osc1: "square", osc2: "sine", osc2Octave: 1, osc2Detune: 1.003, oscMix: 0.5,
                filterType: "lowpass", cutoff: 5800, reso: 2.2,
                attack: 0.005, release: 0.22, volume: 0.85
            },
            {
                name: "C64 DIRTY CRUNCH", label: "C64 CRUNCH",
                osc1: "sawtooth", osc2: "sawtooth", osc2Octave: 0, osc2Detune: 1.015, oscMix: 0.6, noiseMix: 0.1,
                filterType: "lowpass", cutoff: 4200, reso: 5.0,
                filterEnv: { attack: 0.005, decay: 0.28, sustain: 0.35, amount: 3000 },
                attack: 0.005, release: 0.25, volume: 0.8
            },
            {
                name: "SAD BENT CHIRP", label: "BENT CHIRP",
                osc1: "triangle", osc2: "sine", osc2Octave: 1, osc2Detune: 1.004, oscMix: 0.45,
                filterType: "lowpass", cutoff: 5200, reso: 3.5,
                filterEnv: { attack: 0.001, decay: 0.14, sustain: 0.05, amount: 4000 },
                attack: 0.001, release: 0.16, volume: 0.88
            },
            {
                name: "SID OCTAVE HOP", label: "OCTAVE HOP",
                osc1: "square", osc2: "sawtooth", osc2Octave: 1, osc2Detune: 1.004, oscMix: 0.5,
                filterType: "lowpass", cutoff: 6500, reso: 3.0,
                attack: 0.002, release: 0.15, arp: "octhop", volume: 0.82
            }
        ],
        basses: [
            {
                name: "GAME BOY WAVE SUB", label: "GB WAVE SUB",
                oscType: "triangle", subType: "sine", subOctave: -1, subMix: 0.6,
                cutoff: 850, reso: 2.5, envMod: 700, decay: 0.4, attack: 0.006, volume: 0.95
            },
            {
                name: "CAMPFIRE ACOUSTIC BASS", label: "CAMPFIRE",
                oscType: "triangle", subType: "triangle", subOctave: -1, subMix: 0.5,
                cutoff: 1100, reso: 3.2, envMod: 1200, decay: 0.35, attack: 0.008, volume: 0.9
            },
            {
                name: "SID ACID 6581", label: "SID ACID",
                oscType: "sawtooth", subType: "square", subOctave: -1, subMix: 0.45,
                cutoff: 1400, reso: 8.0, envMod: 3200, decay: 0.25, attack: 0.003, volume: 0.85
            },
            {
                name: "ROBOT HEARTBEAT", label: "HEARTBEAT",
                oscType: "sine", subType: "square", subOctave: -1, subMix: 0.75, pitchDrop: true,
                cutoff: 600, reso: 2.2, envMod: 950, decay: 0.5, attack: 0.008, volume: 0.95
            },
            {
                name: "NOISE CHIP PERC", label: "CHIP PERC",
                oscType: "square", subType: "triangle", subOctave: -1, subMix: 0.4,
                cutoff: 2600, reso: 6.0, envMod: 3800, decay: 0.16, attack: 0.001, volume: 0.8
            },
            {
                name: "8-BIT BITPOP REESE", label: "BITPOP REESE",
                oscType: "sawtooth", subType: "sawtooth", subOctave: -1, subMix: 0.55, detune: 1.018,
                cutoff: 1500, reso: 3.5, envMod: 1500, decay: 0.45, attack: 0.01, volume: 0.85
            },
            {
                name: "MELANCHOLY ACID", label: "MELAN ACID",
                oscType: "sawtooth", subType: "sine", subOctave: -1, subMix: 0.5,
                cutoff: 1250, reso: 7.0, envMod: 2600, decay: 0.28, attack: 0.004, volume: 0.86
            },
            {
                name: "POWER DOWN DROP", label: "POWER DOWN",
                oscType: "sine", subType: "sine", subOctave: -1, subMix: 0.9, pitchDrop: true,
                cutoff: 500, reso: 1.5, envMod: 750, decay: 0.75, attack: 0.01, volume: 0.95
            }
        ],
        pedalboard: {
            lead: [
                { slot: 0, cartridge: "decimator", active: true, params: { bits: 8, rate: 38, mix: 50 } },
                { slot: 1, cartridge: "dimension-chorus", active: false, params: { mode: 2, width: 65, mix: 40 } },
                { slot: 2, cartridge: "sid-resonator", active: true, params: { cutoff: 2600, squelch: 60, decay: 0.25 } },
                { slot: 3, cartridge: "analog-delay", active: true, params: { time: 320, feedback: 35, mix: 40 } },
                { slot: 4, cartridge: "spring-reverb", active: true, params: { tension: 55, decay: 1.8, mix: 45 } }
            ],
            bass: [
                { slot: 0, cartridge: "decimator", active: false, params: { bits: 8, rate: 30, mix: 45 } },
                { slot: 1, cartridge: "optical-tremolo", active: false, params: { rate: 4, depth: 40, shape: "triangle" } },
                { slot: 2, cartridge: "sid-resonator", active: true, params: { cutoff: 1400, squelch: 70, decay: 0.22 } },
                { slot: 3, cartridge: "analog-delay", active: false, params: { time: 240, feedback: 25, mix: 30 } },
                { slot: 4, cartridge: "spring-reverb", active: true, params: { tension: 45, decay: 1.5, mix: 35 } }
            ]
        }
    },

    // 5. DAFT PUNK
    {
        format: "ShallotWHAM-Module",
        version: "2.0.0",
        id: "daft-punk",
        name: "DAFT PUNK",
        subtitle: "French Touch, Talkbox & Disco House",
        author: "Shallot",
        category: "Electronic",
        description: "Filtered French house, talkbox saws, Aerodynamic guitar leads, and thick Around The World / Da Funk compressed basslines.",
        themeGlow: "#f59e0b",
        tags: ["daft-punk", "french-touch", "house", "electro", "discovery"],
        leads: [
            {
                name: "AERODYNAMIC LEAD", label: "AERODYNAMIC",
                osc1: "sawtooth", osc2: "square", osc2Octave: 0, osc2Detune: 1.01, oscMix: 0.55,
                filterType: "lowpass", cutoff: 6500, reso: 4.5,
                filterEnv: { attack: 0.005, decay: 0.25, sustain: 0.45, amount: 3500 },
                attack: 0.005, release: 0.25, volume: 0.85
            },
            {
                name: "TALKBOX VOCAL SAW", label: "TALKBOX SAW",
                osc1: "sawtooth", osc2: "sawtooth", osc2Octave: 0, osc2Detune: 1.005, oscMix: 0.5,
                filterType: "bandpass", cutoff: 2400, reso: 6.5,
                filterEnv: { attack: 0.02, decay: 0.35, sustain: 0.5, amount: 1800 },
                attack: 0.02, release: 0.28, vibrato: { rate: 5.8, depth: 6.0 }, volume: 0.82
            },
            {
                name: "HARDER BETTER STRUM", label: "HARDER STRUM",
                osc1: "sawtooth", osc2: "triangle", osc2Octave: 0, osc2Detune: 1.008, oscMix: 0.45,
                filterType: "lowpass", cutoff: 4500, reso: 3.5,
                filterEnv: { attack: 0.008, decay: 0.2, sustain: 0.2, amount: 3200 },
                attack: 0.008, release: 0.2, volume: 0.85
            },
            {
                name: "CRESCENDOLLS BRASS", label: "CRESCENDO",
                osc1: "sawtooth", osc2: "sawtooth", osc2Octave: 0, osc2Detune: 0.992, oscMix: 0.5,
                filterType: "lowpass", cutoff: 3800, reso: 3.2,
                filterEnv: { attack: 0.04, decay: 0.4, sustain: 0.5, amount: 2600 },
                attack: 0.04, release: 0.45, volume: 0.82
            },
            {
                name: "DIGITAL LOVE BELL", label: "DIGITAL BELL",
                osc1: "sine", osc2: "triangle", osc2Octave: 1, osc2Detune: 1.002, oscMix: 0.5,
                filterType: "lowpass", cutoff: 7000, reso: 1.8,
                filterEnv: { attack: 0.002, decay: 0.3, sustain: 0.15, amount: 4000 },
                attack: 0.002, release: 0.35, volume: 0.9
            },
            {
                name: "SHORT CIRCUIT SINE", label: "SHORT CIRCT",
                osc1: "sine", osc2: "square", osc2Octave: 1, osc2Detune: 1.005, oscMix: 0.3,
                filterType: "lowpass", cutoff: 5000, reso: 2.2,
                attack: 0.01, release: 0.22, volume: 0.92
            },
            {
                name: "SUPERHEROES SWEEP", label: "SUPERHEROES",
                osc1: "sawtooth", osc2: "sawtooth", osc2Octave: 0, osc2Detune: 1.015, oscMix: 0.5,
                filterType: "lowpass", cutoff: 2800, reso: 5.5,
                filterEnv: { attack: 0.08, decay: 0.6, sustain: 0.6, amount: 4500 },
                attack: 0.08, release: 0.5, volume: 0.8
            },
            {
                name: "VOYAGER FUNK LEAD", label: "VOYAGER LEAD",
                osc1: "sawtooth", osc2: "square", osc2Octave: 0, osc2Detune: 1.006, oscMix: 0.5,
                filterType: "lowpass", cutoff: 4800, reso: 4.0,
                filterEnv: { attack: 0.01, decay: 0.24, sustain: 0.3, amount: 2800 },
                attack: 0.01, release: 0.22, volume: 0.85
            }
        ],
        basses: [
            {
                name: "AROUND THE WORLD BASS", label: "AROUND WORLD",
                oscType: "sawtooth", subType: "triangle", subOctave: -1, subMix: 0.55,
                cutoff: 1600, reso: 4.8, envMod: 2400, decay: 0.28, attack: 0.004, volume: 0.88
            },
            {
                name: "DA FUNK HEAVY 303", label: "DA FUNK 303",
                oscType: "sawtooth", subType: "square", subOctave: -1, subMix: 0.5,
                cutoff: 1900, reso: 8.5, envMod: 3800, decay: 0.32, attack: 0.002, volume: 0.85
            },
            {
                name: "ROBOT ROCK PUNCH", label: "ROBOT ROCK",
                oscType: "sawtooth", subType: "sawtooth", subOctave: -1, subMix: 0.65, detune: 1.015,
                cutoff: 1400, reso: 3.8, envMod: 1600, decay: 0.35, attack: 0.005, volume: 0.88
            },
            {
                name: "BURNIN' ACID DISTORT", label: "BURNIN ACID",
                oscType: "sawtooth", subType: "square", subOctave: -1, subMix: 0.45,
                cutoff: 2100, reso: 9.0, envMod: 3500, decay: 0.25, attack: 0.002, volume: 0.82
            },
            {
                name: "ONE MORE TIME SUB", label: "ONE MORE SUB",
                oscType: "sine", subType: "triangle", subOctave: -1, subMix: 0.75,
                cutoff: 750, reso: 2.0, envMod: 800, decay: 0.4, attack: 0.008, volume: 0.95
            },
            {
                name: "VERIDIS QUO TENDER", label: "VERIDIS BASS",
                oscType: "triangle", subType: "sine", subOctave: -1, subMix: 0.6,
                cutoff: 900, reso: 2.2, envMod: 900, decay: 0.45, attack: 0.01, volume: 0.92
            },
            {
                name: "HIGH LIFE DISCO", label: "HIGH LIFE",
                oscType: "square", subType: "triangle", subOctave: -1, subMix: 0.4,
                cutoff: 1700, reso: 4.5, envMod: 2200, decay: 0.2, attack: 0.003, volume: 0.85
            },
            {
                name: "FRENCH TOUCH PUMPER", label: "FRENCH PUMP",
                oscType: "sawtooth", subType: "square", subOctave: -1, subMix: 0.55,
                cutoff: 1500, reso: 6.0, envMod: 2800, decay: 0.3, attack: 0.003, volume: 0.86
            }
        ],
        pedalboard: {
            lead: [
                { slot: 0, cartridge: "french-preamp", active: true, params: { drive: 35, warmth: 75, output: 75 } },
                { slot: 1, cartridge: "dimension-chorus", active: true, params: { mode: 4, width: 85, mix: 60 } },
                { slot: 2, cartridge: "formant-filter", active: false, params: { vowel: 2, reso: 65, glide: 30 } },
                { slot: 3, cartridge: "space-echo", active: false, params: { time: 320, intensity: 35, flutter: 25, mix: 35 } },
                { slot: 4, cartridge: "gated-plate", active: true, params: { size: 65, gate: 60, mix: 45 } }
            ],
            bass: [
                { slot: 0, cartridge: "french-preamp", active: true, params: { drive: 45, warmth: 80, output: 70 } },
                { slot: 1, cartridge: "dimension-chorus", active: false, params: { mode: 2, width: 50, mix: 30 } },
                { slot: 2, cartridge: "sidechain-pumper", active: true, params: { depth: 85, rate: 4, release: 0.25 } },
                { slot: 3, cartridge: "analog-delay", active: false, params: { time: 200, feedback: 20, mix: 20 } },
                { slot: 4, cartridge: "reverb", active: false, params: { decay: 1.4, mix: 25 } }
            ]
        }
    },

    // 6. KRAFTWERK
    {
        format: "ShallotWHAM-Module",
        version: "2.0.0",
        id: "kraftwerk",
        name: "KRAFTWERK",
        subtitle: "Minimalist Kling Klang Robotics",
        author: "Shallot",
        category: "Electronic",
        description: "Pure minimalist electronic precision, Kling Klang laboratory sines, Pocket Calculator blips, and Trans-Europe Express pulse lines.",
        themeGlow: "#ef4444",
        tags: ["kraftwerk", "kling-klang", "minimal", "krautrock", "vocoder"],
        leads: [
            {
                name: "KLING KLANG SINE", label: "KLING KLANG",
                osc1: "sine", osc2: "sine", osc2Octave: 1, osc2Detune: 1.001, oscMix: 0.35,
                filterType: "lowpass", cutoff: 7500, reso: 1.0,
                attack: 0.005, release: 0.25, volume: 0.95
            },
            {
                name: "POCKET CALCULATOR", label: "POCKET CALC",
                osc1: "square", osc2: "sine", osc2Octave: 1, osc2Detune: 1.002, oscMix: 0.4,
                filterType: "lowpass", cutoff: 8000, reso: 2.0,
                attack: 0.001, release: 0.1, volume: 0.85
            },
            {
                name: "COMPUTER WORLD BLIP", label: "COMP WORLD",
                osc1: "triangle", osc2: "square", osc2Octave: 1, osc2Detune: 1.003, oscMix: 0.35,
                filterType: "lowpass", cutoff: 6500, reso: 3.5,
                filterEnv: { attack: 0.001, decay: 0.12, sustain: 0.0, amount: 4000 },
                attack: 0.001, release: 0.12, volume: 0.88
            },
            {
                name: "ROBOT VOCODER SAW", label: "ROBOT VOX",
                osc1: "sawtooth", osc2: "sawtooth", osc2Octave: 0, osc2Detune: 1.004, oscMix: 0.5,
                filterType: "bandpass", cutoff: 1900, reso: 6.0,
                attack: 0.01, release: 0.2, volume: 0.82
            },
            {
                name: "TRANS-EUROPE FLUTE", label: "TRANS EUROPE",
                osc1: "sine", osc2: "triangle", osc2Octave: 1, osc2Detune: 1.002, oscMix: 0.45,
                filterType: "lowpass", cutoff: 5500, reso: 1.5,
                attack: 0.03, release: 0.3, vibrato: { rate: 5.2, depth: 4.5 }, volume: 0.92
            },
            {
                name: "THE MODEL SAW", label: "THE MODEL",
                osc1: "sawtooth", osc2: "square", osc2Octave: 0, osc2Detune: 1.006, oscMix: 0.5,
                filterType: "lowpass", cutoff: 4200, reso: 2.5,
                filterEnv: { attack: 0.01, decay: 0.3, sustain: 0.4, amount: 2000 },
                attack: 0.01, release: 0.28, volume: 0.85
            },
            {
                name: "RADIOACTIVITY TONE", label: "RADIO TONE",
                osc1: "sine", osc2: "sine", osc2Octave: 2, osc2Detune: 1.001, oscMix: 0.3,
                filterType: "lowpass", cutoff: 6800, reso: 1.2,
                attack: 0.05, release: 0.5, volume: 0.95
            },
            {
                name: "AUTOBAHN BLIP LEAD", label: "AUTOBAHN BLP",
                osc1: "square", osc2: "triangle", osc2Octave: 1, osc2Detune: 1.003, oscMix: 0.4,
                filterType: "lowpass", cutoff: 7000, reso: 3.0,
                attack: 0.002, release: 0.15, volume: 0.85
            }
        ],
        basses: [
            {
                name: "AUTOBAHN PULSE BASS", label: "AUTOBAHN BAS",
                oscType: "sawtooth", subType: "square", subOctave: -1, subMix: 0.5,
                cutoff: 1400, reso: 4.5, envMod: 1800, decay: 0.25, attack: 0.005, volume: 0.88
            },
            {
                name: "TRANS-EUROPE BEAT", label: "TRANS BEAT",
                oscType: "square", subType: "triangle", subOctave: -1, subMix: 0.45,
                cutoff: 1600, reso: 5.0, envMod: 2200, decay: 0.2, attack: 0.002, volume: 0.85
            },
            {
                name: "RADIOACTIVITY SUB", label: "RADIO SUB",
                oscType: "sine", subType: "sine", subOctave: -1, subMix: 0.8,
                cutoff: 450, reso: 1.0, envMod: 400, decay: 0.5, attack: 0.01, volume: 0.95
            },
            {
                name: "NUMBERS COMPUTER BASS", label: "NUMBERS BASS",
                oscType: "triangle", subType: "square", subOctave: -1, subMix: 0.55,
                cutoff: 1800, reso: 6.0, envMod: 2600, decay: 0.18, attack: 0.002, volume: 0.88
            },
            {
                name: "MAN MACHINE ANALOG", label: "MAN MACHINE",
                oscType: "sawtooth", subType: "sawtooth", subOctave: -1, subMix: 0.5, detune: 1.006,
                cutoff: 1300, reso: 3.5, envMod: 1600, decay: 0.35, attack: 0.006, volume: 0.86
            },
            {
                name: "POCKET ACID CLICK", label: "POCKET CLICK",
                oscType: "square", subType: "sine", subOctave: -1, subMix: 0.6,
                cutoff: 1900, reso: 7.0, envMod: 2800, decay: 0.15, attack: 0.001, volume: 0.82
            },
            {
                name: "TOUR DE FRANCE PUMP", label: "TOUR DE FRNC",
                oscType: "sawtooth", subType: "triangle", subOctave: -1, subMix: 0.5,
                cutoff: 1500, reso: 5.2, envMod: 2400, decay: 0.28, attack: 0.004, volume: 0.88
            },
            {
                name: "KLING KLANG SUB DROP", label: "KLING DROP",
                oscType: "sine", subType: "sine", subOctave: -1, subMix: 0.9, pitchDrop: true,
                cutoff: 500, reso: 1.8, envMod: 800, decay: 0.6, attack: 0.01, volume: 0.95
            }
        ],
        pedalboard: {
            lead: [
                { slot: 0, cartridge: "french-preamp", active: false, params: { drive: 20, warmth: 60, output: 70 } },
                { slot: 1, cartridge: "optical-tremolo", active: false, params: { rate: 6, depth: 50, shape: "square" } },
                { slot: 2, cartridge: "formant-filter", active: false, params: { vowel: 1, reso: 60, glide: 25 } },
                { slot: 3, cartridge: "analog-delay", active: true, params: { time: 260, feedback: 35, mix: 40 } },
                { slot: 4, cartridge: "reverb", active: false, params: { decay: 1.8, mix: 35 } }
            ],
            bass: [
                { slot: 0, cartridge: "tube-screamer", active: false, params: { drive: 25, tone: 1400, level: 75 } },
                { slot: 1, cartridge: "optical-tremolo", active: false, params: { rate: 4, depth: 35, shape: "triangle" } },
                { slot: 2, cartridge: "sidechain-pumper", active: true, params: { depth: 65, rate: 4, release: 0.25 } },
                { slot: 3, cartridge: "delay", active: false, params: { time: 240, feedback: 25, mix: 25 } },
                { slot: 4, cartridge: "reverb", active: false, params: { decay: 1.2, mix: 20 } }
            ]
        }
    },

    // 7. DUNGEON SYNTH
    {
        format: "ShallotWHAM-Module",
        version: "2.0.0",
        id: "dungeon-synth",
        name: "DUNGEON SYNTH",
        subtitle: "Medieval Lo-Fi Fantasy Atmosphere",
        author: "Shallot",
        category: "Fantasy",
        description: "Atmospheric mossy hall organs, Castlevania gothic organs, ancient wood flutes, sorcerer chimes, and deep cavern crypt basslines.",
        themeGlow: "#10b981",
        tags: ["dungeon-synth", "fantasy", "medieval", "ambient", "atmospheric", "lo-fi"],
        leads: [
            {
                name: "CASTLEVANIA PIPE ORGAN", label: "CASTLE ORGAN",
                osc1: "sawtooth", osc2: "square", osc2Octave: 1, osc2Detune: 1.006, oscMix: 0.5,
                filterType: "lowpass", cutoff: 3800, reso: 2.5,
                filterEnv: { attack: 0.03, decay: 0.5, sustain: 0.6, amount: 2000 },
                attack: 0.03, release: 0.6, volume: 0.85
            },
            {
                name: "ANCIENT WOOD FLUTE", label: "WOOD FLUTE",
                osc1: "triangle", osc2: "sine", osc2Octave: 1, osc2Detune: 1.002, oscMix: 0.45, noiseMix: 0.05,
                filterType: "lowpass", cutoff: 4500, reso: 1.8,
                attack: 0.04, release: 0.35, vibrato: { rate: 4.8, depth: 5.5 }, volume: 0.9
            },
            {
                name: "SORCERER CHIME", label: "SORCER CHIME",
                osc1: "sine", osc2: "triangle", osc2Octave: 2, osc2Detune: 1.004, oscMix: 0.4,
                filterType: "lowpass", cutoff: 6500, reso: 3.5,
                filterEnv: { attack: 0.002, decay: 0.4, sustain: 0.1, amount: 3500 },
                attack: 0.002, release: 0.5, volume: 0.88
            },
            {
                name: "MOSS-COVERED HARP", label: "MOSSY HARP",
                osc1: "triangle", osc2: "triangle", osc2Octave: 1, osc2Detune: 1.003, oscMix: 0.5,
                filterType: "lowpass", cutoff: 5000, reso: 2.0,
                filterEnv: { attack: 0.002, decay: 0.22, sustain: 0.05, amount: 3000 },
                attack: 0.002, release: 0.25, volume: 0.92
            },
            {
                name: "CATHEDRAL BRASS CHOIR", label: "CATHEDRAL",
                osc1: "sawtooth", osc2: "sawtooth", osc2Octave: 0, osc2Detune: 0.992, oscMix: 0.5,
                filterType: "lowpass", cutoff: 3200, reso: 2.8,
                filterEnv: { attack: 0.08, decay: 0.6, sustain: 0.55, amount: 2200 },
                attack: 0.08, release: 0.7, volume: 0.82
            },
            {
                name: "TAVERN LUTE", label: "TAVERN LUTE",
                osc1: "triangle", osc2: "square", osc2Octave: 0, osc2Detune: 1.004, oscMix: 0.4,
                filterType: "lowpass", cutoff: 4000, reso: 3.0,
                filterEnv: { attack: 0.003, decay: 0.18, sustain: 0.08, amount: 2800 },
                attack: 0.003, release: 0.2, volume: 0.88
            },
            {
                name: "DARK MONASTERY BELL", label: "DARK BELL",
                osc1: "sine", osc2: "square", osc2Octave: 1, osc2Detune: 1.008, oscMix: 0.35,
                filterType: "lowpass", cutoff: 5800, reso: 4.0,
                filterEnv: { attack: 0.002, decay: 0.5, sustain: 0.1, amount: 4000 },
                attack: 0.002, release: 0.6, volume: 0.88
            },
            {
                name: "SPELLCASTER STRING", label: "SPELLCASTER",
                osc1: "sawtooth", osc2: "triangle", osc2Octave: 0, osc2Detune: 1.008, oscMix: 0.5,
                filterType: "lowpass", cutoff: 3600, reso: 2.2,
                filterEnv: { attack: 0.06, decay: 0.5, sustain: 0.5, amount: 2000 },
                attack: 0.06, release: 0.55, vibrato: { rate: 5.0, depth: 5.0 }, volume: 0.85
            }
        ],
        basses: [
            {
                name: "CRYPT ORGAN PEDAL", label: "CRYPT PEDAL",
                oscType: "sawtooth", subType: "triangle", subOctave: -1, subMix: 0.7,
                cutoff: 900, reso: 2.8, envMod: 1100, decay: 0.5, attack: 0.015, volume: 0.92
            },
            {
                name: "DUNGEON CAVERN SUB", label: "CAVERN SUB",
                oscType: "sine", subType: "sine", subOctave: -1, subMix: 0.85,
                cutoff: 420, reso: 1.0, envMod: 350, decay: 0.6, attack: 0.02, volume: 0.95
            },
            {
                name: "FOREST SHADOW REESE", label: "FOREST REESE",
                oscType: "sawtooth", subType: "sawtooth", subOctave: -1, subMix: 0.55, detune: 1.012,
                cutoff: 1200, reso: 3.2, envMod: 1400, decay: 0.45, attack: 0.01, volume: 0.86
            },
            {
                name: "WAR DRUM IMPACT", label: "WAR DRUM",
                oscType: "triangle", subType: "sine", subOctave: -1, subMix: 0.8, pitchDrop: true,
                cutoff: 600, reso: 3.5, envMod: 1200, decay: 0.45, attack: 0.005, volume: 0.95
            },
            {
                name: "MEDIEVAL SAW BASS", label: "MEDIEVAL SAW",
                oscType: "sawtooth", subType: "square", subOctave: -1, subMix: 0.45,
                cutoff: 1400, reso: 4.5, envMod: 2000, decay: 0.3, attack: 0.006, volume: 0.86
            },
            {
                name: "CASTLE GATE DROP", label: "GATE DROP",
                oscType: "sine", subType: "square", subOctave: -1, subMix: 0.85, pitchDrop: true,
                cutoff: 550, reso: 2.0, envMod: 900, decay: 0.7, attack: 0.01, volume: 0.95
            },
            {
                name: "GOBLIN ACID", label: "GOBLIN ACID",
                oscType: "sawtooth", subType: "sawtooth", subOctave: -1, subMix: 0.5,
                cutoff: 1500, reso: 6.8, envMod: 2600, decay: 0.26, attack: 0.003, volume: 0.85
            },
            {
                name: "SORCERER DEEP DRONE", label: "SORCER DRONE",
                oscType: "triangle", subType: "sine", subOctave: -2, subMix: 0.75,
                cutoff: 700, reso: 2.0, envMod: 750, decay: 0.65, attack: 0.02, volume: 0.95
            }
        ],
        pedalboard: {
            lead: [
                { slot: 0, cartridge: "tube-screamer", active: false, params: { drive: 25, tone: 1600, level: 70 } },
                { slot: 1, cartridge: "small-stone", active: false, params: { rate: 0.5, depth: 60, color: 1 } },
                { slot: 2, cartridge: "ps6", active: false, params: { key: "A", scale: "minor", interval: "5th", mix: 45 } },
                { slot: 3, cartridge: "space-echo", active: true, params: { time: 420, intensity: 48, flutter: 40, mix: 45 } },
                { slot: 4, cartridge: "cathedral-reverb", active: true, params: { decay: 4.8, damping: 25, mix: 55 } }
            ],
            bass: [
                { slot: 0, cartridge: "big-muff", active: false, params: { sustain: 40, tone: 800, volume: 70 } },
                { slot: 1, cartridge: "small-stone", active: false, params: { rate: 0.4, depth: 45, color: 0 } },
                { slot: 2, cartridge: "ps6", active: false, params: { key: "A", scale: "minor", interval: "oct-down", mix: 50 } },
                { slot: 3, cartridge: "analog-delay", active: false, params: { time: 300, feedback: 30, mix: 30 } },
                { slot: 4, cartridge: "cathedral-reverb", active: true, params: { decay: 3.5, damping: 35, mix: 40 } }
            ]
        }
    },

    // 8. DEPECHE MODE
    {
        format: "ShallotWHAM-Module",
        version: "2.0.0",
        id: "depeche-mode",
        name: "DEPECHE MODE",
        subtitle: "Dark 80s Synthpop & Industrial Saws",
        author: "Shallot",
        category: "Darkwave",
        description: "Punchy dark synthpop, Enjoy the Silence choir saws, Personal Jesus gritty stabs, Strangelove bell leads, and driving Violator acid basslines.",
        themeGlow: "#6366f1",
        tags: ["depeche-mode", "synthpop", "darkwave", "80s", "violator"],
        leads: [
            {
                name: "ENJOY THE SILENCE SAW", label: "SILENCE SAW",
                osc1: "sawtooth", osc2: "sawtooth", osc2Octave: 0, osc2Detune: 1.008, oscMix: 0.5,
                filterType: "lowpass", cutoff: 4600, reso: 2.5,
                filterEnv: { attack: 0.01, decay: 0.35, sustain: 0.45, amount: 2600 },
                attack: 0.01, release: 0.4, volume: 0.85
            },
            {
                name: "PERSONAL JESUS LEAD", label: "PERS JESUS",
                osc1: "sawtooth", osc2: "square", osc2Octave: 0, osc2Detune: 1.012, oscMix: 0.55,
                filterType: "lowpass", cutoff: 3800, reso: 3.8,
                filterEnv: { attack: 0.005, decay: 0.22, sustain: 0.3, amount: 3200 },
                attack: 0.005, release: 0.25, volume: 0.82
            },
            {
                name: "STRANGELOVE BELL", label: "STRANGELOVE",
                osc1: "sine", osc2: "triangle", osc2Octave: 1, osc2Detune: 1.004, oscMix: 0.5,
                filterType: "lowpass", cutoff: 7000, reso: 2.8,
                filterEnv: { attack: 0.001, decay: 0.35, sustain: 0.15, amount: 4200 },
                attack: 0.001, release: 0.5, volume: 0.88
            },
            {
                name: "BLACK CELEBRATION", label: "BLACK CELEB",
                osc1: "sawtooth", osc2: "sawtooth", osc2Octave: 0, osc2Detune: 1.018, oscMix: 0.5,
                filterType: "bandpass", cutoff: 2200, reso: 6.0,
                attack: 0.04, release: 0.6, volume: 0.8
            },
            {
                name: "POLICY OF TRUTH", label: "POLICY LEAD",
                osc1: "square", osc2: "sawtooth", osc2Octave: 0, osc2Detune: 0.994, oscMix: 0.5,
                filterType: "lowpass", cutoff: 4200, reso: 3.2,
                filterEnv: { attack: 0.015, decay: 0.28, sustain: 0.35, amount: 2500 },
                attack: 0.015, release: 0.3, volume: 0.85
            },
            {
                name: "NEVER LET ME DOWN", label: "NEVER DOWN",
                osc1: "sawtooth", osc2: "sawtooth", osc2Octave: 0, osc2Detune: 1.009, oscMix: 0.5,
                filterType: "lowpass", cutoff: 5200, reso: 3.0,
                filterEnv: { attack: 0.008, decay: 0.3, sustain: 0.4, amount: 2800 },
                attack: 0.008, release: 0.35, volume: 0.85
            },
            {
                name: "HALO CHOIR SAW", label: "HALO CHOIR",
                osc1: "sawtooth", osc2: "sine", osc2Octave: 0, osc2Detune: 1.003, oscMix: 0.45,
                filterType: "bandpass", cutoff: 2800, reso: 5.0,
                attack: 0.05, release: 0.7, volume: 0.82
            },
            {
                name: "MASTER & SERVANT", label: "MASTER SRV",
                osc1: "square", osc2: "square", osc2Octave: 1, osc2Detune: 1.015, oscMix: 0.55,
                filterType: "lowpass", cutoff: 6500, reso: 4.5,
                filterEnv: { attack: 0.002, decay: 0.18, sustain: 0.2, amount: 3500 },
                attack: 0.002, release: 0.2, volume: 0.8
            }
        ],
        basses: [
            {
                name: "POLICY TRUTH BASS", label: "POLICY BASS",
                oscType: "sawtooth", subType: "sine", subOctave: -1, subMix: 0.7,
                cutoff: 1400, reso: 5.0, envMod: 2200, decay: 0.3, attack: 0.004, volume: 0.88
            },
            {
                name: "WALKING SUB", label: "WALKING SUB",
                oscType: "sine", subType: "sine", subOctave: -1, subMix: 0.9,
                cutoff: 450, reso: 1.0, envMod: 350, decay: 0.48, attack: 0.01, volume: 0.95
            },
            {
                name: "VIOLATOR ACID", label: "VIOLATOR",
                oscType: "sawtooth", subType: "square", subOctave: -1, subMix: 0.5,
                cutoff: 1900, reso: 7.5, envMod: 3200, decay: 0.25, attack: 0.002, volume: 0.85
            },
            {
                name: "BLASPHEMOUS SUB", label: "BLASPHEMOUS",
                oscType: "triangle", subType: "sine", subOctave: -1, subMix: 0.8,
                cutoff: 850, reso: 3.0, envMod: 1100, decay: 0.4, attack: 0.008, volume: 0.92
            },
            {
                name: "WORLD IN MY EYES", label: "WORLD EYES",
                oscType: "square", subType: "sawtooth", subOctave: -1, subMix: 0.6,
                cutoff: 1700, reso: 4.8, envMod: 2000, decay: 0.28, attack: 0.003, volume: 0.86
            },
            {
                name: "QUESTION OF TIME", label: "QUEST TIME",
                oscType: "square", subType: "square", subOctave: -1, subMix: 0.65,
                cutoff: 2200, reso: 5.5, envMod: 2600, decay: 0.2, attack: 0.002, volume: 0.84
            },
            {
                name: "STRIPPED HEAVY SAW", label: "STRIPPED",
                oscType: "sawtooth", subType: "sawtooth", subOctave: -1, subMix: 0.55, detune: 1.012,
                cutoff: 1300, reso: 4.2, envMod: 1700, decay: 0.36, attack: 0.006, volume: 0.88
            },
            {
                name: "BEHIND THE WHEEL", label: "BEHIND WHL",
                oscType: "sawtooth", subType: "triangle", subOctave: -1, subMix: 0.7, pitchDrop: true,
                cutoff: 1100, reso: 6.0, envMod: 2400, decay: 0.38, attack: 0.004, volume: 0.9
            }
        ],
        pedalboard: {
            lead: [
                { slot: 0, cartridge: "proco-rat", active: true, params: { dist: 45, filter: 2400, level: 70 } },
                { slot: 1, cartridge: "flanger", active: true, params: { speed: 0.8, depth: 70, regen: 55 } },
                { slot: 2, cartridge: "ps6", active: false, params: { key: "D", scale: "minor", interval: "3rd", mix: 50 } },
                { slot: 3, cartridge: "analog-delay", active: true, params: { time: 340, feedback: 40, mix: 40 } },
                { slot: 4, cartridge: "gated-plate", active: false, params: { size: 60, gate: 55, mix: 45 } }
            ],
            bass: [
                { slot: 0, cartridge: "proco-rat", active: true, params: { dist: 40, filter: 1600, level: 75 } },
                { slot: 1, cartridge: "dimension-chorus", active: false, params: { mode: 2, width: 55, mix: 35 } },
                { slot: 2, cartridge: "sidechain-pumper", active: true, params: { depth: 75, rate: 4, release: 0.3 } },
                { slot: 3, cartridge: "analog-delay", active: false, params: { time: 220, feedback: 25, mix: 25 } },
                { slot: 4, cartridge: "reverb", active: false, params: { decay: 1.6, mix: 25 } }
            ]
        }
    },

    // 9. VAPORWAVE DREAMS
    {
        format: "ShallotWHAM-Module",
        version: "2.0.0",
        id: "vaporwave-dreams",
        name: "VAPORWAVE DREAMS",
        subtitle: "Late-Night Mallsoft & DX7 Nostalgia",
        author: "Shallot",
        category: "Ambient",
        description: "Late-night empty mall corridors, iconic Yamaha DX7 e-pianos, Macintosh flutes, Windows 95 startup chimes, and slushwave sub basslines.",
        themeGlow: "#06b6d4",
        tags: ["vaporwave", "mallsoft", "dx7", "slushwave", "nostalgia", "vhs"],
        leads: [
            {
                name: "DX7 ELECTRIC PIANO", label: "DX7 PIANO",
                osc1: "sine", osc2: "triangle", osc2Octave: 1, osc2Detune: 1.004, oscMix: 0.5,
                filterType: "lowpass", cutoff: 6200, reso: 2.0,
                filterEnv: { attack: 0.005, decay: 0.45, sustain: 0.3, amount: 3500 },
                attack: 0.005, release: 0.45, volume: 0.92
            },
            {
                name: "MALL CHIME 1995", label: "MALL CHIME",
                osc1: "sine", osc2: "sine", osc2Octave: 2, osc2Detune: 1.002, oscMix: 0.4,
                filterType: "lowpass", cutoff: 7500, reso: 2.5,
                filterEnv: { attack: 0.001, decay: 0.5, sustain: 0.1, amount: 4000 },
                attack: 0.001, release: 0.6, volume: 0.9
            },
            {
                name: "MACINTOSH FLUTE", label: "MAC FLUTE",
                osc1: "triangle", osc2: "sine", osc2Octave: 1, osc2Detune: 1.003, oscMix: 0.45,
                filterType: "lowpass", cutoff: 4800, reso: 1.6,
                attack: 0.03, release: 0.35, vibrato: { rate: 5.0, depth: 5.0 }, volume: 0.92
            },
            {
                name: "CASSETTE TAPE DRIFT", label: "TAPE DRIFT",
                osc1: "sawtooth", osc2: "sawtooth", osc2Octave: 0, osc2Detune: 1.014, oscMix: 0.5,
                filterType: "lowpass", cutoff: 3400, reso: 2.0,
                filterEnv: { attack: 0.02, decay: 0.4, sustain: 0.5, amount: 1800 },
                attack: 0.02, release: 0.4, vibrato: { rate: 3.8, depth: 6.5 }, volume: 0.85
            },
            {
                name: "PLAZA FOUNTAIN WATER", label: "PLAZA WATER",
                osc1: "sine", osc2: "triangle", osc2Octave: 1, osc2Detune: 1.006, oscMix: 0.5, noiseMix: 0.06,
                filterType: "bandpass", cutoff: 3200, reso: 4.5,
                attack: 0.04, release: 0.45, volume: 0.88
            },
            {
                name: "WINDOWS 95 GLOW", label: "WIN95 GLOW",
                osc1: "sine", osc2: "sawtooth", osc2Octave: 1, osc2Detune: 1.002, oscMix: 0.35,
                filterType: "lowpass", cutoff: 6800, reso: 2.2,
                filterEnv: { attack: 0.01, decay: 0.6, sustain: 0.4, amount: 3000 },
                attack: 0.01, release: 0.7, volume: 0.9
            },
            {
                name: "ESPRIT SMOOTH PAD", label: "ESPRIT PAD",
                osc1: "sawtooth", osc2: "triangle", osc2Octave: 0, osc2Detune: 1.008, oscMix: 0.5,
                filterType: "lowpass", cutoff: 3000, reso: 1.8,
                filterEnv: { attack: 0.15, decay: 0.6, sustain: 0.7, amount: 1800 },
                attack: 0.15, release: 0.65, volume: 0.85
            },
            {
                name: "PALM TREE MARIMBA", label: "PALM MARIMBA",
                osc1: "triangle", osc2: "sine", osc2Octave: 1, osc2Detune: 1.003, oscMix: 0.5,
                filterType: "lowpass", cutoff: 4500, reso: 3.5,
                filterEnv: { attack: 0.002, decay: 0.18, sustain: 0.05, amount: 3500 },
                attack: 0.002, release: 0.2, volume: 0.9
            }
        ],
        basses: [
            {
                name: "SLUSHWAVE DEEP SUB", label: "SLUSH SUB",
                oscType: "sine", subType: "sine", subOctave: -1, subMix: 0.85,
                cutoff: 400, reso: 1.0, envMod: 300, decay: 0.55, attack: 0.015, volume: 0.95
            },
            {
                name: "DX BASS 1986", label: "DX BASS 1986",
                oscType: "triangle", subType: "square", subOctave: -1, subMix: 0.5,
                cutoff: 1900, reso: 4.8, envMod: 2600, decay: 0.24, attack: 0.003, volume: 0.88
            },
            {
                name: "MALL ELEVATOR BASS", label: "MALL BASS",
                oscType: "triangle", subType: "triangle", subOctave: -1, subMix: 0.6,
                cutoff: 1000, reso: 2.5, envMod: 1200, decay: 0.35, attack: 0.008, volume: 0.92
            },
            {
                name: "VHS WARPED WARM BASS", label: "VHS WARM",
                oscType: "sawtooth", subType: "sine", subOctave: -1, subMix: 0.6, detune: 1.008,
                cutoff: 1300, reso: 3.0, envMod: 1600, decay: 0.4, attack: 0.01, volume: 0.88
            },
            {
                name: "RESONANCE SUB 90s", label: "RESO SUB",
                oscType: "square", subType: "sine", subOctave: -1, subMix: 0.75,
                cutoff: 900, reso: 5.0, envMod: 1200, decay: 0.38, attack: 0.005, volume: 0.88
            },
            {
                name: "1992 ACID SQUELCH", label: "1992 ACID",
                oscType: "sawtooth", subType: "sawtooth", subOctave: -1, subMix: 0.45,
                cutoff: 2100, reso: 8.0, envMod: 3200, decay: 0.22, attack: 0.002, volume: 0.85
            },
            {
                name: "CASSETTE TAPE DROP", label: "TAPE DROP",
                oscType: "sine", subType: "square", subOctave: -1, subMix: 0.85, pitchDrop: true,
                cutoff: 600, reso: 2.5, envMod: 1000, decay: 0.55, attack: 0.008, volume: 0.95
            },
            {
                name: "PLAZA HEARTBEAT BASS", label: "PLAZA BEAT",
                oscType: "triangle", subType: "triangle", subOctave: -1, subMix: 0.7, pitchDrop: true,
                cutoff: 700, reso: 3.0, envMod: 1100, decay: 0.48, attack: 0.006, volume: 0.92
            }
        ],
        pedalboard: {
            lead: [
                { slot: 0, cartridge: "french-preamp", active: false, params: { drive: 30, warmth: 70, output: 65 } },
                { slot: 1, cartridge: "dimension-chorus", active: true, params: { mode: 4, width: 90, mix: 65 } },
                { slot: 2, cartridge: "formant-filter", active: false, params: { vowel: 1, reso: 45, glide: 40 } },
                { slot: 3, cartridge: "space-echo", active: true, params: { time: 440, intensity: 48, flutter: 55, mix: 50 } },
                { slot: 4, cartridge: "cosmic-shimmer", active: true, params: { shimmer: 65, decay: 3.5, mix: 55 } }
            ],
            bass: [
                { slot: 0, cartridge: "french-preamp", active: false, params: { drive: 35, warmth: 75, output: 70 } },
                { slot: 1, cartridge: "dimension-chorus", active: true, params: { mode: 2, width: 65, mix: 45 } },
                { slot: 2, cartridge: "sidechain-pumper", active: true, params: { depth: 75, rate: 4, release: 0.3 } },
                { slot: 3, cartridge: "space-echo", active: false, params: { time: 320, intensity: 30, flutter: 35, mix: 30 } },
                { slot: 4, cartridge: "cosmic-shimmer", active: false, params: { shimmer: 40, decay: 2.5, mix: 35 } }
            ]
        }
    },

    // 10. USER CUSTOM
    {
        format: "ShallotWHAM-Module",
        version: "2.0.0",
        id: "user-custom",
        name: "USER PATCHES",
        subtitle: "Custom User Sound Bank",
        author: "User",
        category: "Custom",
        description: "Balanced custom sound template ready for user sound design experimentation, live tweaking, and patch saving.",
        themeGlow: "#f59e0b",
        tags: ["custom", "user", "template"],
        leads: [
            {
                name: "INIT LEAD SAW", label: "INIT SAW",
                osc1: "sawtooth", osc2: "sawtooth", osc2Octave: 0, osc2Detune: 1.006, oscMix: 0.5,
                filterType: "lowpass", cutoff: 3800, reso: 2.0,
                filterEnv: { attack: 0.01, decay: 0.28, sustain: 0.4, amount: 2500 },
                attack: 0.01, release: 0.28, volume: 0.85
            },
            {
                name: "CUSTOM SQUARE", label: "USER SQUARE",
                osc1: "square", osc2: "triangle", osc2Octave: 0, osc2Detune: 1.004, oscMix: 0.5,
                filterType: "lowpass", cutoff: 5500, reso: 2.5,
                attack: 0.005, release: 0.2, volume: 0.82
            },
            {
                name: "CUSTOM BRASS", label: "USER BRASS",
                osc1: "sawtooth", osc2: "sawtooth", osc2Octave: 0, osc2Detune: 0.993, oscMix: 0.5,
                filterType: "lowpass", cutoff: 3200, reso: 3.5,
                filterEnv: { attack: 0.04, decay: 0.38, sustain: 0.45, amount: 2400 },
                attack: 0.04, release: 0.4, volume: 0.82
            },
            {
                name: "CUSTOM PLUCK", label: "USER PLUCK",
                osc1: "triangle", osc2: "sine", osc2Octave: 1, osc2Detune: 1.005, oscMix: 0.5,
                filterType: "lowpass", cutoff: 5000, reso: 3.0,
                filterEnv: { attack: 0.002, decay: 0.15, sustain: 0.05, amount: 4000 },
                attack: 0.002, release: 0.18, volume: 0.88
            },
            {
                name: "CUSTOM VOCO", label: "USER VOCO",
                osc1: "sawtooth", osc2: "sawtooth", osc2Octave: 0, osc2Detune: 1.003, oscMix: 0.5,
                filterType: "bandpass", cutoff: 2200, reso: 6.0,
                attack: 0.015, release: 0.25, volume: 0.8
            },
            {
                name: "CUSTOM SINE", label: "USER SINE",
                osc1: "sine", osc2: "sine", osc2Octave: 1, osc2Detune: 1.002, oscMix: 0.4,
                filterType: "lowpass", cutoff: 6500, reso: 1.0,
                attack: 0.02, release: 0.35, vibrato: { rate: 5.5, depth: 6.0 }, volume: 0.92
            },
            {
                name: "CUSTOM CHIP", label: "USER CHIP",
                osc1: "square", osc2: "square", osc2Octave: 1, osc2Detune: 1.001, oscMix: 0.5,
                filterType: "lowpass", cutoff: 8000, reso: 2.0,
                attack: 0.001, release: 0.12, volume: 0.8
            },
            {
                name: "CUSTOM HOOVER", label: "USER HOOVER",
                osc1: "sawtooth", osc2: "sawtooth", osc2Octave: 0, osc2Detune: 1.018, oscMix: 0.5,
                filterType: "lowpass", cutoff: 4000, reso: 4.0,
                filterEnv: { attack: 0.02, decay: 0.4, sustain: 0.5, amount: 2600 },
                attack: 0.02, release: 0.35, volume: 0.82
            }
        ],
        basses: [
            {
                name: "INIT ACID BASS", label: "INIT ACID",
                oscType: "sawtooth", subType: "square", subOctave: -1, subMix: 0.45,
                cutoff: 1300, reso: 7.0, envMod: 2800, decay: 0.26, attack: 0.004, volume: 0.85
            },
            {
                name: "INIT SUB BASS", label: "INIT SUB",
                oscType: "sine", subType: "sine", subOctave: -1, subMix: 0.85,
                cutoff: 480, reso: 1.2, envMod: 400, decay: 0.5, attack: 0.01, volume: 0.95
            },
            {
                name: "CUSTOM REESE", label: "USER REESE",
                oscType: "sawtooth", subType: "sawtooth", subOctave: -1, subMix: 0.55, detune: 1.016,
                cutoff: 1600, reso: 3.5, envMod: 1600, decay: 0.45, attack: 0.01, volume: 0.85
            },
            {
                name: "CUSTOM FM PUNCH", label: "USER FM",
                oscType: "triangle", subType: "square", subOctave: -1, subMix: 0.45,
                cutoff: 2200, reso: 4.5, envMod: 3000, decay: 0.2, attack: 0.002, volume: 0.88
            },
            {
                name: "CUSTOM SLAP", label: "USER SLAP",
                oscType: "square", subType: "triangle", subOctave: -1, subMix: 0.4,
                cutoff: 1800, reso: 5.0, envMod: 2500, decay: 0.18, attack: 0.003, volume: 0.82
            },
            {
                name: "CUSTOM MOOG", label: "USER MOOG",
                oscType: "sawtooth", subType: "triangle", subOctave: -1, subMix: 0.6,
                cutoff: 950, reso: 3.2, envMod: 1200, decay: 0.4, attack: 0.01, volume: 0.88
            },
            {
                name: "CUSTOM 80s", label: "USER 80s",
                oscType: "sawtooth", subType: "sawtooth", subOctave: -1, subMix: 0.5, detune: 1.008,
                cutoff: 1500, reso: 2.8, envMod: 1800, decay: 0.35, attack: 0.008, volume: 0.86
            },
            {
                name: "CUSTOM DROP", label: "USER DROP",
                oscType: "sine", subType: "sine", subOctave: -1, subMix: 0.85, pitchDrop: true,
                cutoff: 600, reso: 2.0, envMod: 900, decay: 0.65, attack: 0.01, volume: 0.95
            }
        ],
        pedalboard: {
            lead: [
                { slot: 0, cartridge: "ds1", active: true, params: { dist: 45, tone: 2400, level: 65 } },
                { slot: 1, cartridge: "dimension-chorus", active: true, params: { mode: 3, width: 75, mix: 50 } },
                { slot: 2, cartridge: "ps6", active: false, params: { key: "C", scale: "major", interval: "3rd", mix: 50 } },
                { slot: 3, cartridge: "delay", active: false, params: { time: 360, feedback: 35, mix: 40 } },
                { slot: 4, cartridge: "reverb", active: true, params: { decay: 2.2, mix: 45 } }
            ],
            bass: [
                { slot: 0, cartridge: "ds1", active: true, params: { dist: 40, tone: 1000, level: 70 } },
                { slot: 1, cartridge: "dimension-chorus", active: false, params: { mode: 2, width: 50, mix: 35 } },
                { slot: 2, cartridge: "sidechain-pumper", active: true, params: { depth: 70, rate: 4, release: 0.3 } },
                { slot: 3, cartridge: "analog-delay", active: false, params: { time: 240, feedback: 25, mix: 30 } },
                { slot: 4, cartridge: "reverb", active: false, params: { decay: 1.6, mix: 35 } }
            ]
        }
    }
];

REMASTERED_MODULES.forEach(mod => {
    const filePath = path.join(MODULES_DIR, `${mod.id}.swm`);
    fs.writeFileSync(filePath, JSON.stringify(mod, null, 2), 'utf8');
    console.log(`✨ Remastered: ${path.basename(filePath)} (${mod.name})`);
});

console.log(`\nSuccessfully remastered all ${REMASTERED_MODULES.length} sound modules to SWM v2.0!`);
