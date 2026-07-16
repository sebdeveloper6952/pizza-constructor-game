<script lang="ts">
	import { onMount } from 'svelte';
	import {
		EditorView,
		keymap,
		lineNumbers,
		highlightActiveLine,
		highlightActiveLineGutter
	} from '@codemirror/view';
	import { EditorState, type Extension } from '@codemirror/state';
	import { indentWithTab } from '@codemirror/commands';
	import { bracketMatching } from '@codemirror/language';
	import { minimalSetup } from 'codemirror';
	import { java } from '@codemirror/lang-java';
	import { oneDark } from '@codemirror/theme-one-dark';

	let {
		value = $bindable(''),
		ariaLabel = 'Code editor',
		readonly = false
	}: { value?: string; ariaLabel?: string; readonly?: boolean } = $props();

	let host = $state<HTMLDivElement>();
	let view: EditorView | undefined;

	onMount(() => {
		// Match the app's look. Editable editor keeps a comfortable min height;
		// the read-only display just hugs its content.
		const look = EditorView.theme({
			'&': { fontSize: '0.95rem', borderRadius: '10px', border: '1px solid var(--border)' },
			'&.cm-focused': { outline: '2px solid var(--accent)', outlineOffset: '1px' },
			'.cm-scroller': {
				fontFamily: "ui-monospace, 'SF Mono', 'Fira Code', Menlo, Consolas, monospace",
				lineHeight: '1.6',
				minHeight: readonly ? 'auto' : '220px'
			},
			'.cm-content': { padding: '0.7rem 0' }
		});

		const extensions: Extension[] = [
			// Deliberately NOT basicSetup: no auto-close brackets / autocomplete popups,
			// so beginners type exactly what they see.
			minimalSetup,
			lineNumbers(),
			bracketMatching(),
			java(),
			oneDark,
			look,
			EditorView.lineWrapping,
			EditorView.contentAttributes.of({ 'aria-label': ariaLabel })
		];

		if (readonly) {
			extensions.push(EditorState.readOnly.of(true), EditorView.editable.of(false));
		} else {
			extensions.push(
				highlightActiveLine(),
				highlightActiveLineGutter(),
				keymap.of([indentWithTab]),
				EditorView.updateListener.of((u) => {
					if (u.docChanged) value = u.state.doc.toString();
				})
			);
		}

		view = new EditorView({ parent: host, state: EditorState.create({ doc: value, extensions }) });
		return () => view?.destroy();
	});

	// Keep the editor in sync when `value` is changed from the outside
	// (e.g. advancing to the next order resets the starter code).
	$effect(() => {
		if (view && value !== view.state.doc.toString()) {
			view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value } });
		}
	});

	// The read-only block often lives inside a collapsed <details>; when it becomes
	// visible CodeMirror needs to re-measure so text lays out correctly.
	export function refresh() {
		view?.requestMeasure();
	}
</script>

<div class="cm-host" bind:this={host}></div>

<style>
	.cm-host :global(.cm-editor) {
		border-radius: 10px;
		overflow: hidden;
	}
</style>
