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
		<section className="flex min-h-[200px] shrink flex-col overflow-hidden rounded-[8px] bg-surface p-3">
			<div className="mb-2.5 flex min-h-[14px] shrink-0 items-center justify-between text-text-faint">
				<span className={sectionLabel}>03 / TEXTURE</span>
				<button
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
			<div className="texture-scroll min-h-0 flex-1 overflow-y-auto">
				<DialRoot
					mode="inline"
					theme={isDark ? "dark" : "light"}
					defaultOpen
					productionEnabled
				/>
			</div>
		</section>
	);
}
