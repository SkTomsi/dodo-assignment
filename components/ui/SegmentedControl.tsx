"use client";

import type { ReactNode } from "react";
import { SoundButton } from "./SoundButton";

const styles = {
	compact: {
		group: "flex rounded-[6px] bg-surface-muted p-[3px]",
		button: "min-w-0 flex-1 gap-1.5 rounded-[4px] px-2 py-[6px] text-sm",
		selected: "bg-surface text-text shadow-tab",
		idle: "text-text-faint hover:bg-surface-hover",
	},
	toolbar: {
		group: "flex h-10 items-center gap-1 rounded-lg bg-surface-muted p-1",
		button: "h-8 gap-1.5 rounded-md px-2.5 text-xs font-medium",
		selected: "bg-surface text-text shadow-tab",
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
	return (
		<fieldset aria-label={label} className={`${style.group} ${className}`}>
			{options.map((option) => (
				<SoundButton
					key={option.value}
					aria-pressed={value === option.value}
					disabled={option.disabled}
					title={option.title}
					onClick={() => onChange(option.value)}
					className={`flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40 ${style.button} ${value === option.value ? style.selected : style.idle}`}
				>
					{option.icon && (
						<span aria-hidden="true" className="shrink-0">
							{option.icon}
						</span>
					)}
					<span className="truncate">{option.label}</span>
				</SoundButton>
			))}
		</fieldset>
	);
}
