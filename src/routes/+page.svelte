<script lang="ts">
	import type { FrontendFestivalEvent } from '$lib/models/festivalEvent/FrontendFestivalEvent';
	import { getTotalNumberOfComingGuests } from '$lib/utils/festivalEvent.util';

	export let data: { festivalEvents: FrontendFestivalEvent[] };
</script>

<article>
	<h2>Festivals</h2>

	<section>
		<p>Alle Events:</p>
		{#each data.festivalEvents as loadedEvent}
			<fieldset>
				<legend>
					<a href="/festival/{loadedEvent.id}">{loadedEvent.name}</a>
					von <a href="/user/{loadedEvent.createdBy?.id}">{loadedEvent.createdBy?.nickname}</a>
				</legend>
				<i>Start: {loadedEvent.startDate?.toLocaleString()}</i>
				<p></p>
				<p>
					<span>Bisherige Gäste: {getTotalNumberOfComingGuests(loadedEvent)}</span>
				</p>
			</fieldset>
		{/each}
	</section>
</article>

<style></style>
