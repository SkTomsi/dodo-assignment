import { Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSoundFx } from "@/components/sound-provider";
import { ART_SIZE, type RenderSettings, renderArt } from "@/lib/renderer";
import { ArtworkPresentation, type PreviewStyle } from "./ArtworkPresentation";
import { pickCardPlaceholder } from "./card-placeholders";
import { WorkspaceToolbar } from "./WorkspaceToolbar";

export function ArtworkWorkspace({
	source,
	pixels,
	title,
	settings,
	original,
	setOriginal,
	loadFile,
	onNotice,
	onError,
}: {
	source: HTMLCanvasElement;
	pixels: ImageData;
	title: string;
	settings: RenderSettings;
	original: boolean;
	setOriginal: (value: boolean) => void;
	loadFile: (file?: File) => Promise<void>;
	onNotice: (message: string) => void;
	onError: (message: string) => void;
}) {
	const { effect, transparent, paper } = settings;
	const { play } = useSoundFx();
	const [previewStyle, setPreviewStyle] = useState<PreviewStyle>("canvas");
	const [cardCopy, setCardCopy] = useState(() => pickCardPlaceholder());
	const [dragging, setDragging] = useState(false);
	const canvas = useRef<HTMLCanvasElement>(null);
	const originalCanvas = useRef<HTMLCanvasElement>(null);
	// Ripple time in seconds; only advances while animating so pausing
	// (original view, reduced motion, animate off) never causes a phase jump.
	const clock = useRef(0);
	useEffect(() => {
		const el = canvas.current;
		if (!el) return;
		const animate =
			settings.animate &&
			settings.motion > 0 &&
			!original &&
			!window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		if (!animate) {
			const frame = requestAnimationFrame(() =>
				renderArt(el, pixels, settings),
			);
			return () => cancelAnimationFrame(frame);
		}
		let frame = 0;
		let last = 0;
		let gap = 0;
		let prev: number | null = null;
		const loop = (now: number) => {
			frame = requestAnimationFrame(loop);
			if (now - last < gap) return;
			last = now;
			if (prev !== null) clock.current += (now - prev) / 1000;
			prev = now;
			const start = performance.now();
			renderArt(el, pixels, settings, ART_SIZE, clock.current);
			// Back off when a full redraw is expensive (dense grids) so the
			// ripple stays smooth instead of starving the main thread.
			gap = Math.min(
				250,
				Math.max(1000 / 60, (performance.now() - start) * 1.5),
			);
		};
		frame = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(frame);
	}, [pixels, settings, original]);
	useEffect(() => {
		if (original && originalCanvas.current) {
			const ctx = originalCanvas.current.getContext("2d");
			if (!ctx) return;
			ctx.clearRect(0, 0, 640, 640);
			ctx.drawImage(source, 0, 0);
		}
	}, [source, original]);

	return (
		<section
			className="flex min-h-0 flex-col overflow-hidden rounded-[10px] border border-border bg-surface shadow-panel"
			aria-label="Artwork workspace"
		>
			<WorkspaceToolbar
				title={title}
				previewStyle={previewStyle}
				setPreviewStyle={(style) => {
					if (
						style !== previewStyle &&
						style !== "canvas" &&
						style !== "folder"
					) {
						setCardCopy(pickCardPlaceholder(cardCopy));
					}
					setPreviewStyle(style);
				}}
			/>

			<section
				aria-label="Image drop area"
				className={`relative flex items-center justify-center overflow-hidden bg-surface-muted p-4 min-[641px]:p-6 aspect-square min-[900px]:aspect-auto min-[900px]:min-h-0 min-[900px]:flex-1 ${
					previewStyle !== "canvas" ? "min-h-[500px]" : ""
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

				<ArtworkPresentation
					previewStyle={previewStyle}
					cardCopy={cardCopy}
					effect={effect}
					ink={settings.ink}
					paper={paper}
					transparent={transparent}
					onNotice={onNotice}
					onError={onError}
				>
					<div
						className={`relative overflow-hidden leading-0 ${transparent && previewStyle !== "folder" ? "bg-[conic-gradient(var(--color-check-a)_25%,var(--color-check-b)_0_50%,var(--color-check-a)_0_75%,var(--color-check-b)_0)] bg-size-[16px_16px]" : ""}`}
						style={transparent ? undefined : { backgroundColor: paper }}
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
								className="absolute inset-0 h-full w-full"
								ref={originalCanvas}
								width="640"
								height="640"
								role="img"
								aria-label="Original source image"
							/>
						)}
					</div>
				</ArtworkPresentation>

				{dragging && (
					<div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 bg-overlay-bg text-base text-overlay-text outline-2 outline-dashed outline-offset-[-12px] outline-overlay-line">
						<Upload size={28} />
						<span>Drop your image here</span>
					</div>
				)}
			</section>

			<div className="flex h-10 shrink-0 items-center justify-between gap-2.5 border-t border-border px-3 text-xs text-text-faint">
				<button
					type="button"
					onClick={() => {
						setOriginal(!original);
						play("toggle");
					}}
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
	);
}
