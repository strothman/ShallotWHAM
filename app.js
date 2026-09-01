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
    leadRelease: 0.25,
    // Dedicated Bassline Instrument Settings
    bassPreset: 0,
    bassCutoff: 1200,
    bassResonance: 6.0,
    bassSubLevel: 50,
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
const LEAD_PRESETS = [
    { name: "TRANCE SAW LEAD", osc1: "sawtooth", osc2: "sawtooth", osc2Detune: 1.006, filterType: "lowpass", cutoff: 4200, reso: 2.0, attack: 0.005, release: 0.35 },
    { name: "CHIPTUNE PULSE", osc1: "square", osc2: "square", osc2Detune: 2.0, filterType: "lowpass", cutoff: 8000, reso: 1.0, attack: 0.001, release: 0.15 },
    { name: "80s SYNTH BRASS", osc1: "sawtooth", osc2: "sawtooth", osc2Detune: 0.992, filterType: "lowpass", cutoff: 3200, reso: 3.5, attack: 0.04, release: 0.45 },
    { name: "CYBERPUNK LEAD", osc1: "sawtooth", osc2: "square", osc2Detune: 1.01, filterType: "lowpass", cutoff: 3800, reso: 4.0, attack: 0.01, release: 0.28 },
    { name: "G-FUNK SINE", osc1: "sine", osc2: "sine", osc2Detune: 2.002, filterType: "lowpass", cutoff: 6000, reso: 0.8, attack: 0.02, release: 0.3 },
    { name: "HYPER PLUCK", osc1: "triangle", osc2: "sine", osc2Detune: 3.0, filterType: "lowpass", cutoff: 5500, reso: 2.5, attack: 0.002, release: 0.18 },
    { name: "VOCO VOICE", osc1: "sawtooth", osc2: "sawtooth", osc2Detune: 1.003, filterType: "bandpass", cutoff: 2200, reso: 6.0, attack: 0.01, release: 0.25 },
    { name: "RAVE HOOVER", osc1: "sawtooth", osc2: "sawtooth", osc2Detune: 1.015, filterType: "lowpass", cutoff: 4800, reso: 3.0, attack: 0.015, release: 0.4 }
];

// Bass Preset Templates (Rows 2 & 3 Dedicated Engine)
const BASS_PRESETS = [
    { name: "ACID 303 SAW", oscType: "sawtooth", subType: "square", subOctave: -1, cutoff: 1200, reso: 6.0, envMod: 2200, decay: 0.28, attack: 0.005, subMix: 0.4 },
    { name: "DEEP SUB SINE", oscType: "sine", subType: "sine", subOctave: -1, cutoff: 450, reso: 1.0, envMod: 400, decay: 0.45, attack: 0.01, subMix: 0.75 },
    { name: "FAT REESE BASS", oscType: "sawtooth", subType: "sine", subOctave: -1, detune: 1.018, cutoff: 1800, reso: 3.5, envMod: 1500, decay: 0.5, attack: 0.01, subMix: 0.5 },
    { name: "FM PUNCH BASS", oscType: "triangle", subType: "square", subOctave: -1, cutoff: 2400, reso: 4.0, envMod: 3200, decay: 0.22, attack: 0.002, subMix: 0.45 },
    { name: "SLAP SQUARE", oscType: "square", subType: "triangle", subOctave: -1, cutoff: 2000, reso: 5.0, envMod: 2800, decay: 0.2, attack: 0.003, subMix: 0.35 },
    { name: "80s ANALOG BASS", oscType: "sawtooth", subType: "sawtooth", subOctave: -1, detune: 1.006, cutoff: 1600, reso: 2.5, envMod: 1800, decay: 0.35, attack: 0.008, subMix: 0.5 },
    { name: "WARM MOOG BASS", oscType: "sawtooth", subType: "triangle", subOctave: -1, cutoff: 900, reso: 3.0, envMod: 1200, decay: 0.4, attack: 0.01, subMix: 0.6 },
    { name: "SUB DROPPER", oscType: "sine", subType: "sine", subOctave: -1, pitchDrop: true, cutoff: 600, reso: 1.5, envMod: 800, decay: 0.6, attack: 0.01, subMix: 0.85 }
];

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
        if (document.getElementById("lead-release")) {
            appSettings.leadRelease = parseFloat(document.getElementById("lead-release").value);
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
let tremoloNode = null;

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

// Virtual Keyboard layout builder with Dual Instrument Separation
function buildVirtualKeyboard() {
    const r0Root = document.getElementById("row0-root") ? document.getElementById("row0-root").value : "G";
    const r1Root = document.getElementById("row1-root") ? document.getElementById("row1-root").value : "D";
    const r2Root = document.getElementById("row2-root") ? document.getElementById("row2-root").value : "G";
    const r3Root = document.getElementById("row3-root") ? document.getElementById("row3-root").value : "D";

    const r0Octave = parseInt(document.getElementById("row0-octave") ? document.getElementById("row0-octave").value : 3);
    const r1Octave = parseInt(document.getElementById("row1-octave") ? document.getElementById("row1-octave").value : 3);
    const r2Octave = parseInt(document.getElementById("row2-octave") ? document.getElementById("row2-octave").value : 2);
    const r3Octave = parseInt(document.getElementById("row3-octave") ? document.getElementById("row3-octave").value : 2);

    const r0RootIndex = NOTES.indexOf(r0Root);
    const r1RootIndex = NOTES.indexOf(r1Root);
    const r2RootIndex = NOTES.indexOf(r2Root);
    const r3RootIndex = NOTES.indexOf(r3Root);

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

        const keyCap = document.createElement("div");
        keyCap.className = `key-cap ${instrumentType}-key`;
        keyCap.id = `key-${key}`;
        keyCap.innerHTML = `
            <span class="char">${chars[i]}</span>
            <span class="note">${noteName}${finalOctave}</span>
        `;

        keyCap.addEventListener("mousedown", () => handleKeyDown(key));
        keyCap.addEventListener("mouseup", () => handleKeyUp(key));
        keyCap.addEventListener("mouseleave", () => handleKeyUp(key));

        rowEl.appendChild(keyCap);
    });
}

