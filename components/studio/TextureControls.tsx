import { DialRoot } from "dialkit";
import { RotateCcw } from "lucide-react";
import { useTheme } from "next-themes";
import { useSoundFx } from "@/components/sound-provider";
import { ControlSection } from "./ControlSection";

export function TextureControls({ reset }: { reset: () => void }) {
	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme === "dark";
	const { play } = useSoundFx();
	return (
		<ControlSection
			label="04 / FINE-TUNE"
			className="shrink-0"
			extra={
				<button
					type="button"
					className="-mr-1 rounded-[4px] p-1 text-text-faint hover:bg-surface-hover"
					onClick={() => {
						reset();
						play("click");
					}}
					aria-label="Reset controls"
					title="Reset controls"
				>
					<RotateCcw size={13} />
				</button>
			}
		>
			<div className="overflow-x-clip">
				<DialRoot
					mode="inline"
					theme={isDark ? "dark" : "light"}
					defaultOpen
					productionEnabled
				/>
			</div>
		</ControlSection>
	);
}
