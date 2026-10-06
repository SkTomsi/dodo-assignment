import type { Effect, SourceName } from "@/lib/renderer";

export const palettes = [
	{ name: "Terracotta", ink: "#da593b", paper: "#f5eee2" },
	{ name: "Carbon", ink: "#292b29", paper: "#f0efea" },
	{ name: "Cobalt", ink: "#3258c9", paper: "#edf0f8" },
	{ name: "Moss", ink: "#49664c", paper: "#eef0e4" },
	{ name: "Mulberry", ink: "#82416d", paper: "#f4e9ef" },
];
export const defaultPalette = palettes[0];
export const effects: Effect[] = ["Halftone", "Dither", "Lines"];
export const imageSources: SourceName[] = ["Bloom", "Orbit", "Sphere"];
export const patternSources: SourceName[] = ["Waves", "Ripple", "Mesh"];
export const sectionLabel =
	"text-xs font-semibold tracking-[1.5px] text-text-faint";
export const glyphs = [
	"bg-[radial-gradient(currentColor_1.2px,transparent_1.4px)] bg-[length:4px_4px]",
	"bg-[conic-gradient(currentColor_25%,transparent_0_50%,currentColor_0_75%,transparent_0)] bg-[length:6px_6px]",
	"bg-[repeating-linear-gradient(0deg,currentColor_0_1px,transparent_1px_4px)]",
];
