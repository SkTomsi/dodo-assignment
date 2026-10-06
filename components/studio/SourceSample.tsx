import { Check } from "lucide-react";
import { useEffect, useRef } from "react";
import {
	createSource,
	renderArt,
	type SourceName,
	sourcePixels,
} from "@/lib/renderer";

export function SourceSample({
	name,
	selected,
	onClick,
}: {
	name: SourceName;
	selected: boolean;
	onClick: () => void;
}) {
	const ref = useRef<HTMLCanvasElement>(null);
	useEffect(() => {
		const canvas = ref.current;
		if (!canvas) return;
		const pixels = sourcePixels(createSource(name));
		renderArt(
			canvas,
			pixels,
			{
				effect: "Halftone",
				spacing: 12,
				size: 0.9,
				contrast: 1.15,
				brightness: 0,
				rotation: 0,
				scale: 1,
				invert: false,
				ink: "#52564f",
				paper: "#efefe9",
				transparent: false,
			},
			160,
		);
	}, [name]);
	return (
		<button
			type="button"
			className={`relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-[6px] border bg-surface ${
				selected
					? "border-border-strong shadow-[0_0_0_2px_var(--color-border)]"
					: "border-border"
			}`}
			onClick={onClick}
			aria-pressed={selected}
		>
			<canvas
				ref={ref}
				aria-hidden="true"
				tabIndex={-1}
				className="block h-[44px] w-full bg-canvas-bg"
			/>
			<span
				className={`block truncate px-1 pb-1.5 pt-1 text-center text-xs ${
					selected ? "text-text" : "text-text-faint"
				}`}
			>
				{name}
			</span>
			{selected && (
				<span className="absolute right-1 top-1 grid size-3 place-items-center rounded-full bg-chip text-check-mark">
					<Check size={10} />
				</span>
			)}
		</button>
	);
}
