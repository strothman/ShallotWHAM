/**
 * ShallotWHAM Sound Module Standards Validator (SWM v2.0)
 * Validates all .swm files against the official specification.
 *
 * Usage:
 *   node scripts/validate-modules.js
 */

const fs = require('fs');
const path = require('path');

const MODULES_DIR = path.join(__dirname, '..', 'modules');

const VALID_WAVEFORMS = ['sawtooth', 'square', 'triangle', 'sine'];
const VALID_FILTERS = ['lowpass', 'bandpass', 'highpass', 'notch'];
const VALID_CARTRIDGES = {
    0: ['ds1', 'proco-rat', 'big-muff', 'tube-screamer', 'french-preamp', 'decimator'],
    1: ['small-stone', 'dimension-chorus', 'flanger', 'optical-tremolo', 'ring-mod'],
    2: ['ps6', 'sidechain-pumper', 'mutron-wah', 'formant-filter', 'sid-resonator'],
    3: ['space-echo', 'ping-pong', 'analog-delay', 'delay', 'glitch-delay'],
    4: ['cathedral-reverb', 'gated-plate', 'spring-reverb', 'reverb', 'cosmic-shimmer']
};

function validateModuleFile(filePath) {
    const fileName = path.basename(filePath);
    const errors = [];
    const warnings = [];

    let data;
    try {
        const raw = fs.readFileSync(filePath, 'utf8');
        data = JSON.parse(raw);
    } catch (err) {
        return { fileName, ok: false, errors: [`JSON parse error: ${err.message}`], warnings: [] };
    }

    // 1. Metadata Checks
    if (!data.id || typeof data.id !== 'string') errors.push("Missing or invalid 'id'");
    if (!data.name || typeof data.name !== 'string') errors.push("Missing or invalid 'name'");
    if (data.name && data.name.length > 24) warnings.push(`'name' is long (${data.name.length} chars)`);
    if (!data.author) warnings.push("Missing 'author'");
    if (!data.themeGlow || !data.themeGlow.startsWith('#')) warnings.push("Missing or invalid 'themeGlow' hex color");

    // 2. Leads Array Check
    if (!Array.isArray(data.leads) || data.leads.length !== 8) {
        errors.push(`Expected exactly 8 leads, got ${Array.isArray(data.leads) ? data.leads.length : 'none'}`);
    } else {
        data.leads.forEach((lead, idx) => {
            const prefix = `Lead #${idx + 1} (${lead.name || 'unnamed'})`;
            if (!lead.name) errors.push(`${prefix}: missing 'name'`);
            if (!lead.label) errors.push(`${prefix}: missing 'label'`);
            else if (lead.label.length > 12) warnings.push(`${prefix}: label '${lead.label}' exceeds 12 chars`);

            if (!VALID_WAVEFORMS.includes(lead.osc1)) errors.push(`${prefix}: invalid osc1 '${lead.osc1}'`);
            if (!VALID_WAVEFORMS.includes(lead.osc2)) errors.push(`${prefix}: invalid osc2 '${lead.osc2}'`);

            if (lead.cutoff === undefined || lead.cutoff < 50 || lead.cutoff > 20000) {
                errors.push(`${prefix}: cutoff (${lead.cutoff}) out of audio range [50, 20000]`);
            }
            if (lead.reso === undefined || lead.reso < 0.1 || lead.reso > 20) {
                errors.push(`${prefix}: resonance (${lead.reso}) out of safe range [0.1, 20]`);
            }
            if (lead.attack === undefined || lead.attack <= 0) {
                errors.push(`${prefix}: invalid attack time (${lead.attack})`);
            }
            if (lead.release === undefined || lead.release <= 0) {
                errors.push(`${prefix}: invalid release time (${lead.release})`);
            }
            if (lead.volume !== undefined && (lead.volume < 0.3 || lead.volume > 1.2)) {
                warnings.push(`${prefix}: volume (${lead.volume}) outside recommended normalized range [0.4, 1.0]`);
            }
        });
    }

    // 3. Basses Array Check
    if (!Array.isArray(data.basses) || data.basses.length !== 8) {
        errors.push(`Expected exactly 8 basses, got ${Array.isArray(data.basses) ? data.basses.length : 'none'}`);
    } else {
        data.basses.forEach((bass, idx) => {
            const prefix = `Bass #${idx + 1} (${bass.name || 'unnamed'})`;
            if (!bass.name) errors.push(`${prefix}: missing 'name'`);
            if (!bass.label) errors.push(`${prefix}: missing 'label'`);
            else if (bass.label.length > 12) warnings.push(`${prefix}: label '${bass.label}' exceeds 12 chars`);

            if (!VALID_WAVEFORMS.includes(bass.oscType)) errors.push(`${prefix}: invalid oscType '${bass.oscType}'`);
            if (bass.subType && !VALID_WAVEFORMS.includes(bass.subType)) errors.push(`${prefix}: invalid subType '${bass.subType}'`);

            if (bass.cutoff === undefined || bass.cutoff < 40 || bass.cutoff > 16000) {
                errors.push(`${prefix}: cutoff (${bass.cutoff}) out of audio range [40, 16000]`);
            }
            if (bass.reso === undefined || bass.reso < 0.1 || bass.reso > 20) {
                errors.push(`${prefix}: resonance (${bass.reso}) out of safe range [0.1, 20]`);
            }
            if (bass.decay === undefined || bass.decay <= 0) {
                errors.push(`${prefix}: invalid decay time (${bass.decay})`);
            }
            if (bass.volume !== undefined && (bass.volume < 0.3 || bass.volume > 1.2)) {
                warnings.push(`${prefix}: volume (${bass.volume}) outside recommended normalized range [0.5, 1.0]`);
            }
        });
    }

    // 4. Pedalboard Check
    if (!data.pedalboard || typeof data.pedalboard !== 'object') {
        warnings.push("Missing 'pedalboard' configuration object");
    } else {
        ['lead', 'bass'].forEach(instrument => {
            const chain = data.pedalboard[instrument];
            if (!Array.isArray(chain) || chain.length !== 5) {
                warnings.push(`Pedalboard.${instrument} should have 5 slot configurations`);
            } else {
                let hasActivePedal = false;
                chain.forEach((slot, sIdx) => {
                    const validList = VALID_CARTRIDGES[sIdx] || [];
                    if (!validList.includes(slot.cartridge)) {
                        errors.push(`Pedalboard.${instrument}[${sIdx}] cartridge '${slot.cartridge}' not valid for chassis ${sIdx}`);
                    }
                    if (slot.active) hasActivePedal = true;
                });
                if (!hasActivePedal) {
                    warnings.push(`Pedalboard.${instrument} has 0 active signature pedals; recommend activating 1-2 pedals for character`);
                }
            }
        });
    }

    return {
        fileName,
        name: data.name || 'UNKNOWN',
        ok: errors.length === 0,
        errors,
        warnings
    };
}

