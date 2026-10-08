"use client";

import type { ComponentProps } from "react";
import { type SoundName, useSoundFx } from "@/components/sound-provider";

export function SoundButton({
	sound = "click",
	onClick,
	type = "button",
	...props
}: ComponentProps<"button"> & { sound?: SoundName | false }) {
	const { play } = useSoundFx();
	return (
		<button
			{...props}
			type={type}
			onClick={(event) => {
				onClick?.(event);
				if (sound && !event.defaultPrevented) play(sound);
			}}
		/>
	);
}
