<script>
	import Festival from '$lib/components/Festival.svelte';
	import { authorized } from '$lib/stores/authorized-store.ts';

	export let data;
	authorized.set(data.authorized);
	console.log('root data', data);

	// Colors:
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