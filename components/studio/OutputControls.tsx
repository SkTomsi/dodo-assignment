import { ArrowDownToLine } from "lucide-react";
import { Select } from "@/components/ui/Select";
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
			id="studio-export"
			tabIndex={-1}
			aria-label="Artwork export"
			className="scroll-mt-4 border-t border-border bg-surface p-4"
		>
			<div className="mb-3 flex items-center justify-between">
				<span className="text-xs font-semibold tracking-[1.5px] text-text-faint">
					EXPORT ARTWORK
				</span>
				<span className="text-[10px] tabular-nums text-text-muted">
					{width} × {height}
				</span>
			</div>
			<div className="mb-3 grid grid-cols-1 min-[361px]:grid-cols-[minmax(0,1fr)_104px] min-[900px]:grid-cols-[1fr_92px] gap-2 text-xs text-text">
				<Select
					label="Export aspect ratio"
					value={options.ratio}
					options={exportRatios}
					onChange={(ratio) => setOptions({ ...options, ratio })}
				/>
				<Select
					label="Export resolution"
					value={options.size}
					options={[512, 1024, 2048].map((value) => ({
						value,
						label: `${value}px`,
					}))}
					onChange={(size) => setOptions({ ...options, size })}
				/>
			</div>
			<button
				type="button"
				className="flex w-full items-center justify-center gap-2 rounded-md bg-cta px-3 py-2.5 text-sm text-cta-text shadow-panel hover:bg-cta-hover"
				onClick={download}
				disabled={loading || exporting}
				aria-busy={exporting}
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
