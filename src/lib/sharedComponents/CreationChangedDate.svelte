<script lang="ts">
	let { createdAt, updatedAt }: { createdAt: Date; updatedAt: Date } = $props();

	let createdDate = $derived(new Date(createdAt));
	let updatedDate = $derived(new Date(updatedAt));
	let edited = $derived(createdDate.getTime() !== updatedDate.getTime());
</script>

<i>
	Geschrieben: {createdDate.toLocaleString()}
	{#if edited}
		Aktualisiert: {updatedDate.toLocaleString()}
	{/if}
</i>
