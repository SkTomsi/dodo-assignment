import type { Material } from "@/lib/material";
import type { RenderSettings, SourceName } from "@/lib/renderer";

export interface StudioRecipe {
	settings: RenderSettings;
	material: Material;
	strength: number;
	brush: number;
	keepMarks: boolean;
	sample: SourceName;
	useUpload: boolean;
}

export const baseSettings: RenderSettings = {
	effect: "Halftone",
	spacing: 9,
	size: 0.9,
	rotation: 0,
	contrast: 1.15,
	brightness: 0,
	scale: 1,
	invert: false,
	animate: true,
	motion: 0.7,
	ink: "#da593b",
	paper: "#f5eee2",
	transparent: false,
};

function look(
	name: string,
	description: string,
	sample: SourceName,
	material: Material,
	settings: Partial<RenderSettings>,
	strength = 0.85,
) {
	return {
		name,
		description,
		recipe: {
			settings: { ...baseSettings, animate: false, ...settings },
			material,
			strength,
			brush: 70,
			keepMarks: false,
			sample,
			useUpload: false,
		} satisfies StudioRecipe,
	};
}

export const looks = [
	look("Warm print", "Soft dots · terracotta", "Bloom", "paper", {}),
	look("Heat bloom", "Touch-responsive ink", "Bloom", "thermal", {
		animate: true,
	}),
	look("Chrome study", "Brushed silver · fine lines", "Sphere", "metal", {
		effect: "Lines",
		spacing: 6,
		ink: "#292b29",
		paper: "#f0efea",
		rotation: 30,
	}),
	look("Prism orbit", "Holographic · cobalt", "Orbit", "foil", {
		ink: "#3258c9",
		paper: "#edf0f8",
		spacing: 7,
	}),
	look(
		"Pearl ripple",
		"Quiet sheen · flowing lines",
		"Ripple",
		"pearl",
		{ effect: "Lines", spacing: 8, ink: "#82416d", paper: "#f4e9ef" },
		0.65,
	),
	look(
		"Moss grain",
		"Matte pigment · organic mesh",
		"Mesh",
		"grain",
		{ spacing: 6, ink: "#49664c", paper: "#eef0e4", contrast: 1.4 },
		0.7,
	),
	look(
		"Golden hour",
		"Warm metal · sculpted sphere",
		"Sphere",
		"gold",
		{ spacing: 7, ink: "#92632e", paper: "#f7edda" },
		0.75,
	),
	look("Carbon waves", "Ordered dither · monochrome", "Waves", "paper", {
		effect: "Dither",
		spacing: 5,
		ink: "#292b29",
		paper: "#f0efea",
		contrast: 1.5,
	}),
];

export function recipeKey(recipe: StudioRecipe) {
	return JSON.stringify([
		recipe.sample,
		recipe.useUpload,
		recipe.material,
		recipe.strength,
		recipe.brush,
		recipe.keepMarks,
		...Object.keys(baseSettings).map(
			(key) => recipe.settings[key as keyof RenderSettings],
		),
	]);
}

export function isRecipe(value: unknown): value is StudioRecipe {
	if (!value || typeof value !== "object") return false;
	const recipe = value as StudioRecipe;
	if (!recipe.settings || typeof recipe.settings !== "object") return false;
	const settings = recipe.settings;
	const ranges = {
		spacing: [3, 24],
		size: [0.3, 1.4],
		rotation: [-90, 90],
		contrast: [0.3, 2.5],
		brightness: [-0.4, 0.4],
		scale: [0.5, 2],
		motion: [0, 1.5],
	};
	return (
		Object.entries(ranges).every(([key, [min, max]]) => {
			const number = settings[key as keyof RenderSettings];
			return (
				typeof number === "number" &&
				Number.isFinite(number) &&
				number >= min &&
				number <= max
			);
		}) &&
		["Halftone", "Dither", "Lines"].includes(settings.effect) &&
		[
			"paper",
			"thermal",
			"foil",
			"pearl",
			"metal",
			"glass",
			"grain",
			"gold",
		].includes(recipe.material) &&
		["Bloom", "Orbit", "Sphere", "Waves", "Ripple", "Mesh"].includes(
			recipe.sample,
		) &&
		[settings.ink, settings.paper].every(
			(color) => typeof color === "string" && /^#[\da-f]{6}$/i.test(color),
		) &&
		[
			settings.animate,
			settings.invert,
			settings.transparent,
			recipe.keepMarks,
			recipe.useUpload,
		].every((flag) => typeof flag === "boolean") &&
		Number.isFinite(recipe.strength) &&
		recipe.strength >= 0 &&
		recipe.strength <= 1 &&
		Number.isFinite(recipe.brush) &&
		recipe.brush >= 20 &&
		recipe.brush <= 150
	);
}
