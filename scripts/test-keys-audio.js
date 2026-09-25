const fs = require('fs');
const vm = require('vm');
const path = require('path');

let code = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');

const dummyEl = {
    value: 'G',
    addEventListener: () => {},
    appendChild: () => {},
    classList: { add: () => {}, remove: () => {}, contains: () => false, toggle: () => {} },
    textContent: '',
    innerHTML: '',
    getContext: () => ({ fillRect: () => {}, beginPath: () => {}, moveTo: () => {}, lineTo: () => {}, stroke: () => {} }),
    parentElement: { clientWidth: 800, clientHeight: 200 },
    style: { setProperty: () => {}, display: '', color: '' },
    blur: () => {}
};

const globalScope = {
    console: console,
    window: {},
    setInterval: () => {},
    clearInterval: () => {},
    setTimeout: (fn) => { fn(); },
    clearTimeout: () => {},
    requestAnimationFrame: () => {},
    document: {
        getElementById: () => dummyEl,
        querySelectorAll: () => [],
        createElement: () => dummyEl,
        body: dummyEl
    },
    localStorage: { getItem: () => null, setItem: () => {} },
    navigator: {},
    AudioContext: function() {
        this.currentTime = 0;
        this.sampleRate = 44100;
        this.state = 'running';
        this.destination = {};
        this.createGain = () => ({
            gain: { value: 1, setValueAtTime: () => {}, setTargetAtTime: () => {}, linearRampToValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, cancelScheduledValues: () => {} },
            connect: () => {},
            disconnect: () => {}
        });
        this.createAnalyser = () => ({ fftSize: 512, frequencyBinCount: 256, getByteTimeDomainData: () => {}, connect: () => {}, disconnect: () => {} });
        this.createDynamicsCompressor = () => ({
            threshold: { setValueAtTime: () => {} },
            knee: { setValueAtTime: () => {} },
            ratio: { setValueAtTime: () => {} },
            attack: { setValueAtTime: () => {} },
            release: { setValueAtTime: () => {} },
            connect: () => {}
        });
        this.createOscillator = () => ({
            frequency: { setValueAtTime: () => {}, setTargetAtTime: () => {}, linearRampToValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
            connect: () => {},
            disconnect: () => {},
            start: () => {},
            stop: () => {}
        });
        this.createBiquadFilter = () => ({
            frequency: { setValueAtTime: () => {}, setTargetAtTime: () => {}, linearRampToValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
            Q: { setValueAtTime: () => {} },
            gain: { setValueAtTime: () => {} },
            connect: () => {},
            disconnect: () => {}
        });
        this.createBuffer = (c, l, r) => ({ getChannelData: () => new Float32Array(l) });
        this.createBufferSource = () => ({ buffer: null, loop: false, connect: () => {}, disconnect: () => {}, start: () => {}, stop: () => {} });
        this.createWaveShaper = () => ({ curve: null, oversample: 'none', connect: () => {}, disconnect: () => {} });
        this.createConvolver = () => ({ buffer: null, connect: () => {}, disconnect: () => {} });
        this.createDelay = () => ({ delayTime: { setValueAtTime: () => {} }, connect: () => {}, disconnect: () => {} });
        this.createStereoPanner = () => ({ pan: { setValueAtTime: () => {} }, connect: () => {}, disconnect: () => {} });
        this.resume = () => Promise.resolve();
    }
};
globalScope.window = globalScope;
globalScope.window.AudioContext = globalScope.AudioContext;
globalScope.window.addEventListener = () => {};

console.log("Evaluating app.js...");
const ctx = vm.createContext(globalScope);
vm.runInContext(code, ctx);

vm.runInContext(`
    this.getAudioCtx = () => audioCtx;
    this.getLeadBus = () => leadVoiceBus;
    this.getBassBus = () => bassVoiceBus;
    this.getMasterGain = () => masterGain;
    this.getActiveLead = () => activeLeadVoices;
    this.getActiveBass = () => activeBassVoices;
`, ctx);

console.log("Initializing audio engine...");
ctx.initAudio();

if (!ctx.getAudioCtx()) throw new Error("audioCtx was not created");
if (!ctx.getLeadBus()) throw new Error("leadVoiceBus was not created");
if (!ctx.getBassBus()) throw new Error("bassVoiceBus was not created");
if (!ctx.getMasterGain()) throw new Error("masterGain was not created");

// Test all 4 keyboard rows
const testKeys = [
    { code: "Digit1", type: "lead", row: 0 },
    { code: "KeyQ", type: "lead", row: 1 },
    { code: "KeyA", type: "bass", row: 2 },
    { code: "KeyZ", type: "bass", row: 3 }
];

testKeys.forEach(({ code, type, row }) => {
    console.log(`Testing note trigger: ${code} (${type} row ${row})...`);
    ctx.handleKeyDown(code);
    const activeVoices = type === "lead" ? ctx.getActiveLead() : ctx.getActiveBass();
    const voice = activeVoices.find(v => v.key === code);
    if (!voice) throw new Error(`Voice for ${code} was not spawned in active${type === 'lead' ? 'Lead' : 'Bass'}Voices`);
    console.log(`  -> Spawned ${type} voice at ${Math.round(voice.baseFreq)}Hz`);
    
    ctx.handleKeyUp(code);
    const activeAfter = (type === "lead" ? ctx.getActiveLead() : ctx.getActiveBass()).find(v => v.key === code);
    if (activeAfter) throw new Error(`Voice for ${code} was not removed after handleKeyUp`);
    console.log(`  -> Released ${type} voice cleanly`);
});

console.log("✅ All 4 rows (Lead & Bass) voice synthesis and key triggers validated successfully!");
