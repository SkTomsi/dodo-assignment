import type { ReactNode } from "react";

export function ControlsSidebar({ children }: { children: ReactNode }) {
	return (
		<aside
			className="sidebar flex min-h-0 flex-col overflow-hidden rounded-[10px] border border-border bg-surface-muted shadow-panel"
			aria-label="Generator controls"
		>
			<section
				aria-label="Scrollable generator controls"
				className="sidebar-scroll min-h-0 min-[900px]:flex-1 min-[900px]:overflow-x-hidden min-[900px]:overflow-y-auto min-[900px]:scroll-fade-y min-[900px]:scroll-fade-10"
			>
				<div className="flex min-h-full flex-col gap-3 p-3">{children}</div>
			</section>
		</aside>
	);
}
