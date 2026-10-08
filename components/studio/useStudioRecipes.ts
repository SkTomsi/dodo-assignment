import { useEffect, useRef, useState } from "react";
import { isRecipe, recipeKey, type StudioRecipe } from "./looks";

interface SavedRecipe {
	id: string;
	name: string;
	recipe: StudioRecipe;
}
const storageKey = "dotform-studio-v1";

export function useStudioRecipes(
	current: StudioRecipe,
	apply: (recipe: StudioRecipe) => void,
	onNotice: (message: string) => void,
) {
	const [saved, setSaved] = useState<SavedRecipe[]>([]);
	const [ready, setReady] = useState(false);
	const [timeline, setTimeline] = useState({ items: [current], index: 0 });
	const history = useRef({ items: [current], index: 0 });
	const callbacks = useRef({ apply, onNotice });
	const latest = useRef(current);
	const applied = useRef<string | null>(null);
	useEffect(() => {
		callbacks.current = { apply, onNotice };
		latest.current = current;
	});
	useEffect(() => {
		const timer = setTimeout(() => {
			try {
				const data = JSON.parse(localStorage.getItem(storageKey) ?? "null");
				if (Array.isArray(data?.saved))
					setSaved(
						data.saved
							.filter(
								(item: SavedRecipe) =>
									item &&
									typeof item.id === "string" &&
									typeof item.name === "string" &&
									isRecipe(item.recipe),
							)
							.slice(0, 20),
					);
				if (isRecipe(data?.current)) {
					const restored = { ...data.current, useUpload: false };
					history.current = { items: [restored], index: 0 };
					setTimeline({ ...history.current });
					applied.current = recipeKey(restored);
					callbacks.current.apply(restored);
					callbacks.current.onNotice(
						data.current.useUpload
							? "Recipe restored. Re-upload your image to continue."
							: "Welcome back. Your last recipe is restored.",
					);
				}
			} catch {
				callbacks.current.onNotice(
					"Local storage is unavailable. You can still create and export.",
				);
			}
			setReady(true);
		}, 0);
		return () => clearTimeout(timer);
	}, []);
	useEffect(() => {
		if (!ready) return;
		const key = recipeKey(current);
		if (applied.current === key) {
			applied.current = null;
			return;
		}
		const timer = setTimeout(() => {
			const timeline = history.current;
			if (recipeKey(timeline.items[timeline.index]) !== key) {
				timeline.items = [
					...timeline.items.slice(0, timeline.index + 1),
					current,
				].slice(-60);
				timeline.index = timeline.items.length - 1;
				setTimeline({ ...timeline });
			}
		}, 350);
		return () => clearTimeout(timer);
	}, [current, ready]);
	useEffect(() => {
		if (!ready) return;
		const persist = () => {
			try {
				localStorage.setItem(storageKey, JSON.stringify({ current, saved }));
			} catch {
				callbacks.current.onNotice(
					"Couldn't save locally. Your artwork is still ready to export.",
				);
			}
		};
		const timer = setTimeout(persist, 400);
		window.addEventListener("pagehide", persist);
		return () => {
			clearTimeout(timer);
			window.removeEventListener("pagehide", persist);
		};
	}, [current, saved, ready]);
	const pending =
		recipeKey(current) !== recipeKey(timeline.items[timeline.index]);
	function travel(direction: -1 | 1) {
		const timeline = history.current;
		if (
			recipeKey(latest.current) !== recipeKey(timeline.items[timeline.index])
		) {
			timeline.items = [
				...timeline.items.slice(0, timeline.index + 1),
				latest.current,
			].slice(-60);
			timeline.index = timeline.items.length - 1;
		}
		const index = Math.max(
			0,
			Math.min(timeline.items.length - 1, timeline.index + direction),
		);
		if (index === timeline.index) return;
		timeline.index = index;
		applied.current = recipeKey(timeline.items[index]);
		callbacks.current.apply(timeline.items[index]);
		setTimeline({ ...timeline });
	}
	function select(next: StudioRecipe) {
		const timeline = history.current;
		const previous = latest.current;
		if (recipeKey(previous) !== recipeKey(timeline.items[timeline.index])) {
			timeline.items = [
				...timeline.items.slice(0, timeline.index + 1),
				previous,
			].slice(-60);
			timeline.index = timeline.items.length - 1;
		}
		if (recipeKey(next) !== recipeKey(previous)) {
			timeline.items = [
				...timeline.items.slice(0, timeline.index + 1),
				next,
			].slice(-60);
			timeline.index = timeline.items.length - 1;
		}
		applied.current = recipeKey(next);
		callbacks.current.apply(next);
		setTimeline({ ...timeline });
	}
	return {
		saved,
		ready,
		select,
		canUndo: timeline.index > 0 || pending,
		canRedo: !pending && timeline.index < timeline.items.length - 1,
		undo: () => travel(-1),
		redo: () => travel(1),
		save: (name: string) => {
			if (!name.trim()) return;
			if (saved.length >= 20) {
				onNotice("Your library is full. Remove a recipe to save another.");
				return;
			}
			setSaved((items) => [
				...items,
				{
					id: crypto.randomUUID(),
					name: name.trim().slice(0, 40),
					recipe: current,
				},
			]);
			onNotice(
				current.useUpload
					? "Recipe saved. Uploaded images aren't stored; re-upload after a refresh."
					: "Recipe saved to this browser.",
			);
		},
		remove: (id: string) =>
			setSaved((items) => items.filter((item) => item.id !== id)),
	};
}
