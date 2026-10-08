"use client";

import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { useSoundFx } from "@/components/sound-provider";

export function Select<T extends string | number>({
	label,
	value,
	options,
	onChange,
	icon,
	variant = "field",
	className = "",
	disabled = false,
}: {
	label: string;
	value: T;
	options: readonly { value: T; label: string; disabled?: boolean }[];
	onChange: (value: T) => void;
	icon?: ReactNode;
	variant?: "field" | "toolbar";
	className?: string;
	disabled?: boolean;
}) {
	const { play } = useSoundFx();
	return (
		<div className={`relative flex min-w-0 items-center ${className}`}>
			{icon && (
				<span
					aria-hidden="true"
					className="pointer-events-none absolute left-3 text-text-muted"
				>
					{icon}
				</span>
			)}
			<select
				aria-label={label}
				value={value}
				disabled={disabled}
				onChange={(event) => {
					const option = options.find(
						(item) => String(item.value) === event.target.value,
					);
					if (!option || option.disabled || option.value === value) return;
					onChange(option.value);
					play("click");
				}}
				className={`w-full cursor-pointer appearance-none bg-surface-muted pr-8 text-xs text-text hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40 ${icon ? "pl-9" : "pl-2"} ${variant === "toolbar" ? "h-10 rounded-lg py-2 font-medium" : "h-9 rounded-md border border-border"}`}
			>
				{options.map((option) => (
					<option
						key={option.value}
						value={option.value}
						disabled={option.disabled}
					>
						{option.label}
					</option>
				))}
			</select>
			<ChevronDown
				size={12}
				aria-hidden="true"
				className="pointer-events-none absolute right-3 text-text-faint"
			/>
		</div>
	);
}
