<script>
	import Festival from '$lib/components/Festival.svelte';

	export let data;
	if (data.authorized) {
		console.log('root: page: authorized!');
	} else {
		console.log('root: page: not logged in');
	}
</script>

<h1>Home</h1>

<div>
	{#each data.loadedEvents as thing}
		<Festival data={thing} />
	{/each}
</div>

<style></style>