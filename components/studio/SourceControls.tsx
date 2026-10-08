import { Upload, X } from "lucide-react";
import { type ReactNode, useRef } from "react";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { SoundButton } from "@/components/ui/SoundButton";
import { ControlSection } from "./ControlSection";
import { SourceSample } from "./SourceSample";
import type { ArtworkSource } from "./useArtworkSource";

export function SourceControls({
	artwork,
	error,
	dismissError,
	children,
}: {
	artwork: ArtworkSource;
	error: string;
	dismissError: () => void;
	children?: ReactNode;
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
	return (
		<ControlSection label="01 / SOURCE" className="shrink-0">
			<SegmentedControl
				label="Source mode"
				value={mode}
				onChange={chooseMode}
				options={(["Image", "Pattern"] as const).map((value) => ({
					value,
					label: value,
				}))}
				className="mb-2.5"
			/>
			<div className="flex items-stretch gap-2">
				{mode === "Image" && (
					<SoundButton
						type="button"
						className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1.5 rounded-[6px] border border-dashed text-text-faint hover:bg-surface-hover ${
							useUpload
								? "border-border-strong bg-surface-hover shadow-[0_0_0_2px_var(--color-border)]"
								: "border-border-strong"
						}`}
						disabled={loading}
						onClick={() => {
							input.current?.click();
						}}
						aria-pressed={useUpload}
					>
						<Upload size={14} />
						<span className="truncate px-1 text-xs">
							{loading ? "Reading…" : "Upload"}
						</span>
					</SoundButton>
				)}
				{samples.map((name) => (
					<SourceSample
						key={name}
						name={name}
						selected={!useUpload && sample === name}
						onClick={() => {
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
					<SoundButton
						type="button"
						aria-label="Dismiss error"
						onClick={() => {
							dismissError();
						}}
						className="shrink-0 text-text-faint"
					>
						<X size={12} />
					</SoundButton>
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
			{children}
		</ControlSection>
	);
}
