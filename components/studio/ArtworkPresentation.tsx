import { ArrowUpRight, Download } from "lucide-react";
import { type CSSProperties, type ReactNode, useRef, useState } from "react";
import FolderSvg from "@/components/folder";
import { exportFolder } from "@/lib/export-folder";
import type { CardPlaceholder } from "./card-placeholders";

export const PREVIEW_STYLES = [
	{ value: "canvas", label: "Canvas" },
	{ value: "classic", label: "Classic card" },
	{ value: "polaroid", label: "Polaroid" },
	{ value: "editorial", label: "Editorial" },
	{ value: "folder", label: "Folder" },
] as const;

export type PreviewStyle = (typeof PREVIEW_STYLES)[number]["value"];

const frames: Record<PreviewStyle, string> = {
	canvas:
		"aspect-square h-auto w-full max-w-full overflow-hidden rounded-[2px] shadow-card min-[900px]:h-full min-[900px]:w-auto",
	classic:
		"w-[min(100%,280px)] overflow-hidden rounded-2xl bg-surface text-text shadow-card-big",
	polaroid:
		"w-[min(90%,280px)] -rotate-3 bg-[#fffdf7] p-3 text-[#292720] shadow-card-big",
	editorial:
		"w-[min(100%,300px)] overflow-hidden border border-border-strong bg-surface text-text shadow-card-big",
	folder: "relative aspect-[444/376] w-[min(100%,400px)] -translate-y-8",
};

const images: Record<PreviewStyle, string> = {
	canvas: "",
	classic: "mx-4 my-3 overflow-hidden rounded-xl",
	polaroid: "overflow-hidden border border-black/5",
	editorial: "m-4 overflow-hidden rounded-full border border-border",
	// Fill the face with a centered cover crop; keep both comparison canvases aligned.
	folder:
		"absolute overflow-hidden [&>div]:h-full [&_canvas]:absolute [&_canvas]:top-1/2 [&_canvas]:left-0 [&_canvas]:h-auto [&_canvas]:aspect-square [&_canvas]:[transform:translate(var(--folder-x),calc(-50%+var(--folder-y)))]",
};

