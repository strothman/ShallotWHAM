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

module.exports = {
    CARTRIDGE_CATALOG,
    createPedalDSP,
    createSpringReverbImpulse
};
