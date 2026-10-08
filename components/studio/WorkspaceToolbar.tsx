import {
	ChevronDown,
	Hand,
	Layers2,
	Moon,
	Move,
	Sparkles,
	Sun,
	Volume2,
	VolumeX,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { useSoundFx } from "@/components/sound-provider";
import type { Material, SurfaceTool } from "@/lib/material";
import { PREVIEW_STYLES, type PreviewStyle } from "./ArtworkPresentation";

export function WorkspaceToolbar({
	title,
	previewStyle,
	setPreviewStyle,
	material,
	tool,
	setTool,
	original,
}: {
	title: string;
	previewStyle: PreviewStyle;
	setPreviewStyle: (value: PreviewStyle) => void;
	material: Material;
	tool: SurfaceTool;
	setTool: (value: SurfaceTool) => void;
	original: boolean;
}) {
	const { resolvedTheme, setTheme } = useTheme();
	const isDark = resolvedTheme === "dark";
	const { play, soundOn, toggleSound } = useSoundFx();
	const interactionHint = original
		? "Viewing the original source"
		: material === "paper"
			? "Choose a preview for your artwork"
			: tool === "move"
				? "Drag to reposition · Arrow keys to nudge"
				: material === "thermal"
					? "Drag to warm the ink · Arrow keys to draw"
					: "Move to catch the light · Arrow keys to explore";
	function toggleTheme() {
		setTheme(isDark ? "light" : "dark");
	}
	useEffect(() => {
		const meta = document.querySelector('meta[name="theme-color"]');
		if (meta)
			meta.setAttribute(
				"content",
				resolvedTheme === "dark" ? "#030202" : "#FAF9F9",
			);
	}, [resolvedTheme]);
	return (
		<header className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 p-4 min-[641px]:px-5 min-[1100px]:grid-cols-[minmax(0,1fr)_auto_auto]">
			<div className="min-w-0">
				<div className="flex items-center gap-2 text-xs font-medium tracking-[1px] text-text-muted uppercase">
					<span className="size-1.5 shrink-0 rounded-full bg-chip" />
					<span className="truncate">{title}</span>
				</div>
				<p
					className="mt-1 truncate text-xs text-text-faint"
					title={interactionHint}
				>
					{interactionHint}
				</p>
			</div>
			<div className="col-span-2 row-start-2 flex flex-wrap items-center justify-between gap-3 min-[1100px]:col-span-1 min-[1100px]:col-start-2 min-[1100px]:row-start-1">
				<div className="relative flex items-center">
					<Layers2
						size={14}
						aria-hidden="true"
						className="pointer-events-none absolute left-3 text-text-muted"
					/>
					<select
						aria-label="Preview style"
						value={previewStyle}
						onChange={(event) => {
							const style = PREVIEW_STYLES.find(
								(item) => item.value === event.target.value,
							);
							if (style) setPreviewStyle(style.value);
							play("toggle");
						}}
						className="h-10 w-[136px] cursor-pointer appearance-none rounded-lg bg-surface-muted py-2 pl-9 pr-8 text-xs font-medium text-text hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2"
					>
						{PREVIEW_STYLES.map((style) => (
							<option key={style.value} value={style.value}>
								{style.label}
							</option>
						))}
					</select>
					<ChevronDown
						size={12}
						aria-hidden="true"
						className="pointer-events-none absolute right-3 text-text-faint"
					/>
				</div>
				{material !== "paper" && (
					<fieldset
						className="flex h-10 items-center gap-1 rounded-lg bg-surface-muted p-1"
						aria-label="Surface tools"
					>
						{(["touch", "move"] as const).map((value) => {
							const Icon =
								value === "move"
									? Move
									: material === "thermal"
										? Hand
										: Sparkles;
							return (
								<button
									key={value}
									type="button"
									aria-pressed={tool === value}
									disabled={
										original || (value === "move" && previewStyle !== "folder")
									}
									onClick={() => setTool(value)}
									title={
										original
											? "Show the result to use surface tools"
											: value === "move" && previewStyle !== "folder"
												? "Move is available in Folder preview"
												: undefined
									}
									className={`flex h-8 items-center justify-center gap-1.5 rounded-md px-2.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-40 ${tool === value ? "bg-surface text-text shadow-tab" : "text-text-muted hover:bg-surface-hover"}`}
								>
									<Icon size={14} aria-hidden="true" />
									{value === "move"
										? "Move"
										: material === "thermal"
											? "Touch"
											: "Light"}
								</button>
							);
						})}
					</fieldset>
				)}
			</div>
			<div className="col-start-2 row-start-1 flex items-center gap-1 min-[1100px]:col-start-3">
				<button
					type="button"
					className="grid size-9 place-items-center rounded-lg text-text-muted hover:bg-surface-hover hover:text-text"
					onClick={toggleSound}
					title={soundOn ? "Mute sound effects" : "Unmute sound effects"}
					aria-label={soundOn ? "Mute sound effects" : "Unmute sound effects"}
					aria-pressed={!soundOn}
				>
					{soundOn ? <Volume2 size={17} /> : <VolumeX size={17} />}
				</button>
				<button
					type="button"
					className="grid size-9 place-items-center rounded-lg text-text-muted hover:bg-surface-hover hover:text-text"
					onClick={() => {
						toggleTheme();
						play("toggle");
					}}
					title={isDark ? "Switch to light mode" : "Switch to dark mode"}
					aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
				>
					{isDark ? <Sun size={17} /> : <Moon size={17} />}
				</button>
			</div>
		</header>
	);
}
