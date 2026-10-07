export async function exportFolder({
	svg,
	artwork,
	position,
	paper,
	transparent,
}: {
	svg: SVGSVGElement;
	artwork: HTMLCanvasElement;
	position: { x: number; y: number };
	paper: string;
	transparent: boolean;
}): Promise<Blob> {
	const output = document.createElement("canvas");
	output.width = output.height = 1024;
	const ctx = output.getContext("2d");
	if (!ctx) throw new Error("Canvas is unavailable.");
	const clone = svg.cloneNode(true) as SVGSVGElement;
	clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
	clone.setAttribute("width", "444");
	clone.setAttribute("height", "376");
	clone.removeAttribute("class");
	clone.removeAttribute("style");
	const stops = svg.querySelectorAll("stop");
	clone.querySelectorAll("stop").forEach((stop, index) => {
		stop.setAttribute("stop-color", getComputedStyle(stops[index]).stopColor);
	});
	const url = URL.createObjectURL(
		new Blob([new XMLSerializer().serializeToString(clone)], {
			type: "image/svg+xml",
		}),
	);
	try {
		const image = new Image();
		image.src = url;
		await image.decode();
		// Center the complete folder on a square icon with transparent padding.
		const scale = 896 / 444;
		ctx.translate(64, (1024 - 376 * scale) / 2);
		ctx.scale(scale, scale);
		ctx.drawImage(image, 0, 0, 444, 376);
		const face = svg.querySelector("[data-folder-face]")?.getAttribute("d");
		if (!face) throw new Error("Folder face is unavailable.");
		ctx.save();
		ctx.clip(new Path2D(face));
		if (!transparent) {
			ctx.fillStyle = paper;
			ctx.fillRect(2, 66, 440, 307);
		}
		ctx.drawImage(
			artwork,
			2 + position.x * 4.4,
			66 + (307 - 440) / 2 + position.y * 4.4,
			440,
			440,
		);
		ctx.restore();
		return await new Promise<Blob>((resolve, reject) => {
			output.toBlob(
				(blob) =>
					blob ? resolve(blob) : reject(new Error("PNG export failed.")),
				"image/png",
			);
		});
	} finally {
		URL.revokeObjectURL(url);
	}
}
