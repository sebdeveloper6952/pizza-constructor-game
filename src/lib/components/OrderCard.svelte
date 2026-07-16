<script lang="ts">
	import type { Order } from '$lib/pizza';
	import { SAUCES, SIZES, TOPPINGS, DRINKS, toppingIcon, normalize } from '$lib/pizza';

	let { order, index, total }: { order: Order; index: number; total: number } = $props();
</script>

<article class="order">
	<header>
		<span class="avatar" aria-hidden="true">{order.avatar}</span>
		<div>
			<h2>{order.customer}</h2>
			<p class="ticket">Ticket {index + 1} of {total}</p>
		</div>
	</header>

	<blockquote>“{order.request}”</blockquote>

	<ul class="items">
		{#each order.items as item, i (i)}
			<li>
				<span class="qty">{item.count}×</span>
				{#if item.kind === 'Pizza'}
					<div class="lines">
						<span class="what">
							{SIZES[normalize(item.size)]?.label ?? item.size}
							{SAUCES[normalize(item.sauce)]?.label ?? item.sauce} pizza
						</span>
						{#if item.toppings.length}
							<span class="chips">
								{#each item.toppings as t (t)}
									<span class="chip">{toppingIcon(t)} {TOPPINGS[normalize(t)]?.label ?? t}</span>
								{/each}
							</span>
						{/if}
					</div>
				{:else}
					<div class="lines">
						<span class="what">{DRINKS[normalize(item.flavor)]?.label ?? item.flavor} drink</span>
					</div>
				{/if}
			</li>
		{/each}
	</ul>
</article>

<style>
	.order {
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: 14px;
		padding: 1.1rem 1.25rem;
	}
	header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	.avatar {
		font-size: 2.2rem;
		line-height: 1;
	}
	h2 {
		margin: 0;
		font-size: 1.15rem;
	}
	.ticket {
		margin: 0.1rem 0 0;
		font-size: 0.8rem;
		color: var(--muted);
	}
	blockquote {
		margin: 0.9rem 0;
		font-style: italic;
		line-height: 1.45;
	}
	.items {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.6rem;
	}
	.items li {
		display: flex;
		gap: 0.6rem;
		align-items: baseline;
	}
	.qty {
		font-family: ui-monospace, Menlo, Consolas, monospace;
		font-weight: 700;
		color: var(--accent);
		flex: 0 0 auto;
	}
	.lines {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}
	.what {
		font-weight: 600;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
	}
	.chip {
		background: var(--chip);
		border: 1px solid var(--border);
		border-radius: 999px;
		padding: 0.15rem 0.6rem;
		font-size: 0.82rem;
	}
</style>
