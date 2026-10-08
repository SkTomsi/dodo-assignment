"use client";

import { type ReactNode, useRef } from "react";
import { SoundButton } from "./SoundButton";

const styles = {
	compact: {
		group: "flex rounded-[6px] bg-surface-muted p-[4px]",
		button:
			"min-w-0 flex-1 gap-1.5 rounded-[4px] px-1 py-[6px] text-sm shadow-0",
		selected: "text-text",
		idle: "text-text-faint hover:bg-surface-hover",
	},
	toolbar: {
		group: "flex h-10 items-center gap-1 rounded-lg bg-surface-muted p-1",
		button: "h-8 gap-1.5 rounded-md px-2.5 text-xs font-medium",
		selected: "text-text",
		idle: "text-text-muted hover:bg-surface-hover",
	},
	plain: {
		group: "flex gap-4 text-xs",
		button: "rounded",
		selected: "text-text",
		idle: "text-text-faint hover:text-text",
	},
};

export function SegmentedControl<T extends string>({
	label,
	value,
	options,
	onChange,
	variant = "compact",
	className = "",
}: {
	label: string;
	value: T;
	options: readonly {
		value: T;
		label: ReactNode;
		icon?: ReactNode;
		disabled?: boolean;
		title?: string;
	}[];
	onChange: (value: T) => void;
	variant?: keyof typeof styles;
	className?: string;
}) {
	const style = styles[variant];
	const group = useRef<HTMLDivElement>(null);
	const enabled = options.filter((option) => !option.disabled);
	const tabStop =
		enabled.find((option) => option.value === value)?.value ??
		enabled[0]?.value;
	return (
		<div
			ref={group}
			role="radiogroup"
			aria-label={label}
			data-variant={variant}
			className={`segmented-control ${style.group} ${className}`}
			onPointerDown={() => {
				if (group.current) group.current.dataset.input = "pointer";
			}}
			onKeyDown={(event) => {
				if (group.current) group.current.dataset.input = "keyboard";
				if (event.altKey || event.ctrlKey || event.metaKey) return;
				const buttons = Array.from(
					event.currentTarget.querySelectorAll<HTMLButtonElement>(
						"button:not(:disabled)",
					),
				);
				const index = buttons.indexOf(event.target as HTMLButtonElement);
				if (index < 0) return;
				const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
				let next: number;
				switch (event.key) {
					case "ArrowRight":
						next = index + (rtl ? -1 : 1);
						break;
					case "ArrowLeft":
						next = index + (rtl ? 1 : -1);
						break;
					case "ArrowDown":
						next = index + 1;
						break;
					case "ArrowUp":
						next = index - 1;
						break;
					case "Home":
						next = 0;
						break;
					case "End":
						next = buttons.length - 1;
						break;
					default:
						return;
				}
				event.preventDefault();
				const button = buttons[(next + buttons.length) % buttons.length];
				button.focus();
				button.click();
			}}
		>
			{options.map((option) => (
				<SoundButton
					key={option.value}
					role="radio"
					aria-checked={value === option.value}
					tabIndex={option.value === tabStop ? 0 : -1}
					disabled={option.disabled}
					title={option.title}
					onClick={(event) => {
						if (option.value === value) {
							event.preventDefault();
							return;
						}
						onChange(option.value);
					}}
					className={`segmented-option relative isolate flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40 ${style.button} ${value === option.value ? style.selected : style.idle}`}
				>
					{option.icon && (
						<span aria-hidden="true" className="relative shrink-0">
							{option.icon}
						</span>
					)}
					<span className="relative truncate">{option.label}</span>
				</SoundButton>
			))}
		</div>
	);
}
