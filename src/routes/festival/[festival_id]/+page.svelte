<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import type { FrontendFestivalEvent } from '$lib/models/FrontendFestivalEvent';
	import { formateDate, formateDateTime } from '$lib/utils/dateUtils';
	import InfoDialog from '$lib/sharedComponents/InfoDialog.svelte';

	export let data: { festival: FrontendFestivalEvent; yourFestival: boolean; visitor: boolean };

	async function deleteFestival(): Promise<void> {
		await fetch('/festival/' + data.festival.id, {
			method: 'DELETE'
		});
		await goto('/');
	}

	function joinFestival(): void {
		if (data.visitor) {
			infoDialogText = 'Du bist bereits dabei!';
			showInfoDialog = true;
		} else {
			fetch('/festival/' + data.festival.id + '/join', {
				method: 'POST'
			}).then(() => {
				invalidateAll();
			});
		}
	}

	function leaveFestival(): void {
		if (data.visitor) {
			fetch('/festival/' + data.festival.id + '/leave', {
				method: 'POST'
			}).then(() => {
				invalidateAll();
			});
		} else {
			infoDialogText = 'Wärst du angemeldet gewesen, wärst du es jetzt nicht mehr.';
			showInfoDialog = true;
		}
	}
	let showInfoDialog = false;
	let infoDialogText = '';
</script>

<InfoDialog bind:showInfoDialog bind:infoDialogText></InfoDialog>

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
		{#if data.festival.visitors.length}
			<p>Bisher haben sich angemeldet:</p>
			<ul>
				{#each data.festival.visitors as visitor}
					<li>
						<p>{visitor.email}</p>
					</li>
				{/each}
			</ul>
		{:else}
			<p>Es hat sich noch niemand angemeldet.</p>
		{/if}
	</section>

	<section>
		<a class="button" href="/festival/edit/{data.festival.id}">Bearbeiten</a>
		<button on:click|trusted={deleteFestival}>Löschen</button>
		<button on:click={leaveFestival}>Absagen</button>
		<button on:click={joinFestival}>Mitmachen</button>
		<a class="button" href="/">Zurück</a>
	</section>
</article>

<style></style>
