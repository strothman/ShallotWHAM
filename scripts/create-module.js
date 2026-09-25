/**
 * ShallotWHAM Sound Module Generator & Validator (SWM v2.0)
 * Usage:
 *   node scripts/create-module.js --validate
 *   node scripts/create-module.js --scaffold <module-id>
 */

const fs = require('fs');
const path = require('path');
const { validateModuleFile, runValidation } = require('./validate-modules');

const MODULES_DIR = path.join(__dirname, '..', 'modules');

function createModuleTemplate(id, name) {
    const cleanId = id.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const cleanName = (name || cleanId.replace(/-/g, ' ')).toUpperCase();

    const template = {
        format: "ShallotWHAM-Module",
        version: "2.0.0",
        id: cleanId,
        name: cleanName,
        subtitle: "Studio Sound Module",
        author: "Shallot",
        category: "Electronic",
        description: `Sound module for ShallotWHAM workstation with 8 signature leads and 8 punchy basslines.`,
        themeGlow: "#00e5ff",
        tags: ["shallotwham", "synth", cleanId],
        leads: Array.from({ length: 8 }).map((_, i) => ({
            name: `${cleanName} LEAD ${i + 1}`,
            label: `LEAD ${i + 1}`,
            osc1: i % 2 === 0 ? "sawtooth" : "square",
            osc2: i % 2 === 0 ? "sawtooth" : "triangle",
            osc2Octave: 0,
            osc2Detune: 1.006,
            oscMix: 0.5,
            noiseMix: 0.0,
            filterType: "lowpass",
            cutoff: 3500,
            reso: 2.0,
            filterEnv: { attack: 0.01, decay: 0.25, sustain: 0.4, amount: 2500 },
            attack: 0.01,
            decay: 0.3,
            sustain: 0.7,
            release: 0.25,
            volume: 0.8
        })),
        basses: Array.from({ length: 8 }).map((_, i) => ({
            name: `${cleanName} BASS ${i + 1}`,
            label: `BASS ${i + 1}`,
            oscType: i % 2 === 0 ? "sawtooth" : "square",
            subType: "sine",
            subOctave: -1,
            subMix: 0.55,
            cutoff: 1400,
            reso: 4.5,
            envMod: 2200,
            decay: 0.28,
            attack: 0.005,
            volume: 0.85
        })),
        pedalboard: {
            lead: [
                { slot: 0, cartridge: "french-preamp", active: false, params: { drive: 30, warmth: 60, output: 70 } },
                { slot: 1, cartridge: "dimension-chorus", active: true, params: { mode: 3, width: 75, mix: 50 } },
                { slot: 2, cartridge: "ps6", active: false, params: { key: "C", scale: "major", interval: "3rd", mix: 50 } },
                { slot: 3, cartridge: "space-echo", active: true, params: { time: 340, intensity: 40, flutter: 30, mix: 40 } },
                { slot: 4, cartridge: "reverb", active: false, params: { decay: 2.2, mix: 45 } }
            ],
            bass: [
                { slot: 0, cartridge: "ds1", active: true, params: { dist: 35, tone: 1200, level: 70 } },
                { slot: 1, cartridge: "dimension-chorus", active: false, params: { mode: 2, width: 60, mix: 40 } },
                { slot: 2, cartridge: "sidechain-pumper", active: true, params: { depth: 70, rate: 4, release: 0.3 } },
                { slot: 3, cartridge: "analog-delay", active: false, params: { time: 240, feedback: 25, mix: 30 } },
                { slot: 4, cartridge: "reverb", active: false, params: { decay: 1.8, mix: 35 } }
            ]
        }
    };

    const outPath = path.join(MODULES_DIR, `${cleanId}.swm`);
    if (fs.existsSync(outPath)) {
        console.error(`❌ Module file already exists: ${outPath}`);
        return false;
    }
    fs.writeFileSync(outPath, JSON.stringify(template, null, 2), 'utf8');
    console.log(`✨ Scaffolded SWM v2.0 module: ${outPath}`);
    validateModuleFile(outPath);
    return true;
}

const args = process.argv.slice(2);
if (args.includes('--validate') || args.length === 0) {
    runValidation();
} else if (args.includes('--scaffold')) {
    const idx = args.indexOf('--scaffold');
    const id = args[idx + 1];
    if (!id) {
        console.error("Usage: node scripts/create-module.js --scaffold <module-id>");
        process.exit(1);
    }
    createModuleTemplate(id, args[idx + 2]);
} else {
    console.log("Usage:\n  node scripts/create-module.js --validate\n  node scripts/create-module.js --scaffold <module-id>");
}
