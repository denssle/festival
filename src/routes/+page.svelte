<script lang="ts">
	import type { FrontendFestivalEvent } from '$lib/models/FrontendFestivalEvent';
	import { formateDateTime } from '$lib/utils/dateUtils';

	export let data: { festivalEvents: FrontendFestivalEvent[] };
</script>

<article>
	<h2>Festivals</h2>

	<section>
		<p>Alle Events:</p>
		{#each data.festivalEvents as loadedEvent}
			<article>
				<a href="/festival/{loadedEvent.id}">{loadedEvent.name}</a>
				<p>
					Von <a href="/user/{loadedEvent.createdBy.id}">{loadedEvent.createdBy.nickname}</a>
					{#if loadedEvent.updatedAt}
						<span>Letztes Update war {formateDateTime(loadedEvent.updatedAt)}</span>
					{/if}
				</p>
			</article>
		{/each}
	</section>
</article>

<style></style>
