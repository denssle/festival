<script lang="ts">
	import { goto } from '$app/navigation';
	import type { BackendFestivalEvent } from '$lib/models/BackendFestivalEvent';
	import type { FrontendFestivalEvent } from '$lib/models/FrontendFestivalEvent';

	export let data: { festival: FrontendFestivalEvent; yourFestival: boolean };

	async function deleteFestival() {
		await fetch('/festival/' + data.festival.id, {
			method: 'DELETE'
		});
		await goto('/');
	}
</script>

<article>
	<h4>{data.festival.name}</h4>
	<p>{data.festival.description}</p>
	<p>Erstellt am {new Date(data.festival.createdAt)} von {data.festival.createdBy}</p>
	{#if data.yourFestival}
		<a class="button" href="/festival/edit/{data.festival.id}">Bearbeiten</a>
		<button on:click|trusted={deleteFestival}>Löschen</button>
	{/if}
	<a class="button" href="/">Zurück</a>
</article>

<style></style>
