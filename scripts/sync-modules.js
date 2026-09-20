const fs = require('fs');
const path = require('path');

const modulesDir = path.join(__dirname, '..', 'modules');
const appJsPath = path.join(__dirname, '..', 'app.js');

const files = fs.readdirSync(modulesDir).filter(f => f.endsWith('.swm'));
const library = {};

files.forEach(f => {
    const raw = fs.readFileSync(path.join(modulesDir, f), 'utf8');
    const mod = JSON.parse(raw);
    library[mod.id] = mod;
});

console.log(`Loaded ${Object.keys(library).length} modules from ${modulesDir}:`, Object.keys(library));

const appJs = fs.readFileSync(appJsPath, 'utf8');
const startMarker = '// PROPRIETARY SOUND MODULE LIBRARY & 5-SLOT ARCHITECTURE';
const endMarker = 'const DEFAULT_SLOT_MODULE_KEYS =';

const startIndex = appJs.indexOf(startMarker);
const endIndex = appJs.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find markers in app.js!");
    process.exit(1);
}

const replacement = `// PROPRIETARY SOUND MODULE LIBRARY & 5-SLOT ARCHITECTURE
// ====================================================
const MODULE_LIBRARY = ${JSON.stringify(library, null, 4)};

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

`;

const newAppJs = appJs.slice(0, startIndex) + replacement + appJs.slice(endIndex);
fs.writeFileSync(appJsPath, newAppJs, 'utf8');
console.log("Successfully updated MODULE_LIBRARY and registration system in app.js!");
