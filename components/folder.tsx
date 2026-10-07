import { useId } from "react";

export default function FolderSvg({
	ink,
	paper,
}: {
	ink: string;
	paper: string;
}) {
	const gradientId = useId();
	return (
		<svg
			viewBox="0 0 444 376"
			className="pointer-events-none absolute inset-0 size-full"
			aria-hidden="true"
			style={{ filter: "drop-shadow(0 10px 14px rgba(0,30,60,0.16))" }}
		>
			<defs>
				<linearGradient
					id={gradientId}
					x1="0"
					y1="2"
					x2="0"
					y2="66"
					gradientUnits="userSpaceOnUse"
				>
					<stop
						offset="0"
						stopColor={`color-mix(in srgb, ${ink} 55%, ${paper})`}
					/>
					<stop
						offset="1"
						stopColor={`color-mix(in srgb, ${ink} 85%, ${paper})`}
					/>
				</linearGradient>
			</defs>
			<path
				d="M14 140V26A24 24 0 0138 2h101c23 0 37 35.5 63 35.5h204a24 24 0 0124 24V140z"
				fill={`url(#${gradientId})`}
			></path>
			<path
				data-folder-face="true"
				d="M14 66h416a12 12 0 0112 12v271a24 24 0 01-24 24H26a24 24 0 01-24-24V78a12 12 0 0112-12z"
				fill={paper}
			></path>
			<path
				d="M2 331.5h440V349a24 24 0 01-24 24H26a24 24 0 01-24-24z"
				fill="#002850"
				fillOpacity="0.06"
			></path>
			<rect
				x="2"
				y="328"
				width="440"
				height="1.5"
				fill="#fff"
				fillOpacity="0.28"
			></rect>
			<rect
				x="2"
				y="343.5"
				width="440"
				height="1"
				fill="#fff"
				fillOpacity="0.18"
			></rect>
			<rect
				x="14"
				y="66"
				width="416"
				height="1"
				fill="#fff"
				fillOpacity="0.3"
			></rect>
		</svg>
	);
}
