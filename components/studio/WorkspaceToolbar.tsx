import {
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
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Select } from "@/components/ui/Select";
import { SoundButton } from "@/components/ui/SoundButton";
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
	const { soundOn, toggleSound } = useSoundFx();
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
				<Select
					label="Preview style"
					value={previewStyle}
					options={PREVIEW_STYLES}
					onChange={setPreviewStyle}
					icon={<Layers2 size={14} />}
					variant="toolbar"
					className="w-[136px]"
				/>
				{material !== "paper" && (
					<SegmentedControl
						label="Surface tools"
						value={tool}
						onChange={setTool}
						variant="toolbar"
						options={(["touch", "move"] as const).map((value) => {
							const Icon =
								value === "move"
									? Move
									: material === "thermal"
										? Hand
										: Sparkles;
							return {
								value,
								label:
									value === "move"
										? "Move"
										: material === "thermal"
											? "Touch"
											: "Light",
								icon: <Icon size={14} />,
								disabled:
									original || (value === "move" && previewStyle !== "folder"),
								title: original
									? "Show the result to use surface tools"
									: value === "move" && previewStyle !== "folder"
										? "Move is available in Folder preview"
										: undefined,
							};
						})}
					/>
				)}
			</div>
			<div className="col-start-2 row-start-1 flex items-center gap-1 min-[1100px]:col-start-3">
				<SoundButton
					type="button"
					className="grid size-9 place-items-center rounded-lg text-text-muted hover:bg-surface-hover hover:text-text"
					onClick={toggleSound}
					sound={false}
					title={soundOn ? "Mute sound effects" : "Unmute sound effects"}
					aria-label={soundOn ? "Mute sound effects" : "Unmute sound effects"}
					aria-pressed={!soundOn}
				>
					{soundOn ? <Volume2 size={17} /> : <VolumeX size={17} />}
				</SoundButton>
				<SoundButton
					type="button"
					className="grid size-9 place-items-center rounded-lg text-text-muted hover:bg-surface-hover hover:text-text"
					onClick={toggleTheme}
					sound="switch-on"
					title={isDark ? "Switch to light mode" : "Switch to dark mode"}
					aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
				>
					{isDark ? <Sun size={17} /> : <Moon size={17} />}
				</SoundButton>
			</div>
		</header>
	);
}
