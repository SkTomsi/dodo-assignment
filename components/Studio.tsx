"use client";

import { Redo2, Undo2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ExportOptions } from "@/lib/export-artwork";
import type { ArtworkCapture, Material, SurfaceTool } from "@/lib/material";
import { useSoundFx } from "./sound-provider";
import { ArtworkWorkspace } from "./studio/ArtworkWorkspace";
import { ColorControls } from "./studio/ColorControls";
import { ControlsSidebar } from "./studio/ControlsSidebar";
import { EffectControls } from "./studio/EffectControls";
import { LooksControls } from "./studio/LooksControls";
import type { StudioRecipe } from "./studio/looks";
import { MaterialControls } from "./studio/MaterialControls";
import { MobileNavigation } from "./studio/MobileNavigation";
import { OutputControls } from "./studio/OutputControls";
import { SourceControls } from "./studio/SourceControls";
import { StudioNotice } from "./studio/StudioNotice";
import { TextureControls } from "./studio/TextureControls";
import { useArtworkSettings } from "./studio/useArtworkSettings";
import { useArtworkSource } from "./studio/useArtworkSource";
import { usePngExport } from "./studio/usePngExport";
import { useStudioRecipes } from "./studio/useStudioRecipes";
import { SoundButton } from "./ui/SoundButton";