function getNoteFrequency(noteName, octave) {
    const noteIndex = NOTES.indexOf(noteName);
    const stepsFromA4 = noteIndex + (octave - 4) * 12;
    return 440 * Math.pow(2, stepsFromA4 / 12);
}

function getKeyNoteAndFrequency(keyCode) {
    const r0Root = document.getElementById("row0-root") ? document.getElementById("row0-root").value : "G";
    const r1Root = document.getElementById("row1-root") ? document.getElementById("row1-root").value : "D";
    const r2Root = document.getElementById("row2-root") ? document.getElementById("row2-root").value : "G";
    const r3Root = document.getElementById("row3-root") ? document.getElementById("row3-root").value : "D";

    const r0Octave = parseInt(document.getElementById("row0-octave") ? document.getElementById("row0-octave").value : 3);
    const r1Octave = parseInt(document.getElementById("row1-octave") ? document.getElementById("row1-octave").value : 3);
    const r2Octave = parseInt(document.getElementById("row2-octave") ? document.getElementById("row2-octave").value : 2);
    const r3Octave = parseInt(document.getElementById("row3-octave") ? document.getElementById("row3-octave").value : 2);

    let noteIndex = -1;
    let octave = 4;
    let shiftedOctave = 4;

    if (ROW0_KEYS.includes(keyCode)) {
        const idx = ROW0_KEYS.indexOf(keyCode);
        noteIndex = (NOTES.indexOf(r0Root) + idx) % 12;
        octave = r0Octave + Math.floor((NOTES.indexOf(r0Root) + idx) / 12);
        shiftedOctave = octave + leadOctaveShift;
    } else if (ROW1_KEYS.includes(keyCode)) {
        const idx = ROW1_KEYS.indexOf(keyCode);
        noteIndex = (NOTES.indexOf(r1Root) + idx) % 12;
        octave = r1Octave + Math.floor((NOTES.indexOf(r1Root) + idx) / 12);
        shiftedOctave = octave + leadOctaveShift;
    } else if (ROW2_KEYS.includes(keyCode)) {
        const idx = ROW2_KEYS.indexOf(keyCode);
        noteIndex = (NOTES.indexOf(r2Root) + idx) % 12;
        octave = r2Octave + Math.floor((NOTES.indexOf(r2Root) + idx) / 12);
        shiftedOctave = octave + bassOctaveShift;
    } else if (ROW3_KEYS.includes(keyCode)) {
        const idx = ROW3_KEYS.indexOf(keyCode);
        noteIndex = (NOTES.indexOf(r3Root) + idx) % 12;
        octave = r3Octave + Math.floor((NOTES.indexOf(r3Root) + idx) / 12);
        shiftedOctave = octave + bassOctaveShift;
    } else {
        return null;
    }

    const noteName = NOTES[noteIndex];
    return {
        noteName: noteName + shiftedOctave,
        frequency: getNoteFrequency(noteName, shiftedOctave)
    };
}

// Lead DSP Nodes
let leadVoiceBus = null;
let leadDS1DistNode = null;
let leadDS1ToneFilter = null;
let leadDS1LevelGain = null;
let leadDS1DryGain = null;
let leadDS1WetGain = null;
let leadPreFXBus = null;
let leadDelayNode = null;
let leadDelayFeedbackNode = null;
let leadDelayWetGain = null;
let leadReverbNode = null;
let leadReverbWetGain = null;
let leadMasterGain = null;

// Bass DSP Nodes
let bassVoiceBus = null;
let bassDS1DistNode = null;
let bassDS1ToneFilter = null;
let bassDS1LevelGain = null;
let bassDS1DryGain = null;
let bassDS1WetGain = null;
let bassPreFXBus = null;
let bassDelayNode = null;
let bassDelayFeedbackNode = null;
let bassDelayWetGain = null;
let bassReverbNode = null;
let bassReverbWetGain = null;
let bassMasterGain = null;

