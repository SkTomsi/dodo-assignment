import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { Effect } from "@/lib/renderer";
import { ControlSection } from "./ControlSection";
import { effects, glyphs } from "./presets";

export function EffectControls({
	effect,
	setEffect,
}: {
	effect: Effect;
	setEffect: (effect: Effect) => void;
}) {
	return (
		<ControlSection label="02 / STAMP" className="shrink-0">
			<SegmentedControl
				label="Stamp effect"
				value={effect}
				onChange={setEffect}
				options={effects.map((value, i) => ({
					value,
					label: value,
					icon: <span className={`block size-3 ${glyphs[i]}`} />,
				}))}
			/>
		</ControlSection>
	);
}
