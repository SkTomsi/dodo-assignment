"use client";

import { useEffect, useRef, useState } from "react";
import type { ArtworkCapture, Material, SurfaceTool } from "@/lib/material";
import { useSoundFx } from "./sound-provider";
import { ArtworkWorkspace } from "./studio/ArtworkWorkspace";
import { ControlsSidebar } from "./studio/ControlsSidebar";
import { EffectControls } from "./studio/EffectControls";
import { MaterialControls } from "./studio/MaterialControls";
import { OutputControls } from "./studio/OutputControls";
import { SourceControls } from "./studio/SourceControls";
import { StudioNotice } from "./studio/StudioNotice";
import { TextureControls } from "./studio/TextureControls";
import { useArtworkSettings } from "./studio/useArtworkSettings";
import { useArtworkSource } from "./studio/useArtworkSource";
import { usePngExport } from "./studio/usePngExport";

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
	const { exporting, download } = usePngExport({
		pixels: artwork.pixels,
		settings,
		mode: artwork.mode,
		capture,
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
			<main className="mx-auto max-w-[1360px] px-4 py-4 min-[641px]:px-6 min-[900px]:h-dvh min-[900px]:py-5">
				<div className="grid grid-cols-1 gap-5 min-[641px]:gap-[22px] min-[900px]:h-full min-[900px]:grid-cols-[minmax(0,1fr)_296px] min-[1200px]:grid-cols-[minmax(0,1fr)_318px]">
					<ArtworkWorkspace
						source={artwork.source}
						pixels={artwork.pixels}
						title={artwork.title}
						settings={settings}
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
					<ControlsSidebar>
						<EffectControls
							effect={settings.effect}
							setEffect={controls.setEffect}
						/>
						<SourceControls
							artwork={artwork}
							error={error}
							dismissError={() => setError("")}
						/>
						<TextureControls reset={reset} />
						<MaterialControls
							material={material}
							setMaterial={(value) => {
								setMaterial(value);
								setOriginal(false);
								setTool("touch");
								setKeepMarks(false);
								play(value);
							}}
							strength={strength}
							setStrength={setStrength}
							brush={brush}
							setBrush={setBrush}
							keepMarks={keepMarks}
							setKeepMarks={setKeepMarks}
							clearMarks={() => setClearVersion((version) => version + 1)}
						/>
						<div className="min-h-[16px] flex-1" aria-hidden="true" />
						<OutputControls
							settings={settings}
							choosePalette={controls.choosePalette}
							toggleTransparent={controls.toggleTransparent}
							download={download}
							loading={artwork.loading}
							exporting={exporting}
						/>
					</ControlsSidebar>
				</div>
			</main>
			<StudioNotice notice={notice} />
		</div>
	);
}
