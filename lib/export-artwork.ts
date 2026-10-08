export const exportRatios = [
	{ value: "square", label: "Square · 1:1", ratio: 1 },
	{ value: "portrait", label: "Portrait · 4:5", ratio: 4 / 5 },
	{ value: "landscape", label: "Landscape · 3:2", ratio: 3 / 2 },
	{ value: "wide", label: "Wide · 16:9", ratio: 16 / 9 },
] as const;
export type ExportRatio = (typeof exportRatios)[number]["value"];
export interface ExportOptions {
	size: number;
	ratio: ExportRatio;
}
export function exportDimensions(options: ExportOptions) {
	const ratio =
		exportRatios.find((item) => item.value === options.ratio)?.ratio ?? 1;
	return {
		width: Math.round(options.size * Math.min(1, ratio)),
		height: Math.round(options.size / Math.max(1, ratio)),
	};
}
export function frameArtwork(
	artwork: HTMLCanvasElement,
	options: ExportOptions,
) {
	const output = document.createElement("canvas");
	const { width, height } = exportDimensions(options);
	output.width = width;
	output.height = height;
	const context = output.getContext("2d");
	if (!context) throw new Error("Canvas is unavailable.");
	const scale = Math.max(width / artwork.width, height / artwork.height);
	context.drawImage(
		artwork,
		(width - artwork.width * scale) / 2,
		(height - artwork.height * scale) / 2,
		artwork.width * scale,
		artwork.height * scale,
	);
	return output;
}