export function ArtworkPresentation({
	previewStyle,
	cardCopy,
	effect,
	ink,
	paper,
	transparent,
	children,
	onNotice,
	onError,
}: {
	previewStyle: PreviewStyle;
	cardCopy: CardPlaceholder;
	effect: string;
	ink: string;
	paper: string;
	transparent: boolean;
	children: ReactNode;
	onNotice: (message: string) => void;
	onError: (message: string) => void;
}) {
	const frame = useRef<HTMLDivElement>(null);
	const [exporting, setExporting] = useState(false);
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [dragging, setDragging] = useState(false);
	const drag = useRef<{
		pointerId: number;
		x: number;
		y: number;
		width: number;
		height: number;
		start: { x: number; y: number };
	} | null>(null);
	const clamp = (value: number) => Math.max(-50, Math.min(50, value));
	async function downloadFolder() {
		if (exporting) return;
		setExporting(true);
		onNotice("");
		try {
			const svg = frame.current?.querySelector("svg");
			const canvases = frame.current?.querySelectorAll("canvas");
			const artwork = canvases?.[canvases.length - 1];
			if (!svg || !artwork) throw new Error("Artwork is not ready.");
			const blob = await exportFolder({
				svg,
				artwork,
				position,
				paper,
				transparent,
			});
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `dotform-folder-${effect.toLowerCase()}.png`;
			link.click();
			setTimeout(() => URL.revokeObjectURL(url), 1000);
			onNotice("Folder exported · 1024 × 1024 PNG");
		} catch {
			onError("Folder export failed. Please try again.");
		} finally {
			setExporting(false);
		}
	}
	return (
		<>
			<div
				ref={frame}
				className={frames[previewStyle]}
				data-preview-style={previewStyle}
			>
				{previewStyle === "folder" && <FolderSvg ink={ink} paper={paper} />}
				{previewStyle === "editorial" && (
					<div className="flex items-center justify-between border-b border-border-strong px-4 py-3 text-[10px] uppercase tracking-[2px]">
						<span>{cardCopy.category}</span>
						<span>{cardCopy.detail}</span>
					</div>
				)}
				<div
					className={images[previewStyle]}
					style={
						previewStyle === "folder"
							? ({
									"--folder-x": `${position.x}%`,
									"--folder-y": `${position.y}%`,
									// Face bounds and corner radii from the folder SVG's 444 × 376 viewBox.
									left: `${(2 / 444) * 100}%`,
									top: `${(66 / 376) * 100}%`,
									width: `${(440 / 444) * 100}%`,
									height: `${(307 / 376) * 100}%`,
									borderRadius: `${(12 / 440) * 100}% ${(12 / 440) * 100}% ${(24 / 440) * 100}% ${(24 / 440) * 100}% / ${(12 / 307) * 100}% ${(12 / 307) * 100}% ${(24 / 307) * 100}% ${(24 / 307) * 100}%`,
								} as CSSProperties)
							: undefined
					}
				>
					{children}
				</div>
				{previewStyle === "folder" && (
					<button
						type="button"
						aria-label="Folder. Drag or use arrow keys to move the image. Shift moves faster. Home resets position."
						title="Drag to reposition · Arrow keys to nudge · Home to reset"
						className={`absolute inset-0 touch-none rounded-[14px] bg-transparent active:transform-none focus-visible:outline-2 focus-visible:outline-offset-4 ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
						onPointerDown={(event) => {
							if (!event.isPrimary || event.button !== 0 || drag.current)
								return;
							const bounds = event.currentTarget.getBoundingClientRect();
							event.currentTarget.setPointerCapture(event.pointerId);
							drag.current = {
								pointerId: event.pointerId,
								x: event.clientX,
								y: event.clientY,
								width: (bounds.width * 440) / 444,
								height: (bounds.width * 440) / 444,
								start: position,
							};
							setDragging(true);
						}}
						onPointerMove={(event) => {
							const current = drag.current;
							if (!current || current.pointerId !== event.pointerId) return;
							setPosition({
								x: clamp(
									current.start.x +
										((event.clientX - current.x) / current.width) * 100,
								),
								y: clamp(
									current.start.y +
										((event.clientY - current.y) / current.height) * 100,
								),
							});
						}}
						onPointerUp={(event) => {
							if (drag.current?.pointerId !== event.pointerId) return;
							event.currentTarget.releasePointerCapture(event.pointerId);
							drag.current = null;
							setDragging(false);
						}}
						onPointerCancel={() => {
							if (drag.current) setPosition(drag.current.start);
							drag.current = null;
							setDragging(false);
						}}
						onLostPointerCapture={() => {
							drag.current = null;
							setDragging(false);
						}}
						onKeyDown={(event) => {
							const step = event.shiftKey ? 10 : 2;
							const directions: Record<string, { x: number; y: number }> = {
								ArrowLeft: { x: -step, y: 0 },
								ArrowRight: { x: step, y: 0 },
								ArrowUp: { x: 0, y: -step },
								ArrowDown: { x: 0, y: step },
							};
							if (event.key === "Enter") {
								event.preventDefault();
								setPosition({ x: 0, y: 0 });
							} else if (directions[event.key]) {
								event.preventDefault();
								const delta = directions[event.key];
								setPosition((current) => ({
									x: clamp(current.x + delta.x),
									y: clamp(current.y + delta.y),
								}));
							}
						}}
					/>
				)}
				{previewStyle === "classic" && (
					<div className="px-4 pb-4">
						<span className="text-[10px] uppercase tracking-[1.3px] text-text-faint">
							{cardCopy.category}
						</span>
						<h2 className="mt-1 font-display text-lg font-semibold tracking-[-0.7px]">
							{cardCopy.title}
						</h2>
						<p className="mt-1 text-sm text-text-muted">
							{cardCopy.description}
						</p>
					</div>
				)}
				{previewStyle === "polaroid" && (
					<div className="px-1 pb-2 pt-5">
						<h2 className="truncate font-serif text-xl italic">
							{cardCopy.title}
						</h2>
						<p className="mt-2 font-mono text-[9px] uppercase tracking-[2px] opacity-50">
							{cardCopy.category} / {cardCopy.detail}
						</p>
					</div>
				)}
				{previewStyle === "editorial" && (
					<div className="border-t border-border-strong p-4">
						<h2 className="truncate font-serif text-[32px] leading-none tracking-[-1px]">
							{cardCopy.title}
						</h2>
						<div className="mt-4 flex items-center justify-between text-[10px] uppercase tracking-[1.5px] text-text-muted">
							<span>Read the story</span>
							<ArrowUpRight size={16} aria-hidden="true" />
						</div>
					</div>
				)}
			</div>
			{previewStyle === "folder" && (
				<fieldset
					aria-label="Folder keyboard shortcuts"
					className="absolute inset-x-4 bottom-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 rounded-lg border border-border bg-surface px-2 py-2 text-[10px] text-text-muted shadow-panel w-fit mx-auto"
				>
					<span className="flex items-center gap-1.5">
						<kbd
							className="rounded border border-border bg-surface-muted px-1.5 py-0.5 font-mono text-[10px] text-text"
							aria-label="Arrow keys"
						>
							← ↑ ↓ →
						</kbd>
						Move
					</span>
					<span className="flex items-center gap-1.5">
						<kbd className="rounded border border-border bg-surface-muted px-1.5 py-0.5 font-mono text-[10px] text-text">
							Shift
						</kbd>
						+ arrows · Faster
					</span>
					<button
						type="button"
						className="flex items-center gap-1.5 rounded px-1 py-0.5 text-[10px] hover:bg-surface-hover"
						onClick={() => setPosition({ x: 0, y: 0 })}
						aria-label="Reset folder image position"
					>
						<kbd className="rounded border border-border bg-surface-muted px-1.5 py-0.5 font-mono text-[10px] text-text">
							Enter
						</kbd>
						Center
					</button>
					<button
						type="button"
						disabled={exporting}
						onClick={downloadFolder}
						className="flex items-center gap-1.5 rounded bg-cta px-2 py-1.5 text-[10px] text-cta-text hover:bg-cta-hover"
					>
						<Download size={12} aria-hidden="true" />
						{exporting ? "Exporting…" : "Export folder PNG"}
					</button>
				</fieldset>
			)}
		</>
	);
}
