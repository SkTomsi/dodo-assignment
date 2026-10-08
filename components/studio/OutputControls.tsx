import { ArrowDownToLine } from "lucide-react";
import {
	type ExportOptions,
	exportDimensions,
	exportRatios,
} from "@/lib/export-artwork";

export function OutputControls({
	options,
	setOptions,
	download,
	loading,
	exporting,
}: {
	options: ExportOptions;
	setOptions: (options: ExportOptions) => void;
	download: () => void;
	loading: boolean;
	exporting: boolean;
}) {
	const { width, height } = exportDimensions(options);
	return (
		<section
			aria-label="Artwork export"
			className="border-t border-border bg-surface p-4"
		>
			<div className="mb-3 flex items-center justify-between">
				<span className="text-xs font-semibold tracking-[1.5px] text-text-faint">
					EXPORT ARTWORK
				</span>
				<span className="text-[10px] tabular-nums text-text-muted">
					{width} × {height}
				</span>
			</div>
			<div className="mb-3 grid grid-cols-[1fr_92px] gap-2 text-xs text-text">
				<label>
					<span className="sr-only">Aspect ratio</span>
					<select
						aria-label="Export aspect ratio"
						value={options.ratio}
						onChange={(event) => {
							const ratio = exportRatios.find(
								(item) => item.value === event.target.value,
							);
							if (ratio) setOptions({ ...options, ratio: ratio.value });
						}}
						className="h-9 w-full rounded-md border border-border bg-surface-muted px-2"
					>
						{exportRatios.map((item) => (
							<option key={item.value} value={item.value}>
								{item.label}
							</option>
						))}
					</select>
				</label>
				<label>
					<span className="sr-only">Long edge</span>
					<select
						aria-label="Export resolution"
						value={options.size}
						onChange={(event) =>
							setOptions({ ...options, size: Number(event.target.value) })
						}
						className="h-9 w-full rounded-md border border-border bg-surface-muted px-2"
					>
						{[512, 1024, 2048].map((size) => (
							<option key={size} value={size}>
								{size}px
							</option>
						))}
					</select>
				</label>
			</div>
			<button
				type="button"
				className="flex w-full items-center justify-center gap-2 rounded-md bg-cta px-3 py-2.5 text-sm text-cta-text shadow-panel hover:bg-cta-hover"
				onClick={download}
				disabled={loading || exporting}
			>
				<ArrowDownToLine size={15} />
				{exporting ? "Exporting…" : "Export artwork PNG"}
			</button>
			<p className="mt-2 text-[10px] leading-relaxed text-text-faint">
				{options.ratio !== "square"
					? "Centered crop · use Canvas to see the framing."
					: "Artwork only · no preview frame."}
				{options.size === 2048 && " 2× upscaled."}
			</p>
		</section>
	);
}
