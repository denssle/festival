<script lang="ts">
	let { createdAt = $bindable(), updatedAt = $bindable() } = $props();

	let edited: boolean = $state(false);

	$effect(() => {
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
