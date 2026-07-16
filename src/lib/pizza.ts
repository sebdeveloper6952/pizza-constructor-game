import type { Instance, PizzaInstance, DrinkInstance } from './parser';

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

/** Known drink flavors render with a color; unknown flavors fall back to gray. */
export const DRINKS: Record<string, { label: string; color: string }> = {
	cola: { label: 'Cola', color: '#3a1f14' },
	lemonade: { label: 'Lemonade', color: '#f2e14c' },
	orange: { label: 'Orange', color: '#ff9526' },
	grape: { label: 'Grape', color: '#7b4ea3' },
	water: { label: 'Water', color: '#bfe6f2' }
};

export function normalize(s: string): string {
	return s.trim().toLowerCase();
}

export function toppingIcon(name: string): string {
	return TOPPINGS[normalize(name)]?.icon ?? '❓';
}

// --- Orders (each item can be requested in a quantity) -------------------------

export type LineItem =
	| { kind: 'Pizza'; count: number; size: string; sauce: string; toppings: string[] }
	| { kind: 'Drink'; count: number; flavor: string };

export type Order = {
	customer: string;
	avatar: string;
	request: string;
	items: LineItem[];
};

export const ORDERS: Order[] = [
	{
		customer: 'Ana',
		avatar: '👩',
		request: 'Just a small tomato pizza with cheese, please. Keep it simple!',
		items: [{ kind: 'Pizza', count: 1, size: 'small', sauce: 'tomato', toppings: ['cheese'] }]
	},
	{
		customer: 'Marco',
		avatar: '🧑',
		request: 'A medium tomato pizza with pepperoni and mushrooms.',
		items: [
			{ kind: 'Pizza', count: 1, size: 'medium', sauce: 'tomato', toppings: ['pepperoni', 'mushroom'] }
		]
	},
	{
		customer: 'The Ramírez family',
		avatar: '👨‍👩‍👧',
		request: 'Movie night! Two identical medium tomato pizzas with pepperoni, please.',
		items: [
			{ kind: 'Pizza', count: 2, size: 'medium', sauce: 'tomato', toppings: ['pepperoni'] }
		]
	},
	{
		customer: 'Diego',
		avatar: '🧔',
		request: 'One large BBQ pizza with chicken, onion and bacon — and two colas to go with it.',
		items: [
			{ kind: 'Pizza', count: 1, size: 'large', sauce: 'bbq', toppings: ['chicken', 'onion', 'bacon'] },
			{ kind: 'Drink', count: 2, flavor: 'cola' }
		]
	},
	{
		customer: 'Lucía',
		avatar: '👧',
		request:
			'Fancy night for two: a large pesto pizza with tomato and basil, a small white pizza with ham and pineapple, and two lemonades.',
		items: [
			{ kind: 'Pizza', count: 1, size: 'large', sauce: 'pesto', toppings: ['tomato', 'basil'] },
			{ kind: 'Pizza', count: 1, size: 'small', sauce: 'white', toppings: ['ham', 'pineapple'] },
			{ kind: 'Drink', count: 2, flavor: 'lemonade' }
		]
	}
];

// --- Matching: does the bag of objects the student built equal the order? ------

function keyForPizza(size: string, sauce: string, toppings: string[]): string {
	return `P|${normalize(size)}|${normalize(sauce)}|${toppings.map(normalize).sort().join('+')}`;
}
function keyForDrink(flavor: string): string {
	return `D|${normalize(flavor)}`;
}

function keyForItem(item: LineItem): string {
	return item.kind === 'Pizza'
		? keyForPizza(item.size, item.sauce, item.toppings)
		: keyForDrink(item.flavor);
}
function keyForInstance(inst: Instance): string {
	return inst.kind === 'Pizza'
		? keyForPizza(inst.size, inst.sauce, inst.toppings)
		: keyForDrink(inst.flavor);
}

export function describeItem(item: LineItem): string {
	if (item.kind === 'Drink') return `${DRINKS[normalize(item.flavor)]?.label ?? item.flavor} drink`;
	const size = SIZES[normalize(item.size)]?.label ?? item.size;
	const sauce = SAUCES[normalize(item.sauce)]?.label ?? item.sauce;
	const tops = item.toppings.length ? ` with ${item.toppings.join(', ')}` : '';
	return `${size} ${sauce} pizza${tops}`;
}
function describeInstance(inst: Instance): string {
	if (inst.kind === 'Drink') return describeItem({ kind: 'Drink', count: 1, flavor: inst.flavor });
	return describeItem({
		kind: 'Pizza',
		count: 1,
		size: inst.size,
		sauce: inst.sauce,
		toppings: inst.toppings
	});
}

export type Diff = { text: string; n: number };
export type MatchResult = {
	perfect: boolean;
	missing: Diff[];
	extra: Diff[];
};

export function matchOrder(instances: Instance[], order: Order): MatchResult {
	const required = new Map<string, { n: number; text: string }>();
	for (const item of order.items) {
		const k = keyForItem(item);
		required.set(k, { n: (required.get(k)?.n ?? 0) + item.count, text: describeItem(item) });
	}

	const got = new Map<string, { n: number; text: string }>();
	for (const inst of instances) {
		const k = keyForInstance(inst);
		got.set(k, { n: (got.get(k)?.n ?? 0) + 1, text: describeInstance(inst) });
	}

	const missing: Diff[] = [];
	for (const [k, { n, text }] of required) {
		const have = got.get(k)?.n ?? 0;
		if (n > have) missing.push({ text, n: n - have });
	}

	const extra: Diff[] = [];
	for (const [k, { n, text }] of got) {
		const need = required.get(k)?.n ?? 0;
		if (n > need) extra.push({ text, n: n - need });
	}

	return { perfect: missing.length === 0 && extra.length === 0, missing, extra };
}

/** Pretty-print each object's state, so students see reference → object. */
export function instanceStateLines(instances: Instance[]): string[] {
	return instances.map((inst, i) => {
		const name = inst.varName ?? `#${i + 1}`;
		if (inst.kind === 'Drink') return `${name} → Drink { flavor: "${inst.flavor}" }`;
		const toppings = inst.toppings.length
			? '[' + inst.toppings.map((t) => `"${t}"`).join(', ') + ']'
			: '[]';
		return `${name} → Pizza { size: "${inst.size}", sauce: "${inst.sauce}", toppings: ${toppings} }`;
	});
}

export type { Instance, PizzaInstance, DrinkInstance };
