import { type Material, materials } from "@/lib/material";
import { ControlSection } from "./ControlSection";

export function MaterialControls({
	material,
	setMaterial,
	strength,
	setStrength,
	brush,
	setBrush,
	keepMarks,
	setKeepMarks,
	clearMarks,
}: {
	material: Material;
	setMaterial: (material: Material) => void;
	strength: number;
	setStrength: (strength: number) => void;
	brush: number;
	setBrush: (brush: number) => void;
	keepMarks: boolean;
	setKeepMarks: (keep: boolean) => void;
	clearMarks: () => void;
}) {
	return (
		<ControlSection
			label="03 / TEXTURE"
			className="shrink-0"
			extra={
				<span className="text-[10px] tracking-wide text-text-muted">
					FINISH LIBRARY
				</span>
			}
		>
			<div className="grid grid-cols-4 gap-1.5">
				{materials.map((item) => (
					<button
						key={item.value}
						type="button"
						aria-pressed={material === item.value}
						onClick={() => setMaterial(item.value)}
						className={`rounded-[6px] border p-1.5 text-[10px] ${material === item.value ? "border-text-muted bg-surface-active text-text" : "border-border text-text-muted hover:bg-surface-hover"}`}
					>
						<span
							aria-hidden="true"
							className="mb-1.5 block h-7 rounded-[3px] border border-black/5"
							style={{ background: item.color }}
						/>
						{item.label}
					</button>
				))}
			</div>
			<p className="mt-2.5 text-xs leading-relaxed text-text-muted">
				{materials.find((item) => item.value === material)?.description}
			</p>
			{material !== "paper" && (
				<div className="mt-3 space-y-3">
					<label className="block text-xs text-text-muted">
						<span className="mb-1.5 flex justify-between">
							<span>Finish strength</span>
							<span className="tabular-nums">
								{Math.round(strength * 100)}%
							</span>
						</span>
						<input
							aria-label="Finish strength"
							className="block w-full accent-[var(--color-text)]"
							type="range"
							min="0"
							max="1"
							step="0.01"
							value={strength}
							onChange={(event) => setStrength(Number(event.target.value))}
						/>
					</label>
					{material === "thermal" && (
						<>
							<label className="block text-xs text-text-muted">
								<span className="mb-1.5 flex justify-between">
									<span>Brush size</span>
									<span className="tabular-nums">{brush}</span>
								</span>
								<input
									aria-label="Brush size"
									className="block w-full accent-[var(--color-text)]"
									type="range"
									min="20"
									max="150"
									step="1"
									value={brush}
									onChange={(event) => setBrush(Number(event.target.value))}
								/>
							</label>
							<div className="flex items-center justify-between gap-2">
								{
									<button
										type="button"
										role="switch"
										aria-checked={keepMarks}
										onClick={() => setKeepMarks(!keepMarks)}
										className="rounded px-1 py-1.5 text-xs text-text-muted hover:bg-surface-hover"
									>
										{keepMarks ? "●" : "○"} Keep marks
									</button>
								}
								<button
									type="button"
									onClick={clearMarks}
									className="rounded border border-border px-2 py-1.5 text-xs text-text-muted hover:bg-surface-hover"
								>
									Clear marks
								</button>
							</div>
						</>
					)}
				</div>
			)}
		</ControlSection>
	);
}
