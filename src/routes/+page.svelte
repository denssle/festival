<script>
	import Festival from '$lib/components/Festival.svelte';

	export let data;
	console.log('root data', data);
	// #D81E30
	// #439E8F
	// #FDF8E1
	// #FD904D
</script>

<h1>Home</h1>

<div>
	{#each data.loadedEvents as loadedEvent}
		<Festival data={loadedEvent} />
	{/each}
</div>

<style></style>