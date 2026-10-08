import { Upload } from "lucide-react";
import { type RefObject, useEffect, useRef, useState } from "react";
import { useSoundFx } from "@/components/sound-provider";
import { type ExportOptions, exportRatios } from "@/lib/export-artwork";
import {
	type ArtworkCapture,
	type Material,
	materials,
	type SurfaceTool,
} from "@/lib/material";
import type { RenderSettings } from "@/lib/renderer";
import { ArtworkPresentation, type PreviewStyle } from "./ArtworkPresentation";
import { pickCardPlaceholder } from "./card-placeholders";
import { MaterialSurface } from "./MaterialSurface";
import { WorkspaceToolbar } from "./WorkspaceToolbar";

export function ArtworkWorkspace({
	source,
	pixels,
	title,
	settings,
	exportOptions,
	material,
	strength,
	brush,
	keepMarks,
	clearVersion,
	tool,
	setTool,
	capture,
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
	exportOptions: ExportOptions;
	material: Material;
	strength: number;
	brush: number;
	keepMarks: boolean;
	clearVersion: number;
	tool: SurfaceTool;
	setTool: (tool: SurfaceTool) => void;
	capture: RefObject<ArtworkCapture | null>;
	original: boolean;
	setOriginal: (value: boolean) => void;
	loadFile: (file?: File) => Promise<void>;
	onNotice: (message: string) => void;
	onError: (message: string) => void;
}) {
	const { effect, transparent, paper } = settings;
	const { play } = useSoundFx();
	const [previewStyle, setPreviewStyle] = useState<PreviewStyle>("folder");
	const [cardCopy, setCardCopy] = useState(() => pickCardPlaceholder());
	const [dragging, setDragging] = useState(false);
	const originalCanvas = useRef<HTMLCanvasElement>(null);
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
			className="flex min-h-0 flex-col overflow-hidden rounded-xl bg-surface shadow-panel"
			aria-label="Artwork workspace"
		>
			<WorkspaceToolbar
				title={title}
				material={material}
				tool={tool}
				setTool={setTool}
				original={original}
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
					if (style !== "folder") setTool("touch");
				}}
			/>
			<section
				aria-label="Image drop area"
				className={`relative flex items-center justify-center overflow-hidden bg-surface-muted p-6 min-[641px]:p-8 aspect-square min-[900px]:aspect-auto min-[900px]:min-h-0 min-[900px]:flex-1 ${
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
					capture={capture}
					exportSize={exportOptions.size}
					touching={material !== "paper" && tool === "touch" && !original}
				>
					<div
						className={`relative overflow-hidden leading-0 ${transparent && previewStyle !== "folder" ? "bg-[conic-gradient(var(--color-check-a)_25%,var(--color-check-b)_0_50%,var(--color-check-a)_0_75%,var(--color-check-b)_0)] bg-size-[16px_16px]" : ""}`}
						style={transparent ? undefined : { backgroundColor: paper }}
					>
						<MaterialSurface
							pixels={pixels}
							settings={settings}
							material={material}
							strength={strength}
							brush={brush}
							keepMarks={keepMarks}
							clearVersion={clearVersion}
							tool={previewStyle === "folder" ? tool : "touch"}
							original={original}
							capture={capture}
							onNotice={onNotice}
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
						{previewStyle === "canvas" &&
							exportOptions.ratio !== "square" &&
							(() => {
								const ratio =
									exportRatios.find(
										(item) => item.value === exportOptions.ratio,
									)?.ratio ?? 1;
								return (
									<div
										aria-hidden="true"
										className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border border-white/80 shadow-[0_0_0_999px_#00000055]"
										style={{
											width: `${Math.min(1, ratio) * 100}%`,
											height: `${Math.min(1, 1 / ratio) * 100}%`,
										}}
									/>
								);
							})()}
					</div>
				</ArtworkPresentation>

				{dragging && (
					<div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 bg-overlay-bg text-base text-overlay-text outline-2 outline-dashed outline-offset-[-12px] outline-overlay-line">
						<Upload size={28} />
						<span>Drop your image here</span>
					</div>
				)}
			</section>

			<div className="flex h-12 shrink-0 items-center justify-between gap-3 px-4 text-xs text-text-faint min-[641px]:px-5">
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
					{material !== "paper" && (
						<span className="mr-2 hidden min-[641px]:inline">
							{materials.find((item) => item.value === material)?.label} ·{" "}
							{material !== "thermal"
								? "Full-surface finish"
								: keepMarks
									? "Marks kept"
									: "Cooling ink"}{" "}
						</span>
					)}
					1024 × 1024
				</span>
			</div>
		</section>
	);
}
