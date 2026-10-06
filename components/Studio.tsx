/** biome-ignore-all lint/a11y/useButtonType: <explanation> */
"use client";

import { type DialConfig, DialRoot, useDialKitController } from "dialkit";
import {
	ArrowDownToLine,
	ArrowUpRight,
	Check,
	Layers2,
	Moon,
	RotateCcw,
	Sun,
	Upload,
	X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
	ART_SIZE,
	createSource,
	type Effect,
	prepareImage,
	type RenderSettings,
	renderArt,
	type SourceName,
	sourcePixels,
} from "@/lib/renderer";

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
} satisfies DialConfig;

const palettes = [
	{ name: "Terracotta", ink: "#da593b", paper: "#f5eee2" },
	{ name: "Carbon", ink: "#292b29", paper: "#f0efea" },
	{ name: "Cobalt", ink: "#3258c9", paper: "#edf0f8" },
	{ name: "Moss", ink: "#49664c", paper: "#eef0e4" },
	{ name: "Mulberry", ink: "#82416d", paper: "#f4e9ef" },
];
const defaultPalette = palettes[0];
const effects: Effect[] = ["Halftone", "Dither", "Lines"];
const imageSources: SourceName[] = ["Bloom", "Orbit", "Sphere"];
const patternSources: SourceName[] = ["Waves", "Ripple", "Mesh"];
const sectionLabel =
	"text-xs font-semibold tracking-[1.5px] text-text-faint";
const glyphs = [
	"bg-[radial-gradient(currentColor_1.2px,transparent_1.4px)] bg-[length:4px_4px]",
	"bg-[conic-gradient(currentColor_25%,transparent_0_50%,currentColor_0_75%,transparent_0)] bg-[length:6px_6px]",
	"bg-[repeating-linear-gradient(0deg,currentColor_0_1px,transparent_1px_4px)]",
];

function Box({
	label,
	extra,
	children,
	className = "",
}: {
	label: string;
	extra?: ReactNode;
	children: ReactNode;
	className?: string;
}) {
	return (
		<section className={`rounded-[8px] bg-surface p-3 ${className}`}>
			<div className="mb-2.5 flex min-h-[14px] items-center justify-between text-text-faint">
				<span className={sectionLabel}>{label}</span>
				{extra}
			</div>
			{children}
		</section>
	);
}

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
			className={`relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-[6px] border bg-surface ${
				selected
					? "border-border-strong shadow-[0_0_0_2px_var(--color-border)]"
					: "border-border"
			}`}
			onClick={onClick}
			aria-pressed={selected}
		>
			<canvas
				ref={ref}
				aria-hidden="true"
				className="block h-[44px] w-full bg-canvas-bg"
			/>
			<span
				className={`block truncate px-1 pb-1.5 pt-1 text-center text-xs ${
					selected ? "text-text" : "text-text-faint"
				}`}
			>
				{name}
			</span>
			{selected && (
				<span className="absolute right-1 top-1 grid size-3 place-items-center rounded-full bg-chip text-check-mark">
					<Check size={10} />
				</span>
			)}
		</button>
	);
}