function initAudio() {
    if (audioCtx) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();

    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(appSettings.synthVolume / 100, audioCtx.currentTime);

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;

    tremoloNode = audioCtx.createGain();
    tremoloNode.gain.setValueAtTime(1.0, audioCtx.currentTime);
    tremoloNode.connect(masterGain);

    masterGain.connect(analyser);
    analyser.connect(audioCtx.destination);

    // ==========================================
    // 1. LEAD FX CHAIN SETUP
    // ==========================================
    leadVoiceBus = audioCtx.createGain();
    leadPreFXBus = audioCtx.createGain();
    leadMasterGain = audioCtx.createGain();
    leadMasterGain.gain.setValueAtTime(1.0, audioCtx.currentTime);

    // Lead DS-1
    leadDS1DryGain = audioCtx.createGain();
    leadDS1WetGain = audioCtx.createGain();
    leadDS1DryGain.gain.setValueAtTime(appSettings.leadDS1Active ? 0.0 : 1.0, audioCtx.currentTime);
    leadDS1WetGain.gain.setValueAtTime(appSettings.leadDS1Active ? 1.0 : 0.0, audioCtx.currentTime);

    leadDS1DistNode = audioCtx.createWaveShaper();
    leadDS1DistNode.curve = makeDistortionCurve(appSettings.leadDS1Dist || 50);
    leadDS1DistNode.oversample = '4x';

    leadDS1ToneFilter = audioCtx.createBiquadFilter();
    leadDS1ToneFilter.type = 'peaking';
    leadDS1ToneFilter.frequency.setValueAtTime(appSettings.leadDS1Tone || 2500, audioCtx.currentTime);
    leadDS1ToneFilter.Q.setValueAtTime(1.0, audioCtx.currentTime);
    leadDS1ToneFilter.gain.setValueAtTime(6.0, audioCtx.currentTime);

    leadDS1LevelGain = audioCtx.createGain();
    leadDS1LevelGain.gain.setValueAtTime(((appSettings.leadDS1Level || 65) / 100) * 0.8, audioCtx.currentTime);

    leadVoiceBus.connect(leadDS1DryGain);
    leadDS1DryGain.connect(leadPreFXBus);

    leadVoiceBus.connect(leadDS1DistNode);
    leadDS1DistNode.connect(leadDS1ToneFilter);
    leadDS1ToneFilter.connect(leadDS1LevelGain);
    leadDS1LevelGain.connect(leadDS1WetGain);
    leadDS1WetGain.connect(leadPreFXBus);

    // Lead Delay
    leadDelayNode = audioCtx.createDelay(5.0);
    leadDelayFeedbackNode = audioCtx.createGain();
    leadDelayWetGain = audioCtx.createGain();

    leadDelayNode.delayTime.setValueAtTime((appSettings.leadDelayTime || 380) / 1000, audioCtx.currentTime);
    leadDelayFeedbackNode.gain.setValueAtTime(((appSettings.leadDelayFeedback || 40) / 100) * 0.85, audioCtx.currentTime);
    leadDelayWetGain.gain.setValueAtTime(appSettings.leadDelayActive ? ((appSettings.leadDelayMix || 45) / 100) * 0.7 : 0.0, audioCtx.currentTime);

    leadDelayNode.connect(leadDelayFeedbackNode);
    leadDelayFeedbackNode.connect(leadDelayNode);

    // Lead Reverb
    leadReverbNode = audioCtx.createConvolver();
    leadReverbNode.buffer = createReverbImpulse(audioCtx, 2.5, 2.0);
    leadReverbWetGain = audioCtx.createGain();
    leadReverbWetGain.gain.setValueAtTime(appSettings.leadReverbActive ? ((appSettings.leadReverbMix || 55) / 100) * 0.8 : 0.0, audioCtx.currentTime);

    // Lead FX Bus Connections to Master
    leadPreFXBus.connect(leadMasterGain);
    leadPreFXBus.connect(leadDelayNode);
    leadDelayNode.connect(leadDelayWetGain);
    leadDelayWetGain.connect(leadMasterGain);

    leadPreFXBus.connect(leadReverbNode);
    leadReverbNode.connect(leadReverbWetGain);
    leadReverbWetGain.connect(leadMasterGain);

    leadMasterGain.connect(tremoloNode);

    // ==========================================
    // 2. BASS FX CHAIN SETUP
    // ==========================================
    bassVoiceBus = audioCtx.createGain();
    bassPreFXBus = audioCtx.createGain();
    bassMasterGain = audioCtx.createGain();
    const bassVolVal = appSettings.bassVolume !== undefined ? appSettings.bassVolume / 100 : 0.85;
    bassMasterGain.gain.setValueAtTime(bassVolVal, audioCtx.currentTime);

    // Bass DS-1 Overdrive
    bassDS1DryGain = audioCtx.createGain();
    bassDS1WetGain = audioCtx.createGain();
    bassDS1DryGain.gain.setValueAtTime(appSettings.bassDS1Active ? 0.0 : 1.0, audioCtx.currentTime);
    bassDS1WetGain.gain.setValueAtTime(appSettings.bassDS1Active ? 1.0 : 0.0, audioCtx.currentTime);

    bassDS1DistNode = audioCtx.createWaveShaper();
    bassDS1DistNode.curve = makeDistortionCurve((appSettings.bassDS1Dist || 45) * 0.8);
    bassDS1DistNode.oversample = '4x';

    bassDS1ToneFilter = audioCtx.createBiquadFilter();
    bassDS1ToneFilter.type = 'lowshelf';
    bassDS1ToneFilter.frequency.setValueAtTime(appSettings.bassDS1Tone || 900, audioCtx.currentTime);
    bassDS1ToneFilter.gain.setValueAtTime(4.0, audioCtx.currentTime);

    bassDS1LevelGain = audioCtx.createGain();
    bassDS1LevelGain.gain.setValueAtTime(((appSettings.bassDS1Level || 70) / 100) * 0.85, audioCtx.currentTime);

    bassVoiceBus.connect(bassDS1DryGain);
    bassDS1DryGain.connect(bassPreFXBus);

    bassVoiceBus.connect(bassDS1DistNode);
    bassDS1DistNode.connect(bassDS1ToneFilter);
    bassDS1ToneFilter.connect(bassDS1LevelGain);
    bassDS1LevelGain.connect(bassDS1WetGain);
    bassDS1WetGain.connect(bassPreFXBus);

    // Bass Delay
    bassDelayNode = audioCtx.createDelay(5.0);
    bassDelayFeedbackNode = audioCtx.createGain();
    bassDelayWetGain = audioCtx.createGain();

    bassDelayNode.delayTime.setValueAtTime((appSettings.bassDelayTime || 280) / 1000, audioCtx.currentTime);
    bassDelayFeedbackNode.gain.setValueAtTime(((appSettings.bassDelayFeedback || 30) / 100) * 0.75, audioCtx.currentTime);
    bassDelayWetGain.gain.setValueAtTime(appSettings.bassDelayActive ? ((appSettings.bassDelayMix || 35) / 100) * 0.6 : 0.0, audioCtx.currentTime);

    bassDelayNode.connect(bassDelayFeedbackNode);
    bassDelayFeedbackNode.connect(bassDelayNode);

    // Bass Reverb
    bassReverbNode = audioCtx.createConvolver();
    bassReverbNode.buffer = createReverbImpulse(audioCtx, 1.8, 2.5);
    bassReverbWetGain = audioCtx.createGain();
    bassReverbWetGain.gain.setValueAtTime(appSettings.bassReverbActive ? ((appSettings.bassReverbMix || 40) / 100) * 0.6 : 0.0, audioCtx.currentTime);

    // Bass FX Bus Connections to Master
    bassPreFXBus.connect(bassMasterGain);
    bassPreFXBus.connect(bassDelayNode);
    bassDelayNode.connect(bassDelayWetGain);
    bassDelayWetGain.connect(bassMasterGain);

    bassPreFXBus.connect(bassReverbNode);
    bassReverbNode.connect(bassReverbWetGain);
    bassReverbWetGain.connect(bassMasterGain);

    bassMasterGain.connect(tremoloNode);

    startVisualizer();
}

