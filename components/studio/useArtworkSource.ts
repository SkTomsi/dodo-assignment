import { useEffect, useMemo, useRef, useState } from "react";
import {
	createSource,
	prepareImage,
	type SourceName,
	sourcePixels,
} from "@/lib/renderer";
import { imageSources, patternSources } from "./presets";

export function useArtworkSource({
	onSelect,
	onReady,
	onError: setError,
}: {
	onSelect: () => void;
	onReady: () => void;
	onError: (message: string) => void;
}) {
	const [mode, setMode] = useState<"Image" | "Pattern">("Image");
	const [sample, setSample] = useState<SourceName>("Bloom");
	const [uploaded, setUploaded] = useState<{
		canvas: HTMLCanvasElement;
		name: string;
	} | null>(null);
	const [useUpload, setUseUpload] = useState(false);
	const [loading, setLoading] = useState(false);
	const request = useRef(0);
	useEffect(
		() => () => {
			request.current += 1;
		},
		[],
	);
	const source = useMemo(
		() => (useUpload && uploaded ? uploaded.canvas : createSource(sample)),
		[sample, useUpload, uploaded],
	);
	const pixels = useMemo(() => sourcePixels(source), [source]);
	async function loadFile(file?: File) {
		if (!file) return;
		setError("");
		if (
			![
				"image/png",
				"image/jpeg",
				"image/webp",
				"image/avif",
				"image/gif",
			].includes(file.type)
		) {
			setError("Choose a PNG, JPG, WebP, AVIF, or GIF image.");
			return;
		}
		if (file.size > 20 * 1024 * 1024) {
			setError("That image is a little large. Try one under 20 MB.");
			return;
		}
		const id = ++request.current;
		setLoading(true);
		const url = URL.createObjectURL(file);
		try {
			const image = new Image();
			image.src = url;
			await image.decode();
			if (id !== request.current) return;
			const prepared = prepareImage(
				image,
				image.naturalWidth,
				image.naturalHeight,
			);
			setUploaded({ canvas: prepared, name: file.name });
			setUseUpload(true);
			setMode("Image");
			onSelect();
			onReady();
		} catch {
			if (id === request.current)
				setError("We couldn’t read that image. Try a different file.");
		} finally {
			URL.revokeObjectURL(url);
			if (id === request.current) setLoading(false);
		}
	}

	function chooseMode(next: "Image" | "Pattern") {
		setMode(next);
		setSample(next === "Image" ? "Bloom" : "Waves");
		setUseUpload(next === "Image" && !!uploaded);
		onSelect();
	}

	function chooseSample(name: SourceName) {
		setSample(name);
		setUseUpload(false);
		onSelect();
	}
	return {
		source,
		pixels,
		mode,
		sample,
		useUpload,
		loading,
		title: useUpload && uploaded ? uploaded.name : sample,
		samples: mode === "Image" ? imageSources : patternSources,
		loadFile,
		chooseMode,
		chooseSample,
		restoreSource: (name: SourceName, useUploaded: boolean) => {
			request.current += 1;
			setLoading(false);
			setMode(patternSources.includes(name) ? "Pattern" : "Image");
			setSample(name);
			setUseUpload(useUploaded && !!uploaded);
			onSelect();
		},
	};
}
export type ArtworkSource = ReturnType<typeof useArtworkSource>;
