import { useRef } from "react";
import { Upload, X } from "lucide-react";
import { useSoundFx } from "@/components/sound-provider";
import type { ArtworkSource } from "./useArtworkSource";
import { ControlSection } from "./ControlSection";
import { SourceSample } from "./SourceSample";

export function SourceControls({
	artwork,
	error,
	dismissError,
}: {
	artwork: ArtworkSource;
	error: string;
	dismissError: () => void;
}) {
	const {
		mode,
		sample,
		samples,
		useUpload,
		loading,
		loadFile,
		chooseMode,
		chooseSample,
	} = artwork;
	const input = useRef<HTMLInputElement>(null);
	const { play } = useSoundFx();
	return (
		<ControlSection label="02 / SHAPE" className="shrink-0">
			<div className="mb-2.5 flex rounded-[6px] bg-surface-muted p-[3px]">
				{(["Image", "Pattern"] as const).map((item) => (
					<button
						key={item}
						onClick={() => {
							chooseMode(item);
							play("click");
						}}
						className={`flex-1 rounded-[4px] px-2 py-[6px] text-sm ${
							mode === item
								? "bg-surface text-text shadow-tab"
								: "text-text-faint"
						}`}
						aria-pressed={mode === item}
					>
						{item}
					</button>
				))}
			</div>
			<div className="flex items-stretch gap-2">
				{mode === "Image" && (
					<button
						className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1.5 rounded-[6px] border border-dashed text-text-faint hover:bg-surface-hover ${
							useUpload
								? "border-border-strong bg-surface-hover shadow-[0_0_0_2px_var(--color-border)]"
								: "border-border-strong"
						}`}
						disabled={loading}
						onClick={() => {
							input.current?.click();
							play("click");
						}}
						aria-pressed={useUpload}
					>
						<Upload size={14} />
						<span className="truncate px-1 text-xs">
							{loading ? "Reading…" : "Upload"}
						</span>
					</button>
				)}
				{samples.map((name) => (
					<SourceSample
						key={name}
						name={name}
						selected={!useUpload && sample === name}
						onClick={() => {
							play("click");
							chooseSample(name);
						}}
					/>
				))}
			</div>
			<p className="mt-2 text-center text-xs text-text-faint">
				JPG, PNG, WebP & more · up to 20 MB
			</p>
			{error && (
				<div
					className="mt-2 flex items-start gap-1.5 text-sm leading-[1.4] text-danger"
					role="alert"
				>
					<span className="min-w-0 flex-1">{error}</span>
					<button
						aria-label="Dismiss error"
						onClick={() => {
							dismissError();
							play("click");
						}}
						className="shrink-0 text-text-faint"
					>
						<X size={12} />
					</button>
				</div>
			)}
			<input
				ref={input}
				type="file"
				accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
				className="sr-only"
				aria-label="Upload an image"
				onChange={(event) => {
					void loadFile(event.target.files?.[0]);
					event.target.value = "";
				}}
			/>
		</ControlSection>
	);
}
