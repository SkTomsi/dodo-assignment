import {
	ChevronDown,
	Layers2,
	Moon,
	Sun,
	Volume2,
	VolumeX,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { useSoundFx } from "@/components/sound-provider";
import { PREVIEW_STYLES, type PreviewStyle } from "./ArtworkPresentation";

export function WorkspaceToolbar({
	title,
	previewStyle,
	setPreviewStyle,
}: {
	title: string;
	previewStyle: PreviewStyle;
	setPreviewStyle: (value: PreviewStyle) => void;
}) {
	const { resolvedTheme, setTheme } = useTheme();
	const isDark = resolvedTheme === "dark";
	const { play, soundOn, toggleSound } = useSoundFx();
	function toggleTheme() {
		setTheme(isDark ? "light" : "dark");
	}
	useEffect(() => {
		const meta = document.querySelector('meta[name="theme-color"]');
		if (meta)
			meta.setAttribute(
				"content",
				resolvedTheme === "dark" ? "#000000" : "#ffffff",
			);
	}, [resolvedTheme]);
	return (
		<div className="flex h-14 shrink-0 items-center justify-between gap-3 px-4 min-[641px]:px-5">
			<span className="flex min-w-0 items-center gap-2 text-xs tracking-[1.2px] text-text-faint uppercase">
				<span className="size-1 shrink-0 rounded-full bg-chip" />
				<span className="truncate">{title}</span>
			</span>
			<div className="flex shrink-0 items-center gap-1">
				<div className="relative flex items-center">
					<Layers2
						size={14}
						aria-hidden="true"
						className="pointer-events-none absolute left-2 text-text-muted"
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
						className="h-8 cursor-pointer appearance-none rounded-[5px] border border-border bg-surface py-1 pl-7 pr-7 text-xs text-text focus-visible:outline-2 focus-visible:outline-offset-2"
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
						className="pointer-events-none absolute right-2 text-text-faint"
					/>
				</div>
				<button
					type="button"
					className={`grid size-[30px] place-items-center rounded-[5px] text-text-faint ${
						isDark ? "bg-surface-hover text-text" : ""
					}`}
					onClick={toggleSound}
					title={soundOn ? "Mute sound effects" : "Unmute sound effects"}
					aria-label={soundOn ? "Mute sound effects" : "Unmute sound effects"}
					aria-pressed={!soundOn}
				>
					{soundOn ? <Volume2 size={17} /> : <VolumeX size={17} />}
				</button>
				<button
					type="button"
					className={`grid size-[30px] place-items-center rounded-[5px] text-text-faint ${
						isDark ? "bg-surface-hover text-text" : ""
					}`}
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
		</div>
	);
}
