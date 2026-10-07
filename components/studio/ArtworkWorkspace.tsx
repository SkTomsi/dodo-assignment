import { Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSoundFx } from "@/components/sound-provider";
import { ART_SIZE, type RenderSettings, renderArt } from "@/lib/renderer";
import { ArtworkPresentation, type PreviewStyle } from "./ArtworkPresentation";
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
	const [dragging, setDragging] = useState(false);
	const canvas = useRef<HTMLCanvasElement>(null);
	const originalCanvas = useRef<HTMLCanvasElement>(null);
	useEffect(() => {
		const frame = requestAnimationFrame(() => {
			if (canvas.current) renderArt(canvas.current, pixels, settings);
		});
		return () => cancelAnimationFrame(frame);
	}, [pixels, settings]);
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
				setPreviewStyle={setPreviewStyle}
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
					title={title}
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
