import { type RefObject, useState } from "react";
import { useSoundFx } from "@/components/sound-provider";
import {
	type ExportOptions,
	exportDimensions,
	frameArtwork,
} from "@/lib/export-artwork";
import type { ArtworkCapture } from "@/lib/material";
import { type RenderSettings, renderArt } from "@/lib/renderer";

export function usePngExport({
	pixels,
	settings,
	mode,
	onError,
	onNotice,
	capture,
	options,
}: {
	pixels: ImageData;
	settings: RenderSettings;
	mode: "Image" | "Pattern";
	onError: (message: string) => void;
	onNotice: (message: string) => void;
	capture: RefObject<ArtworkCapture | null>;
	options: ExportOptions;
}) {
	const [exporting, setExporting] = useState(false);
	const { play } = useSoundFx();
	function download() {
		if (exporting) return;
		play("click");
		setExporting(true);
		let output: HTMLCanvasElement;
		try {
			const snapshot = capture.current?.();
			output = snapshot ?? document.createElement("canvas");
			if (!snapshot) renderArt(output, pixels, settings);
			output = frameArtwork(output, options);
		} catch {
			setExporting(false);
			onError("Export failed. Please try again.");
			return;
		}
		output.toBlob((blob) => {
			setExporting(false);
			if (!blob) {
				onError("Export failed. Please try again.");
				return;
			}
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			const { width, height } = exportDimensions(options);
			link.download = `mottle-${settings.effect.toLowerCase()}-${mode.toLowerCase()}-${width}x${height}.png`;
			link.click();
			setTimeout(() => URL.revokeObjectURL(url), 1000);
			onNotice(`Artwork exported · ${width} × ${height} PNG`);
			play("success");
		}, "image/png");
	}

	return { exporting, download };
}
