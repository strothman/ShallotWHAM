/**
 * Mock Web Audio Context to unit-test all 26 DSP cartridge branches
 */
function createMockAudioContext() {
    class MockAudioParam {
        constructor(val = 0) { this.value = val; }
        setValueAtTime(v) { this.value = v; }
        setTargetAtTime(v) { this.value = v; }
        exponentialRampToValueAtTime(v) { this.value = v; }
        linearRampToValueAtTime(v) { this.value = v; }
        cancelScheduledValues() {}
    }
    class MockAudioNode {
        constructor() {
            this.gain = new MockAudioParam(1);
            this.frequency = new MockAudioParam(440);
            this.Q = new MockAudioParam(1);
            this.delayTime = new MockAudioParam(0.1);
        }
        connect(target) { return target; }
        disconnect() {}
        start() {}
        stop() {}
    }

    return {
        currentTime: 0,
        sampleRate: 44100,
        destination: new MockAudioNode(),
        createGain: () => new MockAudioNode(),
        createBiquadFilter: () => new MockAudioNode(),
        createDelay: () => new MockAudioNode(),
        createConvolver: () => new MockAudioNode(),
        createWaveShaper: () => {
            const ws = new MockAudioNode();
            ws.curve = null;
            return ws;
        },
        createOscillator: () => new MockAudioNode(),
        createBuffer: (channels, length, sampleRate) => ({
            getChannelData: () => new Float32Array(length)
        })
    };
}

global.makeDistortionCurve = function(k) { return new Float32Array(44100); };
global.createReverbImpulse = function(ctx, dur, decay) { return ctx.createBuffer(2, 44100, 44100); };
global.createBitcrusherNode = function(ctx) {
    return {
        input: ctx.createGain(),
        output: ctx.createGain(),
        connect: function(dest) { return dest; },
        disconnect: function() {},
        setBits: function() {},
        setCrush: function() {}
    };
};

const { CARTRIDGE_CATALOG, createPedalDSP } = require('./modular-pedal-engine.js');
const mockCtx = createMockAudioContext();

console.log("Beginning unit tests for all 26 cartridges...\n");
let passed = 0;
let failed = 0;

Object.keys(CARTRIDGE_CATALOG).forEach(cartId => {
    try {
        const dsp = createPedalDSP(cartId, {}, mockCtx);
        if (!dsp || !dsp.inputNode || !dsp.outputNode || typeof dsp.updateParam !== 'function' || typeof dsp.cleanup !== 'function') {
            console.error(`❌ Cartridge ${cartId}: Missing required interface methods!`);
            failed++;
            return;
        }

        // Test updating each knob param
        CARTRIDGE_CATALOG[cartId].knobs.forEach(knob => {
            dsp.updateParam(knob.id, knob.default);
        });

        // Test cleanup
        dsp.cleanup();

        passed++;
        console.log(`✅ Cartridge [${cartId}] instantiated, param-updated, and cleaned up successfully!`);
    } catch (err) {
        console.error(`❌ Cartridge [${cartId}] failed with exception:`, err);
        failed++;
    }
});

console.log(`\nResults: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
