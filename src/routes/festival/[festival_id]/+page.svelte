<script lang="ts">
	import { goto } from '$app/navigation';
	import type { FrontendFestivalEvent } from '$lib/models/FrontendFestivalEvent';
	import { formateDate, formateDateTime } from '$lib/utils/dateUtils';

	export let data: { festival: FrontendFestivalEvent; yourFestival: boolean; visitor: boolean };

	async function deleteFestival() {
		await fetch('/festival/' + data.festival.id, {
			method: 'DELETE'
		});
		await goto('/');
	}

	function joinFestival() {
		if (!data.visitor) {
			fetch('/festival/' + data.festival.id + '/join', {
				method: 'POST'
			});
		}
	}

	console.log(data);
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
			<!-- TODO auch wieder austreten können -->
			<button on:click={joinFestival} hidden={data.visitor}>Mitmachen</button>
		{/if}
		<a class="button" href="/">Zurück</a>
	</section>
</article>

<style></style>
