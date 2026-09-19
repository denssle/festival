<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { LOCALES, type Locale } from '$lib/i18n';
	import { currentLocale, tr } from '$lib/i18n/tr';

	// Aktive Sprache aus den Layout-Daten (siehe currentLocale) statt als Prop.
	let locale: Locale = $derived(currentLocale());

	// Zurück auf die Seite, auf der der Umschalter geklickt wurde – inklusive
	// Query-String, damit z. B. Filter oder Formularmeldungen nicht verlorengehen.
	// Der Wert wird in `/language` gegen offene Redirects geprüft.
	let redirectTo: string = $derived(page.url.pathname + page.url.search);
</script>

<!--
	Bewusst ein Formular-POST statt eines Client-Fetch: Der Umschalter funktioniert damit
	auch ohne JavaScript, und die Antwort kommt schon in der neuen Sprache zurück.

	`{base}/language` statt resolve(): Ein Formular-Action wird vom Browser gegen die
	aktuelle Dokument-URL aufgelöst, der relative Pfad aus resolve() ('./language') würde
	auf verschachtelten Routen danebengreifen – dieselbe Falle wie beim Location-Header
	(siehe CLAUDE.md, Abschnitt 3).
-->
<form action="{base}/language" class="language-switcher" method="POST">
	<input name="redirectTo" type="hidden" value={redirectTo} />
	<span aria-hidden="true">{tr('language.label')}:</span>
	{#each LOCALES as option (option)}
		<button
			aria-current={option === locale ? 'true' : undefined}
			aria-label={tr(`language.${option}`)}
			disabled={option === locale}
			lang={option}
			name="locale"
			type="submit"
			value={option}
		>
			{tr(`language.${option}`)}
		</button>
	{/each}
</form>

<style>
	.language-switcher {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.language-switcher button {
		min-width: 0;
		padding: 0.2rem 0.6rem;
		font-size: 0.85rem;
	}

	/* Die aktive Sprache bleibt sichtbar, ist aber nicht mehr klickbar. Der
	   `disabled`-Standardstil wuerde sie fast unlesbar ausgrauen. */
	.language-switcher button[disabled] {
		background-color: var(--accent-bg);
		color: var(--text);
		cursor: default;
		opacity: 1;
	}
</style>
