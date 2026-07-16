<script lang="ts">
	import type { ParsedPizza } from '$lib/parser';
	import { SAUCES, SIZES, toppingIcon, normalize } from '$lib/pizza';

	let { pizza }: { pizza: ParsedPizza | null } = $props();

	const sauceInfo = $derived(pizza ? SAUCES[normalize(pizza.sauce)] : undefined);
	const sizeInfo = $derived(pizza ? SIZES[normalize(pizza.size)] : undefined);

	// Overall scale of the pie based on the requested size (falls back to medium).
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
		if (!pizza || pizza.toppings.length === 0) return [];
		const total = Math.min(pizza.toppings.length * PER_TOPPING, 30);
		const pts = positions(total);
		return pts.map((p, i) => ({ ...p, icon: toppingIcon(pizza.toppings[i % pizza.toppings.length]) }));
	});
</script>

{#if pizza}
	<div class="pizza" style="--scale:{scale}">
		<svg viewBox="0 0 100 100" role="img" aria-label="Rendered pizza">
			<!-- crust -->
			<circle cx="50" cy="50" r="48" fill="#e2a850" />
			<circle cx="50" cy="50" r="44" fill="#efc06a" />
			<!-- sauce -->
			<circle cx="50" cy="50" r="42" fill={sauceInfo?.color ?? '#d9d3c5'} />
			<!-- cheese layer (skipped for white sauce so it stays visible) -->
			{#if normalize(pizza.sauce) !== 'white'}
				<circle cx="50" cy="50" r="40" fill="#f6d97a" opacity="0.72" />
			{/if}
			<!-- toppings -->
			{#each placed as t (t.x + '-' + t.y)}
				<text x={t.x} y={t.y} font-size="6.5" text-anchor="middle" dominant-baseline="central">{t.icon}</text>
			{/each}
		</svg>
		{#if !sauceInfo}
			<p class="unknown">Unknown sauce “{pizza.sauce}” — the kitchen improvised a plain base.</p>
		{/if}
	</div>
{:else}
	<div class="empty">
		<svg viewBox="0 0 100 100" aria-hidden="true">
			<circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 4" />
		</svg>
		<p>No pizza yet — write the code and hit <strong>Serve</strong>.</p>
	</div>
{/if}

<style>
	.pizza {
		width: calc(clamp(220px, 70%, 320px) * var(--scale, 1));
		margin-inline: auto;
		filter: drop-shadow(0 10px 18px rgba(0, 0, 0, 0.28));
		transition: width 0.25s ease;
	}
	.pizza svg {
		width: 100%;
		height: auto;
		display: block;
	}
	.unknown {
		margin: 0.6rem 0 0;
		text-align: center;
		font-size: 0.8rem;
		color: #b8860b;
	}
	.empty {
		width: min(70%, 300px);
		margin-inline: auto;
		color: color-mix(in srgb, currentColor 45%, transparent);
		text-align: center;
	}
	.empty svg {
		width: 60%;
		height: auto;
		opacity: 0.6;
	}
	.empty p {
		font-size: 0.9rem;
	}
</style>
