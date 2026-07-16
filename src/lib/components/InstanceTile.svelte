<script lang="ts">
	import type { Instance } from '$lib/parser';
	import { SIZES, SAUCES, DRINKS, normalize } from '$lib/pizza';
	import PizzaView from './PizzaView.svelte';
	import DrinkView from './DrinkView.svelte';

	let { instance, index }: { instance: Instance; index: number } = $props();

	const name = $derived(instance.varName ?? `#${index + 1}`);
	const detail = $derived.by(() => {
		if (instance.kind === 'Drink') return DRINKS[normalize(instance.flavor)]?.label ?? instance.flavor;
		const size = SIZES[normalize(instance.size)]?.label ?? instance.size;
		const sauce = SAUCES[normalize(instance.sauce)]?.label ?? instance.sauce;
		return `${size} · ${sauce}`;
	});
</script>

<figure class="tile">
	<div class="art">
		{#if instance.kind === 'Pizza'}
			<PizzaView pizza={instance} />
		{:else}
			<DrinkView drink={instance} />
		{/if}
	</div>
	<figcaption>
		<span class="name">{name}</span>
		<span class="cls">{instance.kind}</span>
		<span class="detail">{detail}</span>
	</figcaption>
</figure>

<style>
	.tile {
		margin: 0;
		width: clamp(128px, 30vw, 156px);
		background: color-mix(in srgb, var(--chip) 55%, var(--card));
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 0.75rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}
	.art {
		width: 100%;
		aspect-ratio: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	figcaption {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.1rem;
		text-align: center;
	}
	.name {
		font-family: ui-monospace, Menlo, Consolas, monospace;
		font-weight: 700;
		background: var(--chip);
		border: 1px solid var(--border);
		border-radius: 6px;
		padding: 0.05rem 0.4rem;
		font-size: 0.85rem;
	}
	.cls {
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--accent);
		font-weight: 700;
	}
	.detail {
		font-size: 0.8rem;
		color: var(--muted);
	}
</style>
