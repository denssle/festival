<script>
	import { FestivalEvent } from './FestivalEvent.ts';
	import Festival from './Festival.svelte';

	export let data;
	console.log('data', data);
</script>

<div>
	{#each data.loadedEvents as thing}
		<Festival data={thing} />
	{/each}
</div>
