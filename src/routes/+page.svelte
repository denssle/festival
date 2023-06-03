<script>
	import Festival from '$lib/components/Festival.svelte';

	export let data;
</script>

<h1>Home</h1>

<div>
	<p>Festivals:</p>
	{#each data.loadedEvents as loadedEvent}
		<a href="/festival/{loadedEvent.id}">{loadedEvent.name}</a>
	{/each}
</div>

<style></style>
