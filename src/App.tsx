import { type DialConfig, DialRoot, useDialKitController } from "dialkit";
import {
	ArrowDownToLine,
	ArrowUpRight,
	Check,
	ImagePlus,
	Layers2,
	RotateCcw,
	SlidersHorizontal,
	Sparkles,
	Upload,
	X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
	ART_SIZE,
	createSource,
	type Effect,
	prepareImage,
	type RenderSettings,
	renderArt,
	type SourceName,
	sourcePixels,
} from "./renderer";

const config = {
	spacing: [9, 3, 24, 1],
	size: [0.9, 0.3, 1.4, 0.01],
	rotation: [0, -90, 90, 1],
	tone: {
		_collapsed: false,
		contrast: [1.15, 0.3, 2.5, 0.05],
		brightness: [0, -0.4, 0.4, 0.01],
		scale: [1, 0.5, 2, 0.01],
		invert: false,
	},
	color: {
		_collapsed: true,
		ink: "#da593b",
		paper: "#f5eee2",
		transparent: false,
	},
} satisfies DialConfig;
const palettes = [
	{ name: "Terracotta", ink: "#da593b", paper: "#f5eee2" },
	{ name: "Carbon", ink: "#292b29", paper: "#f0efea" },
	{ name: "Cobalt", ink: "#3258c9", paper: "#edf0f8" },
	{ name: "Moss", ink: "#49664c", paper: "#eef0e4" },
	{ name: "Mulberry", ink: "#82416d", paper: "#f4e9ef" },
];
const imageSources: SourceName[] = ["Bloom", "Orbit", "Sphere"];
const patternSources: SourceName[] = ["Waves", "Ripple", "Mesh"];

function Sample({
	name,
	selected,
	onClick,
}: {
	name: SourceName;
	selected: boolean;
	onClick: () => void;
}) {
	const ref = useRef<HTMLCanvasElement>(null);
	useEffect(() => {
		const pixels = sourcePixels(createSource(name));
		renderArt(
			ref.current!,
			pixels,
			{
				effect: "Halftone",
				spacing: 12,
				size: 0.9,
				contrast: 1.15,
				brightness: 0,
				rotation: 0,
				scale: 1,
				invert: false,
				ink: "#52564f",
				paper: "#efefe9",
				transparent: false,
			},
			160,
		);
	}, [name]);
	return (
		<button
			className={`sample ${selected ? "selected" : ""}`}
			onClick={onClick}
			aria-pressed={selected}
		>
			<canvas ref={ref} aria-hidden="true" />
			<span>{name}</span>
			{selected && (
				<span className="sample-check">
					<Check size={10} />
				</span>
			)}
		</button>
	);
}

