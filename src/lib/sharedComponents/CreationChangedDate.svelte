<script lang='ts'>
	import { afterUpdate, onMount } from 'svelte';

	export let createdAt: Date;
	export let updatedAt: Date;

	let edited: boolean = false;

	onMount(() => {
		mapToDate();
	});

	afterUpdate(() => {
		mapToDate();
	});

	function mapToDate() {
		createdAt = new Date(createdAt);
		updatedAt = new Date(updatedAt);
		edited = createdAt.getTime() !== updatedAt.getTime();
	}
</script>

<i>
	Geschrieben: {createdAt.toLocaleString()}
	{#if edited}
		Aktualisiert: {updatedAt.toLocaleString()}
	{/if}
</i>