import { ArrowDownToLine } from "lucide-react";
import { useSoundFx } from "@/components/sound-provider";
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

export function OutputControls({
	settings,
	choosePalette,
	toggleTransparent,
	download,
	loading,
	exporting,
}: {
	settings: RenderSettings;
	choosePalette: (palette: { ink: string; paper: string }) => void;
	toggleTransparent: () => void;
	download: () => void;
	loading: boolean;
	exporting: boolean;
}) {
	const { ink, paper, transparent } = settings;
	const { play } = useSoundFx();
	const paletteName =
		palettes.find((p) => p.ink === ink && p.paper === paper)?.name ?? "Custom";
	return (
		<ControlSection
			label="05 / OTHER"
			className="shrink-0"
			extra={<span className="text-xs text-text-faint">{paletteName}</span>}
		>
			<div className="flex gap-1.5">
				{palettes.map((palette) => {
					const selected = ink === palette.ink && paper === palette.paper;
					return (
						<button
							type="button"
							key={palette.name}
							className={`h-[30px] min-w-0 flex-1 place-items-center rounded-[5px] border border-border hover:-translate-y-0.5 ${
								selected
									? "outline-[1.5px] outline-currentColor outline-offset-2"
									: ""
							}`}
							onClick={() => {
								play("click");
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
						</button>
					);
				})}
			</div>

			<button
				type="button"
				role="switch"
				aria-checked={transparent}
				onClick={() => {
					toggleTransparent();
					play("toggle");
				}}
				className="mt-2.5 flex w-full items-center justify-between rounded-[5px] px-1.5 py-1.5 text-sm text-text-muted hover:bg-surface-hover"
			>
				<span>Transparent background</span>
				<Switch on={transparent} />
			</button>

			<button
				type="button"
				className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-[6px] bg-cta px-3 py-2.5 text-sm text-cta-text shadow-panel hover:bg-cta-hover"
				onClick={download}
				disabled={loading || exporting}
			>
				<ArrowDownToLine className="mr-auto" size={15} />
				{exporting ? "Exporting…" : "Export PNG"}
				<span className="ml-auto text-cta-accent">↗</span>
			</button>
		</ControlSection>
	);
}
