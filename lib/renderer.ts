export type SourceName =
	| "Bloom"
	| "Orbit"
	| "Sphere"
	| "Waves"
	| "Ripple"
	| "Mesh";
export type Effect = "Halftone" | "Dither" | "Lines";
export interface RenderSettings {
	effect: Effect;
	spacing: number;
	size: number;
	contrast: number;
	brightness: number;
	rotation: number;
	scale: number;
	invert: boolean;
	ink: string;
	paper: string;
	transparent: boolean;
}
export const ART_SIZE = 1024;
const clamp = (v: number) => Math.max(0, Math.min(1, v));

// The samples are locally generated height fields: no remote image or API is needed.
export function createSource(name: SourceName): HTMLCanvasElement {
	const canvas = document.createElement("canvas");
	canvas.width = canvas.height = 640;
	const ctx = canvas.getContext("2d", { willReadFrequently: true });
	if (!ctx) throw new Error("Canvas 2D rendering is unavailable.");
	const image = ctx.createImageData(640, 640);
	for (let y = 0; y < 640; y++) {
		for (let x = 0; x < 640; x++) {
			const u = (x / 640 - 0.5) * 2.5;
			const v = (y / 640 - 0.5) * 2.5;
			const r = Math.hypot(u, v);
			const angle = Math.atan2(v, u);
			let density = 0;
			if (name === "Bloom") {
				const edge = 0.78 + 0.18 * Math.cos(angle * 6 + r * 2.8);
				const distance = r / edge;
				if (distance < 1) {
					const height = Math.sqrt(1 - distance * distance);
					const ridge = 0.5 + 0.5 * Math.sin(angle * 6 + r * 5);
					density = clamp(
						0.18 + 0.56 * (1 - height) + 0.42 * ridge * r - u * 0.21 + v * 0.18,
					);
					density *= Math.min(1, (1 - distance) * 55);
				}
			} else if (name === "Orbit") {
				const tiltY = v * 1.22 + u * 0.22;
				const radius = Math.hypot(u, tiltY);
				const ring = (radius - 0.58) / 0.26;
				if (Math.abs(ring) < 1) {
					const z = Math.sqrt(1 - ring * ring);
					density = clamp(0.52 - 0.42 * z + 0.38 * (u - tiltY) + 0.2 * ring);
					density *= Math.min(1, (1 - Math.abs(ring)) * 35);
				}
			} else if (name === "Sphere") {
				if (r < 0.86) {
					const z = Math.sqrt(0.86 * 0.86 - r * r);
					density = clamp(0.64 + u * 0.46 + v * 0.4 - z * 0.65);
					density *= Math.min(1, (0.86 - r) * 50);
				}
			} else if (name === "Waves") {
				density =
					(0.5 + 0.5 * Math.sin(u * 4.7 + Math.sin(v * 3) * 1.8)) * 0.85;
			} else if (name === "Ripple") {
				density = (0.5 + 0.5 * Math.cos(r * 16 - angle * 2)) * 0.8;
			} else {
				density = clamp(
					0.42 + 0.3 * Math.sin(u * 4 + v * 2) + 0.3 * Math.cos(v * 4 - u * 2),
				);
			}
			const i = (y * 640 + x) * 4;
			image.data[i] =
				image.data[i + 1] =
				image.data[i + 2] =
					Math.round((1 - density) * 255);
			image.data[i + 3] = 255;
		}
	}
	ctx.putImageData(image, 0, 0);
	return canvas;
}

export function prepareImage(
	image: CanvasImageSource,
	width: number,
	height: number,
) {
	const canvas = document.createElement("canvas");
	canvas.width = canvas.height = 640;
	const ctx = canvas.getContext("2d", { willReadFrequently: true });
	if (!ctx) throw new Error("Canvas 2D rendering is unavailable.");
	ctx.fillStyle = "#fff";
	ctx.fillRect(0, 0, 640, 640);
	const scale = Math.min(640 / width, 640 / height);
	ctx.drawImage(
		image,
		(640 - width * scale) / 2,
		(640 - height * scale) / 2,
		width * scale,
		height * scale,
	);
	return canvas;
}

export function sourcePixels(source: HTMLCanvasElement) {
	const ctx = source.getContext("2d", { willReadFrequently: true });
	if (!ctx) throw new Error("Canvas 2D rendering is unavailable.");
	return ctx.getImageData(0, 0, source.width, source.height);
}
const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

export function renderArt(
	canvas: HTMLCanvasElement,
	pixels: ImageData,
	settings: RenderSettings,
	size = ART_SIZE,
) {
	if (canvas.width !== size || canvas.height !== size)
		canvas.width = canvas.height = size;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Canvas 2D rendering is unavailable.");
	ctx.clearRect(0, 0, size, size);
	if (!settings.transparent) {
		ctx.fillStyle = settings.paper;
		ctx.fillRect(0, 0, size, size);
	}
	const step = (settings.spacing * size) / ART_SIZE;
	const theta = (settings.rotation * Math.PI) / 180;
	const cos = Math.cos(theta),
		sin = Math.sin(theta);
	const bound = Math.ceil((size * Math.SQRT2) / step / 2);
	ctx.fillStyle = settings.ink;
	ctx.save();
	ctx.translate(size / 2, size / 2);
	ctx.rotate(theta);
	for (let gy = -bound; gy <= bound; gy++) {
		for (let gx = -bound; gx <= bound; gx++) {
			const x = gx * step,
				y = gy * step;
			const sx =
				((x * cos - y * sin) / size / settings.scale + 0.5) * pixels.width;
			const sy =
				((x * sin + y * cos) / size / settings.scale + 0.5) * pixels.height;
			if (sx < 0 || sx >= pixels.width || sy < 0 || sy >= pixels.height)
				continue;
			const i = (Math.floor(sy) * pixels.width + Math.floor(sx)) * 4;
			const luminance =
				(pixels.data[i] * 0.2126 +
					pixels.data[i + 1] * 0.7152 +
					pixels.data[i + 2] * 0.0722) /
				255;
			let density = clamp(
				(1 - luminance - 0.5) * settings.contrast + 0.5 - settings.brightness,
			);
			if (settings.invert) density = 1 - density;
			if (density < 0.006) continue;
			if (settings.effect === "Dither") {
				const threshold =
					(bayer[(((gy % 4) + 4) % 4) * 4 + (((gx % 4) + 4) % 4)] + 0.5) / 16;
				if (density > threshold) {
					const s = step * settings.size;
					ctx.fillRect(x - s / 2, y - s / 2, s, s);
				}
			} else if (settings.effect === "Lines") {
				const thickness = step * density * settings.size;
				ctx.fillRect(x - step / 2, y - thickness / 2, step + 0.3, thickness);
			} else {
				const radius = step * 0.56 * Math.sqrt(density) * settings.size;
				ctx.beginPath();
				ctx.arc(x, y, radius, 0, Math.PI * 2);
				ctx.fill();
			}
		}
	}
	ctx.restore();
}
