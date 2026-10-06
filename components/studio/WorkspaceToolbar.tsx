import { Layers2, Moon, Sun, Volume2, VolumeX } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { useSoundFx } from "@/components/sound-provider";

export function WorkspaceToolbar({
	title,
	cardView,
	setCardView,
}: {
	title: string;
	cardView: boolean;
	setCardView: (value: boolean) => void;
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
					onClick={() => {
						setCardView(!cardView);
						play("toggle");
					}}
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
					onClick={toggleSound}
					title={soundOn ? "Mute sound effects" : "Unmute sound effects"}
					aria-label={soundOn ? "Mute sound effects" : "Unmute sound effects"}
					aria-pressed={!soundOn}
				>
					{soundOn ? <Volume2 size={17} /> : <VolumeX size={17} />}
				</button>
				<button
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
