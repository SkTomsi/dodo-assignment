import type { ReactNode } from "react";

export function ControlsSidebar({
	children,
	header,
	footer,
}: {
	children: ReactNode;
	header: ReactNode;
	footer: ReactNode;
}) {
	return (
		<aside
			className="sidebar flex min-h-0 flex-col overflow-hidden rounded-xl bg-surface-muted shadow-panel"
			aria-label="Generator controls"
		>
			{header}
			<section
				aria-label="Scrollable generator controls"
				className="sidebar-scroll min-h-0 min-[900px]:flex-1 min-[900px]:overflow-x-hidden min-[900px]:overflow-y-auto min-[900px]:scroll-fade-y min-[900px]:scroll-fade-10"
			>
				<div className="flex min-h-full flex-col gap-4 p-4">{children}</div>
			</section>
			<div className="shrink-0">{footer}</div>
		</aside>
	);
}
