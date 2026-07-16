<script lang="ts">
	import { parseProgram } from '$lib/parser';
	import { ORDERS, matchOrder, instanceStateLines } from '$lib/pizza';
	import OrderCard from '$lib/components/OrderCard.svelte';
	import InstanceTile from '$lib/components/InstanceTile.svelte';
	import CodeEditor from '$lib/components/CodeEditor.svelte';

	const CLASS_SOURCE = `public class Pizza {
    String size;
    String sauce;
    String[] toppings;

    // Constructor — call it with "new"
    public Pizza(String size, String sauce, String... toppings) {
        this.size = size;
        this.sauce = sauce;
        this.toppings = toppings;
    }
}

public class Drink {
    String flavor;

    public Drink(String flavor) {
        this.flavor = flavor;
    }
}`;

	const STARTER = `// Create ONE object per item the order needs.
// You have two classes:
//   Pizza(size, sauce, toppings...)   and   Drink(flavor)

Pizza p1 = new Pizza("medium", "tomato", "cheese");`;

	let level = $state(0);
	let code = $state(STARTER);
	let attempted = $state(false);
	let solved = $state<boolean[]>(ORDERS.map(() => false));
	let classView = $state<{ refresh: () => void }>();

	const order = $derived(ORDERS[level]);
	const outcome = $derived(parseProgram(code));
	const instances = $derived(outcome.instances);
	const parseErrors = $derived(outcome.errors);
	const match = $derived(matchOrder(instances, order));
	const stateLines = $derived(instanceStateLines(instances));
	const solvedCount = $derived(solved.filter(Boolean).length);
	const allDone = $derived(solvedCount === ORDERS.length);

	function serve() {
		attempted = true;
		if (parseErrors.length === 0 && match.perfect) {
			solved[level] = true;
		}
	}

	function nextOrder() {
		if (level < ORDERS.length - 1) {
			level += 1;
			code = STARTER;
			attempted = false;
		}
	}

	function restart() {
		level = 0;
		code = STARTER;
		attempted = false;
		solved = ORDERS.map(() => false);
	}
</script>

<svelte:head>
	<title>Pizza Constructor — learn Java classes & objects</title>
	<meta
		name="description"
		content="Write Java to instantiate Pizza and Drink objects and fulfill each customer's order. Learn classes, objects, constructors and multiple instances."
	/>
</svelte:head>

