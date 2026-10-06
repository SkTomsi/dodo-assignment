import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SAMPLE_RATE = 44100;

const outDir = join(
	dirname(fileURLToPath(import.meta.url)),
	"..",
	"public",
	"sounds",
);
mkdirSync(outDir, { recursive: true });

function noiseSource(seed) {
	let s = seed >>> 0;
	return () => {
		s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
		return (s / 4294967296) * 2 - 1;
	};
}

function lowpass(cutoff) {
	const a = 1 - Math.exp((-2 * Math.PI * cutoff) / SAMPLE_RATE);
	let prev = 0;
	return (x) => {
		prev += a * (x - prev);
		return prev;
	};
}

function render(duration, sampleAt) {
	const count = Math.round(duration * SAMPLE_RATE);
	const out = new Float64Array(count);
	for (let i = 0; i < count; i++) {
		const t = i / SAMPLE_RATE;
		const edge = Math.min(1, t / 0.0015) * Math.min(1, (duration - t) / 0.006);
		out[i] = sampleAt(t) * edge;
	}
	return out;
}

function partials(t, freqs) {
	return freqs.reduce(
		(sum, [freq, gain]) => sum + gain * Math.sin(2 * Math.PI * freq * t),
		0,
	);
}

function decay(t, tau, attack) {
	return Math.exp(-t / tau) * (1 - Math.exp(-t / attack));
}

function normalize(samples, peak) {
	let max = 0;
	for (const value of samples) max = Math.max(max, Math.abs(value));
	const scale = max > 0 ? peak / max : 1;
	return samples.map((value) => value * scale);
}

function toWav(samples) {
	const dataSize = samples.length * 2;
	const buffer = Buffer.alloc(44 + dataSize);
	buffer.write("RIFF", 0);
	buffer.writeUInt32LE(36 + dataSize, 4);
	buffer.write("WAVE", 8);
	buffer.write("fmt ", 12);
	buffer.writeUInt32LE(16, 16);
	buffer.writeUInt16LE(1, 20);
	buffer.writeUInt16LE(1, 22);
	buffer.writeUInt32LE(SAMPLE_RATE, 24);
	buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
	buffer.writeUInt16LE(2, 32);
	buffer.writeUInt16LE(16, 34);
	buffer.write("data", 36);
	buffer.writeUInt32LE(dataSize, 40);
	for (let i = 0; i < samples.length; i++) {
		const clamped = Math.max(-1, Math.min(1, samples[i]));
		buffer.writeInt16LE(Math.round(clamped * 32767), 44 + i * 2);
	}
	return buffer;
}

const sounds = {};

// Crisp tick for buttons, tabs and chips.
{
	const noise = noiseSource(7);
	const lp = lowpass(5000);
	sounds.click = normalize(
		render(0.055, (t) => {
			const tone = partials(t, [
				[1568, 1],
				[2349, 0.45],
				[3136, 0.18],
			]);
			return (
				tone * decay(t, 0.01, 0.0008) * 0.55 +
				lp(noise()) * decay(t, 0.003, 0.0003) * 0.5
			);
		}),
		0.9,
	);
}

// Softer, lower blip for switches and toggles.
{
	const noise = noiseSource(23);
	const lp = lowpass(3500);
	sounds.toggle = normalize(
		render(0.08, (t) => {
			const tone = partials(t, [
				[740, 1],
				[1108, 0.3],
				[1480, 0.18],
			]);
			return (
				tone * decay(t, 0.018, 0.0015) * 0.7 +
				lp(noise()) * decay(t, 0.002, 0.0003) * 0.12
			);
		}),
		0.9,
	);
}

// Rising two-note confirmation for exports and uploads.
sounds.success = normalize(
	render(0.26, (t) => {
		const first =
			t < 0.16
				? partials(t, [
						[880, 1],
						[1760, 0.16],
					]) * decay(t, 0.09, 0.006)
				: 0;
		const t2 = t - 0.085;
		const second =
			t2 > 0
				? partials(t2, [
						[1318.51, 1],
						[2637.02, 0.14],
					]) * decay(t2, 0.13, 0.006)
				: 0;
		return first * 0.75 + second * 0.85;
	}),
	0.9,
);

for (const [name, samples] of Object.entries(sounds)) {
	const file = join(outDir, `${name}.wav`);
	writeFileSync(file, toWav(samples));
	console.log(
		`${name}.wav — ${(samples.length / SAMPLE_RATE).toFixed(3)}s, ${((samples.length * 2 + 44) / 1024) | 0} KB`,
	);
}
