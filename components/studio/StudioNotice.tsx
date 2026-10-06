import { Check } from "lucide-react";

export function StudioNotice({ notice }: { notice: string }) {
	return (
		<div
			className={`pointer-events-none fixed bottom-[22px] left-1/2 z-20 flex max-w-[calc(100%-28px)] items-center gap-[9px] whitespace-normal rounded-lg bg-cta px-4 py-[11px] text-sm text-cta-text shadow-toast transition-[opacity,transform] duration-[180ms] ${
				notice ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
			} min-[641px]:whitespace-nowrap`}
			role="status"
		>
			{notice && (
				<>
					<Check size={15} />
					{notice}
				</>
			)}
		</div>
	);
}
