"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import useSound from "use-sound";
import materialChimes from "@/public/sounds/material-chimes.json";

export type SoundName =
	| "click"
	| "toggle"
	| "success"
	| keyof typeof materialChimes;

const materialSprites = Object.fromEntries(
	Object.entries(materialChimes).map(
		([name, range]): [string, [number, number]] => [name, [range[0], range[1]]],
	),
);

type SoundContextValue = {
	soundOn: boolean;
	toggleSound: () => void;
	play: (name: SoundName) => void;
};

const SoundContext = createContext<SoundContextValue | null>(null);
const STORAGE_KEY = "dotform-sound";

export function SoundProvider({ children }: { children: ReactNode }) {
	const [soundOn, setSoundOn] = useState(() => {
		if (typeof window === "undefined") return true;
		return window.localStorage.getItem(STORAGE_KEY) !== "off";
	});

	const [playClick] = useSound("/sounds/click.wav", {
		volume: 0.3,
		interrupt: true,
		soundEnabled: soundOn,
	});
	const [playToggle] = useSound("/sounds/toggle.wav", {
		volume: 0.3,
		interrupt: true,
		soundEnabled: soundOn,
	});
	const [playSuccess] = useSound("/sounds/success.wav", {
		volume: 0.32,
		interrupt: true,
		soundEnabled: soundOn,
	});
	const [playMaterial] = useSound("/sounds/material-chimes.wav", {
		volume: 0.32,
		interrupt: true,
		sprite: materialSprites,
		soundEnabled: soundOn,
	});

	const play = useCallback(
		(name: SoundName) => {
			if (name === "click") playClick();
			else if (name === "toggle") playToggle();
			else if (name === "success") playSuccess();
			else playMaterial({ id: name });
		},
		[playClick, playToggle, playSuccess, playMaterial],
	);

	const toggleSound = useCallback(() => {
		const next = !soundOn;
		// Confirm the flip in both directions, including the moment sound turns on.
		playToggle({ forceSoundEnabled: true });
		window.localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
		setSoundOn(next);
	}, [soundOn, playToggle]);

	const value = useMemo(
		() => ({ soundOn, toggleSound, play }),
		[soundOn, toggleSound, play],
	);

	return (
		<SoundContext.Provider value={value}>{children}</SoundContext.Provider>
	);
}

export function useSoundFx(): SoundContextValue {
	const context = useContext(SoundContext);
	if (!context) {
		throw new Error("useSoundFx must be used inside SoundProvider");
	}
	return context;
}
