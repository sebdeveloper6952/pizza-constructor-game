<script lang="ts">
	import type { DrinkInstance } from '$lib/parser';
	import { DRINKS, normalize } from '$lib/pizza';

	let { drink }: { drink: DrinkInstance } = $props();

	const info = $derived(DRINKS[normalize(drink.flavor)]);
	const color = $derived(info?.color ?? '#b9b4a8');
</script>

<svg viewBox="0 0 100 100" role="img" aria-label="Drink cup" style="width:70%">
	<!-- straw -->
	<line x1="62" y1="8" x2="55" y2="34" stroke="#e05a6d" stroke-width="4" stroke-linecap="round" />
	<!-- cup body (tapered) filled with the drink color -->
	<path d="M30 30 H70 L64 88 Q64 92 60 92 H40 Q36 92 36 88 Z" fill={color} />
	<!-- soft highlight for a bit of gloss -->
	<path d="M38 34 L42 34 L39 86 L36 86 Z" fill="#ffffff" opacity="0.18" />
	<!-- lid -->
	<rect x="26" y="24" width="48" height="8" rx="3" fill="#d8d3c7" />
	<rect x="26" y="24" width="48" height="3" rx="1.5" fill="#c3bdae" />
	{#if !info}
		<text x="50" y="60" font-size="22" text-anchor="middle" dominant-baseline="central">❓</text>
	{/if}
</svg>

<style>
	svg {
		height: auto;
		display: block;
		margin-inline: auto;
		filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.22));
	}
</style>