function createReverbImpulse(context, duration, decay) {
    const sampleRate = context.sampleRate;
    const length = sampleRate * duration;
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
    } else if (interval === 'triad') {
        const degree3 = (currentDegree + 2) % 7;
        const octWrap3 = Math.floor((currentDegree + 2) / 7);
        const semitones3 = scaleSteps[degree3] + (octWrap3 * 12);
        harmonies.push(baseFreq * Math.pow(2, (semitones3 - semitonesFromRoot) / 12));

        const degree5 = (currentDegree + 4) % 7;
        const octWrap5 = Math.floor((currentDegree + 4) / 7);
        const semitones5 = scaleSteps[degree5] + (octWrap5 * 12);
        harmonies.push(baseFreq * Math.pow(2, (semitones5 - semitonesFromRoot) / 12));
    }
    return harmonies;
}

// 1. LEAD SYNTH ENGINE (Rows 0 & 1)
function spawnLeadVoice(key, frequency, isHarmony) {
    const presetIdx = appSettings.leadPreset !== undefined ? appSettings.leadPreset : 0;
    const patch = LEAD_PRESETS[presetIdx] || LEAD_PRESETS[0];

    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const voiceGain = audioCtx.createGain();
    let vibratoNode = null;
    let vibratoGain = null;

    voiceGain.gain.setValueAtTime(0, audioCtx.currentTime);

    const harmonyScale = isHarmony ? (((appSettings.leadPS6Mix || 50) / 100) * 0.8) : 1.0;

    osc1.type = patch.osc1;
    osc1.frequency.setValueAtTime(frequency, audioCtx.currentTime);

    osc2.type = patch.osc2;
    osc2.frequency.setValueAtTime(frequency * (patch.osc2Detune || 1.004), audioCtx.currentTime);

    filter.type = patch.filterType || "lowpass";

    const cutoffVal = document.getElementById("lead-cutoff") ? parseFloat(document.getElementById("lead-cutoff").value) : (appSettings.leadCutoff || patch.cutoff || 3500);
    const resonanceVal = document.getElementById("lead-reso") ? parseFloat(document.getElementById("lead-reso").value) : (appSettings.leadResonance || patch.reso || 1.5);

    filter.Q.setValueAtTime(resonanceVal, audioCtx.currentTime);
    filter.frequency.setValueAtTime(cutoffVal, audioCtx.currentTime);
    if (filter.type === "lowpass") {
        const decayCutoff = Math.max(80, cutoffVal * 0.35);
        filter.frequency.exponentialRampToValueAtTime(decayCutoff, audioCtx.currentTime + 0.18);
    }

    const attackVal = document.getElementById("lead-attack") ? parseFloat(document.getElementById("lead-attack").value) : (appSettings.leadAttack || patch.attack || 0.01);
    let targetGainVal = 0.25 * harmonyScale;
    voiceGain.gain.linearRampToValueAtTime(targetGainVal, audioCtx.currentTime + attackVal);

    if (presetIdx === 6 || presetIdx === 2 || patch.name.includes("VOICE") || patch.name.includes("BRASS") || patch.name.includes("SINE")) {
        vibratoNode = audioCtx.createOscillator();
        vibratoGain = audioCtx.createGain();
        vibratoNode.frequency.setValueAtTime(5.8, audioCtx.currentTime);
        vibratoGain.gain.setValueAtTime(6.0, audioCtx.currentTime);
        vibratoNode.connect(vibratoGain);
        vibratoGain.connect(osc1.frequency);
        vibratoGain.connect(osc2.frequency);
        vibratoNode.start();
    }

    osc1.connect(filter);
    osc2.connect(filter);
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
        osc2DetuneRatio: patch.osc2Detune || 1.004,
        vibrato: vibratoNode,
        filter: filter,
        gainNode: voiceGain,
        baseFreq: frequency
    };

    activeLeadVoices.push(voiceObj);
}

