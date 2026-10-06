import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Upload } from "lucide-react";
import { ART_SIZE, renderArt, type RenderSettings } from "@/lib/renderer";
import { useSoundFx } from "@/components/sound-provider";
import { WorkspaceToolbar } from "./WorkspaceToolbar";

export function ArtworkWorkspace({
	source,
	pixels,
	title,
	settings,
	original,
	setOriginal,
	loadFile,
}: {
	source: HTMLCanvasElement;
	pixels: ImageData;
	title: string;
	settings: RenderSettings;
	original: boolean;
	setOriginal: (value: boolean) => void;
	loadFile: (file?: File) => Promise<void>;
}) {
	const { effect, transparent, paper } = settings;
	const { play } = useSoundFx();
	const [cardView, setCardView] = useState(false);
	const [dragging, setDragging] = useState(false);
	const canvas = useRef<HTMLCanvasElement>(null);
	const originalCanvas = useRef<HTMLCanvasElement>(null);
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

	return (
		<section
			className="flex min-h-0 flex-col overflow-hidden rounded-[10px] border border-border bg-surface shadow-panel"
			aria-label="Artwork workspace"
		>
			<WorkspaceToolbar
				title={title}
				cardView={cardView}
				setCardView={setCardView}
			/>

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
							? "max-h-full w-[min(100%,280px)] overflow-hidden rounded-2xl bg-surface shadow-card-big text-text"
							: "aspect-square h-auto w-full max-w-full overflow-hidden rounded-[2px] shadow-card min-[900px]:h-full min-[900px]:w-auto"
					}
					style={
						cardView || transparent ? undefined : { backgroundColor: paper }
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
						className={`relative inset-0 leading-0 rounded-2xl ${
							transparent
								? "bg-[conic-gradient(var(--color-check-a)_25%,var(--color-check-b)_0_50%,var(--color-check-a)_0_75%,var(--color-check-b)_0)] bg-size-[16px_16px]"
								: ""
						} ${cardView ? "mx-4 my-3" : ""}`}
						style={
							cardView && !transparent ? { backgroundColor: paper } : undefined
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
							<span className="text-xs tracking-[1.3px] opacity-35">
								A DIFFERENT PERSPECTIVE
							</span>
							<h2 className="font-display text-lg font-semibold tracking-[-0.7px] mt-1.2">
								Made of little things.
							</h2>
							<p className="text-sm opacity-60">
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
