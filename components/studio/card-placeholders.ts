export const cardPlaceholders = [
	{
		title: "The Sunday Edit",
		category: "Weekly journal",
		description: "A few good reads, a new record, and nowhere to rush.",
		detail: "Issue 028",
	},
	{
		title: "Field Notes",
		category: "Out of office",
		description: "Small discoveries from a weekend off the usual route.",
		detail: "Vol. 03",
	},
	{
		title: "Soft Focus",
		category: "Photo essay",
		description: "Morning light and the places we pass every day.",
		detail: "12 photographs",
	},
	{
		title: "After Hours",
		category: "Listening room",
		description: "Records for the long way home and one more song.",
		detail: "Side B",
	},
	{
		title: "Slow Mornings",
		category: "Daily rituals",
		description: "Coffee on the stove. A book left open. Time to spare.",
		detail: "No. 014",
	},
	{
		title: "Common Ground",
		category: "Studio visits",
		description: "Inside the spaces where independent makers work.",
		detail: "Vol. 06",
	},
	{
		title: "Paper Trails",
		category: "From the archive",
		description: "Collected sketches, loose pages, and ideas worth keeping.",
		detail: "Collection 02",
	},
	{
		title: "Open House",
		category: "At home",
		description: "Good company, mismatched chairs, and a table for everyone.",
		detail: "Issue 011",
	},
	{
		title: "Off the Grid",
		category: "Weekend guide",
		description: "A quiet cabin, a walking trail, and no set itinerary.",
		detail: "48 hours away",
	},
	{
		title: "In Good Shape",
		category: "Design notes",
		description: "Everyday objects with a little more thought behind them.",
		detail: "No. 007",
	},
	{
		title: "New Season",
		category: "Seasonal notes",
		description: "Fresh stems, open windows, and a change of pace.",
		detail: "Spring edition",
	},
	{
		title: "Local Colour",
		category: "Neighbourhood guide",
		description: "Independent shops and familiar faces around the corner.",
		detail: "Vol. 04",
	},
] as const;

export type CardPlaceholder = (typeof cardPlaceholders)[number];

export function pickCardPlaceholder(
	current?: CardPlaceholder,
): CardPlaceholder {
	const choices = cardPlaceholders.filter((item) => item !== current);
	return choices[Math.floor(Math.random() * choices.length)];
}
