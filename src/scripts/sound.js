// The garden's sound, generated with the Web Audio API: no audio files.
// Sound is off by default. A saved "on" waits for the first click or key press on each page,
// so nothing ever plays on load.

const AudioCtx = window.AudioContext || window.webkitAudioContext;
const button = document.querySelector('.sound');
const root = document.documentElement;
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

// Same rule as the Light / Dark switch: a saved choice wins, otherwise the system setting
const isDark = () => (root.dataset.theme ?? (systemDark.matches ? 'dark' : 'light')) === 'dark';

let ctx;
let master; // the garden, faded in and out
let effects; // doors and clicks, at the garden's full level
let timer;
let on = false; // the choice, as the button shows it
let playing = false; // whether the garden plays on this page

function noise(seconds, brown) {
	const length = Math.floor(ctx.sampleRate * seconds);
	const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
	const data = buffer.getChannelData(0);
	let last = 0;
	for (let i = 0; i < length; i++) {
		const white = Math.random() * 2 - 1;
		if (brown) {
			last = (last + 0.02 * white) / 1.02;
			data[i] = last * 3.5;
		} else {
			data[i] = white;
		}
	}
	return buffer;
}

// Brown noise through a slowly drifting band-pass, swelling and falling like wind
function breeze() {
	const source = ctx.createBufferSource();
	source.buffer = noise(6, true);
	source.loop = true;

	const band = ctx.createBiquadFilter();
	band.type = 'bandpass';
	band.frequency.value = 500;
	band.Q.value = 0.6;

	const gain = ctx.createGain();
	gain.gain.value = 0.35;

	const swell = ctx.createOscillator();
	swell.frequency.value = 0.09;
	const swellDepth = ctx.createGain();
	swellDepth.gain.value = 0.2;
	swell.connect(swellDepth).connect(gain.gain);

	const drift = ctx.createOscillator();
	drift.frequency.value = 0.05;
	const driftDepth = ctx.createGain();
	driftDepth.gain.value = 250;
	drift.connect(driftDepth).connect(band.frequency);

	source.connect(band).connect(gain).connect(master);
	source.start();
	swell.start();
	drift.start();
}

// One short gliding note, into the garden unless told otherwise
function tone(type, from, to, start, duration, volume, pan, bus = master) {
	const oscillator = ctx.createOscillator();
	const gain = ctx.createGain();
	oscillator.type = type;
	oscillator.frequency.setValueAtTime(from, start);
	oscillator.frequency.exponentialRampToValueAtTime(to, start + duration);
	gain.gain.setValueAtTime(0, start);
	gain.gain.linearRampToValueAtTime(volume, start + 0.008);
	gain.gain.exponentialRampToValueAtTime(0.0005, start + duration);

	let out = oscillator.connect(gain);
	if (ctx.createStereoPanner) {
		const panner = ctx.createStereoPanner();
		panner.pan.value = pan;
		out = out.connect(panner);
	}
	out.connect(bus);
	oscillator.start(start);
	oscillator.stop(start + duration + 0.02);
}

// Two to five quick chirps, somewhere to the left or right
function bird() {
	const t = ctx.currentTime;
	const count = 2 + Math.floor(Math.random() * 4);
	const base = 2600 + Math.random() * 1400;
	const pan = Math.random() * 1.6 - 0.8;
	for (let i = 0; i < count; i++) {
		const start = t + i * (0.09 + Math.random() * 0.05);
		tone('sine', base, base * 1.35, start, 0.05, 0.035, pan);
		tone('sine', base * 1.3, base * 0.85, start + 0.045, 0.05, 0.025, pan);
	}
}

// Two trills of four pulses
function cricket() {
	const t = ctx.currentTime;
	const pan = Math.random() * 1.6 - 0.8;
	for (let trill = 0; trill < 2; trill++) {
		for (let i = 0; i < 4; i++) tone('sine', 4300, 4250, t + trill * 0.35 + i * 0.045, 0.03, 0.02, pan);
	}
}

// Birds by day, crickets by night
function critter() {
	if (playing) isDark() ? cricket() : bird();
}

// The next critter in a few seconds; crickets come more often. Nothing while the tab is hidden
function schedule() {
	clearTimeout(timer);
	if (!playing || document.hidden) return;
	timer = setTimeout(() => {
		critter();
		schedule();
	}, (isDark() ? 1200 : 2500) + Math.random() * 4000);
}

function setup() {
	if (ctx) return;
	ctx = new AudioCtx();
	master = ctx.createGain();
	master.gain.value = 0;
	master.connect(ctx.destination);
	effects = ctx.createGain();
	effects.gain.value = 0.6;
	effects.connect(ctx.destination);
	breeze();
	// Once the garden runs, stop waiting for a press
	ctx.addEventListener('statechange', () => {
		if (ctx.state === 'running' && playing) stopWaiting();
	});
}

function fadeIn() {
	setup();
	ctx.resume();
	playing = true;
	if (ctx.state === 'running') stopWaiting();
	master.gain.setTargetAtTime(0.6, ctx.currentTime, 0.6);
	setTimeout(critter, 800);
	schedule();
}

function fadeOut() {
	playing = false;
	clearTimeout(timer);
	if (ctx) master.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
}

