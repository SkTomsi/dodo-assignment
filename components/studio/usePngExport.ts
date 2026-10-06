import { useState } from "react";
import { useSoundFx } from "@/components/sound-provider";
import { type RenderSettings, renderArt } from "@/lib/renderer";

export function usePngExport({
	pixels,
	settings,
	mode,
	onError,
	onNotice,
}: {
	pixels: ImageData;
	settings: RenderSettings;
	mode: "Image" | "Pattern";
	onError: (message: string) => void;
	onNotice: (message: string) => void;
}) {
	const [exporting, setExporting] = useState(false);
	const { play } = useSoundFx();
	function download() {
		play("click");
		setExporting(true);
		const output = document.createElement("canvas");
		renderArt(output, pixels, settings);
		output.toBlob((blob) => {
			setExporting(false);
			if (!blob) {
				onError("Export failed. Please try again.");
				return;
			}
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `dotform-${settings.effect.toLowerCase()}-${mode.toLowerCase()}.png`;
			link.click();
			setTimeout(() => URL.revokeObjectURL(url), 1000);
			onNotice("PNG exported. Go make something good.");
			play("success");
		}, "image/png");
	}

	return { exporting, download };
}
