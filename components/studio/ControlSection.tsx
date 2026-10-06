import type { ReactNode } from "react";
import { sectionLabel } from "./presets";

export function ControlSection({
	label,
	extra,
	children,
	className = "",
}: {
	label: string;
	extra?: ReactNode;
	children: ReactNode;
	className?: string;
}) {
	return (
		<section className={`rounded-[8px] bg-surface p-3 ${className}`}>
			<div className="mb-2.5 flex min-h-[14px] items-center justify-between text-text-faint">
				<span className={sectionLabel}>{label}</span>
				{extra}
			</div>
			{children}
		</section>
	);
}
