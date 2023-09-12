<script lang="ts">
	import { goto } from '$app/navigation';
	import type { FestivalEvent } from '$lib/models/FestivalEvent';

	export let data: { festival: FestivalEvent; yourFestival: boolean };

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
</article>

<style></style>
