/**
 * ShallotWHAM Sound Module Generator & Validator (.swm)
 * Usage:
 *   node scripts/create-module.js --validate
 */

const fs = require('fs');
const path = require('path');

const MODULES_DIR = path.join(__dirname, '..', 'modules');

function validateModule(filePath) {
    try {
        const raw = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(raw);
        const issues = [];

        if (!data.name) issues.push("Missing 'name'");
        if (!data.id) issues.push("Missing 'id'");
        if (!data.leads || !Array.isArray(data.leads)) issues.push("Missing 'leads' array");
        else if (data.leads.length !== 8) issues.push(`Expected 8 leads, got ${data.leads.length}`);
        if (!data.basses || !Array.isArray(data.basses)) issues.push("Missing 'basses' array");
        else if (data.basses.length !== 8) issues.push(`Expected 8 basses, got ${data.basses.length}`);

        if (issues.length > 0) {
            console.error(`❌ ${path.basename(filePath)}: FAIL - ${issues.join(', ')}`);
            return false;
        }
        console.log(`✅ ${path.basename(filePath)}: OK (${data.name}) - 8 Leads, 8 Basses`);
        return true;
    } catch (err) {
        console.error(`❌ ${path.basename(filePath)}: JSON parse error - ${err.message}`);
        return false;
    }
}

function validateAll() {
    if (!fs.existsSync(MODULES_DIR)) {
        console.error(`Directory not found: ${MODULES_DIR}`);
        return;
    }
    const files = fs.readdirSync(MODULES_DIR).filter(f => f.endsWith('.swm'));
    console.log(`Found ${files.length} module files in ${MODULES_DIR}\n`);
    let allValid = true;
    files.forEach(f => {
        const valid = validateModule(path.join(MODULES_DIR, f));
        if (!valid) allValid = false;
    });
    console.log(`\nResult: ${allValid ? "ALL MODULES VALID! ✨" : "SOME MODULES FAILED VALIDATION"}`);
}

const args = process.argv.slice(2);
if (args.includes('--validate') || args.length === 0) {
    validateAll();
} else {
    console.log("Usage: node scripts/create-module.js --validate");
}
