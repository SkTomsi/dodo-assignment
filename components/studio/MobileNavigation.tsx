import { ArrowDownToLine, Image, SlidersHorizontal } from "lucide-react";

const sections = [
	{ id: "studio-preview", label: "Preview", icon: Image },
	{ id: "studio-controls", label: "Adjust", icon: SlidersHorizontal },
	{ id: "studio-export", label: "Export", icon: ArrowDownToLine },
];

export function MobileNavigation() {
	return (
		<nav
			aria-label="Studio sections"
			className="mobile-navigation fixed inset-x-0 bottom-0 z-10 border-t border-border bg-surface px-4 pt-2 min-[900px]:hidden"
		>
			<div className="mx-auto flex max-w-md gap-2">
				{sections.map(({ id, label, icon: Icon }) => (
					<a
						key={id}
						href={`#${id}`}
						className="flex min-h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-lg text-xs font-medium text-text-muted hover:bg-surface-hover hover:text-text"
					>
						<Icon size={16} aria-hidden="true" />
						{label}
					</a>
				))}
			</div>
		</nav>
	);
}
