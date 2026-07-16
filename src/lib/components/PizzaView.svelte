<script lang="ts">
	import type { PizzaInstance } from '$lib/parser';
	import { SAUCES, SIZES, toppingIcon, normalize } from '$lib/pizza';

	let { pizza }: { pizza: PizzaInstance } = $props();

	const sauceInfo = $derived(SAUCES[normalize(pizza.sauce)]);
	const sizeInfo = $derived(SIZES[normalize(pizza.size)]);
	// small/medium/large stay visually distinct even inside a fixed tile.
	const scale = $derived((sizeInfo?.diameter ?? 230) / 270);

	// Deterministic "sunflower" layout so toppings spread evenly and never jump
	// around between renders (no Math.random — that would also break prerender).
	function positions(count: number): Array<{ x: number; y: number }> {
		const golden = Math.PI * (3 - Math.sqrt(5));
		const maxR = 34;
		const out: Array<{ x: number; y: number }> = [];
		for (let i = 0; i < count; i++) {
			const r = maxR * Math.sqrt((i + 0.5) / count);
			const a = i * golden;
			out.push({ x: 50 + r * Math.cos(a), y: 50 + r * Math.sin(a) });
		}
		return out;
	}

	const PER_TOPPING = 5;
	const placed = $derived.by(() => {
		if (pizza.toppings.length === 0) return [];
		const total = Math.min(pizza.toppings.length * PER_TOPPING, 30);
		return positions(total).map((p, i) => ({
			...p,
			icon: toppingIcon(pizza.toppings[i % pizza.toppings.length])
		}));
	});
</script>

<svg viewBox="0 0 100 100" role="img" aria-label="Pizza" style="width:{scale * 100}%">
	<circle cx="50" cy="50" r="48" fill="#e2a850" />
	<circle cx="50" cy="50" r="44" fill="#efc06a" />
	<circle cx="50" cy="50" r="42" fill={sauceInfo?.color ?? '#d9d3c5'} />
	{#if normalize(pizza.sauce) !== 'white'}
		<circle cx="50" cy="50" r="40" fill="#f6d97a" opacity="0.72" />
	{/if}
	{#each placed as t (t.x + '-' + t.y)}
		<text x={t.x} y={t.y} font-size="6.5" text-anchor="middle" dominant-baseline="central">
			{t.icon}
		</text>
	{/each}
</svg>

<style>
	svg {
		height: auto;
		display: block;
		margin-inline: auto;
		filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.22));
	}
</style>
