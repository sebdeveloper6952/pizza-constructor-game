import type { ParsedPizza } from './parser';

/** Everything the kitchen knows how to make. Used for rendering + gentle hints. */
export const SIZES: Record<string, { label: string; diameter: number }> = {
	small: { label: 'Small', diameter: 190 },
	medium: { label: 'Medium', diameter: 230 },
	large: { label: 'Large', diameter: 270 }
};

export const SAUCES: Record<string, { label: string; color: string }> = {
	tomato: { label: 'Tomato', color: '#c0392b' },
	white: { label: 'White', color: '#f0e4c3' },
	bbq: { label: 'BBQ', color: '#6d3410' },
	pesto: { label: 'Pesto', color: '#4f7f34' }
};

/** Known toppings render as icons; anything else still counts, just with a ❓. */
export const TOPPINGS: Record<string, { label: string; icon: string }> = {
	pepperoni: { label: 'Pepperoni', icon: '🔴' },
	cheese: { label: 'Extra cheese', icon: '🧀' },
	mushroom: { label: 'Mushroom', icon: '🍄' },
	onion: { label: 'Onion', icon: '🧅' },
	pepper: { label: 'Green pepper', icon: '🫑' },
	olive: { label: 'Olive', icon: '🫒' },
	ham: { label: 'Ham', icon: '🍖' },
	pineapple: { label: 'Pineapple', icon: '🍍' },
	bacon: { label: 'Bacon', icon: '🥓' },
	basil: { label: 'Basil', icon: '🌿' },
	tomato: { label: 'Tomato slices', icon: '🍅' },
	chicken: { label: 'Chicken', icon: '🍗' }
};

export function toppingIcon(name: string): string {
	return TOPPINGS[normalize(name)]?.icon ?? '❓';
}

export function normalize(s: string): string {
	return s.trim().toLowerCase();
}

/** A customer's order — the target the student must reproduce in code. */
export type Order = {
	customer: string;
	avatar: string;
	request: string;
	size: string;
	sauce: string;
	toppings: string[];
};

export const ORDERS: Order[] = [
	{
		customer: 'Ana',
		avatar: '👩',
		request: 'Just a small tomato pizza with cheese, please. Keep it simple!',
		size: 'small',
		sauce: 'tomato',
		toppings: ['cheese']
	},
	{
		customer: 'Marco',
		avatar: '🧑',
		request: 'A medium tomato pizza with pepperoni and mushrooms.',
		size: 'medium',
		sauce: 'tomato',
		toppings: ['pepperoni', 'mushroom']
	},
	{
		customer: 'Sofía',
		avatar: '👩‍🦰',
		request: 'Large white-sauce pizza, with ham, pineapple and extra cheese. Don’t judge me!',
		size: 'large',
		sauce: 'white',
		toppings: ['ham', 'pineapple', 'cheese']
	},
	{
		customer: 'Diego',
		avatar: '🧔',
		request: 'Medium BBQ pizza: chicken, onion, bacon and green pepper. Load it up!',
		size: 'medium',
		sauce: 'bbq',
		toppings: ['chicken', 'onion', 'bacon', 'pepper']
	},
	{
		customer: 'Lucía',
		avatar: '👧',
		request: 'A large pesto pizza with tomato slices, olives and basil. Fancy night!',
		size: 'large',
		sauce: 'pesto',
		toppings: ['tomato', 'olive', 'basil']
	}
];

export type MatchResult = {
	perfect: boolean;
	sizeOk: boolean;
	sauceOk: boolean;
	missingToppings: string[];
	extraToppings: string[];
};

/** Compare the object the student built against what the customer asked for. */
export function matchOrder(pizza: ParsedPizza, order: Order): MatchResult {
	const sizeOk = normalize(pizza.size) === normalize(order.size);
	const sauceOk = normalize(pizza.sauce) === normalize(order.sauce);

	const wanted = new Set(order.toppings.map(normalize));
	const got = new Set(pizza.toppings.map(normalize));

	const missingToppings = [...wanted].filter((t) => !got.has(t));
	const extraToppings = [...got].filter((t) => !wanted.has(t));

	return {
		perfect: sizeOk && sauceOk && missingToppings.length === 0 && extraToppings.length === 0,
		sizeOk,
		sauceOk,
		missingToppings,
		extraToppings
	};
}

/** Pretty-print the resulting object's state, so students see class → object. */
export function objectStateLines(pizza: ParsedPizza): string[] {
	const toppings = pizza.toppings.length
		? '[' + pizza.toppings.map((t) => `"${t}"`).join(', ') + ']'
		: '[]';
	return [
		'Pizza {',
		`    size: "${pizza.size}"`,
		`    sauce: "${pizza.sauce}"`,
		`    toppings: ${toppings}`,
		'}'
	];
}
