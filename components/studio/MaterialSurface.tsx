import { type PointerEvent, type RefObject, useEffect, useRef } from "react";
import {
	type ArtworkCapture,
	createMaterialRenderer,
	type Material,
	type SurfaceTool,
} from "@/lib/material";
import { ART_SIZE, type RenderSettings, renderArt } from "@/lib/renderer";

type Point = { x: number; y: number };
type SurfaceEngine = {
	paint: (point: Point) => void;
	light: (point: Point) => void;
	end: () => void;
};

export function MaterialSurface({
	pixels,
	settings,
	material,
	strength,
	brush,
	keepMarks,
	clearVersion,
	tool,
	original,
	capture: captureRef,
	onNotice,
}: {
	pixels: ImageData;
	settings: RenderSettings;
	material: Material;
	strength: number;
	brush: number;
	keepMarks: boolean;
	clearVersion: number;
	tool: SurfaceTool;
	original: boolean;
	capture: RefObject<ArtworkCapture | null>;
	onNotice: (notice: string) => void;
}) {
	const canvas = useRef<HTMLCanvasElement>(null);
	const engine = useRef<SurfaceEngine | null>(null);
	const activePointer = useRef<number | null>(null);
	const keyboardPoint = useRef<Point>({ x: 0.5, y: 0.5 });
	const live = useRef({
		settings,
		material,
		strength,
		brush,
		keepMarks,
		original,
		onNotice,
	});
	const invalidate = useRef<(() => void) | null>(null);
	const clear = useRef<(() => void) | null>(null);
	useEffect(() => {
		live.current = {
			settings,
			material,
			strength,
			brush,
			keepMarks,
			original,
			onNotice,
		};
		invalidate.current?.();
	}, [settings, material, strength, brush, keepMarks, original, onNotice]);
	useEffect(() => {
		const output = canvas.current;
		const context = output?.getContext("2d");
		if (!output || !context) return;
		const makeCanvas = () => {
			const surface = document.createElement("canvas");
			surface.width = surface.height = ART_SIZE;
			return surface;
		};
		const print = makeCanvas();
		const shader = makeCanvas();
		const mask = makeCanvas();
		const heatOrigin = makeCanvas();
		const maskContext = mask.getContext("2d");
		const heatOriginContext = heatOrigin.getContext("2d");
		if (!maskContext || !heatOriginContext) return;
		let renderer: ReturnType<typeof createMaterialRenderer> = null;
		let attempted = false;
		let frame = 0;
		let previous: Point | null = null;
		let light = { x: 0.5, y: 0.35 };
		let dirty = true;
		let marks = false;
		let coolingAge = 0;
		let time = 0;
		let last = 0;
		let lastPrint = 0;
		let printInterval = 1000 / 60;
		let lastFrame = 0;
		let currentSettings: RenderSettings | null = null;
		const reduced = matchMedia("(prefers-reduced-motion: reduce)");
		const fail = () => {
			renderer?.dispose();
			renderer = null;
			live.current.onNotice(
				"Materials unavailable on this device. Your original print and export still work.",
			);
		};
		const draw = (now: number, frozen = false) => {
			const options = live.current;
			const elapsed = last ? Math.min((now - last) / 1000, 1) : 0;
			last = now;
			const animate =
				options.settings.animate &&
				options.settings.motion > 0 &&
				!options.original &&
				!reduced.matches;
			if (!frozen && animate) time += Math.min(elapsed, 0.1);
			let updated = false;
			if (
				currentSettings !== options.settings ||
				(animate && now - lastPrint > printInterval)
			) {
				const started = performance.now();
				renderArt(print, pixels, options.settings, ART_SIZE, time);
				printInterval = Math.min(
					250,
					Math.max(1000 / 60, (performance.now() - started) * 1.5),
				);
				currentSettings = options.settings;
				lastPrint = now;
				updated = true;
			}
			if (options.material !== "paper" && !attempted) {
				attempted = true;
				renderer = createMaterialRenderer(shader);
				if (renderer) renderer.update(print);
				else fail();
			}
			if (updated && renderer) renderer.update(print);
			const cooling =
				marks &&
				options.material === "thermal" &&
				!options.keepMarks &&
				!reduced.matches &&
				!options.original;
			if (cooling && !frozen) {
				coolingAge += elapsed;
				maskContext.globalCompositeOperation = "source-over";
				maskContext.clearRect(0, 0, ART_SIZE, ART_SIZE);
				maskContext.globalAlpha = Math.exp(-coolingAge / 2.9);
				maskContext.drawImage(heatOrigin, 0, 0);
				maskContext.globalAlpha = 1;
				if (coolingAge > 16) {
					maskContext.clearRect(0, 0, ART_SIZE, ART_SIZE);
					marks = false;
				}
			}
			if (dirty || updated || cooling || frozen) {
				context.clearRect(0, 0, ART_SIZE, ART_SIZE);
				context.drawImage(print, 0, 0);
				if (renderer && options.material !== "paper") {
					try {
						if (options.material === "thermal") renderer.updateHeat(mask);
						renderer.draw(options.material, light, options.strength);
						context.clearRect(0, 0, ART_SIZE, ART_SIZE);
						context.drawImage(shader, 0, 0);
					} catch {
						fail();
						context.globalCompositeOperation = "source-over";
						context.clearRect(0, 0, ART_SIZE, ART_SIZE);
						context.drawImage(print, 0, 0);
					}
				}
				dirty = false;
			}
			return !frozen && !options.original && (animate || cooling);
		};
		function loop(now: number) {
			frame = 0;
			if (document.hidden) {
				last = 0;
				return;
			}
			const frameInterval =
				live.current.material === "paper" ? 1000 / 60 : 1000 / 30;
			if (now - lastFrame < frameInterval) {
				frame = requestAnimationFrame(loop);
				return;
			}
			lastFrame = now;
			if (draw(now)) frame = requestAnimationFrame(loop);
		}
		function requestDraw() {
			dirty = true;
			if (!frame && !document.hidden) {
				last = 0;
				frame = requestAnimationFrame(loop);
			}
		}
		clear.current = () => {
			maskContext.clearRect(0, 0, ART_SIZE, ART_SIZE);
			heatOriginContext.clearRect(0, 0, ART_SIZE, ART_SIZE);
			marks = false;
			previous = null;
			requestDraw();
		};
		invalidate.current = requestDraw;
		engine.current = {
			paint(point) {
				const radius = live.current.brush;
				const distance = previous
					? Math.hypot(point.x - previous.x, point.y - previous.y) * ART_SIZE
					: 0;
				const steps = Math.max(
					1,
					Math.ceil(distance / Math.max(4, radius / 5)),
				);
				maskContext.globalCompositeOperation = "source-over";
				for (let step = 1; step <= steps; step++) {
					const horizontal =
						(previous
							? previous.x + ((point.x - previous.x) * step) / steps
							: point.x) * ART_SIZE;
					const vertical =
						(previous
							? previous.y + ((point.y - previous.y) * step) / steps
							: point.y) * ART_SIZE;
					const gradient = maskContext.createRadialGradient(
						horizontal,
						vertical,
						0,
						horizontal,
						vertical,
						radius,
					);
					gradient.addColorStop(0, "rgba(0,0,0,.65)");
					gradient.addColorStop(0.45, "rgba(0,0,0,.30)");
					gradient.addColorStop(1, "rgba(0,0,0,0)");
					maskContext.fillStyle = gradient;
					maskContext.fillRect(
						horizontal - radius,
						vertical - radius,
						radius * 2,
						radius * 2,
					);
				}
				previous = point;
				light = point;
				heatOriginContext.clearRect(0, 0, ART_SIZE, ART_SIZE);
				heatOriginContext.drawImage(mask, 0, 0);
				marks = true;
				coolingAge = 0;
				requestDraw();
			},
			light(point) {
				light = point;
				requestDraw();
			},
			end() {
				previous = null;
			},
		};
		captureRef.current = () => {
			draw(performance.now(), true);
			const snapshot = makeCanvas();
			snapshot.getContext("2d")?.drawImage(output, 0, 0);
			return snapshot;
		};
		const visibility = () => {
			cancelAnimationFrame(frame);
			frame = 0;
			last = 0;
			if (!document.hidden) requestDraw();
		};
		document.addEventListener("visibilitychange", visibility);
		reduced.addEventListener("change", requestDraw);
		requestDraw();
		return () => {
			cancelAnimationFrame(frame);
			document.removeEventListener("visibilitychange", visibility);
			reduced.removeEventListener("change", requestDraw);
			renderer?.dispose();
			engine.current = null;
			invalidate.current = null;
			clear.current = null;
			captureRef.current = null;
		};
	}, [pixels, captureRef]);
	useEffect(() => {
		void clearVersion;
		void material;
		clear.current?.();
	}, [clearVersion, material]);
	const interactive = tool === "touch" && material !== "paper" && !original;
	function point(event: PointerEvent<HTMLCanvasElement>) {
		const bounds = event.currentTarget.getBoundingClientRect();
		return {
			x: Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width)),
			y: Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height)),
		};
	}
	return (
		<canvas
			ref={canvas}
			width={ART_SIZE}
			height={ART_SIZE}
			role="img"
			tabIndex={interactive ? 0 : undefined}
			aria-label={
				interactive
					? material === "thermal"
						? "Heat-sensitive artwork. Drag to warm the ink. Arrow keys draw; Space warms a spot."
						: "Light-reactive artwork. Move the pointer or use arrow keys to move the light."
					: `${settings.effect} artwork`
			}
			className={`block h-auto w-full focus-visible:outline-2 focus-visible:outline-offset-[-4px] ${interactive ? (material === "thermal" ? "touch-none cursor-crosshair" : "touch-none cursor-default") : ""}`}
			onPointerDown={(event) => {
				if (!interactive || !event.isPrimary || event.button !== 0) return;
				event.currentTarget.setPointerCapture(event.pointerId);
				activePointer.current = event.pointerId;
				engine.current?.end();
				if (material === "thermal") engine.current?.paint(point(event));
				else engine.current?.light(point(event));
			}}
			onPointerMove={(event) => {
				if (!interactive || !event.isPrimary) return;
				engine.current?.light(point(event));
				if (activePointer.current === event.pointerId && material === "thermal")
					engine.current?.paint(point(event));
			}}
			onPointerUp={(event) => {
				if (activePointer.current !== event.pointerId) return;
				activePointer.current = null;
				engine.current?.end();
				if (event.currentTarget.hasPointerCapture(event.pointerId))
					event.currentTarget.releasePointerCapture(event.pointerId);
			}}
			onLostPointerCapture={() => {
				activePointer.current = null;
				engine.current?.end();
			}}
			onPointerCancel={() => {
				activePointer.current = null;
				engine.current?.end();
			}}
			onBlur={() => engine.current?.end()}
			onKeyDown={(event) => {
				if (
					!interactive ||
					!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(
						event.key,
					)
				)
					return;
				event.preventDefault();
				const step = event.shiftKey ? 0.06 : 0.02;
				const previous = keyboardPoint.current;
				const next = {
					x: Math.max(
						0,
						Math.min(
							1,
							previous.x +
								(event.key === "ArrowRight"
									? step
									: event.key === "ArrowLeft"
										? -step
										: 0),
						),
					),
					y: Math.max(
						0,
						Math.min(
							1,
							previous.y +
								(event.key === "ArrowDown"
									? step
									: event.key === "ArrowUp"
										? -step
										: 0),
						),
					),
				};
				keyboardPoint.current = next;
				if (material === "thermal") engine.current?.paint(next);
				else engine.current?.light(next);
			}}
		/>
	);
}
