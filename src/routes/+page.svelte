<script lang="ts">
	import type { FrontendFestivalEvent } from '$lib/models/FrontendFestivalEvent';

	export let data: { festivalEvents: FrontendFestivalEvent[] };
</script>

<article>
	<h2>Festivals</h2>

	<section>
		<p>Alle Events:</p>
		{#each data.festivalEvents as loadedEvent}
			<article>
				<a href="/festival/{loadedEvent.id}">{loadedEvent.name}</a>
				<p>Von {loadedEvent.createdBy.nickname}</p>
			</article>
		{/each}
	</section>
</article>

<style></style>
