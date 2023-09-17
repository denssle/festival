<script lang="ts">
	import { goto } from '$app/navigation';
	import type { FrontendFestivalEvent } from '$lib/models/FrontendFestivalEvent';
	import { formateDate, formateDateTime } from '$lib/utils/dateUtils';
	import JoinFestivalButtons from './JoinFestivalButtons.svelte';

	export let data: { festival: FrontendFestivalEvent; yourFestival: boolean; visitor: boolean };

	async function deleteFestival(): Promise<void> {
		await fetch('/festival/' + data.festival.id, {
			method: 'DELETE'
		});
		await goto('/');
	}
</script>

<article>
	<section>
		<h4>{data.festival.name}</h4>
		<sub>Starting: {formateDateTime(data.festival.startDate)}</sub>
		<p>{data.festival.description}</p>
	</section>

	<section>
		<p>Erstellt am {formateDate(data.festival.createdAt)} von {data.festival.createdBy?.email}</p>
	</section>

	<section>
		{#if data.yourFestival}
			<a class="button" href="/festival/edit/{data.festival.id}">Bearbeiten</a>
			<button on:click|trusted={deleteFestival}>Löschen</button>
		{:else}
			<JoinFestivalButtons data={{ visitor: data.visitor, festival: data.festival }} />
		{/if}
		<a class="button" href="/">Zurück</a>
	</section>
</article>

<style></style>