// A short knock of noise: the latch
function latch(at, frequency) {
	const source = ctx.createBufferSource();
	source.buffer = noise(0.06, false);
	const band = ctx.createBiquadFilter();
	band.type = 'bandpass';
	band.frequency.value = frequency;
	band.Q.value = 4;
	const gain = ctx.createGain();
	gain.gain.setValueAtTime(0.6, at);
	gain.gain.exponentialRampToValueAtTime(0.001, at + 0.05);
	source.connect(band).connect(gain).connect(effects);
	source.start(at);
}

// A sawtooth that rises and falls through a narrow, opening filter, fluttering 21 times a second
function creak(at, length) {
	const oscillator = ctx.createOscillator();
	oscillator.type = 'sawtooth';
	oscillator.frequency.setValueAtTime(70, at);
	oscillator.frequency.linearRampToValueAtTime(118, at + length * 0.6);
	oscillator.frequency.linearRampToValueAtTime(92, at + length);

	const band = ctx.createBiquadFilter();
	band.type = 'bandpass';
	band.Q.value = 9;
	band.frequency.setValueAtTime(650, at);
	band.frequency.linearRampToValueAtTime(1200, at + length);

	const flutter = ctx.createOscillator();
	flutter.frequency.value = 21;
	const flutterDepth = ctx.createGain();
	flutterDepth.gain.value = 0.5;

	const gain = ctx.createGain();
	gain.gain.setValueAtTime(0, at);
	gain.gain.linearRampToValueAtTime(0.13, at + 0.06);
	gain.gain.linearRampToValueAtTime(0, at + length);

	flutter.connect(flutterDepth).connect(gain.gain);
	oscillator.connect(band).connect(gain).connect(effects);
	oscillator.start(at);
	oscillator.stop(at + length + 0.05);
	flutter.start(at);
	flutter.stop(at + length + 0.05);
}

// Low noise, quickly gone: the door meets its frame
function thud(at) {
	const source = ctx.createBufferSource();
	source.buffer = noise(0.25, false);
	const low = ctx.createBiquadFilter();
	low.type = 'lowpass';
	low.frequency.value = 180;
	const gain = ctx.createGain();
	gain.gain.setValueAtTime(1.2, at);
	gain.gain.exponentialRampToValueAtTime(0.001, at + 0.2);
	source.connect(low).connect(gain).connect(effects);
	source.start(at);
}

// A door opens: the latch gives, then the hinge creaks as it swings (like the door: a 0.12s nudge,
// then the swing). Only while the garden plays; the page changes before the creak ends
export function doorOpen() {
	if (!playing) return;
	const t = ctx.currentTime;
	latch(t, 2400);
	creak(t + 0.12, 0.75);
}

// The design's closing sequence, 0.28s earlier, so the thud lands as the door meets its frame (0.5s)
function closeSounds() {
	const t = ctx.currentTime;
	creak(t + 0.02, 0.4);
	thud(t + 0.5);
	latch(t + 0.52, 1800);
}

// A door closes on the way back. This can come before any press on the page:
// play only if the browser already lets the audio run, otherwise stay silent
export function doorClose() {
	if (!on) return;
	if (!ctx) {
		if (navigator.getAutoplayPolicy?.('audiocontext') === 'disallowed') return;
		setup();
	}
	if (ctx.state === 'running') return closeSounds();
	// Still starting, or back from the back-forward cache: play only if it runs within a moment
	const moment = new Promise((resolve) => setTimeout(resolve, 150));
	Promise.race([ctx.resume(), moment])
		.then(() => {
			if (ctx.state === 'running') closeSounds();
		})
		.catch(() => {});
}

// A soft click for Flip, Flip back and the menu button
export function click() {
	if (playing) tone('triangle', 880, 520, ctx.currentTime, 0.1, 0.1, 0, effects);
}

function setOn(next) {
	on = next;
	button.setAttribute('aria-pressed', String(on));
	try {
		localStorage.setItem('sound', on ? 'on' : 'off');
	} catch {
		// Storage blocked: the choice still applies on this page
	}
}

// A saved "on" starts with the first click or key press anywhere on the page
function onPress(event) {
	// A click on Sound (also by Enter or Space) is left to the button's own handler
	const pressesSound = event.type === 'click' || event.key === 'Enter' || event.key === ' ';
	if (pressesSound && event.target.closest?.('.sound')) return;
	if (!on) return stopWaiting();
	playing ? ctx.resume() : fadeIn();
}

function stopWaiting() {
	document.removeEventListener('click', onPress, true);
	document.removeEventListener('keydown', onPress, true);
}

function init() {
	let saved = false;
	try {
		saved = localStorage.getItem('sound') === 'on';
	} catch {
		// Storage blocked: stay off
	}

	button.addEventListener('click', () => {
		// A saved "on" still waiting for a press: this press starts it
		if (on && !playing) return fadeIn();
		setOn(!on);
		on ? fadeIn() : fadeOut();
	});

	if (saved) {
		on = true;
		button.setAttribute('aria-pressed', 'true');
		document.addEventListener('click', onPress, true);
		document.addEventListener('keydown', onPress, true);
	}

	// Pause when the tab is hidden, carry on when it's back
	document.addEventListener('visibilitychange', () => {
		if (!ctx || !playing) return;
		if (document.hidden) {
			ctx.suspend();
			clearTimeout(timer);
		} else {
			ctx.resume();
			schedule();
		}
	});

	// Switching Light / Dark swaps birds and crickets at once
	new MutationObserver(schedule).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
	systemDark.addEventListener('change', schedule);
}

if (AudioCtx && button) init();