export default function Studio() {
	const [original, setOriginal] = useState(false);
	const [error, setError] = useState("");
	const [notice, setNotice] = useState("");
	const [material, setMaterial] = useState<Material>("thermal");
	const [tool, setTool] = useState<SurfaceTool>("touch");
	const [strength, setStrength] = useState(0.85);
	const [brush, setBrush] = useState(70);
	const [keepMarks, setKeepMarks] = useState(false);
	const [clearVersion, setClearVersion] = useState(0);
	const [exportOptions, setExportOptions] = useState<ExportOptions>({
		size: 1024,
		ratio: "square",
	});
	const capture = useRef<ArtworkCapture | null>(null);
	const { play } = useSoundFx();
	const artwork = useArtworkSource({
		onSelect: () => setOriginal(false),
		onReady: () => {
			setNotice("Image ready. Make it yours.");
			play("success");
		},
		onError: setError,
	});
	const controls = useArtworkSettings();
	const { settings } = controls;
	const recipe = useMemo<StudioRecipe>(
		() => ({
			settings,
			material,
			strength,
			brush,
			keepMarks,
			sample: artwork.sample,
			useUpload: artwork.useUpload,
		}),
		[
			settings,
			material,
			strength,
			brush,
			keepMarks,
			artwork.sample,
			artwork.useUpload,
		],
	);
	function applyRecipe(next: StudioRecipe) {
		controls.apply(next.settings);
		artwork.restoreSource(next.sample, next.useUpload);
		setMaterial(next.material);
		setStrength(next.strength);
		setBrush(next.brush);
		setKeepMarks(next.keepMarks);
		setTool("touch");
		setOriginal(false);
	}
	const recipes = useStudioRecipes(recipe, applyRecipe, setNotice);
	useEffect(() => {
		function keyboard(event: KeyboardEvent) {
			const target = event.target as HTMLElement;
			if (
				target.closest("input, textarea, select, [role=slider]") ||
				target.isContentEditable ||
				!(event.metaKey || event.ctrlKey) ||
				event.altKey
			)
				return;
			if (event.defaultPrevented) return;
			if (event.key.toLowerCase() === "y" && event.ctrlKey && !event.shiftKey) {
				event.preventDefault();
				recipes.redo();
			} else if (event.key.toLowerCase() === "z") {
				event.preventDefault();
				if (event.shiftKey) recipes.redo();
				else recipes.undo();
			}
		}
		window.addEventListener("keydown", keyboard);
		return () => window.removeEventListener("keydown", keyboard);
	}, [recipes]);
	const { exporting, download } = usePngExport({
		pixels: artwork.pixels,
		settings,
		mode: artwork.mode,
		capture,
		options: exportOptions,
		onError: setError,
		onNotice: setNotice,
	});
	function reset() {
		controls.reset();
		setOriginal(false);
		setMaterial("thermal");
		setTool("touch");
		setStrength(0.85);
		setBrush(70);
		setKeepMarks(false);
		setClearVersion((version) => version + 1);
		setNotice("Controls reset");
	}
	useEffect(() => {
		if (!notice) return;
		const timeout = setTimeout(() => setNotice(""), 2600);
		return () => clearTimeout(timeout);
	}, [notice]);
	return (
		<div className="min-h-dvh bg-bg">
			<main className="studio-main mx-auto max-w-[1360px] px-4 py-4 min-[641px]:px-6 min-[900px]:h-dvh min-[900px]:py-6">
				<div className="grid grid-cols-1 gap-6 min-[900px]:h-full min-[900px]:grid-cols-[minmax(0,1fr)_320px] min-[1200px]:gap-7 min-[1200px]:grid-cols-[minmax(0,1fr)_344px]">
					<ArtworkWorkspace
						source={artwork.source}
						pixels={artwork.pixels}
						title={artwork.title}
						settings={settings}
						exportOptions={exportOptions}
						material={material}
						strength={strength}
						brush={brush}
						keepMarks={keepMarks}
						clearVersion={clearVersion}
						tool={tool}
						setTool={setTool}
						capture={capture}
						original={original}
						setOriginal={setOriginal}
						loadFile={artwork.loadFile}
						onNotice={setNotice}
						onError={setError}
					/>
					<ControlsSidebar
						header={
							<div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
								<div>
									<h1 className="font-display text-lg font-semibold tracking-tight text-text">
										Mottle
									</h1>
									<p className="text-[10px] text-text-faint">
										A little texture goes a long way.
									</p>
								</div>
								<div className="flex gap-1">
									<SoundButton
										type="button"
										aria-label="Undo"
										aria-keyshortcuts="Meta+z Control+z"
										title="Undo · ⌘/Ctrl Z"
										disabled={!recipes.canUndo}
										onClick={recipes.undo}
										className="rounded-md p-2 text-text-muted hover:bg-surface-hover disabled:opacity-30"
									>
										<Undo2 size={16} />
									</SoundButton>
									<SoundButton
										type="button"
										aria-label="Redo"
										aria-keyshortcuts="Meta+Shift+z Control+Shift+z Control+y"
										title="Redo · ⌘/Ctrl Shift Z"
										disabled={!recipes.canRedo}
										onClick={recipes.redo}
										className="rounded-md p-2 text-text-muted hover:bg-surface-hover disabled:opacity-30"
									>
										<Redo2 size={16} />
									</SoundButton>
								</div>
							</div>
						}
						footer={
							<OutputControls
								options={exportOptions}
								setOptions={setExportOptions}
								download={download}
								loading={artwork.loading}
								exporting={exporting}
							/>
						}
					>
						<SourceControls
							artwork={artwork}
							error={error}
							dismissError={() => setError("")}
						>
							<details className="mt-4 border-t border-border pt-3">
								<summary className="cursor-pointer text-xs text-text-muted">
									Looks & saved recipes
								</summary>
								<LooksControls
									current={recipe}
									apply={recipes.select}
									recipes={recipes}
								/>
							</details>
						</SourceControls>
						<EffectControls
							effect={settings.effect}
							setEffect={controls.setEffect}
						/>
						<MaterialControls
							material={material}
							setMaterial={(value) => {
								setMaterial(value);
								setOriginal(false);
								setTool("touch");
								setKeepMarks(false);
							}}
							strength={strength}
							setStrength={setStrength}
							brush={brush}
							setBrush={setBrush}
							keepMarks={keepMarks}
							setKeepMarks={setKeepMarks}
							clearMarks={() => setClearVersion((version) => version + 1)}
						/>
						<TextureControls reset={reset} />
						<ColorControls
							settings={settings}
							choosePalette={controls.choosePalette}
							toggleTransparent={controls.toggleTransparent}
						/>
					</ControlsSidebar>
				</div>
			</main>
			<MobileNavigation />
			<StudioNotice notice={notice} />
		</div>
	);
}
