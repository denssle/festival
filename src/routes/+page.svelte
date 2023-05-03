<script>
	import Festival from '$lib/components/Festival.svelte';

	export let data;
	if (data.authorized) {
		console.log('authorized!');
	} else {
		console.log('not logged in');
	}
</script>

<h1>Home</h1>

<div>
	{#each data.loadedEvents as thing}
		<Festival data={thing} />
	{/each}
</div>