// 2. BASSLINE SYNTH ENGINE (Rows 2 & 3)
function spawnBassVoice(key, frequency, isHarmony = false) {
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

    // 1. Main Oscillator
    oscMain.type = preset.oscType;
    oscMain.frequency.setValueAtTime(frequency, audioCtx.currentTime);

    if (preset.pitchDrop) {
        oscMain.frequency.exponentialRampToValueAtTime(Math.max(20, frequency * 0.45), audioCtx.currentTime + 0.35);
    }

    if (preset.detune) {
        oscMain2 = audioCtx.createOscillator();
        oscMain2.type = preset.oscType;
        oscMain2.frequency.setValueAtTime(frequency * preset.detune, audioCtx.currentTime);
        oscMain2.connect(mainGain);
        oscMain2.start();
    }

    // 2. Sub-Oscillator (1 octave down)
    const subFreq = frequency * 0.5;
    oscSub.type = preset.subType || "sine";
    oscSub.frequency.setValueAtTime(subFreq, audioCtx.currentTime);

    const subMixRatio = (appSettings.bassSubLevel !== undefined ? appSettings.bassSubLevel : 50) / 100;
    mainGain.gain.setValueAtTime(0.7, audioCtx.currentTime);
    subGain.gain.setValueAtTime(subMixRatio * 0.7, audioCtx.currentTime);

    // 3. Bass Filter Envelope
    filter.type = "lowpass";
    const customCutoff = document.getElementById("bass-cutoff") ? parseFloat(document.getElementById("bass-cutoff").value) : preset.cutoff;
    const customReso = document.getElementById("bass-reso") ? parseFloat(document.getElementById("bass-reso").value) : preset.reso;

    filter.Q.setValueAtTime(customReso, audioCtx.currentTime);

    const envPeakCutoff = Math.min(12000, customCutoff + preset.envMod);
    filter.frequency.setValueAtTime(envPeakCutoff, audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(Math.max(50, customCutoff), audioCtx.currentTime + preset.decay);

    // 4. Amplitude Envelope
    const attackTime = preset.attack || 0.005;
    const harmonyScale = isHarmony ? (((appSettings.bassPS6Mix || 60) / 100) * 0.8) : 1.0;
    voiceGain.gain.linearRampToValueAtTime(0.35 * harmonyScale, audioCtx.currentTime + attackTime);

    // Routing to Bass Voice Bus
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
        osc2DetuneRatio: preset.detune || 1,
        oscSub: oscSub,
        filter: filter,
        gainNode: voiceGain,
        baseFreq: frequency
    };

    activeBassVoices.push(voiceObj);
}

function handleKeyDown(key) {
    initAudio();
    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    }

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

    const keyCap = document.getElementById(`key-${key}`);
    if (keyCap) keyCap.classList.add("active");

    applyPitchBend();
}

