<script lang="ts">
	import type { PageData } from './$types';
	import { getTotalNumberOfComingGuests } from '$lib/utils/festivalEvent.util';

	let { data }: { data: PageData } = $props();
</script>

<article>
	<h2>Festivals</h2>
	<p>Willkommen hier.</p>

	<section>
		<a class="button" href="/festival/new">Neues Fest anlegen</a>

		{#each data.festivalEvents as loadedEvent (loadedEvent.id)}
			<fieldset>
				<legend>
					<a href="/festival/{loadedEvent.id}">{loadedEvent.name}</a>
					{#if loadedEvent.createdBy}
						von <a href="/user/{loadedEvent.createdBy.id}">{loadedEvent.createdBy.nickname}</a>
					{/if}
				</legend>
				<i>Start: {loadedEvent.startDate?.toLocaleString()}</i>
				<p>
					<span>Bisherige Gäste: {getTotalNumberOfComingGuests(loadedEvent)}</span>
				</p>
			</fieldset>
		{:else}
			<p>Es gibt noch keine Feste. Leg das erste an!</p>
		{/each}
	</section>
</article>
