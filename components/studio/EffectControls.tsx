import type { Effect } from "@/lib/renderer";
import { useSoundFx } from "@/components/sound-provider";
import { effects, glyphs } from "./presets";
import { ControlSection } from "./ControlSection";

export function EffectControls({
	effect,
	setEffect,
}: {
	effect: Effect;
	setEffect: (effect: Effect) => void;
}) {
	const { play } = useSoundFx();
	return (
		<ControlSection label="01 / TYPE" className="shrink-0">
			<div className="flex rounded-[6px] bg-surface-muted p-[3px]">
				{effects.map((item, i) => (
					<button
						key={item}
						onClick={() => {
							setEffect(item);
							play("click");
						}}
						aria-pressed={effect === item}
						className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-[4px] px-1 py-[7px] text-sm ${
							effect === item
								? "bg-surface text-text shadow-tab"
								: "text-text-faint"
						}`}
					>
						<span
							className={`size-3 shrink-0 ${glyphs[i]}`}
							aria-hidden="true"
						/>
						<span className="truncate">{item}</span>
					</button>
				))}
			</div>
		</ControlSection>
	);
}
