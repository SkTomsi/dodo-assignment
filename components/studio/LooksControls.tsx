import {
	ArrowLeft,
	ArrowRight,
	BookmarkPlus,
	Check,
	Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { SoundButton } from "@/components/ui/SoundButton";
import { createSource, renderArt, sourcePixels } from "@/lib/renderer";
import { ControlSection } from "./ControlSection";
import { looks, recipeKey, type StudioRecipe } from "./looks";
import type { useStudioRecipes } from "./useStudioRecipes";

function LookThumbnail({ recipe }: { recipe: StudioRecipe }) {
	const canvas = useRef<HTMLCanvasElement>(null);
	useEffect(() => {
		if (canvas.current)
			renderArt(
				canvas.current,
				sourcePixels(createSource(recipe.sample)),
				{ ...recipe.settings, animate: false },
				160,
				0,
			);
	}, [recipe]);
	return <canvas ref={canvas} className="h-12 w-full object-cover" />;
}

export function LooksControls({
	current,
	apply,
	recipes,
}: {
	current: StudioRecipe;
	apply: (recipe: StudioRecipe) => void;
	recipes: ReturnType<typeof useStudioRecipes>;
}) {
	const [tab, setTab] = useState<"curated" | "saved">("curated");
	const [naming, setNaming] = useState(false);
	const [name, setName] = useState("");
	const gallery = useRef<HTMLDivElement>(null);
	return (
		<ControlSection
			label="LOOKS"
			extra={
				<SoundButton
					type="button"
					aria-label="Save recipe"
					disabled={!recipes.ready}
					onClick={() => setNaming(!naming)}
					className="rounded p-1 hover:bg-surface-hover"
				>
					<BookmarkPlus size={15} />
				</SoundButton>
			}
		>
			<SegmentedControl
				label="Looks collection"
				value={tab}
				onChange={setTab}
				variant="plain"
				className="mb-3"
				options={[
					{ value: "curated", label: "Curated looks" },
					{ value: "saved", label: `Saved · ${recipes.saved.length}` },
				]}
			/>
			{naming && (
				<form
					className="mb-3 flex gap-2"
					onSubmit={(event) => {
						event.preventDefault();
						if (!name.trim()) return;
						recipes.save(name);
						setName("");
						setNaming(false);
						setTab("saved");
					}}
				>
					<input
						aria-label="Recipe name"
						placeholder="Name this look"
						maxLength={40}
						value={name}
						onChange={(event) => setName(event.target.value)}
						className="min-w-0 flex-1 rounded border border-border bg-surface-muted px-2 py-2 text-xs text-text"
					/>
					<SoundButton
						type="submit"
						disabled={!name.trim()}
						className="rounded bg-cta px-3 text-xs text-cta-text"
					>
						Save
					</SoundButton>
				</form>
			)}
			{tab === "curated" ? (
				<div
					ref={gallery}
					className="grid snap-x grid-flow-col auto-cols-[124px] gap-2 overflow-x-auto pb-2"
				>
					{looks.map((look) => {
						const selected = recipeKey(current) === recipeKey(look.recipe);
						return (
							<SoundButton
								type="button"
								key={look.name}
								aria-pressed={selected}
								onClick={() => apply(look.recipe)}
								title={look.description}
								className={`snap-start overflow-hidden rounded-lg border text-left ${selected ? "border-text-muted bg-surface-active" : "border-border hover:bg-surface-hover"}`}
							>
								<LookThumbnail recipe={look.recipe} />
								<span className="flex items-center justify-between px-2 pt-2 text-xs font-medium text-text">
									{look.name}
									{selected && <Check size={12} />}
								</span>
								<span className="block truncate px-2 pb-2 pt-1 text-[10px] text-text-faint">
									{look.description}
								</span>
							</SoundButton>
						);
					})}
				</div>
			) : (
				<div className="space-y-2">
					<p className="text-[10px] leading-relaxed text-text-faint">
						Settings only. Uploaded images and painted marks are not stored.
					</p>
					{recipes.saved.length === 0 && (
						<p className="py-3 text-xs leading-relaxed text-text-muted">
							Find a look you love, then save its recipe here. Everything stays
							in this browser.
						</p>
					)}
					{recipes.saved.map((item) => (
						<div
							key={item.id}
							className="flex items-center gap-2 rounded-lg border border-border p-2"
						>
							<SoundButton
								type="button"
								onClick={() => apply(item.recipe)}
								className="min-w-0 flex-1 truncate text-left text-xs text-text"
							>
								{item.name}
							</SoundButton>
							<SoundButton
								type="button"
								aria-label={`Delete ${item.name}`}
								onClick={() => recipes.remove(item.id)}
								className="rounded p-1 text-text-faint hover:bg-surface-hover"
							>
								<Trash2 size={13} />
							</SoundButton>
						</div>
					))}
				</div>
			)}
			<div className="mt-2 flex items-center justify-between gap-2">
				<p className="text-[10px] leading-relaxed text-text-faint">
					{tab === "curated"
						? "8 looks. Make one yours."
						: "Recipes, saved locally."}
				</p>
				{tab === "curated" && (
					<div className="flex gap-1">
						<SoundButton
							type="button"
							aria-label="Previous looks"
							onClick={() => gallery.current?.scrollBy({ left: -264 })}
							className="rounded p-1 text-text-muted hover:bg-surface-hover"
						>
							<ArrowLeft size={13} />
						</SoundButton>
						<SoundButton
							type="button"
							aria-label="Next looks"
							onClick={() => gallery.current?.scrollBy({ left: 264 })}
							className="rounded p-1 text-text-muted hover:bg-surface-hover"
						>
							<ArrowRight size={13} />
						</SoundButton>
					</div>
				)}
			</div>
		</ControlSection>
	);
}