function releaseVoice(voice, releaseTime) {
    if (!voice || !voice.gainNode) return;
    try {
        voice.gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
        voice.gainNode.gain.setValueAtTime(voice.gainNode.gain.value, audioCtx.currentTime);
        voice.gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + releaseTime);

        setTimeout(() => {
            try {
                if (voice.osc1) voice.osc1.stop();
                if (voice.osc2) voice.osc2.stop();
                if (voice.oscSub) voice.oscSub.stop();
                if (voice.vibrato) {
                    voice.vibrato.stop();
                    voice.vibrato.disconnect();
                }
                if (voice.osc1) voice.osc1.disconnect();
                if (voice.osc2) voice.osc2.disconnect();
                if (voice.oscSub) voice.oscSub.disconnect();
                voice.gainNode.disconnect();
            } catch (e) { }
        }, releaseTime * 1000 + 100);
    } catch (e) { }
}

function handleKeyUp(key) {
    if (isLeadKey(key)) {
        const voicesToStop = activeLeadVoices.filter(v => v.key === key || v.key.startsWith(`${key}_harm_`));
        const releaseTime = document.getElementById("korg-knob-release") ? parseFloat(document.getElementById("korg-knob-release").value) : 0.25;

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

    const keyCap = document.getElementById(`key-${key}`);
    if (keyCap) keyCap.classList.remove("active");
}

function stopVoice(voice) {
    try {
        if (voice.gainNode) voice.gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        if (voice.osc1) voice.osc1.stop();
        if (voice.osc2) voice.osc2.stop();
        if (voice.oscSub) voice.oscSub.stop();
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

// ==========================================
// DUAL INSTRUMENT MINI PEDALBOARD CONTROLLERS
// ==========================================

// Lead Pedal Toggles
function toggleLeadDistortion() {
    initAudio();
    appSettings.leadDS1Active = !appSettings.leadDS1Active;
    if (leadDS1DryGain) leadDS1DryGain.gain.setTargetAtTime(appSettings.leadDS1Active ? 0.0 : 1.0, audioCtx.currentTime, 0.01);
    if (leadDS1WetGain) leadDS1WetGain.gain.setTargetAtTime(appSettings.leadDS1Active ? 1.0 : 0.0, audioCtx.currentTime, 0.01);
    syncUIFromSettings();
    saveSettings();
}

function toggleLeadHarmonizer() {
    initAudio();
    appSettings.leadPS6Active = !appSettings.leadPS6Active;
    syncUIFromSettings();
    saveSettings();
}

function toggleLeadDelay() {
    initAudio();
    appSettings.leadDelayActive = !appSettings.leadDelayActive;
    if (leadDelayWetGain) leadDelayWetGain.gain.setTargetAtTime(appSettings.leadDelayActive ? (((appSettings.leadDelayMix || 45) / 100) * 0.7) : 0.0, audioCtx.currentTime, 0.01);
    syncUIFromSettings();
    saveSettings();
}

function toggleLeadReverb() {
    initAudio();
    appSettings.leadReverbActive = !appSettings.leadReverbActive;
    if (leadReverbWetGain) leadReverbWetGain.gain.setTargetAtTime(appSettings.leadReverbActive ? (((appSettings.leadReverbMix || 55) / 100) * 0.8) : 0.0, audioCtx.currentTime, 0.01);
    syncUIFromSettings();
    saveSettings();
}

// Bass Pedal Toggles
function toggleBassDistortion() {
    initAudio();
    appSettings.bassDS1Active = !appSettings.bassDS1Active;
    if (bassDS1DryGain) bassDS1DryGain.gain.setTargetAtTime(appSettings.bassDS1Active ? 0.0 : 1.0, audioCtx.currentTime, 0.01);
    if (bassDS1WetGain) bassDS1WetGain.gain.setTargetAtTime(appSettings.bassDS1Active ? 1.0 : 0.0, audioCtx.currentTime, 0.01);
    syncUIFromSettings();
    saveSettings();
}

function toggleBassHarmonizer() {
    initAudio();
    appSettings.bassPS6Active = !appSettings.bassPS6Active;
    syncUIFromSettings();
    saveSettings();
}

function toggleBassDelay() {
    initAudio();
    appSettings.bassDelayActive = !appSettings.bassDelayActive;
    if (bassDelayWetGain) bassDelayWetGain.gain.setTargetAtTime(appSettings.bassDelayActive ? (((appSettings.bassDelayMix || 35) / 100) * 0.6) : 0.0, audioCtx.currentTime, 0.01);
    syncUIFromSettings();
    saveSettings();
}

function toggleBassReverb() {
    initAudio();
    appSettings.bassReverbActive = !appSettings.bassReverbActive;
    if (bassReverbWetGain) bassReverbWetGain.gain.setTargetAtTime(appSettings.bassReverbActive ? (((appSettings.bassReverbMix || 40) / 100) * 0.6) : 0.0, audioCtx.currentTime, 0.01);
    syncUIFromSettings();
    saveSettings();
}

function disableAllEffects() {
    if (appSettings.leadDS1Active) toggleLeadDistortion();
    if (appSettings.leadPS6Active) toggleLeadHarmonizer();
    if (appSettings.leadDelayActive) toggleLeadDelay();
    if (appSettings.leadReverbActive) toggleLeadReverb();
    if (appSettings.bassDS1Active) toggleBassDistortion();
    if (appSettings.bassPS6Active) toggleBassHarmonizer();
    if (appSettings.bassDelayActive) toggleBassDelay();
    if (appSettings.bassReverbActive) toggleBassReverb();
}

// 1. Lead Mini Pedals Event Wiring
const leadDs1Toggle = document.getElementById("lead-ds1-toggle");
if (leadDs1Toggle) leadDs1Toggle.addEventListener("click", () => toggleLeadDistortion());

const leadDs1Dist = document.getElementById("lead-ds1-dist");
if (leadDs1Dist) leadDs1Dist.addEventListener("input", (e) => {
    const val = parseFloat(e.target.value);
    appSettings.leadDS1Dist = val;
    if (leadDS1DistNode) leadDS1DistNode.curve = makeDistortionCurve(val);
    saveSettings();
});

const leadDs1Tone = document.getElementById("lead-ds1-tone");
if (leadDs1Tone) leadDs1Tone.addEventListener("input", (e) => {
    const val = parseFloat(e.target.value);
    appSettings.leadDS1Tone = val;
    if (leadDS1ToneFilter) leadDS1ToneFilter.frequency.setTargetAtTime(val, audioCtx.currentTime, 0.05);
    saveSettings();
});

const leadDs1Level = document.getElementById("lead-ds1-level");
if (leadDs1Level) leadDs1Level.addEventListener("input", (e) => {
    const val = parseFloat(e.target.value);
    appSettings.leadDS1Level = val;
    if (leadDS1LevelGain) leadDS1LevelGain.gain.setTargetAtTime((val / 100) * 0.8, audioCtx.currentTime, 0.05);
    saveSettings();
});

const leadPs6Toggle = document.getElementById("lead-ps6-toggle");
if (leadPs6Toggle) leadPs6Toggle.addEventListener("click", () => toggleLeadHarmonizer());

const leadPs6Key = document.getElementById("lead-ps6-key");
if (leadPs6Key) leadPs6Key.addEventListener("change", (e) => {
    appSettings.leadPS6Key = e.target.value;
    e.target.blur();
    saveSettings();
});

const leadPs6Scale = document.getElementById("lead-ps6-scale");
if (leadPs6Scale) leadPs6Scale.addEventListener("change", (e) => {
    appSettings.leadPS6Scale = e.target.value;
    e.target.blur();
    saveSettings();
});

const leadPs6Interval = document.getElementById("lead-ps6-interval");
if (leadPs6Interval) leadPs6Interval.addEventListener("change", (e) => {
    appSettings.leadPS6Interval = e.target.value;
    e.target.blur();
    saveSettings();
});

const leadPs6Mix = document.getElementById("lead-ps6-mix");
if (leadPs6Mix) leadPs6Mix.addEventListener("input", (e) => {
    appSettings.leadPS6Mix = parseFloat(e.target.value);
    saveSettings();
});

const leadDelayToggle = document.getElementById("lead-delay-toggle");
if (leadDelayToggle) leadDelayToggle.addEventListener("click", () => toggleLeadDelay());

const leadDelayTime = document.getElementById("lead-delay-time");
if (leadDelayTime) leadDelayTime.addEventListener("input", (e) => {
    const val = parseFloat(e.target.value);
    appSettings.leadDelayTime = val;
    if (leadDelayNode) leadDelayNode.delayTime.setTargetAtTime(val / 1000, audioCtx.currentTime, 0.1);
    saveSettings();
});

const leadDelayFdbk = document.getElementById("lead-delay-fdbk");
if (leadDelayFdbk) leadDelayFdbk.addEventListener("input", (e) => {
    const val = parseFloat(e.target.value);
    appSettings.leadDelayFeedback = val;
    if (leadDelayFeedbackNode) leadDelayFeedbackNode.gain.setTargetAtTime((val / 100) * 0.85, audioCtx.currentTime, 0.05);
    saveSettings();
});

const leadDelayMix = document.getElementById("lead-delay-mix");
if (leadDelayMix) leadDelayMix.addEventListener("input", (e) => {
    const val = parseFloat(e.target.value);
    appSettings.leadDelayMix = val;
    if (leadDelayWetGain && appSettings.leadDelayActive) leadDelayWetGain.gain.setTargetAtTime((val / 100) * 0.7, audioCtx.currentTime, 0.05);
    saveSettings();
});

const leadReverbToggle = document.getElementById("lead-reverb-toggle");
if (leadReverbToggle) leadReverbToggle.addEventListener("click", () => toggleLeadReverb());

const leadReverbMix = document.getElementById("lead-reverb-mix");
if (leadReverbMix) leadReverbMix.addEventListener("input", (e) => {
    const val = parseFloat(e.target.value);
    appSettings.leadReverbMix = val;
    if (leadReverbWetGain && appSettings.leadReverbActive) leadReverbWetGain.gain.setTargetAtTime((val / 100) * 0.8, audioCtx.currentTime, 0.05);
    saveSettings();
});

// 2. Bass Mini Pedals Event Wiring
const bassDs1Toggle = document.getElementById("bass-ds1-toggle");
if (bassDs1Toggle) bassDs1Toggle.addEventListener("click", () => toggleBassDistortion());

const bassDs1Dist = document.getElementById("bass-ds1-dist");
if (bassDs1Dist) bassDs1Dist.addEventListener("input", (e) => {
    const val = parseFloat(e.target.value);
    appSettings.bassDS1Dist = val;
    if (bassDS1DistNode) bassDS1DistNode.curve = makeDistortionCurve(val * 0.8);
    saveSettings();
});

const bassDs1Tone = document.getElementById("bass-ds1-tone");
if (bassDs1Tone) bassDs1Tone.addEventListener("input", (e) => {
    const val = parseFloat(e.target.value);
    appSettings.bassDS1Tone = val;
    if (bassDS1ToneFilter) bassDS1ToneFilter.frequency.setTargetAtTime(val, audioCtx.currentTime, 0.05);
    saveSettings();
});

const bassDs1Level = document.getElementById("bass-ds1-level");
if (bassDs1Level) bassDs1Level.addEventListener("input", (e) => {
    const val = parseFloat(e.target.value);
    appSettings.bassDS1Level = val;
    if (bassDS1LevelGain) bassDS1LevelGain.gain.setTargetAtTime((val / 100) * 0.85, audioCtx.currentTime, 0.05);
    saveSettings();
});

const bassPs6Toggle = document.getElementById("bass-ps6-toggle");
if (bassPs6Toggle) bassPs6Toggle.addEventListener("click", () => toggleBassHarmonizer());

const bassPs6Key = document.getElementById("bass-ps6-key");
if (bassPs6Key) bassPs6Key.addEventListener("change", (e) => {
    appSettings.bassPS6Key = e.target.value;
    e.target.blur();
    saveSettings();
});

const bassPs6Scale = document.getElementById("bass-ps6-scale");
if (bassPs6Scale) bassPs6Scale.addEventListener("change", (e) => {
    appSettings.bassPS6Scale = e.target.value;
    e.target.blur();
    saveSettings();
});

const bassPs6Interval = document.getElementById("bass-ps6-interval");
if (bassPs6Interval) bassPs6Interval.addEventListener("change", (e) => {
    appSettings.bassPS6Interval = e.target.value;
    e.target.blur();
    saveSettings();
});

const bassPs6Mix = document.getElementById("bass-ps6-mix");
if (bassPs6Mix) bassPs6Mix.addEventListener("input", (e) => {
    appSettings.bassPS6Mix = parseFloat(e.target.value);
    saveSettings();
});

const bassDelayToggle = document.getElementById("bass-delay-toggle");
if (bassDelayToggle) bassDelayToggle.addEventListener("click", () => toggleBassDelay());

const bassDelayTime = document.getElementById("bass-delay-time");
if (bassDelayTime) bassDelayTime.addEventListener("input", (e) => {
    const val = parseFloat(e.target.value);
    appSettings.bassDelayTime = val;
    if (bassDelayNode) bassDelayNode.delayTime.setTargetAtTime(val / 1000, audioCtx.currentTime, 0.1);
    saveSettings();
});

const bassDelayFdbk = document.getElementById("bass-delay-fdbk");
if (bassDelayFdbk) bassDelayFdbk.addEventListener("input", (e) => {
    const val = parseFloat(e.target.value);
    appSettings.bassDelayFeedback = val;
    if (bassDelayFeedbackNode) bassDelayFeedbackNode.gain.setTargetAtTime((val / 100) * 0.75, audioCtx.currentTime, 0.05);
    saveSettings();
});

const bassDelayMix = document.getElementById("bass-delay-mix");
if (bassDelayMix) bassDelayMix.addEventListener("input", (e) => {
    const val = parseFloat(e.target.value);
    appSettings.bassDelayMix = val;
    if (bassDelayWetGain && appSettings.bassDelayActive) bassDelayWetGain.gain.setTargetAtTime((val / 100) * 0.6, audioCtx.currentTime, 0.05);
    saveSettings();
});

const bassReverbToggle = document.getElementById("bass-reverb-toggle");
if (bassReverbToggle) bassReverbToggle.addEventListener("click", () => toggleBassReverb());

const bassReverbMix = document.getElementById("bass-reverb-mix");
if (bassReverbMix) bassReverbMix.addEventListener("input", (e) => {
    const val = parseFloat(e.target.value);
    appSettings.bassReverbMix = val;
    if (bassReverbWetGain && appSettings.bassReverbActive) bassReverbWetGain.gain.setTargetAtTime((val / 100) * 0.6, audioCtx.currentTime, 0.05);
    saveSettings();
});

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

// Global click audio activator
window.addEventListener("click", () => {
    initAudio();
    if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume();
    }
    scanGamepads();
});

// Initialize on page load
loadSettings();
initLeadControls();
updateKeybindLabels();
updateLeadOctaveIndicators();
updateBassOctaveIndicators();
buildVirtualKeyboard();
syncUIFromSettings();

