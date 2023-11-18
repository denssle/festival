<script lang="ts">
	import type { FrontendFestivalEvent } from '$lib/models/FrontendFestivalEvent';

	export let data: { festivalEvents: FrontendFestivalEvent[] };
</script>

<article>
	<h2>Festivals</h2>

	<section>
		<p>Alle Events:</p>
		{#each data.festivalEvents as loadedEvent}
			<ul>
				<li>
					<a href="/festival/{loadedEvent.id}">{loadedEvent.name}</a>
				</li>
			</ul>
		{/each}
	</section>
</article>

<style></style>
