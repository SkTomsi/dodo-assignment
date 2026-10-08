import { DialRoot } from "dialkit";
import { RotateCcw } from "lucide-react";
import { useTheme } from "next-themes";
import { useSoundFx } from "@/components/sound-provider";
import { sectionLabel } from "./presets";

export function TextureControls({ reset }: { reset: () => void }) {
	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme === "dark";
	const { play } = useSoundFx();
	return (
		<details className="shrink-0 rounded-[10px] bg-surface p-4">
			<summary className="cursor-pointer text-xs font-semibold tracking-[1.5px] text-text-faint">
				04 / TEXTURE{" "}
				<span className="float-right text-[10px] font-normal tracking-normal">
					Fine-tune
				</span>
			</summary>
			<div className="mb-3 mt-4 flex min-h-[14px] shrink-0 items-center justify-between text-text-faint">
				<span className={sectionLabel}>PRINT CONTROLS</span>
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
			</div>
			<div className="overflow-x-clip">
				<DialRoot
					mode="inline"
					theme={isDark ? "dark" : "light"}
					defaultOpen
					productionEnabled
				/>
			</div>
		</details>
	);
}
