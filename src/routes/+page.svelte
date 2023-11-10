<script lang='ts'>

	import type { FrontendFestivalEvent } from '$lib/models/FrontendFestivalEvent';

	export let data: { festivalEvents: FrontendFestivalEvent[] };
</script>

<h1>Festivals</h1>

<div>
	<p>List:</p>
	{#each data.festivalEvents as loadedEvent}
		<ul>
			<li>
				<a href='/festival/{loadedEvent.id}'>{loadedEvent.name}</a>
			</li>
		</ul>
	{/each}
</div>

<style></style>