export default function Studio() {
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
	const [ink, setInk] = useState(defaultPalette.ink);
	const [paper, setPaper] = useState(defaultPalette.paper);
	const [transparent, setTransparent] = useState(false);
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
	const { resolvedTheme, setTheme } = useTheme();
	const isDark = resolvedTheme === "dark";
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
			ink,
			paper,
			transparent,
		}),
		[effect, values, ink, paper, transparent],
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
	useEffect(() => {
		const meta = document.querySelector('meta[name="theme-color"]');
		if (meta)
			meta.setAttribute(
				"content",
				resolvedTheme === "dark" ? "#000000" : "#ffffff",
			);
	}, [resolvedTheme]);

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
	function toggleTheme() {
		setTheme(isDark ? "light" : "dark");
	}
	function reset() {
		dial.resetValues();
		setEffect("Halftone");
		setInk(defaultPalette.ink);
		setPaper(defaultPalette.paper);
		setTransparent(false);
		setOriginal(false);
		setNotice("Controls reset");
	}
	function download() {
		setExporting(true);
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
	const samples = mode === "Image" ? imageSources : patternSources;
	const paletteName =
		palettes.find((p) => p.ink === ink && p.paper === paper)?.name ?? "Custom";

	return (
		<div className="min-h-dvh bg-bg">
			<main className="mx-auto max-w-[1360px] px-4 py-4 min-[641px]:px-6 min-[900px]:h-dvh min-[900px]:py-5">
				<div className="grid grid-cols-1 gap-5 min-[641px]:gap-[22px] min-[900px]:h-full min-[900px]:grid-cols-[minmax(0,1fr)_296px] min-[1200px]:grid-cols-[minmax(0,1fr)_318px]">
					<section
						className="flex min-h-0 flex-col overflow-hidden rounded-[10px] border border-border bg-surface shadow-panel"
						aria-label="Artwork workspace"
					>
						<div className="flex h-[46px] shrink-0 items-center justify-between gap-3 border-b border-border px-3">
							<span className="flex min-w-0 items-center gap-2 text-xs tracking-[1.2px] text-text-faint uppercase">
								<span className="size-1 shrink-0 rounded-full bg-chip" />
								<span className="truncate">{title}</span>
							</span>
							<div className="flex shrink-0 items-center gap-1">
								<button
									className={`grid size-[30px] place-items-center rounded-[5px] text-text-faint ${
										cardView ? "bg-surface-hover text-text" : ""
									}`}
									onClick={() => setCardView(!cardView)}
									aria-pressed={cardView}
									title="Preview on a UI card"
									aria-label="Preview on a UI card"
								>
									<Layers2 size={17} />
								</button>
								<button
									className={`grid size-[30px] place-items-center rounded-[5px] text-text-faint ${
										isDark ? "bg-surface-hover text-text" : ""
									}`}
									onClick={toggleTheme}
									title={
										isDark ? "Switch to light mode" : "Switch to dark mode"
									}
									aria-label={
										isDark ? "Switch to light mode" : "Switch to dark mode"
									}
								>
									{isDark ? <Sun size={17} /> : <Moon size={17} />}
								</button>
							</div>
						</div>

						<div
							className={`relative flex items-center justify-center overflow-hidden bg-surface-muted p-4 min-[641px]:p-6 aspect-square min-[900px]:aspect-auto min-[900px]:min-h-0 min-[900px]:flex-1 ${
								cardView ? "min-[900px]:min-h-[440px]" : ""
							}`}
							onDragOver={(event) => {
								event.preventDefault();
								setDragging(true);
							}}
							onDragLeave={(event) => {
								if (!event.currentTarget.contains(event.relatedTarget as Node))
									setDragging(false);
							}}
							onDrop={(event) => {
								event.preventDefault();
								setDragging(false);
								void loadFile(event.dataTransfer.files[0]);
							}}
						>
							<div className="absolute left-[17px] top-[17px] size-2 border-l border-t border-border-strong" />
							<div className="absolute right-[17px] top-[17px] size-2 border-r border-t border-border-strong" />
							<div className="absolute bottom-[17px] left-[17px] size-2 border-b border-l border-border-strong" />
							<div className="absolute bottom-[17px] right-[17px] size-2 border-b border-r border-border-strong" />

							<div
								className={
									cardView
										? "max-h-full w-[min(100%,280px)] overflow-hidden rounded-[12px] bg-surface shadow-card-big text-text"
										: "aspect-square h-auto w-full max-w-full overflow-hidden rounded-[2px] shadow-card min-[900px]:h-full min-[900px]:w-auto"
								}
								style={
									cardView || transparent
										? undefined
										: { backgroundColor: paper }
								}
							>
								{cardView && (
									<div className="flex items-center justify-between px-4 pt-4">
										<span className="text-xs tracking-[1.4px]">
											FIELD NOTES / 001
										</span>
										<ArrowUpRight size={16} />
									</div>
								)}
								<div
									className={`relative leading-[0] ${
										transparent
											? "bg-[conic-gradient(var(--color-check-a)_25%,var(--color-check-b)_0_50%,var(--color-check-a)_0_75%,var(--color-check-b)_0)] bg-[length:16px_16px]"
											: ""
									} ${cardView ? "mx-4 my-3" : ""}`}
									style={
										cardView && !transparent
											? { backgroundColor: paper }
											: undefined
									}
								>
									<canvas
										ref={canvas}
										width={ART_SIZE}
										height={ART_SIZE}
										role="img"
										aria-label={`${effect} artwork of ${title}`}
										className="block h-auto w-full"
									/>
									{original && (
										<canvas
											className="absolute inset-0"
											ref={originalCanvas}
											width="640"
											height="640"
											role="img"
											aria-label="Original source image"
										/>
									)}
								</div>
								{cardView && (
									<div className="px-4 pb-4">
										<span className="text-xs tracking-[1.3px] opacity-65">
											A DIFFERENT PERSPECTIVE
										</span>
										<h2 className="font-display mt-1.5 text-lg font-semibold tracking-[-0.7px]">
											Made of little things.
										</h2>
										<p className="mt-1.5 text-sm opacity-60">
											A study in texture, shape, and possibility.
										</p>
									</div>
								)}
							</div>

							{dragging && (
								<div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 bg-overlay-bg text-base text-overlay-text outline-2 outline-dashed outline-offset-[-12px] outline-overlay-line">
									<Upload size={28} />
									<span>Drop your image here</span>
								</div>
							)}
						</div>

						<div className="flex h-10 shrink-0 items-center justify-between gap-2.5 border-t border-border px-3 text-xs text-text-faint">
							<button
								onClick={() => setOriginal(!original)}
								aria-pressed={original}
								className="-ml-1.5 rounded-[5px] px-1.5 py-1.5 text-xs text-text-muted hover:bg-surface-hover"
							>
								{original ? "Show result" : "Show original"}
							</button>
							<span className="text-xs tabular-nums tracking-[0.5px]">
								1024 × 1024
							</span>
						</div>
					</section>

					<aside
						className="sidebar flex min-h-0 flex-col gap-3 overflow-y-auto rounded-[10px] border border-border bg-surface-muted p-3 shadow-panel"
						aria-label="Generator controls"
					>
						<Box label="01 / TYPE" className="shrink-0">
							<div className="flex rounded-[6px] bg-surface-muted p-[3px]">
								{effects.map((item, i) => (
									<button
										key={item}
										onClick={() => setEffect(item)}
										aria-pressed={effect === item}
										className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-[4px] px-1 py-[7px] text-sm ${
											effect === item
												? "bg-surface text-text shadow-tab"
												: "text-text-faint"
										}`}
									>
										<span
											className={`size-3 shrink-0 ${glyphs[i]}`}
											aria-hidden="true"
										/>
										<span className="truncate">{item}</span>
									</button>
								))}
							</div>
						</Box>

						<Box label="02 / SHAPE" className="shrink-0">
							<div className="mb-2.5 flex rounded-[6px] bg-surface-muted p-[3px]">
								{(["Image", "Pattern"] as const).map((item) => (
									<button
										key={item}
										onClick={() => chooseMode(item)}
										className={`flex-1 rounded-[4px] px-2 py-[6px] text-sm ${
											mode === item
												? "bg-surface text-text shadow-tab"
												: "text-text-faint"
										}`}
										aria-pressed={mode === item}
									>
										{item}
									</button>
								))}
							</div>
							<div className="flex items-stretch gap-2">
								{mode === "Image" && (
									<button
										className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1.5 rounded-[6px] border border-dashed text-text-faint hover:bg-surface-hover ${
											useUpload
												? "border-border-strong bg-surface-hover shadow-[0_0_0_2px_var(--color-border)]"
												: "border-border-strong"
										}`}
										disabled={loading}
										onClick={() => input.current?.click()}
										aria-pressed={useUpload}
									>
										<Upload size={14} />
										<span className="truncate px-1 text-xs">
											{loading ? "Reading…" : "Upload"}
										</span>
									</button>
								)}
								{samples.map((name) => (
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
								))}
							</div>
							<p className="mt-2 text-center text-xs text-text-faint">
								JPG, PNG, WebP & more · up to 20 MB
							</p>
							{error && (
								<div
									className="mt-2 flex items-start gap-1.5 text-sm leading-[1.4] text-danger"
									role="alert"
								>
									<span className="min-w-0 flex-1">{error}</span>
									<button
										aria-label="Dismiss error"
										onClick={() => setError("")}
										className="shrink-0 text-text-faint"
									>
										<X size={12} />
									</button>
								</div>
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
						</Box>

						<section className="flex min-h-[200px] shrink flex-col overflow-hidden rounded-[8px] bg-surface p-3">
							<div className="mb-2.5 flex min-h-[14px] shrink-0 items-center justify-between text-text-faint">
								<span className={sectionLabel}>03 / TEXTURE</span>
								<button
									className="-mr-1 rounded-[4px] p-1 text-text-faint hover:bg-surface-hover"
									onClick={reset}
									aria-label="Reset controls"
									title="Reset controls"
								>
									<RotateCcw size={13} />
								</button>
							</div>
							<div className="texture-scroll min-h-0 flex-1 overflow-y-auto">
								<DialRoot
									mode="inline"
									theme={isDark ? "dark" : "light"}
									defaultOpen
									productionEnabled
								/>
							</div>
						</section>

						<div className="min-h-[16px] flex-1" aria-hidden="true" />

						<Box
							label="04 / OTHER"
							className="shrink-0"
							extra={
								<span className="text-xs text-text-faint">
									{paletteName}
								</span>
							}
						>
							<div className="flex gap-1.5">
								{palettes.map((palette) => {
									const selected =
										ink === palette.ink && paper === palette.paper;
									return (
										<button
											key={palette.name}
											className={`h-[30px] min-w-0 flex-1 place-items-center rounded-[5px] border border-border hover:-translate-y-0.5 ${
												selected
													? "outline-[1.5px] outline-currentColor outline-offset-2"
													: ""
											}`}
											onClick={() => {
												setInk(palette.ink);
												setPaper(palette.paper);
											}}
											aria-label={`${palette.name} palette`}
											aria-pressed={selected}
											title={palette.name}
											style={{ background: palette.paper, color: palette.ink }}
										>
											<span
												className="mx-auto block size-3.5 rounded-full"
												style={{ background: palette.ink }}
											/>
										</button>
									);
								})}
							</div>

							<button
								role="switch"
								aria-checked={transparent}
								onClick={() => setTransparent((value) => !value)}
								className="mt-2.5 flex w-full items-center justify-between rounded-[5px] px-1.5 py-1.5 text-sm text-text-muted hover:bg-surface-hover"
							>
								<span>Transparent background</span>
								<span
									className={`relative block h-4 w-7 shrink-0 rounded-full transition-colors ${
										transparent ? "bg-cta" : "bg-surface-active"
									}`}
								>
									<span
										className={`absolute top-[2px] block size-3 rounded-full transition-[left] ${
											transparent
												? "left-[14px] bg-surface"
												: "left-[2px] bg-text-faint"
										}`}
									/>
								</span>
							</button>

							<button
								className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-[6px] bg-cta px-3 py-2.5 text-sm text-cta-text shadow-panel hover:bg-cta-hover"
								onClick={download}
								disabled={loading || exporting}
							>
								<ArrowDownToLine className="mr-auto" size={15} />
								{exporting ? "Exporting…" : "Export PNG"}
								<span className="ml-auto text-cta-accent">↗</span>
							</button>
						</Box>
					</aside>
				</div>
			</main>

			<div
				className={`pointer-events-none fixed bottom-[22px] left-1/2 z-20 flex max-w-[calc(100%-28px)] items-center gap-[9px] whitespace-normal rounded-lg bg-cta px-4 py-[11px] text-sm text-cta-text shadow-toast transition-[opacity,transform] duration-[180ms] ${
					notice ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
				} min-[641px]:whitespace-nowrap`}
				role="status"
			>
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