<div class="app">
	<header class="topbar">
		<h1>🍕 Pizza Constructor</h1>
		<p class="tag">Instantiate <code>Pizza</code> and <code>Drink</code> objects to fulfill each order.</p>
		<div class="score" aria-live="polite">Served: {solvedCount} / {ORDERS.length}</div>
	</header>

	<main class="panes">
		<!-- LEFT: the code -->
		<section class="pane editor-pane">
			<details
				class="class-def"
				ontoggle={(e) => {
					if ((e.currentTarget as HTMLDetailsElement).open) classView?.refresh();
				}}
			>
				<summary>📘 The classes (given to you)</summary>
				<CodeEditor
					bind:this={classView}
					value={CLASS_SOURCE}
					readonly
					ariaLabel="The Pizza and Drink class definitions"
				/>
				<p class="note">
					A <strong>class</strong> is the mold. Each <code>new</code> call runs its
					<strong>constructor</strong> and pours one more <strong>object</strong> — write one
					<code>new</code> per item.
				</p>
			</details>

			<span class="editor-label">Your code</span>
			<CodeEditor bind:value={code} ariaLabel="Your Java code" />

			<div class="actions">
				<button class="serve" onclick={serve} disabled={solved[level]}>Serve order 🍕</button>
				{#if solved[level]}
					<button class="next" onclick={nextOrder} disabled={level === ORDERS.length - 1}>
						Next order →
					</button>
				{/if}
			</div>

			<!-- feedback -->
			{#if attempted}
				{#if parseErrors.length}
					<div class="feedback error">
						<strong>⚠️ Fix your code:</strong>
						<ul>
							{#each parseErrors as e, i (i)}
								<li>
									{#if e.ordinal > 0}<b>{e.varName ?? 'Statement ' + e.ordinal}</b>
										{#if e.className}({e.className}){/if}: {/if}{e.error}
									{#if e.hint}<span class="hint">{e.hint}</span>{/if}
								</li>
							{/each}
						</ul>
					</div>
				{:else if match.perfect}
					<div class="feedback success">
						<strong>✅ Order served! {order.customer} is happy.</strong>
						<p>
							You instantiated {instances.length} object{instances.length === 1 ? '' : 's'} — exactly
							the order.
						</p>
					</div>
				{:else}
					<div class="feedback warn">
						<strong>🤔 Not quite — compare what you built to the order:</strong>
						<ul>
							{#each match.missing as d (d.text)}
								<li>Missing: <b>{d.n}×</b> {d.text}.</li>
							{/each}
							{#each match.extra as d (d.text)}
								<li>Remove: <b>{d.n}×</b> {d.text}.</li>
							{/each}
						</ul>
					</div>
				{/if}
			{/if}
		</section>

		<!-- RIGHT: the result -->
		<section class="pane result-pane">
			{#if allDone}
				<div class="done">
					<div class="confetti">🎉</div>
					<h2>All orders served!</h2>
					<p>You instantiated pizzas and drinks from just two classes — one <code>new</code> at a time.</p>
					<button class="next" onclick={restart}>Play again</button>
				</div>
			{:else}
				<OrderCard {order} index={level} total={ORDERS.length} />
			{/if}

			<div class="stage">
				{#if instances.length}
					<div class="tray">
						{#each instances as inst, i (i)}
							<InstanceTile instance={inst} index={i} />
						{/each}
					</div>
				{:else}
					<p class="empty">
						No objects yet — write some <code>new</code> statements and hit <strong>Serve</strong>.
					</p>
				{/if}
			</div>

			<details class="object-state" open>
				<summary>🧱 The objects you created</summary>
				{#if instances.length}
					<pre>{stateLines.join('\n')}</pre>
				{:else}
					<p class="note">Each object you instantiate appears here, with the variable pointing to it.</p>
				{/if}
			</details>
		</section>
	</main>
</div>

<style>
	:global(:root) {
		--bg: #faf7f2;
		--card: #ffffff;
		--chip: #f3efe7;
		--border: #e4ddd0;
		--text: #2c2a26;
		--muted: #8a8577;
		--accent: #d1421f;
		--accent-2: #2f8f4e;
		--code-bg: #2b2b2b;
		--code-text: #f4f1ea;
		color-scheme: light dark;
	}
	@media (prefers-color-scheme: dark) {
		:global(:root) {
			--bg: #1b1a18;
			--card: #26241f;
			--chip: #322f28;
			--border: #3b382f;
			--text: #efeae0;
			--muted: #a49e8f;
			--accent: #f2703f;
			--accent-2: #58c07a;
			--code-bg: #16150f;
			--code-text: #f4f1ea;
		}
	}
	:global(body) {
		margin: 0;
		background: var(--bg);
		color: var(--text);
		font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
	}

	.app {
		max-width: 1200px;
		margin-inline: auto;
		padding: 1.25rem;
	}
	.topbar {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 0.75rem 1rem;
	}
	.topbar h1 {
		margin: 0;
		font-size: 1.5rem;
	}
	.tag {
		margin: 0;
		color: var(--muted);
	}
	.score {
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: 999px;
		padding: 0.35rem 0.9rem;
		font-weight: 700;
		white-space: nowrap;
	}

	.panes {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.25rem;
		margin-top: 1.25rem;
	}
	.pane {
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
		min-width: 0;
	}

	.class-def,
	.object-state {
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 0.5rem 0.9rem;
	}
	summary {
		cursor: pointer;
		font-weight: 600;
	}
	.object-state pre {
		background: var(--code-bg);
		color: var(--code-text);
		padding: 0.9rem;
		border-radius: 8px;
		overflow-x: auto;
		font-size: 0.85rem;
		line-height: 1.5;
		margin: 0.7rem 0 0;
	}
	.class-def :global(.cm-host) {
		margin-top: 0.7rem;
	}
	.note {
		color: var(--muted);
		font-size: 0.85rem;
		margin: 0.6rem 0 0.2rem;
	}

	.editor-label {
		display: block;
		font-weight: 600;
		font-size: 0.85rem;
	}

	.actions {
		display: flex;
		gap: 0.6rem;
	}
	button {
		font: inherit;
		font-weight: 700;
		border: none;
		border-radius: 10px;
		padding: 0.6rem 1.1rem;
		cursor: pointer;
		color: white;
	}
	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.serve {
		background: var(--accent);
	}
	.next {
		background: var(--accent-2);
	}

	.feedback {
		border-radius: 10px;
		padding: 0.8rem 1rem;
		border: 1px solid var(--border);
	}
	.feedback p {
		margin: 0.4rem 0 0;
	}
	.feedback ul {
		margin: 0.5rem 0 0;
		padding-left: 1.2rem;
	}
	.feedback li {
		margin: 0.2rem 0;
	}
	.feedback .hint {
		display: block;
		color: var(--muted);
		font-size: 0.85em;
	}
	.feedback.error {
		background: color-mix(in srgb, var(--accent) 12%, var(--card));
	}
	.feedback.warn {
		background: color-mix(in srgb, #e8a33d 16%, var(--card));
	}
	.feedback.success {
		background: color-mix(in srgb, var(--accent-2) 15%, var(--card));
	}

	.stage {
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: 14px;
		padding: 1.25rem 1rem;
		min-height: 180px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.tray {
		display: flex;
		flex-wrap: wrap;
		gap: 0.8rem;
		justify-content: center;
		width: 100%;
	}
	.empty {
		color: var(--muted);
		text-align: center;
		font-size: 0.9rem;
	}

	.done {
		text-align: center;
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: 14px;
		padding: 1.5rem;
	}
	.done .confetti {
		font-size: 3rem;
	}
	.done h2 {
		margin: 0.3rem 0;
	}

	code {
		background: var(--chip);
		padding: 0.05em 0.35em;
		border-radius: 5px;
		font-family: ui-monospace, Menlo, Consolas, monospace;
		font-size: 0.9em;
	}

	@media (max-width: 820px) {
		.panes {
			grid-template-columns: 1fr;
		}
		.topbar {
			grid-template-columns: 1fr auto;
		}
		.tag {
			grid-column: 1 / -1;
			order: 3;
		}
	}
</style>
