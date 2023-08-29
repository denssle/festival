<script>
	export let data;
</script>

<h1>Festivals</h1>

<div>
	<p>List:</p>
	{#each data.loadedEvents as loadedEvent}
		<ul>
			<li>
				<a href="/festival/{loadedEvent.id}">{loadedEvent.name}</a>
			</li>
		</ul>
	{/each}
</div>

<style></style>