export default function App() {
	const dial = useDialKitController("Make it yours", config, {
		id: "dotform-controls",
	});
	const { values } = dial;
	const [effect, setEffect] = useState<Effect>("Halftone");
	const [mode, setMode] = useState<"Image" | "Pattern">("Image");
	const [sample, setSample] = useState<SourceName>("Bloom");
	const [uploaded, setUploaded] = useState<{
		canvas: HTMLCanvasElement;
		name: string;
	} | null>(null);
	const [useUpload, setUseUpload] = useState(false);
	const [cardView, setCardView] = useState(false);
	const [original, setOriginal] = useState(false);
	const [dragging, setDragging] = useState(false);
	const [error, setError] = useState("");
	const [notice, setNotice] = useState("");
	const [loading, setLoading] = useState(false);
	const [exporting, setExporting] = useState(false);
	const input = useRef<HTMLInputElement>(null);
	const canvas = useRef<HTMLCanvasElement>(null);
	const originalCanvas = useRef<HTMLCanvasElement>(null);
	const request = useRef(0);
	const source = useMemo(
		() => (useUpload && uploaded ? uploaded.canvas : createSource(sample)),
		[sample, useUpload, uploaded],
	);
	const pixels = useMemo(() => sourcePixels(source), [source]);
	const settings: RenderSettings = useMemo(
		() => ({
			effect,
			spacing: values.spacing,
			size: values.size,
			rotation: values.rotation,
			...values.tone,
			...values.color,
		}),
		[effect, values],
	);

	useEffect(() => {
		const frame = requestAnimationFrame(() => {
			if (canvas.current) renderArt(canvas.current, pixels, settings);
		});
		return () => cancelAnimationFrame(frame);
	}, [pixels, settings, cardView]);
	useEffect(() => {
		if (original && originalCanvas.current) {
			const ctx = originalCanvas.current.getContext("2d")!;
			ctx.clearRect(0, 0, 640, 640);
			ctx.drawImage(source, 0, 0);
		}
	}, [source, original, cardView]);
	useEffect(() => {
		if (!notice) return;
		const timeout = setTimeout(() => setNotice(""), 2600);
		return () => clearTimeout(timeout);
	}, [notice]);

	async function loadFile(file?: File) {
		if (!file) return;
		setError("");
		if (
			![
				"image/png",
				"image/jpeg",
				"image/webp",
				"image/avif",
				"image/gif",
			].includes(file.type)
		) {
			setError("Choose a PNG, JPG, WebP, AVIF, or GIF image.");
			return;
		}
		if (file.size > 20 * 1024 * 1024) {
			setError("That image is a little large. Try one under 20 MB.");
			return;
		}
		const id = ++request.current;
		setLoading(true);
		const url = URL.createObjectURL(file);
		try {
			const image = new Image();
			image.src = url;
			await image.decode();
			if (id !== request.current) return;
			const prepared = prepareImage(
				image,
				image.naturalWidth,
				image.naturalHeight,
			);
			setUploaded({ canvas: prepared, name: file.name });
			setUseUpload(true);
			setMode("Image");
			setOriginal(false);
			setNotice("Image ready. Make it yours.");
		} catch {
			if (id === request.current)
				setError("We couldn’t read that image. Try a different file.");
		} finally {
			URL.revokeObjectURL(url);
			if (id === request.current) setLoading(false);
		}
	}

	function chooseMode(next: "Image" | "Pattern") {
		setMode(next);
		setSample(next === "Image" ? "Bloom" : "Waves");
		setUseUpload(next === "Image" && !!uploaded);
		setOriginal(false);
	}
	function reset() {
		dial.resetValues();
		setEffect("Halftone");
		setOriginal(false);
		setNotice("Controls reset");
	}
	function download() {
		setExporting(true);
		// Render a fresh export, independent of the preview's scheduled frame or comparison state.
		const output = document.createElement("canvas");
		renderArt(output, pixels, settings);
		output.toBlob((blob) => {
			setExporting(false);
			if (!blob) {
				setError("Export failed. Please try again.");
				return;
			}
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `dotform-${effect.toLowerCase()}-${mode.toLowerCase()}.png`;
			link.click();
			setTimeout(() => URL.revokeObjectURL(url), 1000);
			setNotice("PNG exported. Go make something good.");
		}, "image/png");
	}
	const title = useUpload && uploaded ? uploaded.name : sample;

	return (
		<div className="app-shell">
			<main>
				<div className="workspace">
					<section className="art-column" aria-label="Artwork workspace">
						<div className="preview-panel">
							<div className="preview-toolbar">
								<div className="effect-tabs" aria-label="Rendering style">
									{(["Halftone", "Dither", "Lines"] as Effect[]).map(
										(item, i) => (
											<button
												key={item}
												onClick={() => setEffect(item)}
												aria-pressed={effect === item}
												className={effect === item ? "active" : ""}
											>
												<span
													className={`effect-glyph glyph-${i}`}
													aria-hidden="true"
												/>
												{item}
											</button>
										),
									)}
								</div>
								<button
									className={`icon-button ${cardView ? "is-active" : ""}`}
									onClick={() => setCardView(!cardView)}
									aria-pressed={cardView}
									title="Preview on a UI card"
									aria-label="Preview on a UI card"
								>
									<Layers2 size={17} />
								</button>
							</div>
							<div
								className={`stage ${dragging ? "dragging" : ""} ${cardView ? "card-stage" : ""}`}
								onDragOver={(event) => {
									event.preventDefault();
									setDragging(true);
								}}
								onDragLeave={(event) => {
									if (
										!event.currentTarget.contains(event.relatedTarget as Node)
									)
										setDragging(false);
								}}
								onDrop={(event) => {
									event.preventDefault();
									setDragging(false);
									void loadFile(event.dataTransfer.files[0]);
								}}
							>
								<div className="stage-corner top-left" />
								<div className="stage-corner top-right" />
								<div className="stage-corner bottom-left" />
								<div className="stage-corner bottom-right" />
								<div
									className={cardView ? "example-card" : "art-frame"}
									style={{
										backgroundColor: settings.transparent
											? undefined
											: settings.paper,
									}}
								>
									{cardView && (
										<div className="card-top">
											<span>FIELD NOTES / 001</span>
											<ArrowUpRight size={18} />
										</div>
									)}
									<div
										className={`canvas-wrap ${settings.transparent ? "checkerboard" : ""}`}
									>
										<canvas
											ref={canvas}
											width={ART_SIZE}
											height={ART_SIZE}
											role="img"
											aria-label={`${effect} artwork of ${title}`}
										/>
										{original && (
											<canvas
												className="original-canvas"
												ref={originalCanvas}
												width="640"
												height="640"
												role="img"
												aria-label="Original source image"
											/>
										)}
									</div>
									{cardView && (
										<div className="card-copy">
											<span className="card-kicker">
												A DIFFERENT PERSPECTIVE
											</span>
											<h2>Made of little things.</h2>
											<p>A study in texture, shape, and possibility.</p>
										</div>
									)}
								</div>
								{dragging && (
									<div className="drop-overlay">
										<Upload size={28} />
										<span>Drop your image here</span>
									</div>
								)}
								<div className="stage-label">
									{cardView ? "IN CONTEXT" : "YOUR CANVAS"}
								</div>
							</div>
							<div className="preview-footer">
								<span>
									<span className="live-dot" />
									{title}
								</span>
								<button
									onClick={() => setOriginal(!original)}
									aria-pressed={original}
								>
									{original ? "Show result" : "Show original"}
								</button>
								<span className="dimensions">1024 × 1024</span>
							</div>
						</div>
						<div className="sample-strip">
							<div className="sample-copy">
								<span className="section-label">A PLACE TO START</span>
								<p>
									{mode === "Image"
										? "Try a little shape."
										: "Find your rhythm."}
								</p>
							</div>
							<div className="samples">
								{(mode === "Image" ? imageSources : patternSources).map(
									(name) => (
										<Sample
											key={name}
											name={name}
											selected={!useUpload && sample === name}
											onClick={() => {
												setSample(name);
												setUseUpload(false);
												setOriginal(false);
											}}
										/>
									),
								)}
							</div>
						</div>
						<p className="canvas-hint">
							<span>↳</span> Small dots. Endless possibilities. Drag an image
							onto the canvas to begin.
						</p>
					</section>

					<aside className="sidebar" aria-label="Generator controls">
						<section className="source-section">
							<div className="section-heading">
								<span className="section-label">01 / SOURCE</span>
								<ImagePlus size={15} />
							</div>
							<div className="source-tabs">
								{(["Image", "Pattern"] as const).map((item) => (
									<button
										key={item}
										onClick={() => chooseMode(item)}
										className={mode === item ? "active" : ""}
										aria-pressed={mode === item}
									>
										{item}
									</button>
								))}
							</div>
							{mode === "Image" ? (
								<>
									<button
										className="upload-button"
										disabled={loading}
										onClick={() => input.current?.click()}
									>
										<Upload size={16} />
										<span>
											{loading
												? "Reading image…"
												: useUpload
													? "Replace image"
													: "Upload an image"}
										</span>
										<span className="plus">+</span>
									</button>
									<p className="source-hint">
										JPG, PNG, WebP & more · up to 20 MB
									</p>
									{uploaded && !useUpload && (
										<button
											className="restore-image"
											onClick={() => setUseUpload(true)}
										>
											Use {uploaded.name}
										</button>
									)}
								</>
							) : (
								<p className="pattern-hint">
									Start with a gradient. Add a little grain.
									<br />
									Choose a pattern below the canvas.
								</p>
							)}
							<input
								ref={input}
								type="file"
								accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
								className="sr-only"
								aria-label="Upload an image"
								onChange={(event) => {
									void loadFile(event.target.files?.[0]);
									event.target.value = "";
								}}
							/>
						</section>
						<section className="controls-section">
							<div className="section-heading">
								<span className="section-label">02 / TEXTURE</span>
								<button
									className="reset-button"
									onClick={reset}
									aria-label="Reset controls"
									title="Reset controls"
								>
									<RotateCcw size={14} />
								</button>
							</div>
							<DialRoot
								mode="inline"
								theme="light"
								defaultOpen
								productionEnabled
							/>
						</section>
						<section className="palette-section">
							<div className="section-heading">
								<span className="section-label">03 / PALETTE</span>
								<span className="palette-name">
									{palettes.find(
										(p) =>
											p.ink === values.color.ink &&
											p.paper === values.color.paper,
									)?.name ?? "Custom"}
								</span>
							</div>
							<div className="palette-list">
								{palettes.map((palette) => (
									<button
										key={palette.name}
										className={`palette ${values.color.ink === palette.ink && values.color.paper === palette.paper ? "selected" : ""}`}
										onClick={() =>
											dial.setValues({
												color: { ink: palette.ink, paper: palette.paper },
											})
										}
										aria-label={`${palette.name} palette`}
										aria-pressed={
											values.color.ink === palette.ink &&
											values.color.paper === palette.paper
										}
										title={palette.name}
										style={{ background: palette.paper, color: palette.ink }}
									>
										<span style={{ background: palette.ink }} />
									</button>
								))}
							</div>
						</section>
						<button
							className="export-button"
							onClick={download}
							disabled={loading || exporting}
						>
							<ArrowDownToLine size={16} />
							{exporting ? "Exporting…" : "Export PNG"}
							<span>↗</span>
						</button>
						<p className="export-note">
							{settings.transparent
								? "Transparent background"
								: "Ready for your next canvas."}
						</p>
						{error && (
							<div className="error" role="alert">
								<span>{error}</span>
								<button aria-label="Dismiss error" onClick={() => setError("")}>
									<X size={14} />
								</button>
							</div>
						)}
					</aside>
				</div>
			</main>
			<div className={`toast ${notice ? "visible" : ""}`} role="status">
				{notice && (
					<>
						<Check size={15} />
						{notice}
					</>
				)}
			</div>
		</div>
	);
}
