<script lang="ts">
	import type { Order } from '$lib/pizza';
	import { SAUCES, SIZES, TOPPINGS, toppingIcon } from '$lib/pizza';

	let { order, index, total }: { order: Order; index: number; total: number } = $props();
</script>

<article class="order">
	<header>
		<span class="avatar" aria-hidden="true">{order.avatar}</span>
		<div>
			<h2>{order.customer}’s order</h2>
			<p class="ticket">Ticket {index + 1} of {total}</p>
		</div>
	</header>

	<blockquote>“{order.request}”</blockquote>

	<ul class="specs">
		<li><span class="k">Size</span><span class="v">{SIZES[order.size]?.label ?? order.size}</span></li>
		<li><span class="k">Sauce</span><span class="v">{SAUCES[order.sauce]?.label ?? order.sauce}</span></li>
		<li class="toppings">
			<span class="k">Toppings</span>
			<span class="chips">
				{#each order.toppings as t (t)}
					<span class="chip">{toppingIcon(t)} {TOPPINGS[t]?.label ?? t}</span>
				{/each}
			</span>
		</li>
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
		color: var(--text);
		line-height: 1.45;
	}
	.specs {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.5rem;
	}
	.specs li {
		display: flex;
		gap: 0.75rem;
		align-items: baseline;
	}
	.specs li.toppings {
		align-items: flex-start;
	}
	.k {
		flex: 0 0 4.5rem;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--muted);
		padding-top: 0.15rem;
	}
	.v {
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
		font-size: 0.85rem;
	}
</style>
