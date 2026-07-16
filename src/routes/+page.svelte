<script lang="ts">
	import { parsePizza } from '$lib/parser';
	import { ORDERS, matchOrder, objectStateLines, TOPPINGS, normalize } from '$lib/pizza';
	import OrderCard from '$lib/components/OrderCard.svelte';
	import PizzaView from '$lib/components/PizzaView.svelte';

	const CLASS_SOURCE = `public class Pizza {
    String size;
    String sauce;
    String[] toppings;

    // The constructor: what you must call with "new"
    public Pizza(String size, String sauce, String... toppings) {
        this.size = size;
        this.sauce = sauce;
        this.toppings = toppings;
    }
}`;

	const STARTER = `// Build the pizza this customer ordered.
// The constructor takes: a size, a sauce, then any number of toppings.

Pizza pizza = new Pizza("medium", "tomato", "cheese");`;

	let level = $state(0);
	let code = $state(STARTER);
	let attempted = $state(false);
	let solved = $state<boolean[]>(ORDERS.map(() => false));

	const order = $derived(ORDERS[level]);
	const parse = $derived(parsePizza(code));
	const pizza = $derived(parse.ok ? parse.pizza : null);
	const match = $derived(pizza ? matchOrder(pizza, order) : null);
	const stateLines = $derived(pizza ? objectStateLines(pizza) : []);
	const solvedCount = $derived(solved.filter(Boolean).length);
	const allDone = $derived(solvedCount === ORDERS.length);

	function label(t: string): string {
		return TOPPINGS[normalize(t)]?.label ?? t;
	}

	function serve() {
		attempted = true;
		if (parse.ok && match?.perfect) {
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

	// Tab inserts spaces instead of leaving the editor.
	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Tab') {
			e.preventDefault();
			const el = e.currentTarget as HTMLTextAreaElement;
			const { selectionStart: s, selectionEnd: end } = el;
			code = code.slice(0, s) + '    ' + code.slice(end);
			queueMicrotask(() => (el.selectionStart = el.selectionEnd = s + 4));
		}
	}
</script>

<svelte:head>
	<title>Pizza Constructor — learn Java classes & objects</title>
	<meta
		name="description"
		content="Write Java to instantiate a Pizza and fulfill the customer's order. Learn classes, objects and constructors."
	/>
</svelte:head>

<div class="app">
	<header class="topbar">
		<h1>🍕 Pizza Constructor</h1>
		<p class="tag">Instantiate a <code>Pizza</code> object to fulfill each order.</p>
		<div class="score" aria-live="polite">Served: {solvedCount} / {ORDERS.length}</div>
	</header>

	<main class="panes">
		<!-- LEFT: the code -->
		<section class="pane editor-pane">
			<details class="class-def">
				<summary>📘 The <code>Pizza</code> class (given to you)</summary>
				<pre>{CLASS_SOURCE}</pre>
				<p class="note">
					A <strong>class</strong> is the recipe. Calling the <strong>constructor</strong> with
					<code>new</code> bakes one actual <strong>object</strong>.
				</p>
			</details>

			<label class="editor-label" for="code">Your code</label>
			<textarea
				id="code"
				class="editor"
				spellcheck="false"
				autocapitalize="off"
				bind:value={code}
				onkeydown={onKeydown}
			></textarea>

			<div class="actions">
				<button class="serve" onclick={serve} disabled={solved[level]}>Serve pizza 🍕</button>
				{#if solved[level]}
					<button class="next" onclick={nextOrder} disabled={level === ORDERS.length - 1}>
						Next order →
					</button>
				{/if}
			</div>

			<!-- feedback -->
			{#if attempted}
				{#if !parse.ok}
					<div class="feedback error">
						<strong>⚠️ {parse.error}</strong>
						{#if parse.hint}<p>{parse.hint}</p>{/if}
					</div>
				{:else if match?.perfect}
					<div class="feedback success">
						<strong>✅ Order served! {order.customer} is happy.</strong>
						<p>Your <code>new Pizza(...)</code> call built exactly the object they asked for.</p>
					</div>
				{:else if match}
					<div class="feedback warn">
						<strong>🤔 Not quite — check the object you built:</strong>
						<ul>
							{#if !match.sizeOk}<li>The <b>size</b> doesn't match the order.</li>{/if}
							{#if !match.sauceOk}<li>The <b>sauce</b> doesn't match the order.</li>{/if}
							{#if match.missingToppings.length}
								<li>Missing topping(s): {match.missingToppings.map(label).join(', ')}.</li>
							{/if}
							{#if match.extraToppings.length}
								<li>Remove extra topping(s): {match.extraToppings.map(label).join(', ')}.</li>
							{/if}
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
					<p>You instantiated {ORDERS.length} different <code>Pizza</code> objects from one class.</p>
					<button class="next" onclick={restart}>Play again</button>
				</div>
			{:else}
				<OrderCard {order} index={level} total={ORDERS.length} />
			{/if}

			<div class="stage">
				<PizzaView {pizza} />
			</div>

			<details class="object-state" open>
				<summary>🧱 The object you created</summary>
				{#if pizza}
					<pre>{stateLines.join('\n')}</pre>
				{:else}
					<p class="note">Once your code parses, the resulting object's fields show up here.</p>
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
		font-family:
			system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
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
	.class-def pre,
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
	.note {
		color: var(--muted);
		font-size: 0.85rem;
		margin: 0.6rem 0 0.2rem;
	}

	.editor-label {
		font-weight: 600;
		font-size: 0.85rem;
	}
	.editor {
		width: 100%;
		box-sizing: border-box;
		min-height: 220px;
		resize: vertical;
		background: var(--code-bg);
		color: var(--code-text);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 1rem;
		font-family: ui-monospace, 'SF Mono', 'Fira Code', Menlo, Consolas, monospace;
		font-size: 0.95rem;
		line-height: 1.6;
		tab-size: 4;
	}
	.editor:focus {
		outline: 2px solid var(--accent);
		outline-offset: 1px;
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
		padding: 1.5rem 1rem;
		display: flex;
		justify-content: center;
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