function runValidation() {
    if (!fs.existsSync(MODULES_DIR)) {
        console.error(`❌ Modules directory not found: ${MODULES_DIR}`);
        process.exit(1);
    }

    const files = fs.readdirSync(MODULES_DIR).filter(f => f.endsWith('.swm'));
    console.log(`\n======================================================`);
    console.log(`🔍 ShallotWHAM Sound Module Validator (SWM v2.0)`);
    console.log(`Checking ${files.length} sound bank modules in ${MODULES_DIR}...`);
    console.log(`======================================================\n`);

    let totalErrors = 0;
    let totalWarnings = 0;

    files.forEach(f => {
        const res = validateModuleFile(path.join(MODULES_DIR, f));
        if (res.ok) {
            console.log(`✅ ${res.fileName.padEnd(28)} : PASS [${res.name}]`);
            if (res.warnings.length > 0) {
                res.warnings.forEach(w => console.log(`   ⚠️  WARNING: ${w}`));
                totalWarnings += res.warnings.length;
            }
        } else {
            console.log(`❌ ${res.fileName.padEnd(28)} : FAIL [${res.name}]`);
            res.errors.forEach(e => console.log(`   ⛔ ERROR: ${e}`));
            res.warnings.forEach(w => console.log(`   ⚠️  WARNING: ${w}`));
            totalErrors += res.errors.length;
            totalWarnings += res.warnings.length;
        }
    });

    console.log(`\n------------------------------------------------------`);
    console.log(`Summary: ${files.length} modules checked | ${totalErrors} errors | ${totalWarnings} warnings`);
    if (totalErrors === 0) {
        console.log(`🎉 ALL MODULES COMPLIANT WITH SWM v2.0 STANDARDS!\n`);
        return true;
    } else {
        console.log(`💥 MODULE STANDARDS VALIDATION FAILED WITH ${totalErrors} ERRORS!\n`);
        return false;
    }
}

if (require.main === module) {
    const success = runValidation();
    if (!success) process.exit(1);
}

module.exports = { validateModuleFile, runValidation };
