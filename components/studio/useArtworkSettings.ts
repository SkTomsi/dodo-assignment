import { type DialConfig, useDialKitController } from "dialkit";
import { useMemo, useState } from "react";
import type { Effect, RenderSettings } from "@/lib/renderer";
import { defaultPalette } from "./presets";

const config = {
	spacing: [9, 3, 24, 1],
	size: [0.9, 0.3, 1.4, 0.01],
	rotation: [0, -90, 90, 1],
	animate: true,
	motion: [0.7, 0, 1.5, 0.05],
	tone: {
		_collapsed: false,
		contrast: [1.15, 0.3, 2.5, 0.05],
		brightness: [0, -0.4, 0.4, 0.01],
		scale: [1, 0.5, 2, 0.01],
		invert: false,
	},
} satisfies DialConfig;

export function useArtworkSettings() {
	const dial = useDialKitController("Make it yours", config, {
		id: "dotform-controls",
	});
	const { values } = dial;
	const [effect, setEffect] = useState<Effect>("Halftone");
	const [ink, setInk] = useState(defaultPalette.ink);
	const [paper, setPaper] = useState(defaultPalette.paper);
	const [transparent, setTransparent] = useState(false);

	const settings: RenderSettings = useMemo(
		() => ({
			effect,
			spacing: values.spacing,
			size: values.size,
			rotation: values.rotation,
			animate: values.animate,
			motion: values.motion,
			...values.tone,
			ink,
			paper,
			transparent,
		}),
		[effect, values, ink, paper, transparent],
	);

	function reset() {
		dial.resetValues();
		setEffect("Halftone");
		setInk(defaultPalette.ink);
		setPaper(defaultPalette.paper);
		setTransparent(false);
	}
	function choosePalette(palette: { ink: string; paper: string }) {
		setInk(palette.ink);
		setPaper(palette.paper);
	}
	return {
		settings,
		setEffect,
		choosePalette,
		toggleTransparent: () => setTransparent((value) => !value),
		reset,
	};
}
