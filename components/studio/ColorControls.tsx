import { SoundButton } from "@/components/ui/SoundButton";
import type { RenderSettings } from "@/lib/renderer";
import { ControlSection } from "./ControlSection";
import { palettes } from "./presets";

function Switch({ on }: { on: boolean }) {
	return (
		<span
			className={`relative block h-4 w-7 shrink-0 rounded-full transition-colors ${
				on ? "bg-cta" : "bg-surface-active"
			}`}
		>
			<span
				className={`absolute top-[2px] block size-3 rounded-full transition-[left] ${
					on ? "left-[14px] bg-surface" : "left-[2px] bg-text-faint"
				}`}
			/>
		</span>
	);
}

export function ColorControls({
	settings,
	choosePalette,
	toggleTransparent,
}: {
	settings: RenderSettings;
	choosePalette: (palette: { ink: string; paper: string }) => void;
	toggleTransparent: () => void;
}) {
	const { ink, paper, transparent } = settings;
	const paletteName =
		palettes.find((p) => p.ink === ink && p.paper === paper)?.name ?? "Custom";
	return (
		<ControlSection
			label="05 / COLOR"
			className="shrink-0"
			extra={<span className="text-xs text-text-faint">{paletteName}</span>}
		>
			<div className="flex gap-1.5">
				{palettes.map((palette) => {
					const selected = ink === palette.ink && paper === palette.paper;
					return (
						<SoundButton
							type="button"
							key={palette.name}
							className={`h-[30px] min-w-0 flex-1 place-items-center rounded-[5px] border border-border hover:-translate-y-0.5 ${
								selected
									? "outline-[1.5px] outline-currentColor outline-offset-2"
									: ""
							}`}
							onClick={() => {
								choosePalette(palette);
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
						</SoundButton>
					);
				})}
			</div>

			<SoundButton
				type="button"
				role="switch"
				sound="toggle"
				aria-checked={transparent}
				onClick={() => {
					toggleTransparent();
				}}
				className="mt-2.5 flex w-full items-center justify-between rounded-[5px] px-1.5 py-1.5 text-sm text-text-muted hover:bg-surface-hover"
			>
				<span>Transparent background</span>
				<Switch on={transparent} />
			</SoundButton>

			<div className="mt-3 grid grid-cols-2 gap-3">
				{(["ink", "paper"] as const).map((color) => (
					<label
						key={color}
						className="flex items-center justify-between gap-2 text-xs text-text-muted"
					>
						<span>{color === "ink" ? "Ink" : "Paper"}</span>
						<input
							type="color"
							aria-label={`${color === "ink" ? "Ink" : "Paper"} color`}
							value={color === "ink" ? ink : paper}
							onChange={(event) =>
								choosePalette({ ink, paper, [color]: event.target.value })
							}
							className="h-7 w-9 cursor-pointer rounded border border-border bg-surface"
						/>
					</label>
				))}
			</div>
		</ControlSection>
	);
}
