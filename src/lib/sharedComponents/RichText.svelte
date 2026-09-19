<script lang="ts">
	import type { Snippet } from 'svelte';
	import { splitRichText, type RichTextPart } from '$lib/i18n/locale.logic';

	/**
	 * Rendert einen übersetzten Satz, in den Markup eingebettet ist (Links, Hervorhebungen).
	 *
	 * Die Plätze im Text (`{name}` bzw. `{name:Text}`, siehe `splitRichText`) werden durch
	 * gleichnamige Snippets ersetzt; ein Snippet bekommt den inneren Text als Argument:
	 *
	 *   <RichText text={tr('festival.joinDialog.notByo')}>
	 *     {#snippet mark(inner: string)}<mark>{inner}</mark>{/snippet}
	 *   </RichText>
	 *
	 * Fehlt ein Snippet, bleibt der Platz sichtbar stehen – dieselbe Absicht wie bei
	 * `interpolate`: ein Fehler soll auffallen, nicht verschwinden.
	 *
	 * Bewusst kein `{@html}`: Die Texte kämen zwar nur aus den Wörterbüchern, Parameter
	 * aus `t()` können aber Nutzereingaben enthalten (Nicknames).
	 */
	let { text, ...snippets }: { text: string; [name: string]: Snippet<[string]> | string } = $props();

	let parts: RichTextPart[] = $derived(splitRichText(text));
</script>

{#each parts as part, index (index)}
	{#if part.type === 'text'}
		{part.value}
	{:else}
		{@const snippet = snippets[part.name]}
		{#if typeof snippet === 'function'}
			{@render snippet(part.inner)}
		{:else}
			{`{${part.name}${part.inner ? `:${part.inner}` : ''}}`}
		{/if}
	{/if}
{/each}
